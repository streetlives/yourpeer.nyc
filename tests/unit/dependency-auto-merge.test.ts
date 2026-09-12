// Covers the privileged path: what the auto-merge job will and will not approve
// and merge. `api` is injected, so these tests exercise the real decision logic
// without touching GitHub.
import { describe, expect, it } from "vitest";

// Plain ESM module, shared with the GitHub Actions runner that executes it
// without a build step.
import {
  evaluatePullRequest,
  run,
  verifyProvenance,
} from "../../.github/scripts/dependency-auto-merge.mjs";

const REPO = "streetlives/yourpeer.nyc";
const HEAD_SHA = "f166ea14aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const CONFIG = {
  baseBranches: ["main"],
  requiredChecks: ["check-types", "Unit Tests"],
  allowedUpdates: {
    "direct:production": ["patch"],
    "direct:development": ["patch", "minor"],
    indirect: ["patch", "minor"],
  },
  mergeMethod: "squash",
};

const DEPENDABOT_COMMIT_MESSAGE = `Bump next from 15.5.9 to 15.5.19

Bumps [next](https://github.com/vercel/next.js) from 15.5.9 to 15.5.19.

---
updated-dependencies:
- dependency-name: next
  dependency-version: 15.5.19
  dependency-type: direct:production
  update-type: version-update:semver-patch
...

Signed-off-by: dependabot[bot] <support@github.com>`;

function botCommit(author = "dependabot[bot]", { verified = true } = {}) {
  return {
    sha: HEAD_SHA,
    author: { login: author },
    committer: { login: author },
    commit: {
      message: DEPENDABOT_COMMIT_MESSAGE,
      verification: { verified, reason: verified ? "valid" : "unsigned" },
    },
  };
}

function passingCheck(name: string) {
  return { name, status: "completed", conclusion: "success" };
}

type State = Record<string, unknown>;

function fixture(overrides: State = {}) {
  return {
    pr: {
      number: 643,
      title: "Bump next from 15.5.9 to 15.5.19",
      state: "open",
      draft: false,
      mergeable: true,
      user: { login: "dependabot[bot]" },
      base: { ref: "main", sha: "1111111122222222333333334444444455555555" },
      head: {
        ref: "dependabot/npm_and_yarn/next-15.5.19",
        sha: HEAD_SHA,
        repo: { full_name: REPO },
      },
      labels: [],
    },
    // Returned on the second /pulls/{n} read, to stand in for a branch that moved
    // mid-inspection.
    prAfter: undefined as Record<string, unknown> | undefined,
    commits: [botCommit()],
    totalCommits: undefined as number | undefined,
    files: [{ filename: "package.json" }, { filename: "package-lock.json" }],
    reviews: [],
    checkRuns: [passingCheck("check-types"), passingCheck("Unit Tests")],
    checkCount: undefined as number | undefined,
    status: { state: "success", total_count: 1 },
    ...overrides,
  };
}

function makeApi(state: ReturnType<typeof fixture>) {
  const calls: {
    method: string;
    path: string;
    body?: Record<string, unknown>;
  }[] = [];
  let prReads = 0;
  const api = async (
    path: string,
    options: { method?: string; body?: string } = {},
  ) => {
    const method = options.method || "GET";
    calls.push({
      method,
      path,
      body: options.body ? JSON.parse(options.body) : undefined,
    });

    if (method === "PUT" && path.endsWith("/merge")) return { merged: true };
    if (method === "POST" && path.endsWith("/reviews")) return { id: 1 };
    if (path.endsWith(`/pulls/${state.pr.number}`)) {
      prReads += 1;
      return prReads > 1 && state.prAfter ? state.prAfter : state.pr;
    }
    // Commits and the diff must come from an immutable base...head comparison, so
    // nothing here answers a request against the PR's mutable ref.
    if (path.includes("/compare/")) {
      expect(path).toContain(`${state.pr.base.sha}...${state.pr.head.sha}`);
      return {
        commits: state.commits,
        total_commits: state.totalCommits ?? state.commits.length,
        files: state.files,
      };
    }
    if (path.includes("/reviews?")) return state.reviews;
    if (path.includes("/check-runs")) {
      return {
        check_runs: state.checkRuns,
        total_count: state.checkCount ?? state.checkRuns.length,
      };
    }
    if (path.endsWith("/status")) return state.status;
    throw new Error(`unexpected request: ${method} ${path}`);
  };
  return { api, calls };
}

