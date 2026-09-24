// Copyright (c) 2026 Streetlives, Inc.
// Use of this source code is governed by the MIT license in LICENSE.
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { GripHorizontal, Mic, MicOff, PhoneOff, X } from "lucide-react";
import { toast } from "sonner";
import { TranslatableText } from "@/components/translatable-text";
import {
  callingApi,
  callingChallenge,
  CallingConfig,
  CallTarget,
  loadCallingChallenge,
  phoneLink,
  PublicCall,
} from "./calling-client";
import type { CallingAudio } from "./calling-audio";

type Phase =
  | "preparing"
  | "number"
  | "code"
  | "queued"
  | "ready"
  | "dialing"
  | "active"
  | "ended"
  | "error";
type Attempt = {
  target: CallTarget;
  controller: AbortController;
  challengeController?: AbortController;
  stream?: MediaStream;
  token?: string;
  config?: CallingConfig;
  own: boolean;
  choosing: boolean;
  choiceSet?: boolean;
  busy: boolean;
  requestId: string;
  call?: PublicCall;
  audio?: CallingAudio;
  future?: boolean;
  connected?: boolean;
};
const CallingContext = createContext<((target: CallTarget) => void) | null>(
  null,
);
const DISMISSED = "yp-callback-prompt-dismissed";
const POSITION = "yp-calling-position";
const text = (value: string) => <TranslatableText text={value} />;
function stopped(attempt: Attempt, current: Attempt | null) {
  return current !== attempt || attempt.controller.signal.aborted;
}
function stopStream(attempt: Attempt) {
  attempt.stream?.getTracks().forEach((track) => track.stop());
  attempt.stream = undefined;
}
function displayPhone(value: string) {
  return value.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, "($1) $2-$3");
}

