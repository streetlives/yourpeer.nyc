"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TranslatableText } from "@/components/translatable-text";
import {
  assessmentNeedsConfirmation,
  normalizeWebsiteSafetyUrl,
  PHP_ADVISORY_URL,
  WEBSITE_SAFETY_REASON_COPY,
  WebsiteSafetyClient,
  type WebsiteSafetyAssessment,
} from "@/lib/website-safety";

type PendingLink = {
  url: string;
  href: string;
  hostname: string;
  target: string;
  download?: string;
  assessment: WebsiteSafetyAssessment;
  checking: boolean;
};

const MAX_PREFETCH_LINKS = 200;

function getAnchor(event: Event): HTMLAnchorElement | null {
  const target = event.target;
  const element =
    target instanceof Element
      ? target
      : target instanceof Node
        ? target.parentElement
        : null;
  return element?.closest<HTMLAnchorElement>("a[href]") ?? null;
}

function isInternal(url: URL) {
  return (
    url.origin === window.location.origin ||
    url.hostname === "yourpeer.nyc" ||
    url.hostname === "www.yourpeer.nyc"
  );
}

function isQuickExit(anchor: HTMLAnchorElement, url: URL) {
  return (
    anchor.id === "quickExitLink" &&
    url.origin === "https://www.google.com" &&
    url.pathname === "/"
  );
}

