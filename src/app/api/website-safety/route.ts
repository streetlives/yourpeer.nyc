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
  { assessment: WebsiteSafetyAssessment; until: number }
>();
let activeRequests = 0;

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
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
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
  for (const url of urls) {
    const cached = cache.get(url);
    if (!refresh && cached && cached.until > now) {
      results.set(url, cached.assessment);
    }
  }
  const missing = urls.filter((url) => !results.has(url));
  const token = process.env.STREETLI_WEBSITE_SAFETY_TOKEN?.trim();

  // An outage/configuration error is unverified, never a clean assessment.
  if (missing.length && token && activeRequests < 4) {
    activeRequests++;
    try {
      const upstream = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls: missing, refresh }),
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
                  candidate.url === url,
              );
              const incoming = parseWebsiteSafetyAssessment(item, url);
              if (!incoming) continue;
              const assessment = mergeAssessment(
                cache.get(url)?.assessment,
                incoming,
              );
              results.set(url, assessment);
              if (cache.size >= 1000) cache.delete(cache.keys().next().value!);
              cache.set(url, {
                assessment,
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
      const old = cache.get(url)?.assessment;
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
