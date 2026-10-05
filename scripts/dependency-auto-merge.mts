// Merges open Dependabot npm updates and Snyk security-fix PRs once automated
// testing and the Codex review have both passed. Run on a schedule by
// .github/workflows/dependency-auto-merge.yml.
//
// A PR is merged only when every gate below holds; anything else is left for a
// human and the reason is written to the job summary:
//   - it comes from Dependabot (npm) or is a Snyk `snyk-fix-*` PR opened by an
//     author in SNYK_PR_AUTHORS, from a branch in this repository, against main
//   - it changes nothing but package.json and/or package-lock.json
//   - package.json only changes the version of dependencies that already
//     existed, and every direct dependency (in package.json and the lockfile)
//     takes a non-major upgrade (for 0.x versions a minor bump counts as major)
//   - every lockfile package resolves from the public npm registry, and no
//     package newly runs an install script
//   - it is up to date with main, so what was tested is what lands
//   - every check run and commit status on the head commit has passed, and the
//     REQUIRED_CHECKS are among them
//   - Codex's latest review approves the head commit and no one else's latest
//     review requests changes
//   - it is not a draft and does not carry the `no-auto-merge` label
//
// The PR's code is never checked out or executed: everything is read through
// the GitHub API. The workflow runs this with Node's built-in type stripping
// (no install step), so keep it to erasable TypeScript syntax and Node
// built-ins only.
//
//   GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo DRY_RUN=true \
//     node scripts/dependency-auto-merge.mts
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const BASE_BRANCH = "main";
export const OPT_OUT_LABEL = "no-auto-merge";
export const CODEX_REVIEWER = "github-actions[bot]";
export const ALLOWED_FILES = new Set(["package.json", "package-lock.json"]);
export const NPM_REGISTRY = "https://registry.npmjs.org/";
export const REQUIRED_CHECKS = [
  "check-types",
  "check-format",
  "check-lint",
  "check-translations",
  "Unit Tests",
  "E2E Tests",
  "dependency-review",
  "codex_auto_approve",
];
const DEPENDENCY_SECTIONS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
  "overrides",
];

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export interface PullRequest {
  number: number;
  title: string;
  draft: boolean;
  user: { login: string };
  labels: { name: string }[];
  base: { ref: string; repo: { full_name: string } };
  head: { ref: string; sha: string; repo: { full_name: string } | null };
}

export interface CheckRun {
  name: string;
  status: string;
  conclusion: string | null;
}

export interface CommitStatus {
  context: string;
  state: string;
}

export interface Review {
  user: { login: string } | null;
  state: string;
  commit_id: string;
}

// ---- Which PRs are candidates -------------------------------------------

export type Source = "dependabot" | "snyk";

export function detectSource(
  pr: PullRequest,
  snykAuthors: string[],
): Source | null {
  if (
    pr.user.login === "dependabot[bot]" &&
    pr.head.ref.startsWith("dependabot/npm_and_yarn/")
  ) {
    return "dependabot";
  }
  if (
    snykAuthors.includes(pr.user.login) &&
    /^snyk-fix-[0-9a-f]+$/.test(pr.head.ref)
  ) {
    return "snyk";
  }
  return null;
}

export function checkPullRequest(pr: PullRequest): string[] {
  const problems: string[] = [];
  if (pr.draft) problems.push("PR is a draft");
  if (pr.base.ref !== BASE_BRANCH) {
    problems.push(`targets ${pr.base.ref}, not ${BASE_BRANCH}`);
  }
  if (pr.head.repo?.full_name !== pr.base.repo.full_name) {
    problems.push("head branch is not in this repository");
  }
  if (pr.labels.some((label) => label.name === OPT_OUT_LABEL)) {
    problems.push(`has the ${OPT_OUT_LABEL} label`);
  }
  return problems;
}

export function checkChangedFiles(files: string[]): string[] {
  const extra = files.filter((file) => !ALLOWED_FILES.has(file));
  if (extra.length)
    return [`changes files other than package manifests: ${extra.join(", ")}`];
  if (!files.length) return ["changes no files"];
  return [];
}

// ---- Version bumps -------------------------------------------------------

interface Version {
  major: number;
  minor: number;
  patch: number;
}

