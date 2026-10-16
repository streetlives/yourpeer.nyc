import { expect, test } from "@playwright/test";

const RESTORABLE_HOURS_URL = "http://localhost:4000/__test/restorable-hours";

test("should render location detail page for a known slug", async ({
  page,
}) => {
  const response = await page.goto("/locations/community-support-nyc-midtown");

  expect(response?.status()).toBe(200);
  await test
    .expect(page.getByRole("heading", { name: "Community Support NYC" }))
    .toBeVisible();
});

test("should redirect to the new slug when an old slug has moved", async ({
  page,
}) => {
  // old-community-support-nyc-midtown is configured in SLUG_REDIRECTS inside mock-server.ts
  // The app calls /location-slug-redirects/:slug and follows the returned slug.
  await page.goto("/locations/old-community-support-nyc-midtown");

  await test.expect(page).toHaveURL("/locations/community-support-nyc-midtown");
});

for (const slug of [
  "this-slug-does-not-exist",
  "location-with-no-services",
  "location-with-no-schedules",
  "location-with-null-hours",
  "old-location-with-null-hours",
]) {
  test(`should return a noindex 404 with a Home link for ${slug}`, async ({
    page,
  }) => {
    const response = await page.goto(`/locations/${slug}`);

    expect(response?.status()).toBe(404);
    await expect(page).toHaveURL(`/locations/${slug}`);
    await expect(page.getByRole("heading", { name: "Oops!" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Home", exact: true }),
    ).toHaveAttribute("href", "/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });
}

for (const slug of [
  "location-with-mixed-hours",
  "location-with-partial-hours",
  "location-with-closed-hours",
  "location-with-closed-status",
  "location-with-open-and-closed-hours",
  "location-with-midnight-hours",
]) {
  test(`should return 200 when at least one service has recorded hours or closed status: ${slug}`, async ({
    page,
  }) => {
    const response = await page.goto(`/locations/${slug}`);

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "Community Support NYC" }),
    ).toBeVisible();
  });
}

for (const slug of [
  "old-community-support-nyc-midtown",
  "oldest-community-support-nyc-midtown",
]) {
  test(`should permanently redirect ${slug} directly to the current slug`, async ({
    request,
  }) => {
    const response = await request.get(`/locations/${slug}`, {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(
      "/locations/community-support-nyc-midtown",
    );
  });
}

test("should make the same URL available again when service hours return", async ({
  page,
  request,
}) => {
  await request.delete(RESTORABLE_HOURS_URL);

  try {
    const unavailableResponse = await page.goto(
      "/locations/location-with-restorable-hours",
    );
    expect(unavailableResponse?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Oops!" })).toBeVisible();

    const restoredResponse = await request.post(RESTORABLE_HOURS_URL);
    expect(restoredResponse.ok()).toBe(true);

    const response = await page.reload();
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "Community Support NYC" }),
    ).toBeVisible();
    await expect(
      page.locator('meta[name="robots"][content*="noindex"]'),
    ).toHaveCount(0);
  } finally {
    await request.delete(RESTORABLE_HOURS_URL);
  }
});

for (const slug of ["location-api-error", "redirect-api-error"]) {
  test(`should preserve API failures as server errors for ${slug}`, async ({
    request,
  }) => {
    const response = await request.get(`/locations/${slug}`, {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(500);
    expect(response.headers().location).toBeUndefined();
  });
}
