import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { act, create } from "react-test-renderer";
import {
  DatadogRumInitComponent,
  type DatadogRumInitDeps,
} from "@/components/datadog-rum-init";

const mockWindow = {
  clearInterval: () => undefined,
  location: { origin: "https://yourpeer.nyc" },
  setInterval: () => 1,
} as unknown as Window;

(globalThis as { window?: Window }).window = mockWindow;

const flushEffects = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

test("DatadogRumInitComponent reacts to consent changes and preserves init/view ordering", async () => {
  let consent = false;
  let intervalCallback: (() => void) | undefined;
  const callLog: string[] = [];

  const deps: DatadogRumInitDeps = {
    clearIntervalFn: (() => undefined) as typeof window.clearInterval,
    getConsentStatus: () => consent,
    initializeRumFn: ({ hasConsent }) => {
      callLog.push(`init:${hasConsent ? "granted" : "not-granted"}`);
      return hasConsent;
    },
    isRumAlreadyInitializedFn: () => false,
    markRumAsInitializedFn: () => {
      callLog.push("mark-initialized");
    },
    setIntervalFn: ((callback: TimerHandler) => {
      intervalCallback = callback as () => void;
      return 1;
    }) as typeof window.setInterval,
    startRumViewFn: ({ hasConsent, normalizedViewName }) => {
      callLog.push(
        `startView:${hasConsent ? "granted" : "not-granted"}:${normalizedViewName}`,
      );
      return hasConsent;
    },
    syncTrackingConsentFn: ({ hasConsent }) => {
      callLog.push(`sync:${hasConsent ? "granted" : "not-granted"}`);
      return true;
    },
  };

  const renderer = create(
    <DatadogRumInitComponent deps={deps} pathname="/jane-doe/private-area" />,
  );

  await flushEffects();

  assert.ok(callLog.includes("sync:not-granted"));
  assert.ok(callLog.includes("init:not-granted"));
  assert.ok(
    callLog.includes("startView:not-granted:route:/:slug/:slug"),
    "view names should use slug-masked normalization",
  );

  consent = true;

  await act(async () => {
    intervalCallback?.();
    await Promise.resolve();
  });

  const syncGrantedIndex = callLog.indexOf("sync:granted");
  const initGrantedIndex = callLog.indexOf("init:granted");
  const markInitializedIndex = callLog.indexOf("mark-initialized");
  const startViewGrantedIndex = callLog.findIndex((entry) =>
    entry.startsWith("startView:granted:"),
  );

  assert.ok(syncGrantedIndex >= 0);
  assert.ok(initGrantedIndex > syncGrantedIndex);
  assert.ok(markInitializedIndex > initGrantedIndex);
  assert.ok(startViewGrantedIndex > markInitializedIndex);

  renderer.unmount();
});
