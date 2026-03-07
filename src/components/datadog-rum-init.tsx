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

const hasDatadogConfiguration =
  DATADOG_ENABLED &&
  DATADOG_APPLICATION_ID.length > 0 &&
  DATADOG_CLIENT_TOKEN.length > 0;

export type DatadogRumInitDeps = {
  clearIntervalFn: typeof window.clearInterval;
  getConsentStatus: () => boolean;
  initializeRumFn: typeof initializeRum;
  isRumAlreadyInitializedFn: typeof isRumAlreadyInitialized;
  markRumAsInitializedFn: typeof markRumAsInitialized;
  setIntervalFn: typeof window.setInterval;
  startRumViewFn: typeof startRumView;
  syncTrackingConsentFn: typeof syncTrackingConsent;
};

const buildTracingOrigins = () => {
  const configuredOrigins = DATADOG_TRACING_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const origins = new Set(configuredOrigins);

  if (typeof window !== "undefined") {
    origins.add(window.location.origin);
  }

  return Array.from(origins);
};

const getConsentStatus = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    !DATADOG_REQUIRE_CONSENT ||
    hasDatadogConsent(window, DATADOG_CONSENT_COOKIE_NAME)
  );
};

const createDeps = (): DatadogRumInitDeps => ({
  clearIntervalFn: window.clearInterval,
  getConsentStatus,
  initializeRumFn: initializeRum,
  isRumAlreadyInitializedFn: isRumAlreadyInitialized,
  markRumAsInitializedFn: markRumAsInitialized,
  setIntervalFn: window.setInterval,
  startRumViewFn: startRumView,
  syncTrackingConsentFn: syncTrackingConsent,
});

export function DatadogRumInitComponent({
  deps,
  pathname,
}: {
  deps?: DatadogRumInitDeps;
  pathname: string;
}) {
  const [hasConsent, setHasConsent] = useState(false);
  const runtimeDeps = deps ?? createDeps();

  useEffect(() => {
    setHasConsent(runtimeDeps.getConsentStatus());

    const interval = runtimeDeps.setIntervalFn(() => {
      setHasConsent(runtimeDeps.getConsentStatus());
    }, CONSENT_REFRESH_INTERVAL_MS);

    return () => {
      runtimeDeps.clearIntervalFn(interval);
    };
  }, [runtimeDeps]);

  useEffect(() => {
    runtimeDeps.syncTrackingConsentFn({
      datadogRum,
      hasConsent,
      hasDatadogConfiguration,
    });

    const didInitialize = runtimeDeps.initializeRumFn({
      allowedTracingUrls: buildTracingOrigins(),
      appName: DATADOG_APP_NAME,
      applicationId: DATADOG_APPLICATION_ID,
      clientToken: DATADOG_CLIENT_TOKEN,
      datadogRum,
      defaultPrivacyLevel: "mask-user-input",
      env: DATADOG_ENV,
      hasConsent,
      hasDatadogConfiguration,
      isAlreadyInitialized: runtimeDeps.isRumAlreadyInitializedFn(window),
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
      runtimeDeps.markRumAsInitializedFn(window);
    }
  }, [hasConsent, runtimeDeps]);

  useEffect(() => {
    runtimeDeps.startRumViewFn({
      appName: DATADOG_APP_NAME,
      datadogRum,
      hasConsent,
      hasDatadogConfiguration,
      normalizedViewName: normalizePathnameForViewName(pathname),
      service: DATADOG_SERVICE,
    });
  }, [hasConsent, pathname, runtimeDeps]);

  return null;
}

export default function DatadogRumInit() {
  const pathname = usePathname() ?? "/";

  return <DatadogRumInitComponent pathname={pathname} />;
}
