import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("should show the list and hide the map by default on mobile", async ({
  page,
}) => {
  await page.goto("/locations");

  await expect(page.getByRole("button", { name: "View map" })).toBeVisible();
  await expect(page.locator("#left_panel")).toBeVisible();
  await expect(page.locator("#map_container")).toBeHidden();
});

test("should show the map and hide the list when clicking View map", async ({
  page,
}) => {
  await page.goto("/locations");

  await page.getByRole("button", { name: "View map" }).click();

  await expect(page.getByRole("button", { name: "View list" })).toBeVisible();
  await expect(page.locator("#map_container")).toBeVisible();
  await expect(page.locator("#left_panel")).toBeHidden();
});

test("should return to list view when clicking View list", async ({ page }) => {
  await page.goto("/locations");

  await page.getByRole("button", { name: "View map" }).click();
  await expect(page.getByRole("button", { name: "View list" })).toBeVisible();

  await page.getByRole("button", { name: "View list" }).click();

  await expect(page.getByRole("button", { name: "View map" })).toBeVisible();
  await expect(page.locator("#left_panel")).toBeVisible();
  await expect(page.locator("#map_container")).toBeHidden();
});
