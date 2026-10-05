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

  await test.expect(page.getByText("Organization's Image")).toBeAttached();

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
  await test.expect(page.getByText("Organization's Image")).toHaveCount(0);
});

// The photo box is 5:3 at every side-panel width, by padding rather than
// aspect-ratio (Safari 14, the build target, has no aspect-ratio). Measured in
// a real layout because jsdom does none.
for (const width of [800, 1024, 1440, 1920]) {
  test(`keeps the photo at 5:3 in a ${width}px-wide window`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/locations/samecare-with-photo");

    // The page can hold more than one copy of the detail panel; measure the
    // one on screen.
    const photo = page
      .locator(
        'img[src="https://photos.yourpeer.nyc/location-photos/samecare/deadbeef.jpg"]',
      )
      .filter({ visible: true });
    const box = page.locator("a", { has: photo }).filter({ visible: true });
    await test.expect(box).toBeVisible();

    const boxRect = await box.boundingBox();
    const photoRect = await photo.boundingBox();
    if (!boxRect || !photoRect) throw new Error("photo box not laid out");

    test.expect(boxRect.height).toBeCloseTo((boxRect.width * 3) / 5, 0);
    // The photo fills the box exactly, so object-fit has nothing left to trim.
    test.expect(photoRect).toEqual(boxRect);
    // Nothing in the chain leans on aspect-ratio for this shape.
    const ratios = await box.evaluate((el) =>
      [el, ...Array.from(el.querySelectorAll("*"))].map(
        (node) => getComputedStyle(node).aspectRatio,
      ),
    );
    test.expect(new Set(ratios)).toEqual(new Set(["auto"]));
  });
}
