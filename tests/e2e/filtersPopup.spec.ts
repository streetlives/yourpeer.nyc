import { expect, test } from "@playwright/test";

test("should open the filters popup when clicking All Filters", async ({
  page,
}) => {
  await page.goto("/locations");

  await page.locator("#filters_popup_open_button").click();

  await expect(page.locator("#filters_popup")).toBeVisible();
});

test("should apply age filter and update URL", async ({ page }) => {
  await page.goto("/locations");

  await page.locator("#filters_popup_open_button").click();
  await page.locator("#age_filter").fill("25");
  await page.locator("#age_filter").press("Enter");

  await expect(page).toHaveURL(/age=25/);
});

test("should apply category filter and navigate to the correct route", async ({
  page,
}) => {
  await page.goto("/locations");
  await page.locator("#filters_popup_open_button").click();

  await page
    .locator("#filters_popup")
    .locator("label")
    .filter({ hasText: "Food" })
    .click();

  await expect(page).toHaveURL(/\/food/);
});
