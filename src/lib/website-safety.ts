// Copyright (c) 2026 Streetlives, Inc.
// Use of this source code is governed by an MIT-style license.

export const WEBSITE_SAFETY_REASON_COPY = {
  unencrypted_http:
    "This link uses an unencrypted HTTP connection. Information sent to this website could be seen or changed by others.",
  https_downgrade:
    "Our latest check found that this website redirects to an unencrypted HTTP connection.",
  php_advisory_possible:
    "This website advertises software that may be affected by a published security advisory. Its patch status has not been verified.",
  possible_compromise:
    "Our latest check found signs that this website may have been compromised.",
  reported_threat:
    "This website has been reported as a possible security threat.",
} as const;

export const PHP_ADVISORY_URL =
  "https://www.php.net/archive/2026.php#2026-10-21-5";

export type WebsiteSafetyReason = keyof typeof WEBSITE_SAFETY_REASON_COPY;
export type WebsiteSafetyStatus = "warning" | "no_known_warning" | "unknown";

export type WebsiteSafetyAssessment = {
  url: string;
  status: WebsiteSafetyStatus;
  reasons: WebsiteSafetyReason[];
  checkedAt: number | null;
  expiresAt: number | null;
  stale: boolean;
};

const MAX_URL_LENGTH = 2048;
const UNKNOWN_RETRY_MS = 30_000;
const READ_TIMEOUT_MS = 5_000;
// The same-origin proxy allows a bounded twelve-second refresh. Do not abort
// the browser request before Streetli's normal eight-second inspection ends.
const REFRESH_TIMEOUT_MS = 13_000;
const MAX_CACHE_ENTRIES = 500;
export const WEBSITE_SAFETY_BATCH_SIZE = 20;

/** Keep destination/query semantics, removing only fragments and attribution. */
export function normalizeWebsiteSafetyUrl(
  raw: string,
  base?: string,
): string | null {
  if (!raw || raw.length > MAX_URL_LENGTH) return null;
  try {
    const url = new URL(raw, base);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      return null;
    }
    url.hash = "";
    const query = url.search
      .slice(1)
      .split("&")
      .filter((part) => {
        let key = part.split("=", 1)[0];
        try {
          key = decodeURIComponent(key.replace(/\+/g, " "));
        } catch {
          return true;
        }
        return !/^utm_|^(?:fbclid|gclid|dclid|gbraid|wbraid|mc_cid|mc_eid|pk_vid)$/i.test(
          key,
        );
      })
      .join("&");
    // URLSearchParams would rewrite meaningful raw encodings (e.g. %20 to +),
    // causing a cache miss against Streetli's registered URL key.
    url.search = query ? `?${query}` : "";
    return url.href;
  } catch {
    return null;
  }
}

export function unknownWebsiteSafetyAssessment(
  url: string,
): WebsiteSafetyAssessment {
  return {
    url,
    status: "unknown",
    reasons: [],
    checkedAt: null,
    expiresAt: null,
    stale: true,
  };
}

function timestamp(value: unknown): number | null {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= 8_640_000_000_000_000
    ? value
    : null;
}

export function parseWebsiteSafetyAssessment(
  value: unknown,
  expectedUrl?: string,
): WebsiteSafetyAssessment | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const url =
    typeof record.url === "string"
      ? normalizeWebsiteSafetyUrl(record.url)
      : null;
  if (!url || (expectedUrl && url !== expectedUrl)) return null;
  const reasons = Array.isArray(record.reasons)
    ? Array.from(
        new Set(
          record.reasons.filter(
            (reason): reason is WebsiteSafetyReason =>
              typeof reason === "string" &&
              Object.prototype.hasOwnProperty.call(
                WEBSITE_SAFETY_REASON_COPY,
                reason,
              ),
          ),
        ),
      )
    : [];
  const checkedAt = timestamp(record.checkedAt);
  const expiresAt = timestamp(record.expiresAt);
  const stale =
    record.stale !== false ||
    !checkedAt ||
    !expiresAt ||
    checkedAt > Date.now() + 5 * 60_000 ||
    expiresAt < checkedAt ||
    expiresAt <= Date.now();
  const status = reasons.length
    ? "warning"
    : record.status === "no_known_warning" && checkedAt && expiresAt
      ? "no_known_warning"
      : "unknown";
  return { url, status, reasons, checkedAt, expiresAt, stale };
}

export function assessmentNeedsConfirmation(
  assessment: WebsiteSafetyAssessment,
): boolean {
  return assessment.status === "warning" || assessment.reasons.length > 0;
}

function withTransportWarning(
  assessment: WebsiteSafetyAssessment,
): WebsiteSafetyAssessment {
  if (!assessment.url.startsWith("http:")) return assessment;
  return {
    ...assessment,
    status: "warning",
    reasons: Array.from(
      new Set(["unencrypted_http" as const, ...assessment.reasons]),
    ),
  };
}

