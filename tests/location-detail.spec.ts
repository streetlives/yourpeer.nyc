import test from "@playwright/test";

test("should render location detail page for a known slug", async ({
  page,
}) => {
  await page.goto("/locations/community-support-nyc-midtown");

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

test("should render 404 page for a slug that does not exist", async ({
  page,
}) => {
  await page.goto("/locations/this-slug-does-not-exist");

  await test.expect(page.getByRole("heading", { name: "Oops!" })).toBeVisible();
});
