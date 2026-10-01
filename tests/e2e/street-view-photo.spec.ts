import test from "@playwright/test";

// The organization-provided photo standing in for Google's Street View still.
// samecare-with-photo is configured in KNOWN_SLUGS inside mock-server.ts and its
// fixture carries a LocationPhoto.

test("shows the organization's photo instead of the Street View still", async ({
  page,
}) => {
  await page.goto("/locations/samecare-with-photo");

  const photo = page.locator(
    'img[src="https://photos.yourpeer.nyc/location-photos/samecare/deadbeef.jpg"]',
  );
  await test.expect(photo).toBeAttached();

  // No Google static Street View image should be rendered for this location.
  await test
    .expect(page.locator('img[src*="maps/api/streetview"]'))
    .toHaveCount(0);
});

test("captions the photo and still links out to Street View", async ({
  page,
}) => {
  await page.goto("/locations/samecare-with-photo");

  await test
    .expect(page.getByText("Photo provided by the organization"))
    .toBeAttached();

  // The photo replaces the thumbnail only; the click-through is unchanged.
  await test
    .expect(
      page
        .locator('a[href*="google.com/maps/@?api=1&map_action=pano"]')
        .first(),
    )
    .toBeAttached();
});

test("falls back to the Street View still without a photo", async ({
  page,
}) => {
  await page.goto("/locations/community-support-nyc-midtown");

  await test
    .expect(page.locator('img[src*="maps/api/streetview"]').first())
    .toBeAttached();
  await test
    .expect(page.getByText("Photo provided by the organization"))
    .toHaveCount(0);
});
