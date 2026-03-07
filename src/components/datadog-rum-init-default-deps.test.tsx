import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { act, create } from "react-test-renderer";

const flushEffects = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

test("DatadogRumInitComponent default deps do not duplicate startView on rerender", async () => {
  process.env.NEXT_PUBLIC_DATADOG_ENABLED = "true";
  process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID = "app-id";
  process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN = "client-token";
  process.env.NEXT_PUBLIC_DATADOG_REQUIRE_CONSENT = "false";

  const mockWindow = {
    clearInterval: () => undefined,
    document: {
      cookie: "",
    },
    location: { origin: "https://yourpeer.nyc" },
    setInterval: (callback: TimerHandler) => {
      if (typeof callback === "function") {
        callback();
      }

      return 1;
    },
  } as unknown as Window;

  (globalThis as { window?: Window }).window = mockWindow;

  const datadogModule = await import("@datadog/browser-rum");
  const datadogRum = datadogModule.datadogRum as {
    getInitConfiguration: () => unknown;
    init: (configuration: unknown) => void;
    setTrackingConsent: (consent: "granted" | "not-granted") => void;
    startView: (view: unknown) => void;
  };

  let startViewCount = 0;

  datadogRum.getInitConfiguration = () => ({ initialized: true });
  datadogRum.init = () => undefined;
  datadogRum.setTrackingConsent = () => undefined;
  datadogRum.startView = () => {
    startViewCount += 1;
  };

  const moduleUrl = new URL(
    `./datadog-rum-init.tsx?default-deps=${Date.now()}`,
    import.meta.url,
  );

  const initModule = (await import(moduleUrl.href)) as {
    DatadogRumInitComponent: React.ComponentType<{ pathname: string }>;
  };

  const renderer = create(
    <initModule.DatadogRumInitComponent pathname="/jane-doe/private-area" />,
  );

  await flushEffects();
  const initialCount = startViewCount;

  await act(async () => {
    renderer.update(
      <initModule.DatadogRumInitComponent pathname="/jane-doe/private-area" />,
    );
    await Promise.resolve();
  });

  assert.equal(startViewCount, initialCount);

  renderer.unmount();
});
