import { describe, expect, it } from "vitest";
import { renderAuditReport } from "../../scripts/npm-audit-summary.mjs";

const metadata = (counts: Partial<Record<string, number>>) => ({
  vulnerabilities: {
    info: 0,
    low: 0,
    moderate: 0,
    high: 0,
    critical: 0,
    ...counts,
  },
});

describe("renderAuditReport", () => {
  it("renders counts and a high/critical table for a successful audit", () => {
    const report = renderAuditReport(
      JSON.stringify({
        vulnerabilities: {
          lodash: {
            name: "lodash",
            severity: "high",
            isDirect: false,
            fixAvailable: true,
          },
          minimist: {
            name: "minimist",
            severity: "low",
            isDirect: false,
            fixAvailable: true,
          },
          next: {
            name: "next",
            severity: "critical",
            isDirect: true,
            fixAvailable: {
              name: "next",
              version: "15.5.26",
              isSemVerMajor: false,
            },
          },
          swiper: {
            name: "swiper",
            severity: "critical",
            isDirect: true,
            fixAvailable: {
              name: "swiper",
              version: "14.3.0",
              isSemVerMajor: true,
            },
          },
        },
        metadata: metadata({ critical: 2, high: 1, low: 1 }),
      }),
    );

    expect(report.summary).toContain("| critical | 2 |");
    expect(report.summary).toContain("| high | 1 |");
    expect(report.summary).toContain("| moderate | 0 |");
    expect(report.summary).toContain(
      "| next | critical | yes | next@15.5.26 |",
    );
    expect(report.summary).toContain(
      "| swiper | critical | yes | swiper@14.3.0 (major) |",
    );
    expect(report.summary).toContain("| lodash | high |  | yes |");
    expect(report.summary).not.toContain("minimist");
    // Critical rows come before high rows.
    expect(report.summary.indexOf("| swiper |")).toBeLessThan(
      report.summary.indexOf("| lodash |"),
    );
    expect(report.summary).not.toContain("unavailable");
    expect(report.warning).toBe(
      "npm audit found 3 high or critical vulnerabilities in production dependencies (advisory)",
    );
  });

  it("renders zero counts with no warning when the audit is clean", () => {
    const report = renderAuditReport(
      JSON.stringify({ vulnerabilities: {}, metadata: metadata({}) }),
    );

    expect(report.summary).toContain("| critical | 0 |");
    expect(report.summary).not.toContain("### High and critical");
    expect(report.warning).toBeNull();
  });

  it("reports an error-only response as unavailable, not as zero", () => {
    const report = renderAuditReport(
      JSON.stringify({
        error: {
          code: "ENOTFOUND",
          summary:
            "request to https://registry.npmjs.org/-/npm/v1/security/advisories/bulk failed",
          detail: "",
        },
      }),
    );

    expect(report.summary).toContain(
      "**Audit unavailable:** ENOTFOUND: request to https://registry.npmjs.org/-/npm/v1/security/advisories/bulk failed",
    );
    expect(report.summary).not.toContain("| critical |");
    expect(report.warning).toMatch(/^npm audit could not complete/);
  });

  it.each([
    ["empty output", ""],
    ["malformed JSON", "{not json"],
    ["null", "null"],
    ["a JSON array", "[]"],
    ["a JSON string", '"oops"'],
    ["an object without metadata", "{}"],
    ["metadata without vulnerabilities", '{"metadata":{}}'],
    ["null metadata", '{"metadata":null}'],
    ["an error that is not an object", '{"error":null}'],
  ])("reports %s as unavailable without throwing", (_, raw) => {
    const report = renderAuditReport(raw);

    expect(report.summary).toContain("**Audit unavailable:**");
    expect(report.summary).not.toContain("| critical |");
    expect(report.warning).toMatch(/^npm audit could not complete/);
  });

  it("tolerates unexpected shapes inside a successful audit", () => {
    const report = renderAuditReport(
      JSON.stringify({
        vulnerabilities: { broken: null, odd: "string", list: [] },
        metadata: { vulnerabilities: { critical: "many", high: null } },
      }),
    );

    expect(report.summary).toContain("| critical | 0 |");
    expect(report.warning).toBeNull();
  });

  it("keeps multi-line error text on one line for the annotation", () => {
    const report = renderAuditReport(
      JSON.stringify({
        error: { code: "E500", summary: "line one\nline two" },
      }),
    );

    expect(report.warning).not.toContain("\n");
    expect(report.warning).toContain("E500: line one line two");
  });
});