// Reads the version out of an exact version or a simple ^/~/>= range. Anything
// else (tags, URLs, `npm:` aliases, compound ranges) returns null so it is
// never treated as a safe bump.
export function parseVersion(spec: string): Version | null {
  const match =
    /^(?:\^|~|>=)?v?(\d+)\.(\d+)\.(\d+)(?:[-+][0-9A-Za-z.+-]*)?$/.exec(
      spec.trim(),
    );
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

const compare = (a: Version, b: Version) =>
  a.major - b.major || a.minor - b.minor || a.patch - b.patch;

// Returns a problem description, or null for a safe (non-major, non-downgrade)
// change from `from` to `to`.
export function checkBump(
  name: string,
  from: string,
  to: string,
): string | null {
  const before = parseVersion(from);
  const after = parseVersion(to);
  if (!before || !after) {
    return `${name}: cannot compare versions "${from}" -> "${to}"`;
  }
  if (compare(after, before) < 0) return `${name}: downgrade ${from} -> ${to}`;
  if (
    after.major !== before.major ||
    (before.major === 0 && after.minor !== before.minor)
  ) {
    return `${name}: major update ${from} -> ${to}`;
  }
  return null;
}

const withoutDependencySections = (manifest: Json) =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(manifest).filter(
        ([key]) => !DEPENDENCY_SECTIONS.includes(key),
      ),
    ),
  );

export function checkPackageJson(baseText: string, headText: string): string[] {
  let base: unknown;
  let head: unknown;
  try {
    base = JSON.parse(baseText);
    head = JSON.parse(headText);
  } catch (err) {
    return [`package.json does not parse (${(err as Error).message})`];
  }
  if (!isObject(base) || !isObject(head))
    return ["package.json is not an object"];

  const problems: string[] = [];
  if (withoutDependencySections(base) !== withoutDependencySections(head)) {
    problems.push("package.json changes fields other than dependency versions");
  }
  for (const section of DEPENDENCY_SECTIONS) {
    const before = isObject(base[section]) ? base[section] : {};
    const after = isObject(head[section]) ? head[section] : {};
    for (const name of new Set([
      ...Object.keys(before),
      ...Object.keys(after),
    ])) {
      const from = before[name];
      const to = after[name];
      if (JSON.stringify(from) === JSON.stringify(to)) continue;
      if (typeof from !== "string" || typeof to !== "string") {
        problems.push(
          `${section}.${name} is added, removed, or not a version string`,
        );
      } else {
        const problem = checkBump(`${section}.${name}`, from, to);
        if (problem) problems.push(problem);
      }
    }
  }
  return problems;
}

// Compares package-lock.json v2/v3 `packages` entries. Every fetched package
// must resolve from the npm registry with an integrity hash, and no direct
// dependency may take a major
// update. Transitive packages are left to their parents' semver ranges: a
// minor release of a direct dependency can legitimately require a new major
// of one of its own dependencies.
export function checkLockfile(baseText: string, headText: string): string[] {
  let base: unknown;
  let head: unknown;
  try {
    base = JSON.parse(baseText);
    head = JSON.parse(headText);
  } catch (err) {
    return [`package-lock.json does not parse (${(err as Error).message})`];
  }
  if (
    !isObject(base) ||
    !isObject(head) ||
    !isObject(base.packages) ||
    !isObject(head.packages)
  ) {
    return ["package-lock.json has no packages section"];
  }

  const root = isObject(head.packages[""]) ? head.packages[""] : {};
  const direct = new Set(
    DEPENDENCY_SECTIONS.flatMap((section) =>
      isObject(root[section]) ? Object.keys(root[section]) : [],
    ).map((name) => `node_modules/${name}`),
  );

  const problems: string[] = [];
  for (const [path, entry] of Object.entries(head.packages)) {
    if (path === "" || !isObject(entry)) continue;
    if (entry.link === true) continue;
    // Bundled packages ship inside their parent's tarball, which the parent's
    // integrity hash covers, so they carry neither field themselves.
    if (entry.inBundle !== true) {
      if (typeof entry.resolved !== "string") {
        problems.push(`${path} has no resolved URL`);
      } else if (!entry.resolved.startsWith(NPM_REGISTRY)) {
        problems.push(
          `${path} resolves from outside the npm registry: ${entry.resolved}`,
        );
      }
      if (
        typeof entry.integrity !== "string" ||
        !entry.integrity.startsWith("sha512-")
      ) {
        problems.push(`${path} has no sha512 integrity hash`);
      }
    }
    const previous = base.packages[path];
    if (
      entry.hasInstallScript === true &&
      !(isObject(previous) && previous.hasInstallScript === true)
    ) {
      problems.push(`${path} newly runs an install script`);
    }
    if (
      direct.has(path) &&
      isObject(previous) &&
      typeof previous.version === "string" &&
      typeof entry.version === "string" &&
      previous.version !== entry.version
    ) {
      const problem = checkBump(path, previous.version, entry.version);
      if (problem) problems.push(problem);
    }
  }
  return problems;
}