export function CallingScope({
  locationId,
  serviceId,
  label,
  children,
}: {
  locationId: string;
  serviceId?: string;
  label: string;
  children: React.ReactNode;
}) {
  const call = useContext(CallingContext);
  return (
    <div
      className="contents"
      onClick={(event) => {
        if (
          !call ||
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        if (
          !window.matchMedia("(min-width: 768px) and (pointer: fine)").matches
        )
          return;
        const anchor = (event.target as Element).closest<HTMLAnchorElement>(
          "a[href]",
        );
        if (
          !anchor ||
          !event.currentTarget.contains(anchor) ||
          !phoneLink(anchor.href)
        )
          return;
        event.preventDefault();
        event.stopPropagation();
        call({ locationId, serviceId, label, href: anchor.href });
      }}
    >
      {children}
    </div>
  );
}

export default function PublicCallingProvider({
  enabled,
  sitekey,
  children,
}: {
  enabled: boolean;
  sitekey: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("preparing");
  const [target, setTarget] = useState<CallTarget>();
  const [call, setCall] = useState<PublicCall>();
  const [config, setConfig] = useState<CallingConfig>();
  const [error, setError] = useState("");
  const [number, setNumber] = useState("");
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(false);
  const [working, setWorking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [nextTarget, setNextTarget] = useState<CallTarget>();
  const [position, setPosition] = useState<{ left: number; top: number }>();
  const panel = useRef<HTMLDivElement>(null);
  const challenge = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLDivElement>(null);
  const current = useRef<Attempt | null>(null);
  const configPromise = useRef<Promise<CallingConfig> | null>(null);
  const priorFocus = useRef<HTMLElement | null>(null);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const beginRef = useRef<(target: CallTarget, future?: boolean) => void>(
    () => {},
  );
  const finishRef = useRef<(attempt: Attempt, ask?: boolean) => Promise<void>>(
    async () => {},
  );
  const connectRef = useRef<
    (attempt: Attempt, call: PublicCall) => Promise<void>
  >(async () => {});
  const maybeDialRef = useRef<(attempt: Attempt) => Promise<void>>(
    async () => {},
  );

  useEffect(() => {
    if (
      !enabled ||
      !window.matchMedia("(min-width: 768px) and (pointer: fine)").matches
    )
      return;
    void loadCallingChallenge().catch(() => {});
    configPromise.current ||= callingApi<CallingConfig>("config");
    void configPromise.current.catch(() => {
      configPromise.current = null;
    });
    try {
      const saved = JSON.parse(localStorage.getItem(POSITION) || "null");
      if (Number.isFinite(saved?.left) && Number.isFinite(saved?.top))
        setPosition(saved);
    } catch {
      /* Storage can be unavailable. */
    }
    return () => {
      const attempt = current.current;
      if (!attempt) return;
      attempt.controller.abort();
      stopStream(attempt);
      void attempt.audio?.disconnect();
      if (attempt.call)
        void fetch(`/api/public-calling/calls/${attempt.call.id}/hangup`, {
          method: "POST",
          credentials: "same-origin",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: "{}",
        }).catch(() => {});
    };
  }, [enabled]);

  const clampPosition = useCallback((left: number, top: number) => {
    const rect = panel.current?.getBoundingClientRect();
    const value = {
      left: Math.max(
        8,
        Math.min(left, window.innerWidth - (rect?.width || 360) - 8),
      ),
      top: Math.max(
        8,
        Math.min(top, window.innerHeight - (rect?.height || 400) - 8),
      ),
    };
    setPosition(value);
    try {
      localStorage.setItem(POSITION, JSON.stringify(value));
    } catch {
      /* Optional preference. */
    }
  }, []);
  useEffect(() => {
    if (!open || !panel.current) return;
    const resize = () => {
      const rect = panel.current?.getBoundingClientRect();
      if (
        rect &&
        (rect.bottom > innerHeight - 8 ||
          rect.right > innerWidth - 8 ||
          rect.top < 8)
      )
        clampPosition(rect.left, rect.top);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(panel.current);
    window.addEventListener("resize", resize);
    resize();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [open, clampPosition]);
  useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);
  useEffect(() => {
    if (phase !== "active" || !call?.connectedAt) {
      setElapsed(0);
      return;
    }
    const update = () =>
      setElapsed(
        Math.max(0, Math.floor((Date.now() - call.connectedAt!) / 1000)),
      );
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [phase, call?.connectedAt]);

  const fail = (attempt: Attempt, err: unknown) => {
    if (stopped(attempt, current.current)) return;
    attempt.controller.abort();
    stopStream(attempt);
    void attempt.audio?.disconnect();
    setError(
      err instanceof Error
        ? err.message
        : "Calling is temporarily unavailable.",
    );
    setPhase("error");
    setWorking(false);
    // Keep the call ID / request ID when delivery is uncertain. Never blindly redial.
    if (attempt.call)
      void callingApi(`calls/${attempt.call.id}/hangup`, "POST", {}).catch(
        () => {},
      );
    attempt.busy = false;
  };

  const getChallenge = (
    attempt: Attempt,
    action: "public_call" | "public_verify",
  ) => {
    attempt.challengeController?.abort();
    const controller = new AbortController();
    attempt.challengeController = controller;
    attempt.controller.signal.addEventListener(
      "abort",
      () => controller.abort(),
      { once: true },
    );
    return callingChallenge(
      sitekey,
      action,
      challenge.current!,
      controller.signal,
    ).then((token) => {
      if (controller.signal.aborted)
        throw new DOMException("Challenge replaced", "AbortError");
      return token;
    });
  };

  finishRef.current = async (attempt, ask = true) => {
    if (stopped(attempt, current.current)) return;
    attempt.controller.abort();
    stopStream(attempt);
    await attempt.audio?.disconnect();
    setPhase("ended");
    setWorking(false);
    setNextTarget(undefined);
    let ended = true;
    if (attempt.call && !["ended", "failed"].includes(attempt.call.status)) {
      try {
        await callingApi(`calls/${attempt.call.id}/hangup`, "POST", {});
      } catch {
        ended = false;
        setError(
          "Your audio has stopped. We are still confirming that the phone call ended.",
        );
      }
    }
    if (
      !ended ||
      !ask ||
      !attempt.call ||
      !attempt.connected ||
      attempt.own ||
      attempt.future
    )
      return;
    try {
      if (localStorage.getItem(DISMISSED)) return;
    } catch {
      /* Still usable without storage. */
    }
    const dismiss = () => {
      try {
        localStorage.setItem(DISMISSED, "1");
      } catch {
        /* Optional preference. */
      }
    };
    toast("Want callbacks on future calls?", {
      description: "Verify your number to use it next time.",
      duration: 10000,
      action: {
        label: "Add my number",
        onClick: () => beginRef.current(attempt.target, true),
      },
      cancel: { label: "Dismiss", onClick: dismiss },
      onDismiss: dismiss,
    });
  };

  connectRef.current = async (attempt, reserved) => {
    if (stopped(attempt, current.current) || !reserved.room || !attempt.stream)
      return;
    try {
      setPhase("dialing");
      const { CallingAudio } = await import("./calling-audio");
      if (stopped(attempt, current.current)) return;
      const connection = new CallingAudio(
        audio.current!,
        () => void finishRef.current(attempt),
        () => setAudioBlocked(true),
      );
      attempt.audio = connection;
      await connection.connect(
        reserved.room.url,
        reserved.room.token,
        attempt.stream,
      );
      if (stopped(attempt, current.current)) {
        await connection.disconnect();
        return;
      }
      const started = await callingApi<PublicCall>(
        `calls/${reserved.id}/start`,
        "POST",
        {},
      );
      if (stopped(attempt, current.current)) return;
      attempt.call = started;
      setCall(started);
      if (["ending", "ended", "failed"].includes(started.status)) {
        await finishRef.current(attempt, false);
        return;
      }
      if (started.status === "active") attempt.connected = true;
      setPhase(started.status === "active" ? "active" : "dialing");
    } catch (err) {
      fail(attempt, err);
    }
  };

  maybeDialRef.current = async (attempt) => {
    if (
      stopped(attempt, current.current) ||
      attempt.choosing ||
      attempt.busy ||
      !attempt.stream ||
      !attempt.config ||
      !attempt.token ||
      attempt.future
    )
      return;
    attempt.busy = true;
    try {
      const result = await callingApi<PublicCall>("calls", "POST", {
        requestId: attempt.requestId,
        locationId: attempt.target.locationId,
        serviceId: attempt.target.serviceId,
        href: attempt.target.href,
        useOwnNumber: attempt.own,
        turnstileToken: attempt.token,
      });
      attempt.token = undefined;
      attempt.call = result;
      if (stopped(attempt, current.current)) {
        await callingApi(`calls/${result.id}/hangup`, "POST", {});
        return;
      }
      setCall(result);
      if (result.status === "queued") {
        stopStream(attempt);
        setPhase("queued");
      } else if (result.status === "reserved")
        await connectRef.current(attempt, result);
      else
        throw new Error(
          "This call request has already finished. Please select the number again.",
        );
    } catch (err) {
      fail(attempt, err);
    }
  };

  const begin = (newTarget: CallTarget, future = false) => {
    const old = current.current;
    if (future && old && !old.controller.signal.aborted && old.call) {
      toast("Finish your current call before adding a callback number.");
      return;
    }
    if (
      old &&
      !old.controller.signal.aborted &&
      !future &&
      (old.call || old.busy || old.stream || old.choosing)
    ) {
      setNextTarget(newTarget);
      setOpen(true);
      return;
    }
    old?.controller.abort();
    if (old) {
      stopStream(old);
      void old.audio?.disconnect();
    }
    priorFocus.current = document.activeElement as HTMLElement;
    const attempt: Attempt = {
      target: newTarget,
      controller: new AbortController(),
      own: false,
      choosing: future,
      busy: false,
      requestId: crypto.randomUUID(),
      future,
    };
    current.current = attempt;
    setTarget(newTarget);
    setCall(undefined);
    setError("");
    setNumber("");
    setCode("");
    setMuted(false);
    setWorking(false);
    setAudioBlocked(false);
    setOpen(true);
    setPhase(future ? "number" : "preparing");
    const getConfig =
      configPromise.current || callingApi<CallingConfig>("config");
    void getConfig
      .then((value) => {
        if (stopped(attempt, current.current)) return;
        if (!value.enabled)
          throw new Error("Browser calling is temporarily unavailable.");
        attempt.config = value;
        if (!attempt.choosing && !attempt.choiceSet)
          attempt.own = !!value.verifiedNumber;
        setConfig(value);
        void maybeDialRef.current(attempt);
      })
      .catch((err) => fail(attempt, err));
    if (future) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      fail(
        attempt,
        new Error("This browser cannot make calls. Please use your phone."),
      );
      return;
    }
    // Invoke immediately inside the trusted number click, alongside the optional callback choice.
    void navigator.mediaDevices
      .getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      })
      .then((stream) => {
        if (stopped(attempt, current.current)) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        attempt.stream = stream;
        void maybeDialRef.current(attempt);
      })
      .catch(() =>
        fail(
          attempt,
          new Error(
            "Microphone access is needed. Allow it in your browser settings, then try again.",
          ),
        ),
      );
    requestAnimationFrame(() => {
      if (stopped(attempt, current.current) || attempt.challengeController)
        return;
      void getChallenge(attempt, "public_call")
        .then((token) => {
          attempt.token = token;
          void maybeDialRef.current(attempt);
        })
        .catch((err) => {
          if (err?.name !== "AbortError" && !attempt.choosing)
            fail(attempt, err);
        });
    });
  };
  beginRef.current = begin;

  useEffect(() => {
    if (!call || ["ended", "failed"].includes(call.status)) return;
    const attempt = current.current;
    if (!attempt || attempt.controller.signal.aborted) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const latest = await callingApi<PublicCall>(`calls/${call.id}`);
        if (cancelled || stopped(attempt, current.current)) return;
        attempt.call = latest;
        setCall(latest);
        if (["ending", "ended", "failed"].includes(latest.status)) {
          await finishRef.current(attempt);
          return;
        }
        if (latest.status === "reserved" && !attempt.stream) setPhase("ready");
        if (latest.status === "active") {
          attempt.connected = true;
          setPhase("active");
        }
      } catch {
        /* Gateway duration cap and reaper remain authoritative when polling fails. */
      }
      if (!cancelled) timer = setTimeout(poll, 2000);
    };
    timer = setTimeout(poll, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [call]);

  const enroll = async (confirm: boolean) => {
    const attempt = current.current;
    if (!attempt || working) return;
    setWorking(true);
    setError("");
    try {
      if (!confirm) {
        if (!phoneLink(`tel:${number}`))
          throw new Error("Enter a 10-digit US number, including area code.");
        const token = await getChallenge(attempt, "public_verify");
        await callingApi("verification/request", "POST", {
          number,
          turnstileToken: token,
        });
        if (!stopped(attempt, current.current)) setPhase("code");
      } else {
        const verification = await callingApi<{ verified: boolean }>(
          "verification/confirm",
          "POST",
          { code, remember },
        );
        if (!verification.verified)
          throw new Error(
            "That code was not accepted. Please check it and try again.",
          );
        const latest = await callingApi<CallingConfig>("config");
        if (stopped(attempt, current.current)) return;
        configPromise.current = Promise.resolve(latest);
        setConfig(latest);
        attempt.config = latest;
        attempt.own = true;
        if (attempt.future) {
          setPhase("ended");
          toast("Your number is ready for future calls.");
        } else {
          // Verification may outlive the original single-use challenge token.
          attempt.token = await getChallenge(attempt, "public_call");
          attempt.choosing = false;
          setPhase("preparing");
          await maybeDialRef.current(attempt);
        }
      }
    } catch (err) {
      if (!stopped(attempt, current.current))
        setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      if (!stopped(attempt, current.current)) setWorking(false);
    }
  };

  const close = async () => {
    const attempt = current.current;
    if (attempt) await finishRef.current(attempt, false);
    setOpen(false);
    priorFocus.current?.focus();
  };
  const skipEnrollment = async () => {
    const attempt = current.current;
    if (!attempt || working) return;
    if (attempt.future) {
      await close();
      return;
    }
    attempt.own = false;
    attempt.choiceSet = true;
    attempt.choosing = true;
    setWorking(true);
    setError("");
    try {
      // A verification challenge can replace or outlive the initial call challenge.
      attempt.token = await getChallenge(attempt, "public_call");
      if (stopped(attempt, current.current)) return;
      attempt.choosing = false;
      setPhase("preparing");
      await maybeDialRef.current(attempt);
    } catch (err) {
      fail(attempt, err);
    } finally {
      if (!stopped(attempt, current.current)) setWorking(false);
    }
  };
  const statusText: Record<Phase, string> = {
    preparing: "Allow your microphone to start the call",
    number: "Use your number for callbacks",
    code: "Check your phone for a code",
    queued: "Another YourPeer caller is ahead of you",
    ready: "Your turn to call",
    dialing: "Calling…",
    active: "On the call",
    ended: "Call ended",
    error: "Could not connect",
  };
  const busyCall = ["dialing", "active"].includes(phase);

  return (
    <CallingContext.Provider value={enabled ? begin : null}>
      {children}
      {enabled && open && (
        <div
          ref={panel}
          role="dialog"
          aria-modal="false"
          aria-labelledby="yp-call-title"
          tabIndex={-1}
          className="fixed z-[10000] w-[360px] max-w-[calc(100vw-16px)] max-h-[calc(100dvh-16px)] overflow-y-auto rounded-2xl border border-gray-200 bg-white text-dark shadow-xl outline-none"
          style={
            position
              ? { left: position.left, top: position.top }
              : { right: 24, bottom: 24 }
          }
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              void close();
            }
          }}
        >
          <div className="flex items-center justify-between border-b border-gray-100 p-3">
            <button
              aria-label="Move call window"
              className="flex touch-none items-center gap-2 rounded px-2 py-1 text-sm font-medium cursor-move focus-visible:outline focus-visible:outline-2"
              onPointerDown={(event) => {
                const rect = panel.current!.getBoundingClientRect();
                drag.current = {
                  x: event.clientX,
                  y: event.clientY,
                  left: rect.left,
                  top: rect.top,
                };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                const d = drag.current;
                if (d)
                  clampPosition(
                    d.left + event.clientX - d.x,
                    d.top + event.clientY - d.y,
                  );
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
              onPointerCancel={() => {
                drag.current = null;
              }}
              onKeyDown={(event) => {
                const directions: Record<string, number[]> = {
                  ArrowLeft: [-10, 0],
                  ArrowRight: [10, 0],
                  ArrowUp: [0, -10],
                  ArrowDown: [0, 10],
                };
                const delta = directions[event.key];
                if (delta) {
                  event.preventDefault();
                  const rect = panel.current!.getBoundingClientRect();
                  clampPosition(rect.left + delta[0], rect.top + delta[1]);
                }
              }}
            >
              <GripHorizontal size={18} aria-hidden="true" />
              {text("YourPeer call")}
            </button>
            <button
              onClick={() => void close()}
              className="rounded-full p-2 hover:bg-gray-100"
              aria-label="Close and end call"
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <h2 id="yp-call-title" className="text-lg font-semibold">
                {target?.label}
              </h2>
              <p className="mt-1 text-base tabular-nums" translate="no">
                {displayPhone(
                  call?.number || phoneLink(target?.href || "")?.number || "",
                )}
                {call?.extension ? ` ext. ${call.extension}` : ""}
              </p>
            </div>
            <p
              role="status"
              aria-live="polite"
              className="text-sm text-gray-600"
            >
              {text(statusText[phase])}
            </p>
            {phase === "preparing" && !current.current?.busy && (
              <div className="rounded-xl bg-amber-300/20 p-4 text-sm">
                <p>
                  {text(
                    config?.verifiedNumber
                      ? `Calling from ${displayPhone(config.verifiedNumber)}`
                      : "Want this service to call you back?",
                  )}
                </p>
                <button
                  className="mt-2 underline underline-offset-2"
                  onClick={() => {
                    const attempt = current.current;
                    if (attempt && !attempt.busy) {
                      attempt.choosing = true;
                      setPhase("number");
                    }
                  }}
                >
                  {text(
                    config?.verifiedNumber
                      ? "Change my number"
                      : "Use my number",
                  )}
                </button>
                <button
                  className="mt-2 block underline underline-offset-2"
                  onClick={() => {
                    const attempt = current.current;
                    if (attempt && !attempt.busy) {
                      attempt.own = false;
                      attempt.choiceSet = true;
                      attempt.choosing = false;
                      void maybeDialRef.current(attempt);
                    }
                  }}
                >
                  {text("Call through YourPeer")}
                </button>
                <p className="mt-2 text-gray-600">
                  {text(
                    "Otherwise, the call starts when microphone access is allowed.",
                  )}
                </p>
              </div>
            )}
            {(phase === "number" || phase === "code") && (
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void enroll(phase === "code");
                }}
              >
                <p className="text-sm text-gray-600">
                  {text(
                    current.current?.future
                      ? "Use your verified number on future calls. This does not change the call you just made."
                      : "The service will see your verified number and can call you back. Your phone service stays the same.",
                  )}
                </p>
                {phase === "number" ? (
                  <>
                    <label className="block text-sm">
                      {text("Your US phone number")}
                      <input
                        autoFocus
                        type="tel"
                        autoComplete="tel-national"
                        value={number}
                        maxLength={80}
                        onChange={(event) => setNumber(event.target.value)}
                        className="mt-1 w-full rounded-lg border-gray-300 text-base"
                        placeholder="(212) 555-0123"
                        disabled={working}
                      />
                    </label>
                    <label className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(event) => setRemember(event.target.checked)}
                        className="mt-0.5 rounded"
                      />
                      {text("Remember on this device. Avoid shared computers.")}
                    </label>
                  </>
                ) : (
                  <label className="block text-sm">
                    {text("Verification code")}
                    <input
                      autoFocus
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={code}
                      maxLength={8}
                      onChange={(event) =>
                        setCode(event.target.value.replace(/\D/g, ""))
                      }
                      className="mt-1 w-full rounded-lg border-gray-300 text-base tracking-widest"
                      disabled={working}
                    />
                  </label>
                )}
                <button
                  disabled={working || (phase === "code" && code.length < 4)}
                  className="w-full rounded-full bg-amber-300 px-4 py-3 font-medium disabled:opacity-50"
                >
                  {text(
                    working
                      ? "Please wait…"
                      : phase === "number"
                        ? "Text me a code"
                        : "Verify number",
                  )}
                </button>
                <button
                  type="button"
                  className="w-full py-2 text-sm underline"
                  disabled={working}
                  onClick={() => void skipEnrollment()}
                >
                  {text(
                    current.current?.future
                      ? "Cancel"
                      : "Skip and call through YourPeer",
                  )}
                </button>
                {phase === "code" && (
                  <button
                    type="button"
                    className="w-full text-sm underline"
                    disabled={working}
                    onClick={() => setPhase("number")}
                  >
                    {text("Change number or resend code")}
                  </button>
                )}
              </form>
            )}
            {phase === "queued" && (
              <p className="text-sm">
                {text(
                  `YourPeer queue position: ${call?.position || 1}. This is separate from the service’s own phone queue.`,
                )}
              </p>
            )}
            {phase === "ready" && (
              <button
                className="w-full rounded-full bg-amber-300 py-3 font-medium"
                disabled={working}
                onClick={async () => {
                  const attempt = current.current;
                  if (!attempt?.call) return;
                  setWorking(true);
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                      audio: true,
                    });
                    if (stopped(attempt, current.current)) {
                      stream.getTracks().forEach((track) => track.stop());
                      return;
                    }
                    attempt.stream = stream;
                    await connectRef.current(attempt, attempt.call);
                  } catch (err) {
                    fail(attempt, err);
                  } finally {
                    setWorking(false);
                  }
                }}
              >
                {text("Call now")}
              </button>
            )}
            {busyCall && (
              <>
                <p className="text-sm text-gray-600">
                  {text(
                    `Calling from ${current.current?.own ? displayPhone(call?.callerNumber || "") : "YourPeer"}`,
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="tabular-nums" translate="no">
                    {Math.floor(elapsed / 60)}:
                    {String(elapsed % 60).padStart(2, "0")}
                  </span>
                  {text(
                    ` · Up to ${Math.ceil((config?.maxCallSeconds || 900) / 60)} minutes per call`,
                  )}
                </p>
                <div className="flex gap-3">
                  <button
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-300 py-3 text-sm"
                    onClick={async () => {
                      await current.current?.audio?.mute(!muted);
                      setMuted(!muted);
                    }}
                  >
                    {muted ? <MicOff size={18} /> : <Mic size={18} />}
                    {text(muted ? "Unmute" : "Mute")}
                  </button>
                  <button
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 py-3 text-sm text-white"
                    onClick={() => {
                      const attempt = current.current;
                      if (attempt) void finishRef.current(attempt);
                    }}
                  >
                    <PhoneOff size={18} />
                    {text("Hang up")}
                  </button>
                </div>
                {audioBlocked && (
                  <button
                    className="w-full py-2 underline"
                    onClick={() =>
                      void current.current?.audio
                        ?.play()
                        .then(() => setAudioBlocked(false))
                    }
                  >
                    {text("Enable call audio")}
                  </button>
                )}
                {call?.extension && (
                  <button
                    disabled={phase !== "active"}
                    className="w-full py-2 text-sm underline disabled:opacity-50"
                    onClick={async () => {
                      const attempt = current.current;
                      for (const digit of call.extension!) {
                        if (!attempt || stopped(attempt, current.current))
                          break;
                        await attempt.audio?.dtmf(digit);
                        await new Promise((resolve) =>
                          setTimeout(resolve, 150),
                        );
                      }
                    }}
                  >
                    {text(`Dial extension ${call.extension}`)}
                  </button>
                )}
                <details>
                  <summary className="cursor-pointer py-1 text-sm">
                    {text("Keypad")}
                  </summary>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {"123456789*0#".split("").map((digit) => (
                      <button
                        key={digit}
                        disabled={phase !== "active"}
                        className="rounded-lg bg-gray-100 py-2 text-lg disabled:opacity-50"
                        onClick={() => void current.current?.audio?.dtmf(digit)}
                      >
                        {digit}
                      </button>
                    ))}
                  </div>
                </details>
              </>
            )}
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {text(error)}
              </p>
            )}
            {nextTarget && (
              <div className="rounded-xl bg-amber-300/20 p-3 text-sm">
                <p>{text("End this call and call the next number?")}</p>
                <div className="mt-3 flex gap-3">
                  <button
                    className="font-semibold underline"
                    onClick={async () => {
                      const next = nextTarget;
                      setNextTarget(undefined);
                      const attempt = current.current;
                      if (attempt) await finishRef.current(attempt, false);
                      beginRef.current(next);
                    }}
                  >
                    {text("End and call")}
                  </button>
                  <button onClick={() => setNextTarget(undefined)}>
                    {text("Keep this call")}
                  </button>
                </div>
              </div>
            )}
            {phase === "error" && (
              <button
                className="w-full rounded-full bg-gray-100 py-3 text-sm"
                onClick={() => void close()}
              >
                {text("Close")}
              </button>
            )}
            {phase === "ended" && config?.verifiedNumber && (
              <button
                className="text-sm underline"
                onClick={async () => {
                  try {
                    await callingApi("verification", "DELETE");
                    configPromise.current = null;
                    setConfig({ enabled: true, verifiedNumber: null });
                    toast("Your number was forgotten on this device.");
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : "Please try again.",
                    );
                  }
                }}
              >
                {text("Forget my number on this device")}
              </button>
            )}
            {!busyCall && (
              <p className="text-sm text-gray-500">
                {text("For emergencies, call 911 from your phone.")}
              </p>
            )}
            <div ref={challenge} />
            <div ref={audio} className="hidden" />
          </div>
        </div>
      )}
    </CallingContext.Provider>
  );
}
