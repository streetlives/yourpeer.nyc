// Copyright (c) 2026 Streetlives, Inc.
// Use of this source code is governed by the MIT license in LICENSE.

export type CallTarget = {
  locationId: string;
  serviceId?: string;
  href: string;
  label: string;
};
export type CallStatus =
  | "queued"
  | "reserved"
  | "dialing"
  | "active"
  | "ending"
  | "ended"
  | "failed";
export type PublicCall = {
  id: string;
  status: CallStatus;
  position?: number;
  room?: { url: string; token: string };
  number: string;
  extension?: string;
  callerNumber: string;
  connectedAt?: number;
  error?: string;
};
export type CallingConfig = {
  enabled: boolean;
  verifiedNumber: string | null;
  maxCallSeconds?: number;
};
export class CallingError extends Error {
  constructor(
    message: string,
    public uncertain = false,
  ) {
    super(message);
  }
}
export async function callingApi<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/public-calling/${path}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    signal: AbortSignal.timeout(28000),
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response
    .json()
    .catch(() => ({ error: "Calling is temporarily unavailable." }));
  if (!response.ok)
    throw new CallingError(
      data.message || data.error || "Calling is temporarily unavailable.",
      !!data.uncertain,
    );
  return data as T;
}

export function phoneLink(value: string) {
  try {
    let number = value;
    if (/^tel:/i.test(value)) number = decodeURIComponent(value.slice(4));
    else {
      const url = new URL(value);
      if (
        url.protocol !== "https:" ||
        url.hostname !== "voice.google.com" ||
        url.searchParams.get("a") !== "nc"
      )
        return null;
      number = url.searchParams.get("n") || "";
    }
    number = number
      .normalize("NFKC")
      .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, "")
      .replace(/[\u2010-\u2015\u2212]/g, "-")
      .trim();
    const match = number.match(
      /^(\+?[\d().\s-]+?)(?:(?:;ext=|\s*(?:ext\.?|x|#|[,;])\s*)(\d{1,12}))?$/i,
    );
    if (!match) return null;
    let digits = match[1].replace(/\D/g, "");
    if (
      match[1].startsWith("+") &&
      !(digits.length === 11 && digits[0] === "1")
    )
      return null;
    if (digits.length === 11 && digits[0] === "1") digits = digits.slice(1);
    if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return null;
    return { number: `+1${digits}`, extension: match[2] || "" };
  } catch {
    return null;
  }
}

type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
let script: Promise<void> | undefined;
export function loadCallingChallenge() {
  if (window.turnstile) return Promise.resolve();
  if (!script)
    script = new Promise<void>((resolve, reject) => {
      const element = document.createElement("script");
      element.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      element.async = true;
      element.onload = () => resolve();
      element.onerror = () => {
        script = undefined;
        element.remove();
        reject(new Error("Could not load the security check."));
      };
      document.head.appendChild(element);
    });
  return script;
}

export async function callingChallenge(
  sitekey: string,
  action: "public_call" | "public_verify",
  container: HTMLElement,
  signal: AbortSignal,
): Promise<string> {
  await loadCallingChallenge();
  if (signal.aborted) throw new Error("Cancelled.");
  return new Promise((resolve, reject) => {
    let widget: string | undefined;
    let settled = false;
    const done = (error?: string, token?: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      if (widget) window.turnstile?.remove(widget);
      if (error) reject(new Error(error));
      else resolve(token!);
    };
    const cancel = () => done("Cancelled.");
    const timer = setTimeout(
      () => done("Security check timed out. Please try again."),
      120000,
    );
    signal.addEventListener("abort", cancel, { once: true });
    widget = window.turnstile!.render(container, {
      sitekey,
      action,
      appearance: "interaction-only",
      callback: (token: string) => done(undefined, token),
      "error-callback": () => done("Security check failed. Please try again."),
      "expired-callback": () =>
        done("Security check expired. Please try again."),
    });
  });
}
