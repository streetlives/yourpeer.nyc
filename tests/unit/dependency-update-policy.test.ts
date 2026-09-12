import { describe, expect, it } from "vitest";

// Plain ESM module, shared with the GitHub Actions runner that executes it
// without a build step.
import {
  classifyChangedFiles,
  classifyDependabot,
  classifySnyk,
  evaluateChecks,
  parseDependabotMetadata,
  parseVersionRanges,
  semverBump,
} from "../../.github/scripts/dependency-update-policy.mjs";

const DEPENDENCY_FILES = ["package.json", "package-lock.json"];

const ALLOWED = {
  "direct:production": ["patch"],
  "direct:development": ["patch", "minor"],
  indirect: ["patch", "minor"],
};

// Verbatim from https://github.com/streetlives/yourpeer.nyc/pull/643 -- a
// security update, which is the case that carries no `update-type`.
const SECURITY_UPDATE = `Bump next from 15.5.9 to 15.5.19

Bumps [next](https://github.com/vercel/next.js) from 15.5.9 to 15.5.19.
- [Release notes](https://github.com/vercel/next.js/releases)
- [Changelog](https://github.com/vercel/next.js/blob/canary/release.js)
- [Commits](https://github.com/vercel/next.js/compare/v15.5.9...v15.5.19)

---
updated-dependencies:
- dependency-name: next
  dependency-version: 15.5.18
  dependency-type: direct:production
...

Signed-off-by: dependabot[bot] <support@github.com>`;

const VERSION_UPDATE = `Bump eslint from 8.57.0 to 8.57.1

Bumps [eslint](https://github.com/eslint/eslint) from 8.57.0 to 8.57.1.

---
updated-dependencies:
- dependency-name: eslint
  dependency-type: direct:development
  update-type: version-update:semver-patch
...

Signed-off-by: dependabot[bot] <support@github.com>`;

const MAJOR_UPDATE = `Bump react from 18.3.1 to 19.0.0

Bumps [react](https://github.com/facebook/react) from 18.3.1 to 19.0.0.

---
updated-dependencies:
- dependency-name: react
  dependency-type: direct:production
  update-type: version-update:semver-major
...

Signed-off-by: dependabot[bot] <support@github.com>`;

const GROUPED_UPDATE = `Bump the dev-dependencies group with 2 updates

Bumps the dev-dependencies group with 2 updates: [prettier](https://github.com/prettier/prettier) and [vitest](https://github.com/vitest-dev/vitest).

Updates \`prettier\` from 3.3.0 to 3.3.3
Updates \`vitest\` from 2.1.0 to 2.2.0

---
updated-dependencies:
- dependency-name: prettier
  dependency-type: direct:development
  update-type: version-update:semver-patch
  dependency-group: dev-dependencies
- dependency-name: vitest
  dependency-type: direct:development
  update-type: version-update:semver-minor
  dependency-group: dev-dependencies
...

Signed-off-by: dependabot[bot] <support@github.com>`;

describe("semverBump", () => {
  it("classifies each level of change", () => {
    expect(semverBump("1.2.3", "2.0.0")).toBe("major");
    expect(semverBump("1.2.3", "1.3.0")).toBe("minor");
    expect(semverBump("1.2.3", "1.2.4")).toBe("patch");
    expect(semverBump("15.5.9", "15.5.19")).toBe("patch");
  });

  it("tolerates version prefixes and returns null for unparseable input", () => {
    expect(semverBump("v1.2.3", "v1.2.4")).toBe("patch");
    expect(semverBump("1.2.3", "next")).toBeNull();
  });
});

describe("parseDependabotMetadata", () => {
  it("reads the trailer terminated by the YAML end marker", () => {
    expect(parseDependabotMetadata(VERSION_UPDATE)).toEqual([
      {
        name: "eslint",
        dependencyType: "direct:development",
        updateType: "version-update:semver-patch",
      },
    ]);
  });

  it("reads every entry of a grouped update", () => {
    const entries = parseDependabotMetadata(GROUPED_UPDATE);
    expect(entries.map((entry: { name: string }) => entry.name)).toEqual([
      "prettier",
      "vitest",
    ]);
  });

  it("returns nothing for a commit with no trailer", () => {
    expect(
      parseDependabotMetadata("Fix the thing\n\nNo metadata here."),
    ).toEqual([]);
  });
});

describe("parseVersionRanges", () => {
  it("reads the single-dependency prose", () => {
    expect(parseVersionRanges(SECURITY_UPDATE).get("next")).toEqual({
      from: "15.5.9",
      to: "15.5.19",
    });
  });

  it("reads the grouped prose", () => {
    const ranges = parseVersionRanges(GROUPED_UPDATE);
    expect(ranges.get("prettier")).toEqual({ from: "3.3.0", to: "3.3.3" });
    expect(ranges.get("vitest")).toEqual({ from: "2.1.0", to: "2.2.0" });
  });
});

