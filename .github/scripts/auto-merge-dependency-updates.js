"use strict";

/**
 * Decides which open dependency-update pull requests are safe to merge without a
 * human in the loop, and merges the ones that qualify.
 *
 * Used by .github/workflows/auto-merge-dependency-updates.yml. The workflow always
 * checks this file out from the default branch, so a pull request cannot change the
 * rules that let it merge itself.
 *
 * Everything above `run()` is pure so it can be unit-tested from
 * tests/unit/auto-merge-dependency-updates.test.ts.
 */

const DEPENDABOT_LOGIN = "dependabot[bot]";
const SNYK_BRANCH_PATTERN = /^snyk-(?:fix|upgrade)-[0-9a-z]+$/i;
const SNYK_TITLE_PATTERN =
  /^\[Snyk\]\s+(?:Security\s+)?upgrade\s+(\S+)\s+from\s+(\S+)\s+to\s+(\S+)/i;

/** Checks that must exist on the head commit and have concluded successfully. */
const REQUIRED_CHECKS = [
  "check-types",
  "check-format",
  "check-lint",
  "check-translations",
  "Unit Tests",
  "E2E Tests",
];

/**
 * Checks whose failure does not block an auto-merge. `codex_auto_approve` cannot
 * work on Dependabot pull requests: those runs get Dependabot secrets rather than
 * Actions secrets, so `OPENAI_API_KEY` is empty and the job fails before reviewing.
 */
const ADVISORY_CHECKS = ["codex_auto_approve"];

/** Any of these labels on a pull request means a human wants to handle it. */
const BLOCKING_LABELS = ["do-not-merge", "blocked", "on-hold"];

/** Reviews from these accounts are not treated as human sign-off or human blocks. */
const BOT_REVIEWERS = [
  "github-actions[bot]",
  "chatgpt-codex-connector",
  "dependabot[bot]",
];

/**
 * How large a version jump may be merged automatically, per dependency type.
 * `indirect` is grouped with production because a transitive dependency can just as
 * easily sit in the runtime tree.
 */
const AUTO_MERGE_POLICY = {
  "direct:development": ["patch", "minor"],
  "direct:production": ["patch"],
  indirect: ["patch"],
  // Actions never ship to users, but they run with repository write access, so a
  // major rewrite of one is a human's call.
  "github-action": ["patch", "minor"],
};

/**
 * Accounts whose `snyk-*` branches are eligible. Snyk opens its pull requests
 * through a connected user account, so the branch name is a naming convention, not
 * an identity: without this list any contributor could push a `snyk-fix-*` branch
 * and have it merged without review.
 */
const SNYK_AUTHORS = ["jbeard4", "snyk-bot"];

/** package.json fields a dependency update is allowed to touch. */
const MANIFEST_DEPENDENCY_FIELDS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
];

/** Hosts a lockfile may newly resolve a package from. */
const ALLOWED_REGISTRY_HOSTS = ["registry.npmjs.org"];

const MERGE_METHOD = "squash";

/**
 * Parses a release version. Prereleases return null so that anything like
 * `1.0.0-beta.3` falls through to a human.
 */
function parseVersion(raw) {
  if (typeof raw !== "string") return null;
  const match = /^[v=^~]?(\d+)\.(\d+)\.(\d+)(?:\+[0-9A-Za-z.-]+)?$/.exec(
    raw.trim(),
  );
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

/**
 * Classifies a version change as "major", "minor" or "patch". Returns null for
 * downgrades, no-ops and anything unparseable.
 *
 * Below 1.0.0 a minor bump is treated as a major one, because that is where
 * pre-1.0 packages put their breaking changes.
 */
function classifyVersionChange(fromVersion, toVersion) {
  const from = parseVersion(fromVersion);
  const to = parseVersion(toVersion);
  if (!from || !to) return null;
  if (to.major !== from.major) return to.major > from.major ? "major" : null;
  if (to.minor !== from.minor) {
    if (to.minor < from.minor) return null;
    return from.major === 0 ? "major" : "minor";
  }
  if (to.patch !== from.patch) return to.patch > from.patch ? "patch" : null;
  return null;
}

/** Dependabot quotes scoped package names in its commit trailer. */
function unquote(value) {
  return String(value)
    .trim()
    .replace(/^["'](.*)["']$/, "$1");
}

/**
 * Reads the `updated-dependencies:` trailer that Dependabot writes into every
 * commit message. Grouped pull requests list one entry per dependency.
 */
function parseUpdatedDependenciesTrailer(message) {
  const lines = String(message || "").split("\n");
  const start = lines.findIndex(
    (line) => line.trim() === "updated-dependencies:",
  );
  if (start === -1) return [];

  const entries = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "..." || line.trim() === "") break;

    const newEntry = /^-\s+([\w-]+):\s*(.*)$/.exec(line);
    if (newEntry) {
      entries.push({ [newEntry[1]]: unquote(newEntry[2]) });
      continue;
    }

    const field = /^\s+([\w-]+):\s*(.*)$/.exec(line);
    if (field && entries.length > 0) {
      entries[entries.length - 1][field[1]] = unquote(field[2]);
      continue;
    }

    break;
  }
  return entries;
}

/**
 * Collects `name -> fromVersion` from the prose Dependabot writes above the
 * trailer. The trailer itself only carries the new version.
 */
function parseVersionRanges(message) {
  const text = String(message || "");
  const patterns = [
    /Bumps \[([^\]]+)\]\([^)]*\) from (\S+?) to (\S+?)[.\s]/g,
    /Bumps `?([^\s`[\]]+)`? from (\S+?) to (\S+?)[.\s]/g,
    /Updates `([^`]+)` from (\S+?) to (\S+?)[.\s]/g,
  ];

  const ranges = new Map();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text + "\n")) !== null) {
      if (!ranges.has(match[1])) {
        ranges.set(match[1], { fromVersion: match[2], toVersion: match[3] });
      }
    }
  }
  return ranges;
}

