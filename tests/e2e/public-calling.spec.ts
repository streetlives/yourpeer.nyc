// Copyright (c) 2026 Streetlives, Inc. MIT license; see LICENSE.
import { expect, test } from "@playwright/test";

test.skip(
  process.env.PUBLIC_CALLING_E2E !== "true",
  "Run with PUBLIC_CALLING_E2E=true; calling is disabled by default.",
);

test("permission, optional callback, queue, cancellation and saved panel position", async ({
  page,
}) => {
  test.setTimeout(90000);
  const requests: { path: string; body: Record<string, unknown> }[] = [];
  const call = {
    id: "a".repeat(32),
    status: "queued",
    position: 1,
    number: "+12125550100",
    callerNumber: "+12125550999",
  };
  await page.route("https://challenges.cloudflare.com/**", (route) =>
    route.fulfill({ body: "", contentType: "application/javascript" }),
  );
  await page.route("**/api/public-calling/**", async (route) => {
    const request = route.request();
    const path = request.url().split("/api/public-calling/")[1];
    requests.push({ path, body: request.postDataJSON() || {} });
    const body =
      path === "config"
        ? { enabled: true, verifiedNumber: null, maxCallSeconds: 900 }
        : path.endsWith("/hangup")
          ? { ...call, status: "ended" }
          : path === "verification/confirm"
            ? { verified: false }
            : path.startsWith("verification/")
              ? {}
              : call;
    await route.fulfill({ json: body });
  });
  await page.addInitScript(() => {
    const state = window as unknown as {
      allowMic: () => void;
      microphoneRequests: number;
      stoppedTracks: number;
      turnstile: unknown;
    };
    state.microphoneRequests = 0;
    state.stoppedTracks = 0;
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: () => {
          state.microphoneRequests++;
          return new Promise((resolve) => {
            state.allowMic = () =>
              resolve({
                getTracks: () => [{ stop: () => state.stoppedTracks++ }],
              });
          });
        },
      },
    });
    state.turnstile = {
      render: (
        _element: unknown,
        options: { callback: (value: string) => void },
      ) => {
        setTimeout(() => options.callback("test-challenge"), 0);
        return "test-widget";
      },
      remove: () => {},
    };
  });
  await page.goto("/locations/community-support-nyc-midtown");
  const phone = page.locator('a[href^="tel:"]').first();
  await expect(phone).toBeVisible();
  await phone.click();
  const panel = page.getByRole("dialog", { name: "Community Support NYC" });
  await expect(panel).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { microphoneRequests: number })
          .microphoneRequests,
    ),
  ).toBe(1);
  await panel
    .getByRole("button", { name: "Use my number", exact: true })
    .click();
  await page.evaluate(() =>
    (window as unknown as { allowMic: () => void }).allowMic(),
  );
  await panel.getByLabel("Your US phone number").fill("(917) 555-0123");
  await panel.getByRole("button", { name: "Text me a code" }).click();
  await panel.getByLabel("Verification code").fill("123456");
  await panel.getByRole("button", { name: "Verify number" }).click();
  await expect(panel.getByRole("alert")).toContainText("not accepted");
  expect(requests.filter((request) => request.path === "calls")).toHaveLength(
    0,
  );
  await panel
    .getByRole("button", { name: "Skip and call through YourPeer" })
    .click();
  await expect(panel).toContainText("YourPeer queue position: 1");
  expect(requests.filter((request) => request.path === "calls")).toHaveLength(
    1,
  );
  expect(
    requests.find((request) => request.path === "calls")?.body,
  ).toMatchObject({ locationId: "loc-001", useOwnNumber: false });
  expect(
    await page.evaluate(
      () => (window as unknown as { stoppedTracks: number }).stoppedTracks,
    ),
  ).toBeGreaterThan(0);
  const before = await panel.boundingBox();
  const handle = await panel
    .getByRole("button", { name: "Move call window" })
    .boundingBox();
  await page.mouse.move(handle!.x + 15, handle!.y + 15);
  await page.mouse.down();
  await page.mouse.move(handle!.x - 90, handle!.y - 45, { steps: 6 });
  await page.mouse.up();
  const after = await panel.boundingBox();
  expect(after!.x).toBeLessThan(before!.x - 50);
  await panel.getByRole("button", { name: "Close and end call" }).click();
  await expect(panel).not.toBeVisible();
  expect(requests.some((request) => request.path.endsWith("/hangup"))).toBe(
    true,
  );
  await phone.click();
  await expect(panel).toBeVisible();
  expect((await panel.boundingBox())!.x).toBeCloseTo(after!.x, 0);
  await page.screenshot({ path: "test-results/public-calling-panel.png" });
  await panel.getByRole("button", { name: "Close and end call" }).click();
});