describe("classifyDependabot", () => {
  it("allows a patch bump of a production dependency", () => {
    expect(
      classifyDependabot([VERSION_UPDATE], DEPENDENCY_FILES, ALLOWED).safe,
    ).toBe(true);
  });

  it("allows a security update that omits update-type", () => {
    const result = classifyDependabot(
      [SECURITY_UPDATE],
      DEPENDENCY_FILES,
      ALLOWED,
    );
    expect(result.safe).toBe(true);
    expect(result.reason).toContain("15.5.9 -> 15.5.19");
  });

  it("refuses a major bump", () => {
    const result = classifyDependabot(
      [MAJOR_UPDATE],
      DEPENDENCY_FILES,
      ALLOWED,
    );
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("major");
  });

  it("refuses a minor bump of a production dependency", () => {
    const minorProduction = VERSION_UPDATE.replace(
      "direct:development",
      "direct:production",
    ).replace("semver-patch", "semver-minor");
    expect(
      classifyDependabot([minorProduction], DEPENDENCY_FILES, ALLOWED).safe,
    ).toBe(false);
  });

  it("allows a group only when every member is within policy", () => {
    expect(
      classifyDependabot([GROUPED_UPDATE], DEPENDENCY_FILES, ALLOWED).safe,
    ).toBe(true);
    expect(
      classifyDependabot(
        [GROUPED_UPDATE, MAJOR_UPDATE],
        DEPENDENCY_FILES,
        ALLOWED,
      ).safe,
    ).toBe(false);
  });

  it("refuses a commit with no Dependabot metadata", () => {
    const result = classifyDependabot(
      ["Drop the auth check"],
      DEPENDENCY_FILES,
      ALLOWED,
    );
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("no `updated-dependencies` metadata");
  });

  it("refuses an unconfigured dependency type", () => {
    const odd = VERSION_UPDATE.replace("direct:development", "direct:mystery");
    expect(classifyDependabot([odd], DEPENDENCY_FILES, ALLOWED).safe).toBe(
      false,
    );
  });
});

describe("classifySnyk", () => {
  it("allows a lockfile-only fix", () => {
    expect(
      classifySnyk({
        title: "[Snyk] Fix for 3 vulnerabilities",
        branch: "snyk-fix-abc123",
        changedFiles: ["package-lock.json"],
      }).safe,
    ).toBe(true);
  });

  it("allows a same-major security upgrade", () => {
    expect(
      classifySnyk({
        title: "[Snyk] Security upgrade axios from 1.6.0 to 1.7.4",
        branch: "snyk-upgrade-abc123",
        changedFiles: DEPENDENCY_FILES,
      }).safe,
    ).toBe(true);
  });

  it("refuses a major upgrade", () => {
    // Verbatim from streetlives-web#249.
    const result = classifySnyk({
      title: "[Snyk] Security upgrade aws-amplify from 4.3.21 to 5.0.24",
      branch: "snyk-upgrade-abc123",
      changedFiles: DEPENDENCY_FILES,
    });
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("major");
  });

  it("refuses a branch that is not Snyk's", () => {
    expect(
      classifySnyk({
        title: "[Snyk] Fix for 1 vulnerabilities",
        branch: "feature/sneaky",
        changedFiles: ["package-lock.json"],
      }).safe,
    ).toBe(false);
  });
});

describe("classifyChangedFiles", () => {
  it("allows manifests and lockfiles, at the root or nested", () => {
    const result = classifyChangedFiles([
      "package.json",
      "package-lock.json",
      "packages/api/yarn.lock",
    ]);
    expect(result.safe).toBe(true);
    expect(result.manifestsTouched).toBe(true);
  });

  it("reports when only the lockfile moved", () => {
    expect(classifyChangedFiles(["package-lock.json"]).manifestsTouched).toBe(
      false,
    );
  });

  it("refuses a workflow edit, which is what Dependabot's github-actions updates are", () => {
    const result = classifyChangedFiles([
      ".github/workflows/dependency-auto-merge.yml",
    ]);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("outside the dependency manifests");
  });

  it("refuses a source file smuggled in beside a real bump", () => {
    expect(
      classifyChangedFiles([
        "package.json",
        "package-lock.json",
        "src/lib/auth.ts",
      ]).safe,
    ).toBe(false);
  });

  it("refuses an empty diff", () => {
    expect(classifyChangedFiles([]).safe).toBe(false);
  });
});

describe("classifyDependabot file guard", () => {
  it("refuses a patch bump that also rewrites a workflow", () => {
    const result = classifyDependabot(
      [VERSION_UPDATE],
      ["package.json", ".github/workflows/tests.yml"],
      ALLOWED,
    );
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("outside the dependency manifests");
  });
});

describe("classifySnyk file guard", () => {
  it("refuses a 'lockfile fix' that edits the manifest", () => {
    const result = classifySnyk({
      title: "[Snyk] Fix for 2 vulnerabilities",
      branch: "snyk-fix-abc123",
      changedFiles: ["package.json", "package-lock.json"],
    });
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("edits `package.json`");
  });

  it("refuses a Snyk PR that touches source", () => {
    expect(
      classifySnyk({
        title: "[Snyk] Security upgrade axios from 1.6.0 to 1.7.4",
        branch: "snyk-upgrade-abc123",
        changedFiles: ["package.json", "src/index.ts"],
      }).safe,
    ).toBe(false);
  });
});

