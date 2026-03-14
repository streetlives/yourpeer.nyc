import test from "@playwright/test";

test("should navigate to the locations page after clicking 'Explore Services'", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Explore Services" }).first().click();

  await test.expect(page).toHaveURL("/locations");
  // await test
  //   .expect(page.getByRole("heading", { name: "All service locations" }))
  //   .toBeVisible();
});

test("should navigate to home page after clicking the logo", async ({
  page,
}) => {
  await page.goto("/locations");

  await page.getByRole("link", { name: "YourPeerNYC" }).click();

  await test.expect(page).toHaveURL("/");
});
