// Copyright (c) 2026 Streetlives, Inc.
// Use of this source code is governed by the MIT license in LICENSE.

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";

const COOKIE = "yp_calling";
const MAX_AGE = 30 * 24 * 60 * 60;
const PATH = "/api/public-calling";
const allowed =
  /^(GET config|POST verification\/(request|confirm)|DELETE verification|POST calls|GET calls\/[\da-f]{32}|POST calls\/[\da-f]{32}\/(start|hangup))$/;

function signature(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function readCallingSession(
  value: string | undefined,
  secret: string,
  now = Date.now(),
) {
  if (!value) return null;
  const [id, expiry, mac, ...rest] = value.split(".");
  if (
    rest.length ||
    !/^[a-f0-9]{64}$/.test(id) ||
    !/^\d+$/.test(expiry) ||
    !mac
  )
    return null;
  const expected = signature(`${id}.${expiry}`, secret);
  if (
    !/^[\w-]{43}$/.test(mac) ||
    !timingSafeEqual(
      new TextEncoder().encode(mac),
      new TextEncoder().encode(expected),
    )
  )
    return null;
  if (Number(expiry) <= now || Number(expiry) > now + MAX_AGE * 1000 + 1000)
    return null;
  return id;
}

export function callingCookie(id: string, secret: string, now = Date.now()) {
  const payload = `${id}.${now + MAX_AGE * 1000}`;
  return `${payload}.${signature(payload, secret)}`;
}

function reply(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Vary: "Cookie" },
  });
}

export function isPublicCallingConfigured() {
  try {
    const origin = new URL(process.env.PUBLIC_CALLING_ORIGIN || "");
    const upstream = new URL(process.env.PUBLIC_CALLING_API_URL || "");
    const safeUrl = (url: URL) =>
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      (url.protocol === "https:" ||
        (process.env.NODE_ENV !== "production" &&
          url.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(url.hostname)));
    if (!safeUrl(origin) || !safeUrl(upstream) || origin.pathname !== "/")
      return false;
  } catch {
    return false;
  }
  return (
    process.env.PUBLIC_CALLING_ENABLED === "true" &&
    !!process.env.PUBLIC_CALLING_API_URL &&
    (process.env.PUBLIC_CALLING_SECRET?.length ?? 0) >= 32 &&
    !!process.env.PUBLIC_CALLING_ORIGIN &&
    !!process.env.PUBLIC_CALLING_CLIENT_IP_HEADER &&
    !!process.env.PUBLIC_CALLING_TURNSTILE_SITE_KEY &&
    !!process.env.PUBLIC_CALLING_TURNSTILE_SECRET
  );
}

export async function handleCallingRequest(
  request: NextRequest,
  segments: string[],
) {
  if (!isPublicCallingConfigured())
    return reply(
      { enabled: false, error: "Browser calling is not available." },
      503,
    );
  const path = segments.join("/");
  if (!allowed.test(`${request.method} ${path}`))
    return reply({ error: "Not found." }, 404);
  const secret = process.env.PUBLIC_CALLING_SECRET!;
  const origin = new URL(process.env.PUBLIC_CALLING_ORIGIN!).origin;
  // Never derive the allowed origin from Host / X-Forwarded-Host.
  if (request.method !== "GET" && request.headers.get("origin") !== origin)
    return reply({ error: "Please call from YourPeer." }, 403);
  if (request.headers.get("sec-fetch-site") === "cross-site")
    return reply({ error: "Please call from YourPeer." }, 403);
  // Deployment MUST overwrite this header at its trusted ingress. No browser-supplied fallback.
  const ip = request.headers
    .get(process.env.PUBLIC_CALLING_CLIENT_IP_HEADER!)
    ?.trim();
  if (!ip || !isIP(ip))
    return reply({ error: "Calling is temporarily unavailable." }, 503);

  let session = readCallingSession(request.cookies.get(COOKIE)?.value, secret);
  const newSession = !session;
  if (!session && path !== "config")
    return reply({ error: "Please reopen the call panel." }, 401);
  session ||= randomBytes(32).toString("hex");
  let body: Record<string, unknown> = {};
  if (request.method === "POST") {
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return reply({ error: "Invalid request." }, 415);
    // Bound bytes while reading; Content-Length can be missing or forged.
    const reader = request.body?.getReader();
    let length = 0;
    const chunks: Uint8Array[] = [];
    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        length += value.length;
        if (length > 8192) {
          await reader.cancel();
          return reply({ error: "Request too large." }, 413);
        }
        chunks.push(value);
      }
    }
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      if (!body || typeof body !== "object" || Array.isArray(body))
        throw new Error();
    } catch {
      return reply({ error: "Invalid request." }, 400);
    }
  }

  if (
    request.method === "POST" &&
    (path === "calls" || path === "verification/request")
  ) {
    const action = path === "calls" ? "public_call" : "public_verify";
    const token = body.turnstileToken;
    if (typeof token !== "string" || !token || token.length > 2048)
      return reply({ error: "Please complete the security check." }, 403);
    try {
      const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          signal: AbortSignal.timeout(10000),
          body: new URLSearchParams({
            secret: process.env.PUBLIC_CALLING_TURNSTILE_SECRET!,
            response: token,
            remoteip: ip,
          }),
        },
      );
      const check = await response.json();
      if (
        !response.ok ||
        check.success !== true ||
        check.hostname !== new URL(origin).hostname ||
        check.action !== action
      )
        throw new Error();
    } catch {
      return reply({ error: "Security check expired. Please try again." }, 403);
    }
    delete body.turnstileToken;
  }

  const remember = body.remember === true;
  delete body.remember;
  const apiBase = process.env.PUBLIC_CALLING_API_URL!.replace(/\/$/, "");
  const url = new URL(`${apiBase}/public-calling/${path}`);
  if (
    url.protocol !== "https:" &&
    !(
      process.env.NODE_ENV !== "production" &&
      ["localhost", "127.0.0.1"].includes(url.hostname)
    )
  )
    return reply({ error: "Calling is temporarily unavailable." }, 503);
  try {
    const upstream = await fetch(url, {
      method: request.method,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(24000),
      headers: {
        "content-type": "application/json",
        "x-public-calling-secret": secret,
        "x-public-calling-session": session,
        "x-public-calling-client-ip": ip,
      },
      ...(request.method === "POST" ? { body: JSON.stringify(body) } : {}),
    });
    const data = await upstream.json();
    const response = reply(data, upstream.status);
    if (
      upstream.ok &&
      ((path === "config" && newSession) ||
        path === "verification/confirm" ||
        (path === "verification" && request.method === "DELETE"))
    ) {
      response.cookies.set(COOKIE, callingCookie(session, secret), {
        httpOnly: true,
        secure: new URL(origin).protocol === "https:",
        sameSite: "strict",
        path: PATH,
        ...(path === "verification/confirm" && remember
          ? { maxAge: MAX_AGE }
          : {}),
      });
    }
    return response;
  } catch {
    // A timed-out call request may already have reached the carrier: client keeps requestId.
    return reply(
      {
        error: "We could not confirm the call status. Please check again.",
        uncertain: true,
      },
      502,
    );
  }
}