describe("evaluateChecks", () => {
  const passing = (name: string) => ({
    name,
    status: "completed",
    conclusion: "success",
  });
  const noStatuses = { state: "pending", total_count: 0 };

  it("passes when every required check succeeded", () => {
    const runs = [passing("Unit Tests"), passing("E2E Tests")];
    expect(
      evaluateChecks(runs, runs.length, noStatuses, ["Unit Tests"]).ok,
    ).toBe(true);
  });

  it("treats a skipped run as acceptable, which is how bot PRs leave codex", () => {
    const runs = [
      passing("Unit Tests"),
      {
        name: "codex_auto_approve",
        status: "completed",
        conclusion: "skipped",
      },
    ];
    expect(
      evaluateChecks(runs, runs.length, noStatuses, ["Unit Tests"]).ok,
    ).toBe(true);
  });

  it("refuses when a required check never reported", () => {
    const runs = [passing("Unit Tests")];
    const result = evaluateChecks(runs, runs.length, noStatuses, [
      "Unit Tests",
      "E2E Tests",
    ]);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("E2E Tests");
  });

  it("refuses while a check is still running", () => {
    const runs = [
      passing("Unit Tests"),
      { name: "E2E Tests", status: "in_progress", conclusion: null },
    ];
    expect(
      evaluateChecks(runs, runs.length, noStatuses, ["Unit Tests"]).ok,
    ).toBe(false);
  });

  it("refuses when an unrequired check failed", () => {
    const runs = [
      passing("Unit Tests"),
      { name: "Lighthouse", status: "completed", conclusion: "failure" },
    ];
    expect(
      evaluateChecks(runs, runs.length, noStatuses, ["Unit Tests"]).ok,
    ).toBe(false);
  });

  it("refuses on a failing commit status, which is how Snyk reports", () => {
    const runs = [passing("Unit Tests")];
    const result = evaluateChecks(
      runs,
      runs.length,
      {
        state: "failure",
        total_count: 1,
      },
      ["Unit Tests"],
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("commit status");
  });

  it("refuses a truncated page rather than judging part of the evidence", () => {
    const runs = [passing("Unit Tests")];
    const result = evaluateChecks(runs, 120, noStatuses, ["Unit Tests"]);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("120");
  });
});

describe("semverBump below 1.0.0", () => {
  it("treats a 0.x minor as breaking, because ^0.34.4 does not accept 0.35.0", () => {
    expect(semverBump("0.34.4", "0.35.4")).toBe("major");
  });

  it("still reads a 0.x patch as a patch", () => {
    expect(semverBump("0.34.4", "0.34.9")).toBe("patch");
  });

  it("treats any 0.0.x move as breaking, because ^0.0.3 accepts nothing", () => {
    expect(semverBump("0.0.3", "0.0.4")).toBe("major");
    expect(semverBump("0.0.3", "0.0.3")).toBe("patch");
  });
});

describe("scoped and removed dependencies", () => {
  // Verbatim from streetlives/yourpeer.nyc#716: a security bump of vitest that
  // drops a transitive package on the way. Scoped names arrive YAML-quoted.
  const REMOVAL = `build(deps): bump @vitest/mocker and vitest

Removes \`@vitest/mocker\`

Updates \`vitest\` from 4.1.6 to 4.1.11

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

  it("unquotes a scoped dependency name", () => {
    expect(parseDependabotMetadata(REMOVAL)[0].name).toBe("@vitest/mocker");
  });

  it("allows an indirect dependency being dropped alongside an in-policy bump", () => {
    const result = classifyDependabot([REMOVAL], DEPENDENCY_FILES, ALLOWED);
    expect(result.safe).toBe(true);
    expect(result.reason).toContain("@vitest/mocker removed");
  });

  it("refuses a direct dependency being dropped, which is a change of intent", () => {
    const direct = REMOVAL.replace(
      "  dependency-version:\n  dependency-type: indirect",
      "  dependency-version:\n  dependency-type: direct:production",
    );
    const result = classifyDependabot([direct], DEPENDENCY_FILES, ALLOWED);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("being removed");
  });

  it("refuses a missing version that is not announced as a removal", () => {
    const silent = REMOVAL.replace("Removes `@vitest/mocker`\n\n", "");
    const result = classifyDependabot([silent], DEPENDENCY_FILES, ALLOWED);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("could not determine the size");
  });
});

describe("reconciling Dependabot's label with the actual versions", () => {
  // #718: labelled semver-minor, but 0.34 -> 0.35 is breaking under a caret range.
  const MISLABELLED = `build(deps): bump sharp

Updates \`sharp\` from 0.34.4 to 0.35.4

---
updated-dependencies:
- dependency-name: sharp
  dependency-type: indirect
  update-type: version-update:semver-minor
...`;

  it("takes the harsher of the two sizings", () => {
    const result = classifyDependabot([MISLABELLED], DEPENDENCY_FILES, ALLOWED);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("major");
  });
});