async function decide(overrides: State = {}, config = CONFIG) {
  const state = fixture(overrides);
  const { api, calls } = makeApi(state);
  const result = await evaluatePullRequest(state.pr.number, {
    api,
    repo: REPO,
    config,
  });
  const mutations = calls.filter((call) => call.method !== "GET");
  return { result, calls, mutations };
}

describe("evaluatePullRequest", () => {
  it("approves and then merges a signed patch bump with green CI", async () => {
    const { result, mutations } = await decide();

    expect(result.outcome).toBe("merged");
    expect(mutations.map((call) => call.method)).toEqual(["POST", "PUT"]);

    const [approval, merge] = mutations;
    expect(approval.path).toBe(`/repos/${REPO}/pulls/643/reviews`);
    expect(approval.body).toMatchObject({
      event: "APPROVE",
      commit_id: HEAD_SHA,
    });
    // Pinning the merge to the SHA we verified is what stops a push landing in
    // between from riding along.
    expect(merge.body).toMatchObject({ sha: HEAD_SHA, merge_method: "squash" });
  });

  it("does not approve twice when it already approved this head", async () => {
    const { result, mutations } = await decide({
      reviews: [{ user: { login: "github-actions[bot]" }, state: "APPROVED" }],
    });

    expect(result.outcome).toBe("merged");
    expect(mutations.map((call) => call.method)).toEqual(["PUT"]);
  });

  describe("refuses without mutating anything", () => {
    const refuses = async (
      label: string,
      overrides: State,
      expected: RegExp,
    ) => {
      const { result, mutations } = await decide(overrides);
      expect(result.outcome, label).toBe("skipped");
      expect(result.reason, label).toMatch(expected);
      expect(mutations, label).toEqual([]);
    };

    it("an unsigned commit, even when attributed to the bot", async () => {
      // The case that keeps Snyk out: `package.json` is on the allowed-file list
      // and carries the scripts CI runs, so an unsigned commit could replace the
      // very checks that were supposed to vet it.
      await refuses(
        "unsigned",
        { commits: [botCommit("dependabot[bot]", { verified: false })] },
        /no verified signature/,
      );
    });

    it("a commit attributed to someone other than the PR author", async () => {
      await refuses(
        "foreign commit",
        { commits: [botCommit(), botCommit("shakilhossain1")] },
        /not attributed to/,
      );
    });

    it("a Snyk PR, because Snyk does not sign its commits", async () => {
      await refuses(
        "snyk",
        {
          pr: {
            ...fixture().pr,
            title: "[Snyk] Fix for 3 vulnerabilities",
            user: { login: "snyk-bot" },
            head: {
              ref: "snyk-fix-abc123",
              sha: HEAD_SHA,
              repo: { full_name: REPO },
            },
          },
          commits: [botCommit("snyk-bot", { verified: false })],
          files: [{ filename: "package-lock.json" }],
        },
        /no verified signature/,
      );
    });

    it("a human author", async () => {
      await refuses(
        "human",
        { pr: { ...fixture().pr, user: { login: "shakilhossain1" } } },
        /not a dependency bot/,
      );
    });

    it("a fork head", async () => {
      await refuses(
        "fork",
        {
          pr: {
            ...fixture().pr,
            head: {
              ref: "x",
              sha: HEAD_SHA,
              repo: { full_name: "someone/fork" },
            },
          },
        },
        /fork/,
      );
    });

    it("a base branch outside the allowlist", async () => {
      await refuses(
        "base",
        { pr: { ...fixture().pr, base: { ref: "master" } } },
        /targets/,
      );
    });

    it("a draft", async () => {
      await refuses("draft", { pr: { ...fixture().pr, draft: true } }, /draft/);
    });

    it("a do-not-merge label", async () => {
      await refuses(
        "label",
        { pr: { ...fixture().pr, labels: [{ name: "do-not-merge" }] } },
        /do-not-merge/,
      );
    });

    it("a reviewer who requested changes", async () => {
      await refuses(
        "changes requested",
        {
          reviews: [{ user: { login: "jbeard4" }, state: "CHANGES_REQUESTED" }],
        },
        /requested changes/,
      );
    });

    it("a required check that never reported", async () => {
      await refuses(
        "missing check",
        { checkRuns: [passingCheck("check-types")] },
        /Unit Tests/,
      );
    });

    it("a failing check", async () => {
      await refuses(
        "failing check",
        {
          checkRuns: [
            passingCheck("check-types"),
            { name: "Unit Tests", status: "completed", conclusion: "failure" },
          ],
        },
        /failure/,
      );
    });

    it("a red commit status, which is how Snyk reports", async () => {
      await refuses(
        "status",
        { status: { state: "failure", total_count: 1 } },
        /commit status/,
      );
    });

    it("a truncated check-run page", async () => {
      await refuses("truncated checks", { checkCount: 120 }, /120/);
    });

    it("a diff that reaches outside the dependency manifests", async () => {
      await refuses(
        "workflow edit",
        {
          files: [
            { filename: "package.json" },
            { filename: ".github/workflows/tests.yml" },
          ],
        },
        /outside the dependency manifests/,
      );
    });

    it("a major bump", async () => {
      const major = botCommit();
      major.commit.message = DEPENDABOT_COMMIT_MESSAGE.replace(
        "semver-patch",
        "semver-major",
      );
      await refuses("major", { commits: [major] }, /major/);
    });

    it("merge conflicts", async () => {
      await refuses(
        "conflicts",
        { pr: { ...fixture().pr, mergeable: false } },
        /conflicts/,
      );
    });

    it("a closed pull request", async () => {
      await refuses(
        "closed",
        { pr: { ...fixture().pr, state: "closed" } },
        /not open/,
      );
    });
  });
});

