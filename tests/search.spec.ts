import { expect, test } from "@playwright/test";

test("should update URL with search param when pressing Enter", async ({
  page,
}) => {
  await page.goto("/locations");

  await page.locator("#search_input").fill("shelter");
  await page.locator("#search_input").press("Enter");

  await expect(page).toHaveURL(/search=shelter/);
});

test("should clear search and remove search param from URL when clicking the clear button", async ({
  page,
}) => {
  await page.goto("/locations?search=food");

  await page.locator("#search_input").waitFor();

  await page.locator("#search_clear_button").click();

  await expect(page).not.toHaveURL(/search=food/);
  await expect(page.locator("#search_input")).toHaveValue("");
});