/**
 * Collects the dependencies a commit drops outright. Dependabot writes these as
 * `Removes \`name\`` with an empty `dependency-version` in the trailer; they happen
 * when an ancestor upgrade prunes a transitive dependency.
 */
function parseRemovedDependencies(message) {
  const text = String(message || "");
  const removed = new Set();
  const patterns = [/Removes \[([^\]]+)\]\([^)]*\)/g, /Removes `([^`]+)`/g];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) removed.add(match[1]);
  }
  return removed;
}

/**
 * Turns a Dependabot commit message into the list of updates it performs.
 * Dependencies whose previous version cannot be recovered are returned with a null
 * `fromVersion`, which `evaluateUpdates` treats as unmergeable.
 */
function parseDependabotUpdates(message) {
  const ranges = parseVersionRanges(message);
  const removed = parseRemovedDependencies(message);
  return parseUpdatedDependenciesTrailer(message).map((entry) => {
    const name = entry["dependency-name"];
    const range = ranges.get(name);
    return {
      name,
      fromVersion: range ? range.fromVersion : null,
      toVersion:
        entry["dependency-version"] || (range ? range.toVersion : null),
      dependencyType: entry["dependency-type"] || "indirect",
      removed: !entry["dependency-version"] && removed.has(name),
    };
  });
}

/** Where a package sits in package.json, in Dependabot's vocabulary. */
function resolveDependencyType(packageJson, name) {
  const manifest = packageJson || {};
  if (manifest.devDependencies && manifest.devDependencies[name]) {
    return "direct:development";
  }
  if (
    (manifest.dependencies && manifest.dependencies[name]) ||
    (manifest.optionalDependencies && manifest.optionalDependencies[name]) ||
    (manifest.peerDependencies && manifest.peerDependencies[name])
  ) {
    return "direct:production";
  }
  return "indirect";
}

/** Reads the single upgrade out of a Snyk pull request title. */
function parseSnykUpdate(title, packageJson) {
  const match = SNYK_TITLE_PATTERN.exec(String(title || "").trim());
  if (!match) return null;
  return {
    name: match[1],
    fromVersion: match[2],
    toVersion: match[3].replace(/[.,]$/, ""),
    dependencyType: resolveDependencyType(packageJson, match[1]),
  };
}

/** Applies AUTO_MERGE_POLICY to every update in a pull request. */
function evaluateUpdates(updates, policy = AUTO_MERGE_POLICY) {
  if (!Array.isArray(updates) || updates.length === 0) {
    return { safe: false, reason: "no dependency updates could be parsed" };
  }

  for (const update of updates) {
    // A dropped transitive dependency is a side effect of the ancestor upgrade in
    // the same commit, which is policed on its own terms just below.
    if (update.removed) {
      if (update.dependencyType === "indirect") continue;
      return {
        safe: false,
        reason: `${update.name} (${update.dependencyType}) is removed, not upgraded`,
      };
    }

    const change = classifyVersionChange(update.fromVersion, update.toVersion);
    if (!change) {
      return {
        safe: false,
        reason: `cannot classify ${update.name} ${update.fromVersion} -> ${update.toVersion}`,
      };
    }
    const allowed = policy[update.dependencyType] || [];
    if (!allowed.includes(change)) {
      return {
        safe: false,
        reason: `${update.name} is a ${change} ${update.dependencyType} update (policy allows ${allowed.join(", ") || "none"})`,
      };
    }
  }

  return {
    safe: true,
    reason: updates
      .map((update) =>
        update.removed
          ? `${update.name} removed (${update.dependencyType})`
          : `${update.name} ${update.fromVersion} -> ${update.toVersion} (${classifyVersionChange(update.fromVersion, update.toVersion)}, ${update.dependencyType})`,
      )
      .join("; "),
  };
}

/** Which files a given kind of dependency-update pull request may touch. */
function allowedPathsFor(source, headRef) {
  if (
    source === "dependabot" &&
    /^dependabot\/github_actions\//.test(headRef)
  ) {
    return { files: [], prefixes: [".github/workflows/"] };
  }
  if (source === "snyk") {
    return {
      files: ["package.json", "package-lock.json", ".snyk"],
      prefixes: [],
    };
  }
  return { files: ["package.json", "package-lock.json"], prefixes: [] };
}

/**
 * A dependency update that touches anything but its manifests is not a dependency
 * update any more, whoever opened it.
 */
function evaluateChangedFiles(filenames, allowed) {
  const unexpected = (filenames || []).filter(
    (filename) =>
      !allowed.files.includes(filename) &&
      !allowed.prefixes.some((prefix) => filename.startsWith(prefix)),
  );
  if (unexpected.length > 0) {
    return {
      safe: false,
      reason: `changes files outside the dependency manifests: ${unexpected.join(", ")}`,
    };
  }
  if (!filenames || filenames.length === 0) {
    return { safe: false, reason: "changes no files" };
  }
  return { safe: true, reason: "" };
}

/** Keeps only the newest run of each check name, so re-runs win. */
function latestCheckRuns(checkRuns) {
  const latest = new Map();
  for (const run of checkRuns || []) {
    const previous = latest.get(run.name);
    if (!previous || (run.id || 0) > (previous.id || 0))
      latest.set(run.name, run);
  }
  return latest;
}

/**
 * Decides whether CI is green enough to merge.
 *
 * Third-party commit statuses (Snyk's own scan) block on failure but are not
 * required to report at all, since a stuck external status should not wedge the
 * queue. Required GitHub checks must all be present and successful.
 */
function evaluateChecks(
  checkRuns,
  statuses,
  required = REQUIRED_CHECKS,
  advisory = ADVISORY_CHECKS,
) {
  const latest = latestCheckRuns(checkRuns);

  const missing = required.filter((name) => !latest.has(name));
  if (missing.length > 0) {
    return { state: "pending", reason: `waiting for ${missing.join(", ")}` };
  }

  const unfinished = [...latest.values()].filter(
    (run) => run.status !== "completed" && !advisory.includes(run.name),
  );
  if (unfinished.length > 0) {
    return {
      state: "pending",
      reason: `still running: ${unfinished.map((run) => run.name).join(", ")}`,
    };
  }

  const failed = [...latest.values()].filter(
    (run) =>
      !advisory.includes(run.name) &&
      run.conclusion !== "success" &&
      run.conclusion !== "neutral" &&
      run.conclusion !== "skipped",
  );
  if (failed.length > 0) {
    return {
      state: "failed",
      reason: `failing checks: ${failed.map((run) => `${run.name} (${run.conclusion})`).join(", ")}`,
    };
  }

  const notSuccessful = required.filter(
    (name) => latest.get(name).conclusion !== "success",
  );
  if (notSuccessful.length > 0) {
    return {
      state: "failed",
      reason: `required checks did not pass: ${notSuccessful.join(", ")}`,
    };
  }

  const failedStatuses = (statuses || []).filter(
    (status) => status.state === "failure" || status.state === "error",
  );
  if (failedStatuses.length > 0) {
    return {
      state: "failed",
      reason: `failing commit statuses: ${failedStatuses.map((status) => status.context).join(", ")}`,
    };
  }

  return { state: "passed", reason: "all required checks passed" };
}

/** A human asking for changes always wins over the policy. */
function evaluateReviews(reviews, botReviewers = BOT_REVIEWERS) {
  const latestByUser = new Map();
  for (const review of reviews || []) {
    const login = review.user && review.user.login;
    if (!login || botReviewers.includes(login)) continue;
    if (review.state !== "APPROVED" && review.state !== "CHANGES_REQUESTED") {
      continue;
    }
    latestByUser.set(login, review.state);
  }

  const blockers = [...latestByUser.entries()]
    .filter(([, state]) => state === "CHANGES_REQUESTED")
    .map(([login]) => login);

  if (blockers.length > 0) {
    return {
      safe: false,
      reason: `changes requested by ${blockers.join(", ")}`,
    };
  }
  return { safe: true, reason: "" };
}

/** Structural equality, used to prove nothing outside the dependency lists moved. */
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => key in b && deepEqual(a[key], b[key]));
}

/** Which policy tier a package sits in, given the manifest field it is declared in. */
const FIELD_DEPENDENCY_TYPES = {
  dependencies: "direct:production",
  devDependencies: "direct:development",
  optionalDependencies: "direct:production",
  peerDependencies: "direct:production",
};

/**
 * Reads the updates a manifest diff actually performs, rather than the ones the
 * pull request says it performs. Both the starting version and the policy tier come
 * from the manifest itself, so a patch-sized claim over a major-sized change cannot
 * pass.
 */
function deriveManifestUpdates(basePackageJson, headPackageJson) {
  const updates = [];
  for (const field of MANIFEST_DEPENDENCY_FIELDS) {
    const before = (basePackageJson || {})[field] || {};
    const after = (headPackageJson || {})[field] || {};
    for (const name of new Set([
      ...Object.keys(before),
      ...Object.keys(after),
    ])) {
      if (before[name] === after[name]) continue;
      updates.push({
        name,
        field,
        fromVersion: name in before ? before[name] : null,
        toVersion: name in after ? after[name] : null,
        dependencyType: FIELD_DEPENDENCY_TYPES[field],
        added: !(name in before),
        removed: !(name in after),
      });
    }
  }
  return updates;
}

/**
 * Checks the manifest diff itself rather than the file name.
 *
 * A file-name allowlist only proves which files changed, not what they say, so on
 * its own it would let a `snyk-fix-*` branch add an install script or a new
 * dependency and merge without review. Policy is enforced against the change the
 * diff makes; the declared updates only have to agree with it.
 */
function evaluateManifestChanges(
  basePackageJson,
  headPackageJson,
  updates,
  policy = AUTO_MERGE_POLICY,
) {
  if (!basePackageJson || !headPackageJson) {
    return { safe: false, reason: "could not read package.json on both sides" };
  }

  const withoutDependencies = (manifest) => {
    const rest = { ...manifest };
    for (const field of MANIFEST_DEPENDENCY_FIELDS) delete rest[field];
    return rest;
  };
  if (
    !deepEqual(
      withoutDependencies(basePackageJson),
      withoutDependencies(headPackageJson),
    )
  ) {
    return {
      safe: false,
      reason: "package.json changes fields outside its dependency lists",
    };
  }

  const claimed = new Map(
    (updates || []).map((update) => [update.name, update]),
  );
  const actual = deriveManifestUpdates(basePackageJson, headPackageJson);

  for (const change of actual) {
    if (change.added) {
      return {
        safe: false,
        reason: `package.json adds ${change.name} to ${change.field}`,
      };
    }
    if (change.removed) {
      return {
        safe: false,
        reason: `package.json drops ${change.name} from ${change.field}`,
      };
    }

    const update = claimed.get(change.name);
    if (!update) {
      return {
        safe: false,
        reason: `package.json changes ${change.name} in ${change.field}, which no declared update accounts for`,
      };
    }

    const declared = parseVersion(change.toVersion);
    const expected = parseVersion(update.toVersion);
    if (
      !declared ||
      !expected ||
      declared.major !== expected.major ||
      declared.minor !== expected.minor ||
      declared.patch !== expected.patch
    ) {
      return {
        safe: false,
        reason: `package.json sets ${change.name} to ${change.toVersion}, not the ${update.toVersion} this pull request claims`,
      };
    }
  }

  // The size of the jump is judged on the versions in the files, not the ones in
  // the commit trailer or the title.
  const verdict = evaluateUpdates(actual, policy);
  if (actual.length > 0 && !verdict.safe) {
    return { safe: false, reason: `package.json: ${verdict.reason}` };
  }

  return { safe: true, reason: verdict.reason };
}

/** True for a tarball URL npm may fetch from without a human looking first. */
function isAllowedRegistryUrl(url) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      ALLOWED_REGISTRY_HOSTS.includes(parsed.hostname)
    );
  } catch {
    return false;
  }
}

/**
 * Checks that a registry tarball is the package and version the entry claims.
 *
 * The host check alone is not enough: any npm package's tarball is on
 * registry.npmjs.org, so without this an entry could keep its name and version and
 * point at some other package's tarball entirely.
 */
function resolvedUrlMatchesPackage(path, entry) {
  if (!entry || typeof entry.resolved !== "string") return true;
  if (!isAllowedRegistryUrl(entry.resolved)) return true;
  if (!entry.version) return false;

  const name = entry.name || lockEntryName(path);
  const bare = name.includes("/") ? name.split("/")[1] : name;
  const expected = `/${name}/-/${bare}-${entry.version}.tgz`;

  try {
    return decodeURIComponent(new URL(entry.resolved).pathname) === expected;
  } catch {
    return false;
  }
}

/** Every `resolved` URL anywhere in a lockfile, whatever its structure version. */
function collectResolvedUrls(node, found = new Set()) {
  if (!node || typeof node !== "object") return found;
  if (Array.isArray(node)) {
    for (const item of node) collectResolvedUrls(item, found);
    return found;
  }
  if (typeof node.resolved === "string") found.add(node.resolved);
  for (const value of Object.values(node)) {
    if (value && typeof value === "object") collectResolvedUrls(value, found);
  }
  return found;
}

/** The package a lockfile path refers to, e.g. node_modules/a/node_modules/b -> b. */
function lockEntryName(path) {
  return String(path).replace(/^.*node_modules\//, "");
}

/**
 * Which policy tier a lockfile entry belongs to.
 *
 * Both inputs are the *base* commit's: the merge target is the one thing in this
 * evaluation the pull request cannot write. Reading the head entry's `dev` flag
 * instead would let a pull request reclassify a production package into the dev
 * tier simply by adding `"dev": true` in the same diff.
 */
function lockEntryDependencyType(path, baseEntry, basePackageJson) {
  const declared = resolveDependencyType(basePackageJson, lockEntryName(path));
  if (declared !== "indirect") return declared;
  return baseEntry && baseEntry.dev ? "direct:development" : "indirect";
}

/**
 * Reads the version changes a lockfile diff actually performs. Added and removed
 * entries are the ordinary consequence of an upgrade and are left to the `resolved`
 * URL check; it is the silent version jumps that need policing.
 */
function deriveLockfileUpdates(baseLock, headLock, basePackageJson) {
  const basePackages = (baseLock || {}).packages || {};
  const headPackages = (headLock || {}).packages || {};

  const updates = [];
  for (const [path, headEntry] of Object.entries(headPackages)) {
    const baseEntry = basePackages[path];
    if (!baseEntry || !headEntry) continue;
    if (baseEntry.version === headEntry.version) continue;
    updates.push({
      name: path,
      fromVersion: baseEntry.version,
      toVersion: headEntry.version,
      dependencyType: lockEntryDependencyType(path, baseEntry, basePackageJson),
      removed: false,
    });
  }
  return updates;
}

/**
 * Checks the lockfile diff. The manifest check cannot see any of this: a lockfile is
 * where a forged update would point a package at a tarball of its own, swap the
 * integrity hash of a version it left alone, or slip an undeclared major upgrade of
 * a transitive package into an otherwise patch-sized pull request.
 */
function evaluateLockfileChanges(
  baseLock,
  headLock,
  basePackageJson,
  policy = AUTO_MERGE_POLICY,
) {
  if (!baseLock || !headLock) {
    return {
      safe: false,
      reason: "could not read package-lock.json on both sides",
    };
  }
  if (baseLock.lockfileVersion !== headLock.lockfileVersion) {
    return {
      safe: false,
      reason: `package-lock.json changes lockfileVersion from ${baseLock.lockfileVersion} to ${headLock.lockfileVersion}`,
    };
  }
  if (
    baseLock.name !== headLock.name ||
    baseLock.version !== headLock.version
  ) {
    return { safe: false, reason: "package-lock.json renames the project" };
  }

  const before = collectResolvedUrls(baseLock);
  const offRegistry = [...collectResolvedUrls(headLock)].filter(
    (url) => !before.has(url) && !isAllowedRegistryUrl(url),
  );
  if (offRegistry.length > 0) {
    return {
      safe: false,
      reason: `package-lock.json resolves ${offRegistry.slice(0, 3).join(", ")} outside the npm registry`,
    };
  }

  const basePackages = baseLock.packages || {};
  for (const [path, headEntry] of Object.entries(headLock.packages || {})) {
    if (!headEntry) continue;
    const baseEntry = basePackages[path];

    if (baseEntry) {
      if (
        baseEntry.version === headEntry.version &&
        baseEntry.resolved === headEntry.resolved &&
        baseEntry.integrity !== headEntry.integrity
      ) {
        return {
          safe: false,
          reason: `package-lock.json changes the integrity hash of ${path} without changing its version`,
        };
      }
      // A package does not change tree between a commit and its child in an
      // ordinary upgrade, and reclassifying one is how the dev tier would be
      // borrowed for a production package.
      if (!!baseEntry.dev !== !!headEntry.dev) {
        return {
          safe: false,
          reason: `package-lock.json moves ${path} ${baseEntry.dev ? "out of" : "into"} the dev tree`,
        };
      }
      // npm never rewrites the tarball of a version it is keeping. Doing both at
      // once is how a substituted package would look.
      if (
        baseEntry.version === headEntry.version &&
        baseEntry.resolved !== headEntry.resolved
      ) {
        return {
          safe: false,
          reason: `package-lock.json replaces the tarball of ${path} without changing its version`,
        };
      }
      if (
        baseEntry.version === headEntry.version &&
        baseEntry.resolved === headEntry.resolved
      ) {
        continue;
      }
    }

    if (!resolvedUrlMatchesPackage(path, headEntry)) {
      return {
        safe: false,
        reason: `package-lock.json resolves ${path} to ${headEntry.resolved}, which is not that package at ${headEntry.version}`,
      };
    }
  }

  const actual = deriveLockfileUpdates(baseLock, headLock, basePackageJson);
  const verdict = evaluateUpdates(actual, policy);
  if (actual.length > 0 && !verdict.safe) {
    return { safe: false, reason: `package-lock.json: ${verdict.reason}` };
  }

  return { safe: true, reason: "" };
}

/** A `uses:` line, split into the part that must not move and the reference. */
function parseUsesLine(line) {
  const match = /^(\s*(?:-\s+)?uses:\s*)(\S+)(\s*#.*)?$/.exec(line);
  if (!match) return null;
  const reference = match[2];
  const at = reference.lastIndexOf("@");
  if (at <= 0) return null;
  return {
    prefix: match[1],
    action: reference.slice(0, at),
    ref: reference.slice(at + 1),
    comment: match[3] || "",
  };
}

/**
 * What an action reference actually is: a release tag (`v5`, `v5.0`, `v5.0.1`,
 * zero-filled to a comparable version) or a commit SHA.
 */
function classifyActionRef(ref) {
  if (/^[0-9a-f]{40}$/i.test(String(ref))) return { kind: "sha" };
  const match = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?$/.exec(String(ref));
  if (match) {
    return {
      kind: "tag",
      version: `${Number(match[1])}.${Number(match[2] || 0)}.${Number(match[3] || 0)}`,
    };
  }
  return { kind: "unknown" };
}

/**
 * The version an action reference resolves to.
 *
 * The executable part of the reference decides: a tag is read as itself, so
 * `@v6 # v5.0.2` is a major upgrade however the comment describes it. Only a SHA
 * pin has no version of its own, and then the comment is a *claim* that
 * `verifyActionReferences` checks against the action's real tags before merging.
 */