describe("verifyProvenance", () => {
  it("accepts commits that are both attributed to the bot and signed", () => {
    expect(verifyProvenance([botCommit()], "dependabot[bot]")).toBeNull();
  });

  it("rejects a commit whose committer differs from its author", () => {
    const mismatched = botCommit();
    mismatched.committer = { login: "shakilhossain1" };
    expect(verifyProvenance([mismatched], "dependabot[bot]")).toMatch(
      /not attributed to/,
    );
  });
});

describe("run", () => {
  it("reports an error per pull request instead of abandoning the batch", async () => {
    const state = fixture();
    const { api } = makeApi(state);
    const silent = { log: () => {}, error: () => {} } as unknown as Console;

    const results = await run({
      api: async (path: string, options?: { method?: string }) =>
        path.endsWith("/pulls/999")
          ? Promise.reject(new Error("boom"))
          : api(path, options),
      repo: REPO,
      config: CONFIG,
      prNumbers: [999, 643],
      log: silent,
    });

    expect(results.map((result) => result.outcome)).toEqual([
      "errored",
      "merged",
    ]);
  });
});

describe("binding the inspection to one revision", () => {
  it("refuses a head that moved between inspection and merge", async () => {
    // The swap Codex reproduced: let a clean head be inspected, then restore the
    // original one before the merge lands.
    const clean = fixture().pr;
    const { result, mutations } = await decide({
      prAfter: {
        ...clean,
        head: {
          ...clean.head,
          sha: "9999999999999999999999999999999999999999",
        },
      },
    });

    expect(result.outcome).toBe("skipped");
    expect(result.reason).toMatch(/head moved/);
    expect(mutations).toEqual([]);
  });

  it("throws rather than judging a truncated commit list", async () => {
    const { api } = makeApi(fixture({ totalCommits: 300 }));
    await expect(
      evaluatePullRequest(643, { api, repo: REPO, config: CONFIG }),
    ).rejects.toThrow(/partial list/);
  });

  it("throws rather than judging a truncated file list", async () => {
    const { api } = makeApi(
      fixture({
        files: Array.from({ length: 300 }, (_, index) => ({
          filename: `packages/p${index}/package.json`,
        })),
      }),
    );
    await expect(
      evaluatePullRequest(643, { api, repo: REPO, config: CONFIG }),
    ).rejects.toThrow(/partial list/);
  });
});
