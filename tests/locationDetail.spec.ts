import { expect, test } from "@playwright/test";

test("should open the location detail panel when clicking More Details", async ({
  page,
}) => {
  await page.goto("/locations");

  await page.locator("#locations").waitFor();

  const firstItem = page.locator("#locations > li").first();
  const locationName = await firstItem.locator(".location_name").textContent();
  const detailLink = firstItem.getByRole("link", { name: "More Details" });
  const expectedSlug = await detailLink.getAttribute("href");

  await detailLink.click();

  await expect(page).toHaveURL(expectedSlug!);
  await expect(page.locator(".details-screen")).toBeVisible();
  await expect(page.locator("#location_name")).toHaveText(locationName!);
  await expect(page.locator("#details_back")).toBeVisible();
});

test("should close the location detail panel when clicking the back button", async ({
  page,
}) => {
  await page.goto("/locations");

  await page.locator("#locations").waitFor();
  await page
    .locator("#locations > li")
    .first()
    .getByRole("link", { name: "More Details" })
    .click();

  await expect(page.locator(".details-screen")).toBeVisible();

  await page.locator("#details_back").click();

  await expect(page.locator(".details-screen")).not.toBeVisible();
  await expect(page).toHaveURL("/locations");
  await expect(page.locator("#locations")).toBeVisible();
});