function actionVersion(use) {
  if (!use) return null;
  const ref = classifyActionRef(use.ref);
  if (ref.kind === "tag") return ref.version;
  if (ref.kind === "sha") {
    const fromComment = /v?(\d+\.\d+\.\d+)/.exec(use.comment || "");
    return fromComment ? fromComment[1] : null;
  }
  return null;
}

/** Resolves a tag of an action repository to the commit it points at. */
async function actionTagCommit(github, owner, repo, tag) {
  try {
    const ref = await github.rest.git.getRef({
      owner,
      repo,
      ref: `tags/${tag}`,
    });
    const object = ref.data.object;
    if (object.type === "commit") return object.sha;
    const annotated = await github.rest.git.getTag({
      owner,
      repo,
      tag_sha: object.sha,
    });
    return annotated.data.object.sha;
  } catch {
    return null;
  }
}

/**
 * Proves that every SHA-pinned reference really is the release its comment claims.
 *
 * Without this the comment is the only thing saying a new 40-character SHA is a
 * patch, and the comment is written by whoever pushed the commit.
 */
async function verifyActionReferences(github, updates) {
  for (const update of updates || []) {
    if (update.toRefKind !== "sha") continue;

    if (!update.toVersion) {
      return {
        safe: false,
        reason: `${update.name} is pinned to a SHA with no version comment`,
      };
    }

    const [owner, repo] = String(update.name).split("/");
    if (!owner || !repo) {
      return { safe: false, reason: `${update.name} is not a GitHub action` };
    }

    const bare = update.toVersion.replace(/^v/, "");
    const candidates = [`v${bare}`, bare];
    let matched = false;
    for (const tag of candidates) {
      const commit = await actionTagCommit(github, owner, repo, tag);
      if (
        commit &&
        commit.toLowerCase() === String(update.toRef).toLowerCase()
      ) {
        matched = true;
        break;
      }
    }

    if (!matched) {
      return {
        safe: false,
        reason: `${update.name}@${String(update.toRef).slice(0, 12)} is not the commit tagged ${update.toVersion}`,
      };
    }
  }

  return { safe: true, reason: "" };
}

