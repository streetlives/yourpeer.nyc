"use client";

import { datadogRum } from "@datadog/browser-rum";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  initializeRum,
  startRumView,
  syncTrackingConsent,
} from "@/components/datadog-rum-runtime";
import {
  hasDatadogConsent,
  isRumAlreadyInitialized,
  markRumAsInitialized,
  normalizePathnameForViewName,
} from "@/components/datadog-rum-utils";

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
const DATADOG_ENABLED = process.env.NEXT_PUBLIC_DATADOG_ENABLED === "true";
const DATADOG_REQUIRE_CONSENT =
  process.env.NEXT_PUBLIC_DATADOG_REQUIRE_CONSENT !== "false";
const DATADOG_CONSENT_COOKIE_NAME =
  process.env.NEXT_PUBLIC_DATADOG_CONSENT_COOKIE_NAME ?? "analytics_consent";
const CONSENT_REFRESH_INTERVAL_MS = 1000;

const buildTracingOrigins = () => {
  const configuredOrigins = DATADOG_TRACING_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const origins = new Set(configuredOrigins);
  origins.add(window.location.origin);

  return Array.from(origins);
};

const hasDatadogConfiguration =
  DATADOG_ENABLED &&
  DATADOG_APPLICATION_ID.length > 0 &&
  DATADOG_CLIENT_TOKEN.length > 0;

const getConsentStatus = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    !DATADOG_REQUIRE_CONSENT ||
    hasDatadogConsent(window, DATADOG_CONSENT_COOKIE_NAME)
  );
};

export default function DatadogRumInit() {
  const pathname = usePathname() ?? "/";
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    setHasConsent(getConsentStatus());

    const interval = window.setInterval(() => {
      setHasConsent(getConsentStatus());
    }, CONSENT_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    syncTrackingConsent({
      datadogRum,
      hasConsent,
      hasDatadogConfiguration,
    });

    const didInitialize = initializeRum({
      allowedTracingUrls: buildTracingOrigins(),
      appName: DATADOG_APP_NAME,
      applicationId: DATADOG_APPLICATION_ID,
      clientToken: DATADOG_CLIENT_TOKEN,
      datadogRum,
      defaultPrivacyLevel: "mask-user-input",
      env: DATADOG_ENV,
      hasConsent,
      hasDatadogConfiguration,
      isAlreadyInitialized: isRumAlreadyInitialized(window),
      service: DATADOG_SERVICE,
      sessionReplaySampleRate: DATADOG_SESSION_REPLAY_ENABLED
        ? Number.isFinite(DATADOG_SESSION_REPLAY_SAMPLE_RATE)
          ? DATADOG_SESSION_REPLAY_SAMPLE_RATE
          : 100
        : 0,
      sessionSampleRate: Number.isFinite(DATADOG_SESSION_SAMPLE_RATE)
        ? DATADOG_SESSION_SAMPLE_RATE
        : 100,
      site: DATADOG_SITE,
      trackLongTasks: true,
      trackResources: true,
      trackUserInteractions: true,
      trackViewsManually: true,
      version: DATADOG_VERSION,
    });

    if (didInitialize) {
      markRumAsInitialized(window);
    }
  }, [hasConsent]);

  useEffect(() => {
    startRumView({
      appName: DATADOG_APP_NAME,
      datadogRum,
      hasConsent,
      hasDatadogConfiguration,
      normalizedViewName: normalizePathnameForViewName(pathname),
      service: DATADOG_SERVICE,
    });
  }, [hasConsent, pathname]);

  return null;
}