export default function OutboundLinkSafetyProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [pending, setPending] = useState<PendingLink | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLAnchorElement | null>(null);
  const active = useRef(0);

  useEffect(() => {
    const safety = new WebsiteSafetyClient();
    let mounted = true;
    let scanTimer: ReturnType<typeof setTimeout> | undefined;
    const prefetched = new Set<string>();

    const eligible = (anchor: HTMLAnchorElement): string | null => {
      if (dialog.current?.contains(anchor)) return null;
      try {
        const url = new URL(anchor.href, window.location.href);
        if (isInternal(url) || isQuickExit(anchor, url)) return null;
        return normalizeWebsiteSafetyUrl(url.href);
      } catch {
        return null;
      }
    };

    const prefetch = () => {
      const urls: string[] = [];
      document
        .querySelectorAll<HTMLAnchorElement>("a[href]")
        .forEach((anchor) => {
          if (prefetched.size >= MAX_PREFETCH_LINKS) return;
          const url = eligible(anchor);
          if (url && !prefetched.has(url)) {
            prefetched.add(url);
            urls.push(url);
          }
        });
      if (urls.length) void safety.lookup(urls);
    };

    const schedulePrefetch = () => {
      if (scanTimer) clearTimeout(scanTimer);
      scanTimer = setTimeout(prefetch, 50);
    };

    const onIntent = (event: Event) => {
      const anchor = getAnchor(event);
      const url = anchor && eligible(anchor);
      if (url) void safety.lookup([url]);
    };

    const onActivate = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        (event.type === "click" && event.button !== 0) ||
        (event.type === "auxclick" && event.button !== 1)
      ) {
        return;
      }
      const anchor = getAnchor(event);
      if (!anchor || dialog.current?.contains(anchor)) return;
      let destination: URL;
      try {
        destination = new URL(anchor.href, window.location.href);
      } catch {
        event.preventDefault();
        return;
      }
      if (["tel:", "mailto:"].includes(destination.protocol)) return;
      // Executable and non-website schemes never receive a security bypass.
      if (!["http:", "https:"].includes(destination.protocol)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (isInternal(destination) || isQuickExit(anchor, destination)) return;
      const url = normalizeWebsiteSafetyUrl(destination.href);
      if (!url) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const assessment = safety.peek(url);
      if (!assessmentNeedsConfirmation(assessment)) {
        if (assessment.status === "unknown" || assessment.stale) {
          void safety.lookup([url], true);
        }
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const requestId = ++active.current;
      trigger.current = anchor;
      setPending({
        url,
        href: destination.href,
        hostname: destination.hostname,
        target:
          event.button === 1 || event.ctrlKey || event.metaKey || event.shiftKey
            ? "_blank"
            : anchor.target || "_self",
        download: anchor.hasAttribute("download")
          ? (anchor.getAttribute("download") ?? "")
          : undefined,
        assessment,
        checking: true,
      });
      // The route reads cached metadata; refreshing only asks Streetli to
      // revalidate an already registered website. No third-party browser fetch.
      void safety.lookup([url], true).then(([fresh]) => {
        if (mounted && active.current === requestId && fresh) {
          setPending(
            (current) =>
              current && { ...current, assessment: fresh, checking: false },
          );
        }
      });
    };

    const observer = new MutationObserver(schedulePrefetch);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href"],
    });
    prefetch();
    document.addEventListener("click", onActivate, true);
    document.addEventListener("auxclick", onActivate, true);
    document.addEventListener("pointerover", onIntent, true);
    document.addEventListener("focusin", onIntent, true);
    return () => {
      mounted = false;
      // This ref is an activation counter; invalidate any pending response.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      active.current++;
      observer.disconnect();
      if (scanTimer) clearTimeout(scanTimer);
      document.removeEventListener("click", onActivate, true);
      document.removeEventListener("auxclick", onActivate, true);
      document.removeEventListener("pointerover", onIntent, true);
      document.removeEventListener("focusin", onIntent, true);
    };
  }, []);

  const close = () => {
    active.current++;
    setPending(null);
  };

  const assessment = pending?.assessment;
  return (
    <>
      {children}
      <AlertDialog open={!!pending} onOpenChange={(open) => !open && close()}>
        {pending && assessment ? (
          <AlertDialogContent
            ref={dialog}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (trigger.current?.isConnected) trigger.current.focus();
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>
                <TranslatableText
                  text={
                    assessment.status === "warning"
                      ? "Check this website before continuing"
                      : "Updated website information"
                  }
                  expectTranslation={false}
                />
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-left">
                  <p className="break-words font-medium" translate="no">
                    {pending.hostname}
                  </p>
                  {assessment.reasons.map((reason) => (
                    <p key={reason}>
                      <TranslatableText
                        text={WEBSITE_SAFETY_REASON_COPY[reason]}
                        expectTranslation={false}
                      />
                    </p>
                  ))}
                  {!assessment.reasons.length ? (
                    <p>
                      <TranslatableText
                        text="The latest check no longer reports this warning. Available checks do not cover every security risk."
                        expectTranslation={false}
                      />
                    </p>
                  ) : null}
                  {assessment.stale && assessment.checkedAt ? (
                    <p>
                      <TranslatableText
                        text="This is the last-known information and may be out of date."
                        expectTranslation={false}
                      />
                    </p>
                  ) : null}
                  {assessment.checkedAt ? (
                    <p>
                      <TranslatableText
                        text="Last checked:"
                        expectTranslation={false}
                      />{" "}
                      <time
                        dateTime={new Date(assessment.checkedAt).toISOString()}
                      >
                        {new Date(assessment.checkedAt).toLocaleString()}
                      </time>
                    </p>
                  ) : null}
                  {assessment.reasons.includes("php_advisory_possible") ? (
                    <p>
                      <a
                        href={PHP_ADVISORY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue underline"
                      >
                        <TranslatableText
                          text="Read the PHP security advisory"
                          expectTranslation={false}
                        />
                      </a>
                    </p>
                  ) : null}
                  <p role="status" aria-live="polite">
                    <TranslatableText
                      text={
                        pending.checking
                          ? "Checking the latest website information…"
                          : "You can go back or choose to continue to this website."
                      }
                      expectTranslation={false}
                    />
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <a
              href="https://www.google.com"
              className="text-sm text-blue underline"
              onClick={close}
            >
              <TranslatableText text="Quick Exit" expectTranslation={false} />
            </a>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={close}>
                <TranslatableText text="Go back" expectTranslation={false} />
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <a
                  href={pending.href}
                  target={pending.target}
                  rel="noopener noreferrer"
                  download={pending.download}
                  onClick={close}
                  onAuxClick={(event) => event.button === 1 && close()}
                >
                  <TranslatableText
                    text="Continue anyway"
                    expectTranslation={false}
                  />
                </a>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    </>
  );
}