// ---- Tests and review ----------------------------------------------------

const PASSING = new Set(["success", "neutral", "skipped"]);

export function checkStatuses(
  checkRuns: CheckRun[],
  statuses: CommitStatus[],
): string[] {
  const problems: string[] = [];
  for (const run of checkRuns) {
    if (run.status !== "completed")
      problems.push(`check ${run.name} is ${run.status}`);
    else if (!PASSING.has(run.conclusion ?? "")) {
      problems.push(`check ${run.name} concluded ${run.conclusion}`);
    }
  }
  for (const status of statuses) {
    if (status.state !== "success") {
      problems.push(`status ${status.context} is ${status.state}`);
    }
  }
  const names = new Set(checkRuns.map((run) => run.name));
  const missing = REQUIRED_CHECKS.filter((name) => !names.has(name));
  if (missing.length)
    problems.push(`required checks have not run: ${missing.join(", ")}`);
  return problems;
}

// Reviews come back oldest first. Only the latest approving/requesting review
// from each reviewer counts, mirroring how GitHub tallies them.
export function checkReviews(reviews: Review[], headSha: string): string[] {
  const latest = new Map<string, Review>();
  for (const review of reviews) {
    if (!review.user) continue;
    if (!["APPROVED", "CHANGES_REQUESTED", "DISMISSED"].includes(review.state))
      continue;
    latest.set(review.user.login, review);
  }

  const problems: string[] = [];
  const codex = latest.get(CODEX_REVIEWER);
  if (!codex || codex.state !== "APPROVED") {
    problems.push("Codex has not approved");
  } else if (codex.commit_id !== headSha) {
    problems.push("Codex approved an earlier commit, not the current head");
  }
  for (const [login, review] of latest) {
    if (login !== CODEX_REVIEWER && review.state === "CHANGES_REQUESTED") {
      problems.push(`${login} requested changes`);
    }
  }
  return problems;
}

// ---- GitHub API runner ---------------------------------------------------

interface Context {
  token: string;
  repo: string;
  dryRun: boolean;
  snykAuthors: string[];
}

