import { expect, test } from "@playwright/test";

test("should open the filters popup when clicking All Filters", async ({
  page,
}) => {
  await page.goto("/locations");

  await page.locator("#filters_popup_open_button").click();

  await expect(page.locator("#filters_popup")).toBeVisible();
});

test("should close the filters popup when clicking the close button", async ({
  page,
}) => {
  await page.goto("/locations");

  await page.locator("#filters_popup_open_button").click();
  await expect(page.locator("#filters_popup")).toBeVisible();

  await page.locator("#filters_popup_close_button").click();

  await expect(page.locator("#filters_popup")).not.toBeVisible();
});

test("should close the filters popup when clicking Show Results", async ({
  page,
}) => {
  await page.goto("/locations");

  await page.locator("#filters_popup_open_button").click();
  await expect(page.locator("#filters_popup")).toBeVisible();

  await page
    .locator("#filters_popup")
    .getByRole("button", { name: /Show .+ results/ })
    .click();

  await expect(page.locator("#filters_popup")).not.toBeVisible();
});

test("should apply age filter and update URL", async ({ page }) => {
  await page.goto("/locations");

  await page.locator("#filters_popup_open_button").click();
  await page.locator("#age_filter").fill("25");
  await page.locator("#age_filter").press("Enter");

  await expect(page).toHaveURL(/age=25/);
});

test("should apply Open Now hours filter and update URL", async ({ page }) => {
  await page.goto("/locations");
  await page.locator("#filters_popup_open_button").click();

  await page
    .locator("#filters_popup")
    .locator("label")
    .filter({ hasText: "Open now" })
    .click();

  await expect(page).toHaveURL(/open=/);
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

test("should clear all filters and return to /locations", async ({ page }) => {
  await page.goto("/locations?age=25&open=");

  await page.locator("#filters_popup_open_button").click();
  await page
    .locator("#filters_popup")
    .getByRole("link", { name: "Clear All" })
    .click();

  await expect(page).toHaveURL("/locations");
});