/**
 * Reads the action bumps a workflow diff performs, and refuses anything else.
 *
 * Dependabot updates a workflow by rewriting `uses:` references and nothing else,
 * so any other edit - a changed `run:` command above all - means this is no longer
 * a dependency update, whoever pushed it.
 */
function deriveWorkflowUpdates(baseText, headText) {
  if (typeof baseText !== "string" || typeof headText !== "string") {
    return { problem: "could not be read on both sides" };
  }

  const baseLines = baseText.split("\n");
  const headLines = headText.split("\n");
  if (baseLines.length !== headLines.length) {
    return { problem: "adds or removes lines, not just action references" };
  }

  const updates = [];
  for (let index = 0; index < headLines.length; index++) {
    if (baseLines[index] === headLines[index]) continue;

    const before = parseUsesLine(baseLines[index]);
    const after = parseUsesLine(headLines[index]);
    if (!before || !after) {
      return {
        problem: `changes line ${index + 1}, which is not an action reference`,
      };
    }
    if (before.prefix !== after.prefix) {
      return { problem: `re-indents line ${index + 1}` };
    }
    if (before.action !== after.action) {
      return {
        problem: `swaps the action on line ${index + 1} from ${before.action} to ${after.action}`,
      };
    }

    updates.push({
      name: before.action,
      fromVersion: actionVersion(before),
      toVersion: actionVersion(after),
      toRef: after.ref,
      toRefKind: classifyActionRef(after.ref).kind,
      dependencyType: "github-action",
      removed: false,
    });
  }

  return { updates };
}

