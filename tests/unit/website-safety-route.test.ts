// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const url = "https://provider.example/resource";

function request(body: unknown, origin = "https://yourpeer.nyc") {
  return new Request("https://yourpeer.nyc/api/website-safety", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });
}

async function route() {
  return (await import("@/app/api/website-safety/route")).POST;
}

describe("website safety server boundary", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("STREETLI_WEBSITE_SAFETY_TOKEN", "server-only-test-token");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("forwards only to Streetli, authenticates server-side, and strips private fields", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        results: [
          {
            url,
            status: "warning",
            reasons: ["php_advisory_possible", "private_internal_reason"],
            checkedAt: Date.now(),
            expiresAt: Date.now() + 60_000,
            stale: false,
            pageText: "private page text",
            contexts: [{ editor: "private" }],
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    const result = await (await route())(request({ urls: [url] }));
    const body = await result.json();
    expect(fetcher).toHaveBeenCalledWith(
      "https://us-central1-streetli.cloudfunctions.net/streetliWebsiteSafety",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer server-only-test-token",
        }),
        redirect: "error",
      }),
    );
    expect(body.results[0].reasons).toEqual(["php_advisory_possible"]);
    expect(JSON.stringify(body)).not.toMatch(/private|server-only-test-token/);
    expect(result.headers.get("cache-control")).toBe("private, no-store");
  });

  it("keeps a previous warning when refresh is inconclusive", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          results: [
            {
              url,
              status: "warning",
              reasons: ["possible_compromise"],
              checkedAt: Date.now(),
              expiresAt: Date.now() + 60_000,
              stale: false,
            },
          ],
        }),
      )
      .mockResolvedValueOnce(Response.json({ results: [] }));
    vi.stubGlobal("fetch", fetcher);
    const post = await route();
    await post(request({ urls: [url] }));
    const result = await post(request({ urls: [url], refresh: true }));
    expect((await result.json()).results[0]).toMatchObject({
      status: "warning",
      reasons: ["possible_compromise"],
      stale: true,
    });
  });

  it("returns unknown when configuration or the upstream is unavailable", async () => {
    vi.stubEnv("STREETLI_WEBSITE_SAFETY_TOKEN", "");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const result = await (await route())(request({ urls: [url] }));
    expect((await result.json()).results[0].status).toBe("unknown");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("does not clear a warning with a stale clean response", async () => {
    const now = Date.now();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          results: [
            {
              url,
              status: "warning",
              reasons: ["possible_compromise"],
              checkedAt: now - 120_000,
              expiresAt: now + 60_000,
              stale: false,
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          results: [
            {
              url,
              status: "no_known_warning",
              reasons: [],
              checkedAt: now - 60_000,
              expiresAt: now - 1_000,
              stale: true,
            },
          ],
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    const post = await route();
    await post(request({ urls: [url] }));
    const result = await post(request({ urls: [url], refresh: true }));
    expect((await result.json()).results[0]).toMatchObject({
      status: "warning",
      reasons: ["possible_compromise"],
      stale: true,
    });
  });

  it("does not replace newer warning evidence with a slower old clean read", async () => {
    const now = Date.now();
    let finishOld!: (value: Response) => void;
    const fetcher = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            finishOld = resolve;
          }),
      )
      .mockResolvedValueOnce(
        Response.json({
          results: [
            {
              url,
              status: "warning",
              reasons: ["php_advisory_possible"],
              checkedAt: now,
              expiresAt: now + 86_400_000,
              stale: false,
            },
          ],
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    const post = await route();
    const oldRequest = post(request({ urls: [url] }));
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    await post(request({ urls: [url], refresh: true }));
    finishOld(
      Response.json({
        results: [
          {
            url,
            status: "no_known_warning",
            reasons: [],
            checkedAt: now - 1_000,
            expiresAt: now + 60_000,
            stale: false,
          },
        ],
      }),
    );
    const oldResult = await oldRequest;
    expect((await oldResult.json()).results[0]).toMatchObject({
      status: "warning",
      reasons: ["php_advisory_possible"],
    });
    const cached = await post(request({ urls: [url] }));
    expect((await cached.json()).results[0].status).toBe("warning");
  });

  it("rejects invalid schemes, oversized batches, and cross-origin requests", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const post = await route();
    expect(
      (await post(request({ urls: ["javascript:alert(1)"] }))).status,
    ).toBe(400);
    expect((await post(request({ urls: Array(21).fill(url) }))).status).toBe(
      400,
    );
    expect(
      (await post(request({ urls: [url] }, "https://untrusted.example")))
        .status,
    ).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
