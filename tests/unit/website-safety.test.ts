import { describe, expect, it, vi } from "vitest";
import {
  assessmentNeedsConfirmation,
  normalizeWebsiteSafetyUrl,
  parseWebsiteSafetyAssessment,
  WebsiteSafetyClient,
  type WebsiteSafetyAssessment,
} from "@/lib/website-safety";

const destination = "https://example.org/apply";

function assessment(
  overrides: Partial<WebsiteSafetyAssessment> = {},
): WebsiteSafetyAssessment {
  return {
    url: destination,
    status: "no_known_warning",
    reasons: [],
    checkedAt: Date.now() - 1_000,
    expiresAt: Date.now() + 60_000,
    stale: false,
    ...overrides,
  };
}

function response(results: WebsiteSafetyAssessment[]) {
  return { ok: true, json: async () => ({ results }) } as Response;
}

describe("website safety metadata", () => {
  it("removes attribution and fragments without conflating meaningful paths or query values", () => {
    expect(
      normalizeWebsiteSafetyUrl(
        "https://example.org/apply?program=food&utm_source=yourpeer.nyc&fbclid=x#hours",
      ),
    ).toBe("https://example.org/apply?program=food");
    expect(
      normalizeWebsiteSafetyUrl(
        "/apply?program=housing",
        "https://example.org",
      ),
    ).toBe("https://example.org/apply?program=housing");
    expect(normalizeWebsiteSafetyUrl("https://example.org/other")).not.toBe(
      destination,
    );
  });

  it("rejects executable/non-web schemes and credential-bearing URLs", () => {
    [
      "javascript:alert(1)",
      "data:text/html,test",
      "file:///tmp/test",
      "https://user:secret@example.org/",
    ].forEach((url) => expect(normalizeWebsiteSafetyUrl(url)).toBeNull());
  });

  it("matches Streetli's raw-query normalization without rewriting nontracking values", () => {
    expect(
      normalizeWebsiteSafetyUrl(
        "https://example.org/apply?q=x%20y~&utm_source=yourpeer.nyc&gbraid=a&mc_cid=b&pk_vid=c&keep=%2Ffoo%3Dbar",
      ),
    ).toBe("https://example.org/apply?q=x%20y~&keep=%2Ffoo%3Dbar");
  });

  it("does not accept a clearance without evidence timestamps or for another URL", () => {
    expect(
      parseWebsiteSafetyAssessment({
        url: destination,
        status: "no_known_warning",
      })?.status,
    ).toBe("unknown");
    expect(
      parseWebsiteSafetyAssessment(assessment(), "https://other.example/"),
    ).toBeNull();
    expect(
      parseWebsiteSafetyAssessment(assessment({ expiresAt: 1e200 }))?.expiresAt,
    ).toBeNull();
  });

  it("requires confirmation for expired metadata and ignores unrecognized backend prose", () => {
    const parsed = parseWebsiteSafetyAssessment({
      ...assessment({ expiresAt: Date.now() - 1 }),
      reasons: [
        "invented-threat",
        "php_advisory_possible",
        "php_advisory_possible",
      ],
    })!;
    expect(parsed.status).toBe("warning");
    expect(parsed.reasons).toEqual(["php_advisory_possible"]);
    expect(assessmentNeedsConfirmation(parsed)).toBe(true);
    expect(assessmentNeedsConfirmation(assessment())).toBe(false);
  });

  it("accepts a fresh check with the backend's twenty-four-hour expiry", () => {
    const checkedAt = Date.now() - 1_000;
    const parsed = parseWebsiteSafetyAssessment(
      assessment({
        checkedAt,
        expiresAt: checkedAt + 24 * 60 * 60_000,
      }),
    )!;
    expect(parsed.status).toBe("no_known_warning");
    expect(parsed.stale).toBe(false);
  });

  it("does not require confirmation for unknown or expired unflagged HTTPS metadata", () => {
    expect(
      assessmentNeedsConfirmation(
        assessment({ status: "unknown", stale: true }),
      ),
    ).toBe(false);
    expect(
      assessmentNeedsConfirmation(
        assessment({ expiresAt: Date.now() - 1, stale: true }),
      ),
    ).toBe(false);
  });
});

