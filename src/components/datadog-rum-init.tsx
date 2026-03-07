"use client";

import { datadogRum } from "@datadog/browser-rum";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const RUM_WINDOW_GUARD_KEY = "__yourPeerRumInitialized__";
const DATADOG_APPLICATION_ID =
  process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID ?? "";
const DATADOG_CLIENT_TOKEN = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN ?? "";
const DATADOG_SITE = process.env.NEXT_PUBLIC_DATADOG_SITE ?? "datadoghq.com";
const DATADOG_SERVICE =
  process.env.NEXT_PUBLIC_DATADOG_SERVICE ?? "yourpeer-frontend";
const DATADOG_ENV = process.env.NEXT_PUBLIC_DATADOG_ENV ?? "";
const DATADOG_VERSION = process.env.NEXT_PUBLIC_DATADOG_VERSION ?? "";
const DATADOG_APP_NAME =
  process.env.NEXT_PUBLIC_DATADOG_APP_NAME ?? "yourpeer.nyc";
const DATADOG_SESSION_SAMPLE_RATE = Number.parseFloat(
  process.env.NEXT_PUBLIC_DATADOG_SESSION_SAMPLE_RATE ?? "100",
);
const DATADOG_SESSION_REPLAY_SAMPLE_RATE = Number.parseFloat(
  process.env.NEXT_PUBLIC_DATADOG_SESSION_REPLAY_SAMPLE_RATE ?? "0",
);
const DATADOG_SESSION_REPLAY_ENABLED =
  process.env.NEXT_PUBLIC_DATADOG_SESSION_REPLAY_ENABLED === "true";
const DATADOG_TRACING_ORIGINS =
  process.env.NEXT_PUBLIC_DATADOG_TRACING_ORIGINS ?? "";

const NUMERIC_SEGMENT_PATTERN = /^\d+$/;
const UUID_SEGMENT_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LONG_TOKEN_SEGMENT_PATTERN = /^[a-z0-9_-]{24,}$/i;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

const buildTracingOrigins = () => {
  const configuredOrigins = DATADOG_TRACING_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const origins = new Set(configuredOrigins);
  origins.add(window.location.origin);

  return Array.from(origins);
};

const normalizePathnameForViewName = (pathname: string) => {
  const normalizedSegments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      if (
        NUMERIC_SEGMENT_PATTERN.test(segment) ||
        UUID_SEGMENT_PATTERN.test(segment) ||
        LONG_TOKEN_SEGMENT_PATTERN.test(segment)
      ) {
        return ":id";
      }

      return segment;
    });

  if (normalizedSegments.length === 0) {
    return "route:/";
  }

  if (normalizedSegments.length > 4) {
    return `route:/${normalizedSegments.slice(0, 4).join("/")}/*`;
  }

  return `route:/${normalizedSegments.join("/")}`;
};

const stripQueryAndHash = (value: string) => {
  const [pathWithoutQuery] = value.split("?");
  return pathWithoutQuery.split("#")[0] ?? pathWithoutQuery;
};

const sanitizeStringValue = (value: string) => {
  return stripQueryAndHash(value).replace(EMAIL_PATTERN, "[redacted-email]");
};

const hasDatadogConfiguration =
  DATADOG_APPLICATION_ID.length > 0 && DATADOG_CLIENT_TOKEN.length > 0;

export default function DatadogRumInit() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    if (!hasDatadogConfiguration) {
      return;
    }

    if (
      (window as Window & { [RUM_WINDOW_GUARD_KEY]?: boolean })[
        RUM_WINDOW_GUARD_KEY
      ]
    ) {
      return;
    }

    datadogRum.init({
      applicationId: DATADOG_APPLICATION_ID,
      clientToken: DATADOG_CLIENT_TOKEN,
      site: DATADOG_SITE,
      service: DATADOG_SERVICE,
      env: DATADOG_ENV,
      version: DATADOG_VERSION,
      sessionSampleRate: Number.isFinite(DATADOG_SESSION_SAMPLE_RATE)
        ? DATADOG_SESSION_SAMPLE_RATE
        : 100,
      sessionReplaySampleRate: DATADOG_SESSION_REPLAY_ENABLED
        ? Number.isFinite(DATADOG_SESSION_REPLAY_SAMPLE_RATE)
          ? DATADOG_SESSION_REPLAY_SAMPLE_RATE
          : 100
        : 0,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      trackViewsManually: true,
      defaultPrivacyLevel: "mask-user-input",
      allowedTracingUrls: buildTracingOrigins(),
      beforeSend: (event) => {
        const view = (event as { view?: { url?: string } }).view;
        const resource = (event as { resource?: { url?: string } }).resource;
        const error = (event as { error?: { message?: string } }).error;

        if (view?.url) {
          view.url = sanitizeStringValue(view.url);
        }

        if (resource?.url) {
          resource.url = sanitizeStringValue(resource.url);
        }

        if (error?.message) {
          error.message = sanitizeStringValue(error.message);
        }

        event.context = {
          ...event.context,
          app_name: DATADOG_APP_NAME,
        };

        return true;
      },
    });

    (window as Window & { [RUM_WINDOW_GUARD_KEY]?: boolean })[
      RUM_WINDOW_GUARD_KEY
    ] = true;
  }, []);

  useEffect(() => {
    if (!hasDatadogConfiguration || !datadogRum.getInitConfiguration()) {
      return;
    }

    datadogRum.startView({
      name: normalizePathnameForViewName(pathname),
      service: DATADOG_SERVICE,
      context: {
        app_name: DATADOG_APP_NAME,
        raw_pathname: pathname,
      },
    });
  }, [pathname]);

  return null;
}
