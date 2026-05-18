import { expect, test } from "@playwright/test";

test("should open and close the off-canvas menu", async ({ page }) => {
  await page.goto("/");

  const menu = page.locator("aside");

  await page.locator("#offCanvasMenuButton").click();
  await expect(menu).toHaveAttribute("aria-hidden", "false");

  await page.getByRole("button", { name: "Close panel" }).click();
  await expect(menu).toHaveAttribute("aria-hidden", "true");
});

test("should expand subcategories when clicking Explore Services and open second level submenu a link", async ({
  page,
}) => {
  await page.goto("/");

  const menu = page.locator("aside");

  await page.locator("#offCanvasMenuButton").click();
  await expect(menu).toHaveAttribute("aria-hidden", "false");

  // Navigate to services list
  await page.locator("#exploreServiceButton").click();
  await expect(page.locator("#main_menu")).toBeHidden();

  await menu.getByRole("button", { name: "Shelter & Housing" }).click();
  await expect(menu.getByRole("link", { name: "Single Adult" })).toBeVisible();

  await menu.getByRole("link", { name: "Single Adult" }).click();
  await expect(menu).toHaveAttribute("aria-hidden", "true");
  await expect(page).toHaveURL("/shelters-housing/adult");
});