/**
 * Validates every changed workflow file and applies the policy to the action
 * versions the diff actually moves.
 */
function evaluateWorkflowChanges(
  changes,
  claimedNames,
  policy = AUTO_MERGE_POLICY,
) {
  const updates = [];

  for (const change of changes || []) {
    const derived = deriveWorkflowUpdates(change.baseText, change.headText);
    if (derived.problem) {
      return { safe: false, reason: `${change.path} ${derived.problem}` };
    }
    updates.push(...derived.updates);
  }

  if (updates.length === 0) {
    return { safe: false, reason: "no action updates could be parsed" };
  }

  if (claimedNames && claimedNames.length > 0) {
    const undeclared = updates
      .map((update) => update.name)
      .filter((name) => !claimedNames.includes(name));
    if (undeclared.length > 0) {
      return {
        safe: false,
        reason: `updates ${undeclared.join(", ")}, which this pull request never declared`,
      };
    }
  }

  const verdict = evaluateUpdates(updates, policy);
  if (!verdict.safe) return { safe: false, reason: verdict.reason, updates };
  return { safe: true, reason: verdict.reason, updates };
}

/**
 * Identifies which bot opened a pull request, if any. Dependabot authors its own
 * pull requests, so the author is proof; Snyk does not, so a Snyk branch counts
 * only when it comes from an account connected to Snyk.
 */