describe("WebsiteSafetyClient", () => {
  it("warns about HTTP immediately before any network response", () => {
    const fetcher = vi.fn<typeof fetch>();
    const client = new WebsiteSafetyClient(fetcher);
    expect(client.peek("http://example.org/")).toMatchObject({
      status: "warning",
      reasons: ["unencrypted_http"],
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("deduplicates concurrent requests and batches at most twenty URLs", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async (_url, init) => {
        const { urls } = JSON.parse(init?.body as string) as { urls: string[] };
        return response(urls.map((url) => assessment({ url })));
      });
    const client = new WebsiteSafetyClient(fetcher);
    const urls = Array.from(
      { length: 21 },
      (_, index) => `https://example.org/${index}`,
    );
    await Promise.all([client.lookup(urls), client.lookup(urls.slice(0, 2))]);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(
      fetcher.mock.calls.map(
        ([, init]) => JSON.parse(init?.body as string).urls.length,
      ),
    ).toEqual([20, 1]);
    await client.lookup(urls);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("retains a warning after a failed refresh and clears it after a conclusive fresh check", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        response([
          assessment({ status: "warning", reasons: ["possible_compromise"] }),
        ]),
      )
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce(response([assessment()]));
    const client = new WebsiteSafetyClient(fetcher);
    await client.lookup([destination]);
    const [retained] = await client.lookup([destination], true);
    expect(retained).toMatchObject({
      status: "warning",
      stale: true,
      reasons: ["possible_compromise"],
    });
    const [refreshed] = await client.lookup([destination], true);
    expect(refreshed).toMatchObject({
      status: "no_known_warning",
      stale: false,
      reasons: [],
    });
  });

  it("limits network concurrency to two and prioritizes a clicked-link refresh over queued preloads", async () => {
    const finish: Array<() => void> = [];
    const fetcher = vi.fn<typeof fetch>().mockImplementation((_url, init) => {
      const { urls } = JSON.parse(init?.body as string) as { urls: string[] };
      return new Promise((resolve) => {
        finish.push(() =>
          resolve(response(urls.map((url) => assessment({ url })))),
        );
      });
    });
    const client = new WebsiteSafetyClient(fetcher);
    const preload = client.lookup(
      Array.from({ length: 41 }, (_, index) => `https://example.org/${index}`),
    );
    const refresh = client.lookup([destination], true);
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    finish.shift()!();
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(3));
    expect(JSON.parse(fetcher.mock.calls[2][1]?.body as string).refresh).toBe(
      true,
    );
    finish.shift()!();
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(4));
    finish.splice(0).forEach((complete) => complete());
    await Promise.all([preload, refresh]);
  });

  it("does not let a stale no-warning result remove an earlier warning", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        response([
          assessment({ status: "warning", reasons: ["php_advisory_possible"] }),
        ]),
      )
      .mockResolvedValueOnce(response([assessment({ stale: true })]));
    const client = new WebsiteSafetyClient(fetcher);
    await client.lookup([destination]);
    const [retained] = await client.lookup([destination], true);
    expect(retained.status).toBe("warning");
    expect(retained.reasons).toEqual(["php_advisory_possible"]);
  });

  it("does not replace newer refresh evidence with a slower old cache response", async () => {
    let finishRead!: (value: Response) => void;
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishRead = resolve;
          }),
      )
      .mockResolvedValueOnce(
        response([assessment({ checkedAt: Date.now() - 500 })]),
      );
    const client = new WebsiteSafetyClient(fetcher);
    const read = client.lookup([destination]);
    await client.lookup([destination], true);
    finishRead(
      response([
        assessment({
          status: "warning",
          reasons: ["possible_compromise"],
          checkedAt: Date.now() - 10_000,
        }),
      ]),
    );
    await read;
    expect(client.peek(destination).status).toBe("no_known_warning");
  });

  it("treats malformed/unavailable/missing results as unknown without storing persistent data", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { url: "https://other.example/", status: "no_known_warning" },
        ],
      }),
    } as Response);
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const client = new WebsiteSafetyClient(fetcher);
    const [result] = await client.lookup([destination]);
    expect(result.status).toBe("unknown");
    expect(result.stale).toBe(true);
    expect(setItem).not.toHaveBeenCalled();
    expect(fetcher.mock.calls[0][1]).toMatchObject({
      cache: "no-store",
      credentials: "same-origin",
    });
    setItem.mockRestore();
  });

  it("keeps an explicit HTTP warning even when cached checks report no other warning", async () => {
    const url = "http://example.org/";
    const client = new WebsiteSafetyClient(
      vi.fn<typeof fetch>().mockResolvedValue(response([assessment({ url })])),
    );
    const [result] = await client.lookup([url]);
    expect(result.status).toBe("warning");
    expect(result.reasons).toContain("unencrypted_http");
  });

  it("allows a normal eight-second refresh and still bounds an unavailable endpoint", async () => {
    vi.useFakeTimers();
    try {
      let signal!: AbortSignal;
      const fetcher = vi.fn<typeof fetch>().mockImplementation((_url, init) => {
        signal = init!.signal!;
        return new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(new Error("aborted")));
        });
      });
      const client = new WebsiteSafetyClient(fetcher);
      const pending = client.lookup([destination], true);
      await vi.advanceTimersByTimeAsync(8_000);
      expect(signal.aborted).toBe(false);
      await vi.advanceTimersByTimeAsync(5_001);
      expect(signal.aborted).toBe(true);
      expect((await pending)[0].status).toBe("unknown");
    } finally {
      vi.useRealTimers();
    }
  });
});