async function api(
  ctx: Context,
  path: string,
  init: { method?: string; body?: Json; raw?: boolean } = {},
): Promise<unknown> {
  const response = await fetch(
    `https://api.github.com/repos/${ctx.repo}${path}`,
    {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Bearer ${ctx.token}`,
        Accept: init.raw
          ? "application/vnd.github.raw"
          : "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    },
  );
  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `${init.method ?? "GET"} ${path}: ${response.status} ${text.slice(0, 300)}`,
    );
  }
  return init.raw ? text : text ? JSON.parse(text) : null;
}

// Fetches every page of a list endpoint. `key` names the array for endpoints
// that wrap it in an object (e.g. check-runs).
async function apiList<T>(
  ctx: Context,
  path: string,
  key?: string,
): Promise<T[]> {
  const items: T[] = [];
  const separator = path.includes("?") ? "&" : "?";
  for (let page = 1; ; page++) {
    const data = await api(ctx, `${path}${separator}per_page=100&page=${page}`);
    const batch = (key ? (data as Json)[key] : data) as T[];
    items.push(...batch);
    if (batch.length < 100) return items;
  }
}

const fileAt = (ctx: Context, file: string, ref: string) =>
  api(ctx, `/contents/${file}?ref=${encodeURIComponent(ref)}`, {
    raw: true,
  }) as Promise<string>;

async function evaluate(ctx: Context, pr: PullRequest): Promise<string[]> {
  const problems = checkPullRequest(pr);
  if (problems.length) return problems;

  const files = (
    await apiList<{ filename: string }>(ctx, `/pulls/${pr.number}/files`)
  ).map((file) => file.filename);
  problems.push(...checkChangedFiles(files));
  if (problems.length) return problems;

  const comparison = (await api(
    ctx,
    `/compare/${BASE_BRANCH}...${pr.head.sha}`,
  )) as { behind_by: number; merge_base_commit: { sha: string } };
  if (comparison.behind_by > 0) {
    return [
      `behind ${BASE_BRANCH} by ${comparison.behind_by} commit(s); needs a rebase`,
    ];
  }
  const baseSha = comparison.merge_base_commit.sha;

  if (files.includes("package.json")) {
    problems.push(
      ...checkPackageJson(
        await fileAt(ctx, "package.json", baseSha),
        await fileAt(ctx, "package.json", pr.head.sha),
      ),
    );
  }
  problems.push(
    ...checkLockfile(
      await fileAt(ctx, "package-lock.json", baseSha),
      await fileAt(ctx, "package-lock.json", pr.head.sha),
    ),
  );

  const checkRuns = await apiList<CheckRun>(
    ctx,
    `/commits/${pr.head.sha}/check-runs?filter=latest`,
    "check_runs",
  );
  const combined = (await api(ctx, `/commits/${pr.head.sha}/status`)) as {
    statuses: CommitStatus[];
  };
  problems.push(...checkStatuses(checkRuns, combined.statuses));

  const reviews = await apiList<Review>(ctx, `/pulls/${pr.number}/reviews`);
  problems.push(...checkReviews(reviews, pr.head.sha));
  return problems;
}

// PR titles are author-controlled, so escape anything that could break out of
// a Markdown table cell.
export const tableCell = (text: string) =>
  text.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\s+/g, " ");

async function run(ctx: Context): Promise<string> {
  const pulls = await apiList<PullRequest>(
    ctx,
    `/pulls?state=open&base=${BASE_BRANCH}&sort=created&direction=asc`,
  );
  const lines = [
    `## Dependency auto-merge${ctx.dryRun ? " (dry run)" : ""}`,
    "",
    "| PR | Source | Result |",
    "| --- | --- | --- |",
  ];
  let candidates = 0;
  for (const pr of pulls) {
    const source = detectSource(pr, ctx.snykAuthors);
    if (!source) continue;
    candidates++;
    let result: string;
    try {
      const problems = await evaluate(ctx, pr);
      if (problems.length) {
        const shown = problems.slice(0, 5).join("; ");
        const more =
          problems.length > 5 ? `; and ${problems.length - 5} more` : "";
        result = `Skipped: ${shown}${more}`;
      } else if (ctx.dryRun) {
        result = "Would merge";
      } else {
        await api(ctx, `/pulls/${pr.number}/merge`, {
          method: "PUT",
          // Pinning the SHA makes GitHub refuse the merge if the branch moved
          // after it was evaluated.
          body: { merge_method: "squash", sha: pr.head.sha },
        });
        result = "Merged";
      }
    } catch (err) {
      result = `Error: ${(err as Error).message}`;
      console.log(`::warning::PR #${pr.number}: ${(err as Error).message}`);
    }
    lines.push(
      `| #${pr.number} ${tableCell(pr.title)} | ${source} | ${tableCell(result)} |`,
    );
    console.log(`#${pr.number} (${source}): ${result}`);
  }
  if (!candidates)
    lines.push("| none | | No open Dependabot or Snyk fix PRs |");
  return `${lines.join("\n")}\n`;
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo)
    throw new Error("GITHUB_TOKEN and GITHUB_REPOSITORY are required");
  const summary = await run({
    token,
    repo,
    dryRun: process.env.DRY_RUN === "true",
    snykAuthors: (process.env.SNYK_PR_AUTHORS ?? "")
      .split(",")
      .map((login) => login.trim())
      .filter(Boolean),
  });
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) appendFileSync(summaryPath, summary);
  else process.stdout.write(summary);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
