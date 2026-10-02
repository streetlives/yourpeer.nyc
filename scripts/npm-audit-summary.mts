// Renders `npm audit --json` output as a GitHub job summary for the advisory
// npm-audit job in .github/workflows/security-audit.yml.
//
// npm audit exits nonzero both when it finds vulnerabilities and when the audit
// itself fails (e.g. a registry outage), and on failure it emits an error-only
// JSON object. This script tells those apart so an outage is reported as
// "unavailable" rather than as zero vulnerabilities. It never throws: any
// unexpected input is reported as unavailable.
//
// The workflow runs it with Node's built-in type stripping (no install step),
// so keep it to erasable TypeScript syntax and Node built-ins only.
//
//   node scripts/npm-audit-summary.mts audit.json
import { appendFileSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const SEVERITY_ORDER = ["critical", "high", "moderate", "low"];

export interface AuditReport {
  summary: string;
  // Text for a `::warning::` annotation, or null when there is nothing to flag.
  warning: string | null;
}

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();

const count = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

function describeFailure(audit: unknown): string | null {
  if (!isObject(audit)) return "npm audit output is not a JSON object";
  if (audit.error !== undefined) {
    const error = isObject(audit.error) ? audit.error : {};
    const parts = [error.code, error.summary].filter(
      (part): part is string => typeof part === "string" && part !== "",
    );
    return parts.length ? parts.join(": ") : "npm audit reported an error";
  }
  if (!isObject(audit.metadata) || !isObject(audit.metadata.vulnerabilities)) {
    return "npm audit output has no vulnerability metadata";
  }
  return null;
}

function formatFix(fixAvailable: unknown): string {
  if (isObject(fixAvailable)) {
    const major = fixAvailable.isSemVerMajor ? " (major)" : "";
    return `${fixAvailable.name}@${fixAvailable.version}${major}`;
  }
  return fixAvailable ? "yes" : "no";
}

function unavailable(reason: string): AuditReport {
  const detail = oneLine(reason);
  return {
    summary: [
      "## npm audit (production dependencies)",
      "",
      `**Audit unavailable:** ${detail}`,
      "",
      "Vulnerability counts are unknown for this run; re-run the workflow later.",
      "",
    ].join("\n"),
    warning: `npm audit could not complete, so no vulnerability report was produced (advisory): ${detail}`,
  };
}

export function renderAuditReport(rawOutput: string): AuditReport {
  let audit: unknown;
  try {
    audit = JSON.parse(rawOutput);
  } catch (err) {
    return unavailable(
      `could not parse npm audit output (${(err as Error).message})`,
    );
  }

  const failure = describeFailure(audit);
  if (failure) return unavailable(failure);

  const { metadata, vulnerabilities } = audit as Json;
  const counts = (metadata as Json).vulnerabilities as Json;
  const lines = [
    "## npm audit (production dependencies)",
    "",
    "| Severity | Count |",
    "|---|---|",
    ...SEVERITY_ORDER.map((s) => `| ${s} | ${count(counts[s])} |`),
  ];

  const rows = Object.values(isObject(vulnerabilities) ? vulnerabilities : {})
    .filter(isObject)
    .filter((v) => v.severity === "critical" || v.severity === "high")
    .sort(
      (a, b) =>
        SEVERITY_ORDER.indexOf(a.severity as string) -
        SEVERITY_ORDER.indexOf(b.severity as string),
    );
  if (rows.length) {
    lines.push(
      "",
      "### High and critical",
      "",
      "| Package | Severity | Direct | Fix available |",
      "|---|---|---|---|",
      ...rows.map(
        (v) =>
          `| ${v.name} | ${v.severity} | ${v.isDirect ? "yes" : ""} | ${formatFix(v.fixAvailable)} |`,
      ),
    );
  }
  lines.push(
    "",
    "Advisory only. Run `npm audit --omit=dev` locally for details.",
    "",
  );

  const severe = count(counts.critical) + count(counts.high);
  return {
    summary: lines.join("\n"),
    warning: severe
      ? `npm audit found ${severe} high or critical vulnerabilities in production dependencies (advisory)`
      : null,
  };
}

function main(auditPath: string) {
  let raw = "";
  try {
    raw = readFileSync(auditPath, "utf8");
  } catch {
    // An unreadable file parses as empty input and is reported as unavailable.
  }
  const { summary, warning } = renderAuditReport(raw);
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) appendFileSync(summaryPath, summary);
  else process.stdout.write(summary);
  if (warning) console.log(`::warning::${warning}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main(process.argv[2] ?? "audit.json");
}
