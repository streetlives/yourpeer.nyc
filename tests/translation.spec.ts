import { test, expect } from "@playwright/test";
import { simulateGoogleTranslate } from "./utils/simulateTranslate";

test.describe("Google Translate simulation", () => {
  test("home page renders with simulated translate wrappers", async ({
    page,
  }) => {
    await simulateGoogleTranslate(page);
    await page.goto("/");

    await expect(page.locator("h1")).toContainText(
      "Free support services validated by your peers",
    );
    await expect(page.locator("font.gt-sim").first()).toBeVisible();

    await page.getByRole("link", { name: "Explore services" }).click();
    await expect(page).toHaveURL(/locations/);
  });
});
