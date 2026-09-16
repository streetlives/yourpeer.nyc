import { describe, expect, it } from "vitest";

import {
  allowedPathsFor,
  classifyVersionChange,
  evaluateChangedFiles,
  evaluateChecks,
  evaluateReviews,
  evaluateUpdates,
  identifySource,
  parseDependabotUpdates,
  parseSnykUpdate,
  preflight,
  REQUIRED_CHECKS,
  resolveDependencyType,
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
