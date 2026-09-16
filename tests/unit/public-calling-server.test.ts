// @vitest-environment node
// Copyright (c) 2026 Streetlives, Inc. MIT license; see LICENSE.
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  callingCookie,
  handleCallingRequest,
  readCallingSession,
} from "@/lib/public-calling-server";
const secret = "test-only-".repeat(8);
const session = "a".repeat(64);
beforeEach(() => {
  vi.stubEnv("PUBLIC_CALLING_ENABLED", "true");
  vi.stubEnv("PUBLIC_CALLING_API_URL", "https://api.example.org/prod");
  vi.stubEnv("PUBLIC_CALLING_SECRET", secret);
  vi.stubEnv("PUBLIC_CALLING_ORIGIN", "https://yourpeer.nyc");
  vi.stubEnv("PUBLIC_CALLING_CLIENT_IP_HEADER", "cf-connecting-ip");
  vi.stubEnv("PUBLIC_CALLING_TURNSTILE_SITE_KEY", "sitekey");
  vi.stubEnv("PUBLIC_CALLING_TURNSTILE_SECRET", "secret");
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (url) =>
        new Response(
          JSON.stringify(
            String(url).includes("siteverify")
              ? {
                  success: true,
                  hostname: "yourpeer.nyc",
                  action: "public_call",
                }
              : { enabled: true },
          ),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    ),
  );
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
function request(
  path: string,
  method: string,
  body?: object,
  extra: Record<string, string> = {},
) {
  return new NextRequest(`https://yourpeer.nyc/api/public-calling/${path}`, {
    method,
    headers: {
      origin: "https://yourpeer.nyc",
      "content-type": "application/json",
      "cf-connecting-ip": "192.0.2.1",
      cookie: `yp_calling=${callingCookie(session, secret)}`,
      ...extra,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
it("rejects forged and expired session cookies", () => {
  const cookie = callingCookie(session, secret, 10000);
  expect(readCallingSession(cookie, secret, 10001)).toBe(session);
  expect(
    readCallingSession(cookie.replace(session, "b".repeat(64)), secret, 10001),
  ).toBeNull();
  expect(readCallingSession(cookie, secret, 40 * 86400000)).toBeNull();
  expect(
    readCallingSession(cookie.slice(0, -1) + "é", secret, 10001),
  ).toBeNull();
});
it("rejects foreign Origin even with a valid cookie", async () => {
  const response = await handleCallingRequest(
    request("calls", "POST", {}, { origin: "https://evil.example" }),
    ["calls"],
  );
  expect(response.status).toBe(403);
  expect(fetch).not.toHaveBeenCalled();
});
it("requires trusted ingress IP, without falling back to forwarded headers", async () => {
  const response = await handleCallingRequest(
    request("config", "GET", undefined, {
      "cf-connecting-ip": "",
      "x-forwarded-for": "192.0.2.3",
    }),
    ["config"],
  );
  expect(response.status).toBe(503);
  expect(fetch).not.toHaveBeenCalled();
});
it("validates challenge action and hostname before forwarding calls", async () => {
  vi.mocked(fetch).mockResolvedValueOnce(
    Response.json({
      success: true,
      hostname: "evil.example",
      action: "public_call",
    }),
  );
  const response = await handleCallingRequest(
    request("calls", "POST", { turnstileToken: "token" }),
    ["calls"],
  );
  expect(response.status).toBe(403);
  expect(fetch).toHaveBeenCalledTimes(1);
});
it("keeps upstream credentials server-side and strips Turnstile token", async () => {
  const response = await handleCallingRequest(
    request("calls", "POST", { requestId: "id", turnstileToken: "token" }),
    ["calls"],
  );
  expect(response.status).toBe(200);
  const [url, options] = vi.mocked(fetch).mock.calls[1];
  expect(String(url)).toBe("https://api.example.org/prod/public-calling/calls");
  expect(options?.headers).toMatchObject({
    "x-public-calling-session": session,
  });
  expect(options?.body).toBe('{"requestId":"id"}');
  expect(response.headers.get("x-public-calling-secret")).toBeNull();
});
it("blocks arbitrary proxy paths, including provider webhooks and reaper", async () => {
  for (const path of [
    "webhook",
    "reap",
    "../locations",
    "calls/anything/start",
  ]) {
    expect(
      (await handleCallingRequest(request(path, "POST", {}), path.split("/")))
        .status,
    ).toBe(404);
  }
  expect(fetch).not.toHaveBeenCalled();
});
it("accepts API call IDs and preserves persistent cookie when reading config", async () => {
  expect(
    (
      await handleCallingRequest(request(`calls/${"b".repeat(32)}`, "GET"), [
        "calls",
        "b".repeat(32),
      ])
    ).status,
  ).toBe(200);
  const response = await handleCallingRequest(request("config", "GET"), [
    "config",
  ]);
  expect(response.headers.get("set-cookie")).toBeNull();
});