function identifySource(pullRequest, snykAuthors = SNYK_AUTHORS) {
  const login = (pullRequest.user && pullRequest.user.login) || "";
  if (login === DEPENDABOT_LOGIN) return "dependabot";
  if (
    SNYK_BRANCH_PATTERN.test(pullRequest.head.ref) &&
    snykAuthors.includes(login)
  ) {
    return "snyk";
  }
  return null;
}

/** Cheap, payload-only reasons to ignore a pull request. */
function preflight(pullRequest) {
  if (pullRequest.draft)
    return { safe: false, reason: "pull request is a draft" };
  if (pullRequest.head.repo && pullRequest.head.repo.fork) {
    return { safe: false, reason: "pull request comes from a fork" };
  }
  const blocking = (pullRequest.labels || [])
    .map((label) => label.name)
    .filter((name) => BLOCKING_LABELS.includes(name));
  if (blocking.length > 0) {
    return { safe: false, reason: `labelled ${blocking.join(", ")}` };
  }
  return { safe: true, reason: "" };
}

/** Reads a file at a commit. Raw media type, so multi-MB lockfiles come back. */
async function fetchTextAtRef(github, context, path, ref) {
  try {
    const response = await github.rest.repos.getContent({
      owner: context.repo.owner,
      repo: context.repo.repo,
      path,
      ref,
      mediaType: { format: "raw" },
    });
    return typeof response.data === "string"
      ? response.data
      : Buffer.from(response.data.content, response.data.encoding).toString(
          "utf8",
        );
  } catch {
    return null;
  }
}

