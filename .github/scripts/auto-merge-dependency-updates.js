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
};

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

/** Identifies which bot opened a pull request, if any. */
function identifySource(pullRequest) {
  const login = (pullRequest.user && pullRequest.user.login) || "";
  if (login === DEPENDABOT_LOGIN) return "dependabot";
  if (SNYK_BRANCH_PATTERN.test(pullRequest.head.ref)) return "snyk";
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

async function fetchPackageJson(github, context, ref) {
  try {
    const response = await github.rest.repos.getContent({
      owner: context.repo.owner,
      repo: context.repo.repo,
      path: "package.json",
      ref,
    });
    return JSON.parse(
      Buffer.from(response.data.content, response.data.encoding).toString(
        "utf8",
      ),
    );
  } catch {
    return {};
  }
}

/**
 * Evaluates one pull request against every gate and returns the decision plus the
 * sentence that explains it.
 */
async function evaluatePullRequest({ github, context, pullRequest }) {
  const source = identifySource(pullRequest);
  if (!source)
    return { source, action: "skip", reason: "not a dependency update" };

  const gate = preflight(pullRequest);
  if (!gate.safe) return { source, action: "skip", reason: gate.reason };

  const { owner, repo } = context.repo;
  const number = pullRequest.number;

  const [detail, files, commits, reviews, checkRuns, combinedStatus] =
    await Promise.all([
      github.rest.pulls.get({ owner, repo, pull_number: number }),
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
          ref: pullRequest.head.sha,
          per_page: 100,
        })
        .catch(() => []),
      github.rest.repos
        .getCombinedStatusForRef({ owner, repo, ref: pullRequest.head.sha })
        .then((response) => response.data.statuses)
        .catch(() => []),
    ]);

  const paths = evaluateChangedFiles(
    files.map((file) => file.filename),
    allowedPathsFor(source, pullRequest.head.ref),
  );
  if (!paths.safe) return { source, action: "skip", reason: paths.reason };

  let updates;
  if (source === "dependabot") {
    updates = commits.flatMap((commit) =>
      parseDependabotUpdates(commit.commit.message),
    );
  } else {
    const packageJson = await fetchPackageJson(
      github,
      context,
      pullRequest.base.sha,
    );
    const update = parseSnykUpdate(pullRequest.title, packageJson);
    updates = update ? [update] : [];
  }

  const policy = evaluateUpdates(updates);
  if (!policy.safe) return { source, action: "skip", reason: policy.reason };

  const review = evaluateReviews(reviews);
  if (!review.safe) return { source, action: "skip", reason: review.reason };

  if (
    detail.data.mergeable === false ||
    detail.data.mergeable_state === "dirty"
  ) {
    return {
      source,
      action: "skip",
      reason: "pull request has merge conflicts",
    };
  }
  if (detail.data.mergeable === null) {
    return { source, action: "wait", reason: "mergeability not computed yet" };
  }

  const checks = evaluateChecks(checkRuns, combinedStatus);
  if (checks.state === "pending") {
    return { source, action: "wait", reason: checks.reason };
  }
  if (checks.state === "failed") {
    return { source, action: "skip", reason: checks.reason };
  }

  return { source, action: "merge", reason: policy.reason };
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
  pullRequestNumber,
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
  allowedPathsFor,
  classifyVersionChange,
  evaluateChangedFiles,
  evaluateChecks,
  evaluatePullRequest,
  evaluateReviews,
  evaluateUpdates,
  identifySource,
  parseDependabotUpdates,
  parseRemovedDependencies,
  parseSnykUpdate,
  parseVersion,
  preflight,
  resolveDependencyType,
  run,
};
