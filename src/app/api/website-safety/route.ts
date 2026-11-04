import { createHash, createHmac, randomBytes } from "node:crypto";
import {
  normalizeWebsiteSafetyUrl,
  parseWebsiteSafetyAssessment,
  unknownWebsiteSafetyAssessment,
  type WebsiteSafetyAssessment,
} from "@/lib/website-safety";

export const runtime = "nodejs";

// This destination is fixed: the route never fetches a submitted website.
const ENDPOINT =
  "https://us-central1-streetli.cloudfunctions.net/streetliWebsiteSafety";
const MAX_URLS = 20;
const MAX_BODY_BYTES = 48_000;
const CACHE_TTL_MS = 60_000;
const cache = new Map<
  string,
  { assessment: Omit<WebsiteSafetyAssessment, "url">; until: number }
>();
let activeRequests = 0;
const refreshAttempts = new Map<string, number>();
const budgetSalt = randomBytes(32).toString("hex");
const clientBudgets = new Map<string, { total: number; refreshes: number }>();
let budgetStartedAt = 0;
let requestsInWindow = 0;

function reserveRequest(request: Request, refresh: boolean, now: number) {
  if (now < budgetStartedAt || now - budgetStartedAt >= 60_000) {
    budgetStartedAt = now;
    requestsInWindow = 0;
    clientBudgets.clear();
  }
  // Forwarding headers are only a best-effort client bucket. The instance-wide
  // cap cannot be bypassed by changing them; Streetli additionally enforces a
  // shared database budget across all server instances before any cache read.
  // Keep only a short-lived keyed digest, never the address itself.
  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unattributed";
  const client = createHmac("sha256", budgetSalt).update(address).digest("hex");
  const previous = clientBudgets.get(client) || { total: 0, refreshes: 0 };
  if (
    requestsInWindow >= 90 ||
    previous.total >= 30 ||
    (refresh && previous.refreshes >= 6)
  )
    return false;
  requestsInWindow++;
  clientBudgets.set(client, {
    total: previous.total + 1,
    refreshes: previous.refreshes + Number(refresh),
  });
  return true;
}

function lookupKey(url: string) {
  return createHash("sha256").update(url).digest("hex");
}

function cachedFor(url: string) {
  const entry = cache.get(lookupKey(url));
  return entry && { ...entry, assessment: { ...entry.assessment, url } };
}

function mergeAssessment(
  previous: WebsiteSafetyAssessment | undefined,
  incoming: WebsiteSafetyAssessment,
): WebsiteSafetyAssessment {
  if (
    previous?.checkedAt &&
    (!incoming.checkedAt || incoming.checkedAt < previous.checkedAt)
  ) {
    return {
      ...previous,
      stale: previous.stale || incoming.status === "unknown",
    };
  }
  if (
    previous?.status === "warning" &&
    (incoming.status === "unknown" ||
      (incoming.status === "no_known_warning" && incoming.stale))
  ) {
    return { ...previous, stale: true };
  }
  return incoming;
}

function response(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

async function readLimitedBody(request: Request): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) return text + decoder.decode();
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return response({ error: "invalid_origin" }, 403);
  }
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    return response({ error: "request_too_large" }, 413);
  }

  let body: unknown;
  try {
    const text = await readLimitedBody(request);
    if (text === null) {
      return response({ error: "request_too_large" }, 413);
    }
    body = JSON.parse(text);
  } catch {
    return response({ error: "invalid_request" }, 400);
  }
  if (!body || typeof body !== "object" || !("urls" in body)) {
    return response({ error: "invalid_request" }, 400);
  }
  const input = body as { urls?: unknown; refresh?: unknown };
  if (
    !Array.isArray(input.urls) ||
    !input.urls.length ||
    input.urls.length > MAX_URLS ||
    (input.refresh !== undefined && typeof input.refresh !== "boolean")
  ) {
    return response({ error: "invalid_request" }, 400);
  }
  const urls: string[] = [];
  for (const value of input.urls) {
    const url =
      typeof value === "string" && value.length <= 2048
        ? normalizeWebsiteSafetyUrl(value)
        : null;
    if (!url) return response({ error: "invalid_url" }, 400);
    if (!urls.includes(url)) urls.push(url);
  }

  const results = new Map<string, WebsiteSafetyAssessment>();
  const refresh = input.refresh === true;
  const now = Date.now();
  if (!reserveRequest(request, refresh, now)) {
    return Response.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Cache-Control": "private, no-store", "Retry-After": "60" },
      },
    );
  }
  for (const url of urls) {
    const cached = cachedFor(url);
    const coolingDown =
      refresh && (refreshAttempts.get(lookupKey(url)) || 0) > now;
    if (coolingDown || (!refresh && cached && cached.until > now)) {
      results.set(
        url,
        cached?.assessment || unknownWebsiteSafetyAssessment(url),
      );
    }
  }
  const missing = urls.filter((url) => !results.has(url));
  const token = process.env.STREETLI_WEBSITE_SAFETY_TOKEN?.trim();

  // An outage/configuration error is unverified, never a clean assessment.
  if (missing.length && token && activeRequests < 4) {
    activeRequests++;
    if (refresh)
      for (const url of missing) {
        if (refreshAttempts.size >= 1000)
          refreshAttempts.delete(refreshAttempts.keys().next().value!);
        refreshAttempts.set(lookupKey(url), now + 30_000);
      }
    try {
      const upstream = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // Semantic query parameters identify different resources. Hash the full
        // normalized key locally rather than disclosing query strings to Streetli.
        body: JSON.stringify({ keys: missing.map(lookupKey), refresh }),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(refresh ? 12_000 : 4_000),
      });
      if (upstream.ok) {
        const payload: unknown = await upstream.json();
        if (payload && typeof payload === "object" && "results" in payload) {
          const items = (payload as { results?: unknown }).results;
          if (Array.isArray(items)) {
            for (const url of missing) {
              const item = items.find(
                (candidate) =>
                  candidate &&
                  typeof candidate === "object" &&
                  candidate.key === lookupKey(url),
              );
              const incoming =
                item && typeof item === "object"
                  ? parseWebsiteSafetyAssessment({ ...item, url }, url)
                  : null;
              if (!incoming) continue;
              const assessment = mergeAssessment(
                cachedFor(url)?.assessment,
                incoming,
              );
              results.set(url, assessment);
              if (cache.size >= 1000) cache.delete(cache.keys().next().value!);
              const { status, reasons, checkedAt, expiresAt, stale } =
                assessment;
              cache.set(lookupKey(url), {
                assessment: { status, reasons, checkedAt, expiresAt, stale },
                until:
                  Date.now() +
                  (assessment.status === "unknown" ? 5_000 : CACHE_TTL_MS),
              });
            }
          }
        }
      }
    } catch {
      // Do not log submitted URLs, credentials, or private verifier responses.
    } finally {
      activeRequests--;
    }
  }

  return response({
    results: urls.map((url) => {
      const assessment = results.get(url);
      const old = cachedFor(url)?.assessment;
      if (
        (!assessment || assessment.status === "unknown") &&
        old?.status === "warning"
      ) {
        return { ...old, stale: true };
      }
      return assessment || unknownWebsiteSafetyAssessment(url);
    }),
  });
}