/** Memory only: no persistent identifiers, URLs in storage, or visitor tracking. */
export class WebsiteSafetyClient {
  private cache = new Map<
    string,
    { assessment: WebsiteSafetyAssessment; receivedAt: number }
  >();
  private pending = new Map<string, Promise<WebsiteSafetyAssessment>>();
  private activeRequests = 0;
  private queued: Array<() => void> = [];

  constructor(private request: typeof fetch = fetch) {}

  private takeSlot(refresh: boolean): Promise<void> {
    return new Promise((resolve) => {
      const start = () => {
        this.activeRequests++;
        resolve();
      };
      if (this.activeRequests < 2) start();
      else if (refresh) this.queued.unshift(start);
      else this.queued.push(start);
    });
  }

  private releaseSlot() {
    this.activeRequests--;
    this.queued.shift()?.();
  }

  peek(url: string): WebsiteSafetyAssessment {
    const assessment =
      this.cache.get(url)?.assessment ?? unknownWebsiteSafetyAssessment(url);
    return withTransportWarning({
      ...assessment,
      stale:
        assessment.stale ||
        !assessment.expiresAt ||
        assessment.expiresAt <= Date.now(),
    });
  }

  private remember(incoming: WebsiteSafetyAssessment): WebsiteSafetyAssessment {
    const current = this.cache.get(incoming.url)?.assessment;
    let assessment = incoming;
    // Failed/incomplete checks cannot clear an earlier warning. A conclusive,
    // fresh check can clear it after the provider has fixed its website.
    if (
      current &&
      ((current.status === "warning" &&
        (incoming.status === "unknown" ||
          (incoming.status === "no_known_warning" && incoming.stale))) ||
        (current.checkedAt &&
          incoming.checkedAt &&
          incoming.checkedAt < current.checkedAt))
    ) {
      assessment = {
        ...current,
        stale: current.stale || incoming.status === "unknown",
      };
    }
    this.cache.delete(incoming.url);
    this.cache.set(incoming.url, { assessment, receivedAt: Date.now() });
    if (this.cache.size > MAX_CACHE_ENTRIES) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    return this.peek(incoming.url);
  }

  async lookup(
    urls: string[],
    refresh = false,
  ): Promise<WebsiteSafetyAssessment[]> {
    const normalized = Array.from(
      new Set(
        urls.map((url) => normalizeWebsiteSafetyUrl(url)).filter(Boolean),
      ),
    ) as string[];
    const promises = new Map<string, Promise<WebsiteSafetyAssessment>>();
    const needed: string[] = [];
    normalized.forEach((url) => {
      const entry = this.cache.get(url);
      const key = `${refresh ? "refresh:" : "read:"}${url}`;
      const pending = this.pending.get(key);
      if (pending) {
        promises.set(url, pending);
      } else if (
        !refresh &&
        entry &&
        ((!this.peek(url).stale && entry.assessment.status !== "unknown") ||
          Date.now() - entry.receivedAt < UNKNOWN_RETRY_MS)
      ) {
        promises.set(url, Promise.resolve(this.peek(url)));
      } else {
        needed.push(url);
      }
    });
    for (
      let offset = 0;
      offset < needed.length;
      offset += WEBSITE_SAFETY_BATCH_SIZE
    ) {
      const batch = needed.slice(offset, offset + WEBSITE_SAFETY_BATCH_SIZE);
      const result = this.fetchBatch(batch, refresh);
      batch.forEach((url) => {
        const key = `${refresh ? "refresh:" : "read:"}${url}`;
        const promise = result
          .then((results) => results.get(url) ?? this.peek(url))
          .finally(() => this.pending.delete(key));
        this.pending.set(key, promise);
        promises.set(url, promise);
      });
    }
    return Promise.all(normalized.map((url) => promises.get(url)!));
  }

  private async fetchBatch(
    urls: string[],
    refresh: boolean,
  ): Promise<Map<string, WebsiteSafetyAssessment>> {
    await this.takeSlot(refresh);
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      refresh ? REFRESH_TIMEOUT_MS : READ_TIMEOUT_MS,
    );
    const results = new Map<string, WebsiteSafetyAssessment>();
    try {
      const response = await this.request("/api/website-safety", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls, refresh }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Website assessment unavailable");
      const payload: unknown = await response.json();
      const values =
        payload && typeof payload === "object" && "results" in payload
          ? (payload as { results: unknown }).results
          : null;
      if (Array.isArray(values)) {
        values.forEach((value) => {
          const assessment = parseWebsiteSafetyAssessment(value);
          if (assessment && urls.includes(assessment.url)) {
            results.set(assessment.url, this.remember(assessment));
          }
        });
      }
    } catch {
      // Never turn a missing endpoint, timeout, or malformed response into a
      // clearance. Preserve any existing warning on this destination.
    } finally {
      clearTimeout(timeout);
      this.releaseSlot();
    }
    urls.forEach((url) => {
      if (!results.has(url)) {
        results.set(url, this.remember(unknownWebsiteSafetyAssessment(url)));
      }
    });
    return results;
  }
}
