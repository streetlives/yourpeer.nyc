import { sanitizeRumEvent } from "@/components/datadog-rum-utils";

type DatadogRumLike = {
  getInitConfiguration: () => unknown;
  init: (configuration: any) => void;
  setTrackingConsent: (consent: "granted" | "not-granted") => void;
  startView: (view: {
    context: Record<string, string>;
    name: string;
    service: string;
  }) => void;
};

type InitializeRumOptions = {
  allowedTracingUrls: string[];
  appName: string;
  applicationId: string;
  clientToken: string;
  datadogRum: DatadogRumLike;
  defaultPrivacyLevel: "mask-user-input";
  env: string;
  hasConsent: boolean;
  hasDatadogConfiguration: boolean;
  isAlreadyInitialized: boolean;
  service: string;
  sessionReplaySampleRate: number;
  sessionSampleRate: number;
  site: string;
  trackLongTasks: boolean;
  trackResources: boolean;
  trackUserInteractions: boolean;
  trackViewsManually: boolean;
  version: string;
};

export const syncTrackingConsent = ({
  datadogRum,
  hasConsent,
  hasDatadogConfiguration,
}: {
  datadogRum: DatadogRumLike;
  hasConsent: boolean;
  hasDatadogConfiguration: boolean;
}) => {
  if (!hasDatadogConfiguration) {
    return false;
  }

  datadogRum.setTrackingConsent(hasConsent ? "granted" : "not-granted");
  return true;
};

export const initializeRum = ({
  allowedTracingUrls,
  appName,
  applicationId,
  clientToken,
  datadogRum,
  defaultPrivacyLevel,
  env,
  hasConsent,
  hasDatadogConfiguration,
  isAlreadyInitialized,
  service,
  sessionReplaySampleRate,
  sessionSampleRate,
  site,
  trackLongTasks,
  trackResources,
  trackUserInteractions,
  trackViewsManually,
  version,
}: InitializeRumOptions) => {
  if (!hasDatadogConfiguration || !hasConsent || isAlreadyInitialized) {
    return false;
  }

  datadogRum.init({
    allowedTracingUrls,
    applicationId,
    beforeSend: (event: unknown) => {
      sanitizeRumEvent(event);

      if (event && typeof event === "object") {
        const existingContext =
          "context" in event &&
          event.context &&
          typeof event.context === "object"
            ? event.context
            : {};

        (event as { context?: Record<string, unknown> }).context = {
          ...existingContext,
          app_name: appName,
        };
      }

      return true;
    },
    clientToken,
    defaultPrivacyLevel,
    env,
    service,
    sessionReplaySampleRate,
    sessionSampleRate,
    site,
    trackLongTasks,
    trackResources,
    trackUserInteractions,
    trackViewsManually,
    version,
  });

  return true;
};

type StartViewOptions = {
  appName: string;
  datadogRum: DatadogRumLike;
  hasConsent: boolean;
  hasDatadogConfiguration: boolean;
  normalizedViewName: string;
  service: string;
};

export const startRumView = ({
  appName,
  datadogRum,
  hasConsent,
  hasDatadogConfiguration,
  normalizedViewName,
  service,
}: StartViewOptions) => {
  if (
    !hasDatadogConfiguration ||
    !hasConsent ||
    !datadogRum.getInitConfiguration()
  ) {
    return false;
  }

  datadogRum.startView({
    context: {
      app_name: appName,
    },
    name: normalizedViewName,
    service,
  });

  return true;
};
