import test from "@playwright/test";

test("should navigate to the locations page after clicking 'Explore Services'", async ({
  page,
}) => {
  await page.goto("/");

  // Click the "Explore Services" link
  await page.getByRole("link", { name: "Explore Services" }).first().click();

  // Verify that the URL is correct
  await test.expect(page).toHaveURL(/\/locations$/);
});