/** Reads a JSON file at a commit. */
async function fetchJsonAtRef(github, context, path, ref) {
  const raw = await fetchTextAtRef(github, context, path, ref);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Evaluates one pull request against every gate and returns the decision, the head
 * commit it was evaluated against, and the sentence that explains it.
 *
 * Everything is read at one commit, and the head is re-checked at the end, so a
 * commit pushed mid-evaluation cannot inherit the previous commit's green checks.
 */
async function evaluatePullRequest({ github, context, pullRequest }) {
  const source = identifySource(pullRequest);
  if (!source)
    return { source, action: "skip", reason: "not a dependency update" };

  const gate = preflight(pullRequest);
  if (!gate.safe) return { source, action: "skip", reason: gate.reason };

  const { owner, repo } = context.repo;
  const number = pullRequest.number;

  const detail = (
    await github.rest.pulls.get({ owner, repo, pull_number: number })
  ).data;
  const headSha = detail.head.sha;
  const baseSha = detail.base.sha;

  const [files, commits, reviews, checkRuns, statuses] = await Promise.all([
    github.paginate(github.rest.pulls.listFiles, {
      owner,
      repo,
      pull_number: number,
      per_page: 100,
    }),
    github.paginate(github.rest.pulls.listCommits, {
      owner,
      repo,
      pull_number: number,
      per_page: 100,
    }),
    github.paginate(github.rest.pulls.listReviews, {
      owner,
      repo,
      pull_number: number,
      per_page: 100,
    }),
    github
      .paginate(github.rest.checks.listForRef, {
        owner,
        repo,
        ref: headSha,
        per_page: 100,
      })
      .catch(() => []),
    github.rest.repos
      .getCombinedStatusForRef({ owner, repo, ref: headSha })
      .then((response) => response.data.statuses)
      .catch(() => []),
  ]);

  const changedFiles = files.map((file) => file.filename);
  const paths = evaluateChangedFiles(
    changedFiles,
    allowedPathsFor(source, detail.head.ref),
  );
  if (!paths.safe)
    return { source, headSha, action: "skip", reason: paths.reason };

  const touchesManifest = changedFiles.includes("package.json");
  const touchesLockfile = changedFiles.includes("package-lock.json");

  // The head manifest is needed for lockfile-only pull requests too: it is what says
  // whether a changed lockfile entry is a direct production or development package.
  const [basePackageJson, headPackageJson] =
    touchesManifest || touchesLockfile || source === "snyk"
      ? await Promise.all([
          fetchJsonAtRef(github, context, "package.json", baseSha),
          fetchJsonAtRef(github, context, "package.json", headSha),
        ])
      : [null, null];

  let updates;
  if (source === "dependabot") {
    updates = commits.flatMap((commit) =>
      parseDependabotUpdates(commit.commit.message),
    );
  } else {
    const update = parseSnykUpdate(detail.title, basePackageJson || {});
    updates = update ? [update] : [];
  }

  // Action updates are judged on the workflow files themselves. Dependabot types an
  // action as a production dependency in its trailer, which would hold every action
  // bump to patch; the reference in the file is the honest signal.
  const workflowFiles = changedFiles.filter((filename) =>
    filename.startsWith(".github/workflows/"),
  );
  let policy;
  if (workflowFiles.length > 0) {
    const changes = await Promise.all(
      workflowFiles.map(async (path) => ({
        path,
        baseText: await fetchTextAtRef(github, context, path, baseSha),
        headText: await fetchTextAtRef(github, context, path, headSha),
      })),
    );
    policy = evaluateWorkflowChanges(
      changes,
      updates.map((update) => update.name),
    );
    if (policy.safe) {
      const references = await verifyActionReferences(github, policy.updates);
      if (!references.safe) {
        return { source, headSha, action: "skip", reason: references.reason };
      }
    }
  } else {
    policy = evaluateUpdates(updates);
  }
  if (!policy.safe)
    return { source, headSha, action: "skip", reason: policy.reason };

  if (touchesManifest) {
    const manifest = evaluateManifestChanges(
      basePackageJson,
      headPackageJson,
      updates,
    );
    if (!manifest.safe)
      return { source, headSha, action: "skip", reason: manifest.reason };
  }

  if (touchesLockfile) {
    const [baseLock, headLock] = await Promise.all([
      fetchJsonAtRef(github, context, "package-lock.json", baseSha),
      fetchJsonAtRef(github, context, "package-lock.json", headSha),
    ]);
    const lockfile = evaluateLockfileChanges(
      baseLock,
      headLock,
      basePackageJson,
    );
    if (!lockfile.safe)
      return { source, headSha, action: "skip", reason: lockfile.reason };
  }

  const review = evaluateReviews(reviews);
  if (!review.safe)
    return { source, headSha, action: "skip", reason: review.reason };

  if (detail.mergeable === false || detail.mergeable_state === "dirty") {
    return {
      source,
      headSha,
      action: "skip",
      reason: "pull request has merge conflicts",
    };
  }
  if (detail.mergeable === null) {
    return {
      source,
      headSha,
      action: "wait",
      reason: "mergeability not computed yet",
    };
  }

  const checks = evaluateChecks(checkRuns, statuses);
  if (checks.state === "pending") {
    return { source, headSha, action: "wait", reason: checks.reason };
  }
  if (checks.state === "failed") {
    return { source, headSha, action: "skip", reason: checks.reason };
  }

  const current = (
    await github.rest.pulls.get({ owner, repo, pull_number: number })
  ).data;
  if (current.head.sha !== headSha) {
    return {
      source,
      headSha,
      action: "wait",
      reason: "head commit changed while this pull request was being evaluated",
    };
  }

  return { source, headSha, action: "merge", reason: policy.reason };
}

/**
 * Entry point called from the workflow. Sweeps every open pull request rather than
 * only the one that triggered the run, so a pull request whose last check finished
 * during an outage still gets picked up by the next sweep.
 */
async function run({
  github,
  context,
  core,
  dryRun = false,
  pullRequestNumber = null,
}) {
  const { owner, repo } = context.repo;

  const openPullRequests = pullRequestNumber
    ? [
        (
          await github.rest.pulls.get({
            owner,
            repo,
            pull_number: Number(pullRequestNumber),
          })
        ).data,
      ]
    : await github.paginate(github.rest.pulls.list, {
        owner,
        repo,
        state: "open",
        per_page: 100,
      });

  const rows = [];
  for (const pullRequest of openPullRequests) {
    const decision = await evaluatePullRequest({
      github,
      context,
      pullRequest,
    });
    if (!decision.source) continue;

    core.info(
      `#${pullRequest.number} (${decision.source}): ${decision.action} - ${decision.reason}`,
    );
    rows.push([
      `#${pullRequest.number}`,
      decision.source,
      decision.action,
      decision.reason,
    ]);

    if (decision.action !== "merge") continue;

    if (dryRun) {
      core.info(`#${pullRequest.number}: dry run, not merging`);
      continue;
    }

    try {
      await github.rest.issues.createComment({
        owner,
        repo,
        issue_number: pullRequest.number,
        body: [
          "Auto-merging this dependency update: all required checks passed and the update is within the automatic merge policy.",
          "",
          `Updates: ${decision.reason}`,
          "",
          "Policy and gating live in `.github/workflows/auto-merge-dependency-updates.yml`. Add a `do-not-merge` label to hold a future update for manual review.",
        ].join("\n"),
      });

      await github.rest.pulls.merge({
        owner,
        repo,
        pull_number: pullRequest.number,
        // Refuses the merge if anything has been pushed since evaluation, so a new
        // commit cannot ride in on the previous commit's green checks.
        sha: decision.headSha,
        merge_method: MERGE_METHOD,
        commit_title: `${pullRequest.title} (#${pullRequest.number})`,
        commit_message: decision.reason,
      });
      core.info(`#${pullRequest.number}: merged`);
    } catch (error) {
      core.warning(`#${pullRequest.number}: merge failed - ${error.message}`);
      rows[rows.length - 1][2] = "merge failed";
      rows[rows.length - 1][3] = error.message;
    }
  }

  if (rows.length > 0) {
    await core.summary
      .addHeading("Dependency update auto-merge", 3)
      .addTable([
        [
          { data: "PR", header: true },
          { data: "Source", header: true },
          { data: "Action", header: true },
          { data: "Reason", header: true },
        ],
        ...rows,
      ])
      .write();
  } else {
    core.info("No dependency-update pull requests are open.");
  }

  return rows;
}

module.exports = {
  AUTO_MERGE_POLICY,
  REQUIRED_CHECKS,
  ADVISORY_CHECKS,
  BLOCKING_LABELS,
  SNYK_AUTHORS,
  allowedPathsFor,
  classifyVersionChange,
  collectResolvedUrls,
  actionVersion,
  classifyActionRef,
  deriveLockfileUpdates,
  deriveManifestUpdates,
  deriveWorkflowUpdates,
  evaluateChangedFiles,
  evaluateChecks,
  evaluateLockfileChanges,
  evaluateManifestChanges,
  evaluatePullRequest,
  evaluateReviews,
  evaluateUpdates,
  evaluateWorkflowChanges,
  lockEntryDependencyType,
  resolvedUrlMatchesPackage,
  verifyActionReferences,
  identifySource,
  parseDependabotUpdates,
  parseRemovedDependencies,
  parseSnykUpdate,
  parseVersion,
  preflight,
  resolveDependencyType,
  run,
};
