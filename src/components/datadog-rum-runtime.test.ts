import test from "node:test";
import assert from "node:assert/strict";
import { initializeRum, startRumView } from "@/components/datadog-rum-runtime";

const buildRumMock = () => {
  let initConfiguration: Record<string, unknown> | undefined;

  const initCalls: Record<string, unknown>[] = [];
  const startViewCalls: Array<Record<string, unknown>> = [];

  return {
    getInitConfiguration: () => initConfiguration,
    init: (configuration: Record<string, unknown>) => {
      initCalls.push(configuration);
      initConfiguration = configuration;
    },
    initCalls,
    startView: (view: Record<string, unknown>) => {
      startViewCalls.push(view);
    },
    startViewCalls,
  };
};

type RumMock = ReturnType<typeof buildRumMock>;

const createInitOptions = (
  datadogRum: RumMock,
  overrides: Record<string, unknown> = {},
) => ({
  allowedTracingUrls: ["https://yourpeer.nyc"],
  appName: "yourpeer.nyc",
  applicationId: "app-id",
  clientToken: "client-token",
  datadogRum,
  defaultPrivacyLevel: "mask-user-input" as const,
  env: "production",
  hasConsent: true,
  hasDatadogConfiguration: true,
  isAlreadyInitialized: false,
  service: "yourpeer-frontend",
  sessionReplaySampleRate: 0,
  sessionSampleRate: 100,
  site: "datadoghq.com",
  trackLongTasks: true,
  trackResources: true,
  trackUserInteractions: true,
  trackViewsManually: true,
  version: "v1",
  ...overrides,
});

test("initializeRum does not initialize when consent is missing", () => {
  const datadogRum = buildRumMock();
  const options = createInitOptions(datadogRum, { hasConsent: false });

  const didInitialize = initializeRum(options);

  assert.equal(didInitialize, false);
  assert.equal(datadogRum.initCalls.length, 0);
});

test("initializeRum initializes once and beforeSend sanitizes event payloads", () => {
  const datadogRum = buildRumMock();
  const didInitialize = initializeRum(createInitOptions(datadogRum));

  assert.equal(didInitialize, true);
  assert.equal(datadogRum.initCalls.length, 1);

  const beforeSend = datadogRum.initCalls[0].beforeSend as (
    event: Record<string, any>,
  ) => boolean;

  const event: any = {
    context: {
      location: "/users/jane@example.com?token=abc",
    },
    error: {
      message: "Error for jane@example.com",
      stack: "https://site/path?secret=1",
    },
    nested: {
      deep: ["/a/b?email=test@example.org"],
    },
    resource: {
      url: "https://example.com/path?authorization=secret",
    },
  };

  assert.equal(beforeSend(event), true);
  assert.equal(event.resource.url, "https://example.com/path");
  assert.equal(event.error.message, "Error for [redacted-email]");
  assert.equal(event.error.stack, "https://site/path");
  assert.equal(event.context.location, "/users/[redacted-email]");
  assert.equal(event.nested.deep[0], "/a/b");
  assert.equal(event.context.app_name, "yourpeer.nyc");
});

test("startRumView only starts when initialized and consented", () => {
  const datadogRum = buildRumMock();

  assert.equal(
    startRumView({
      appName: "yourpeer.nyc",
      datadogRum,
      hasConsent: true,
      hasDatadogConfiguration: true,
      normalizedViewName: "route:/locations/:id",
      service: "yourpeer-frontend",
    }),
    false,
  );

  initializeRum(createInitOptions(datadogRum));

  assert.equal(
    startRumView({
      appName: "yourpeer.nyc",
      datadogRum,
      hasConsent: true,
      hasDatadogConfiguration: true,
      normalizedViewName: "route:/locations/:id",
      service: "yourpeer-frontend",
    }),
    true,
  );

  assert.deepEqual(datadogRum.startViewCalls[0], {
    context: {
      app_name: "yourpeer.nyc",
    },
    name: "route:/locations/:id",
    service: "yourpeer-frontend",
  });
});
