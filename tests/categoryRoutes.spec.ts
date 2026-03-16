import { expect, test } from "@playwright/test";

const categories = [
  { route: "/locations", heading: "All service locations" },
  { route: "/food", heading: "All Food locations" },
  { route: "/clothing", heading: "All Clothing locations" },
  { route: "/shelters-housing", heading: "All Shelter & Housing locations" },
  { route: "/personal-care", heading: "All Personal care locations" },
  { route: "/health-care", heading: "All Health locations" },
  {
    route: "/health-care/mental-health",
    heading: "All Mental Health locations",
  },
  { route: "/other-services", heading: "All Other locations" },
  {
    route: "/other-services/legal-services",
    heading: "All Legal Services locations",
  },
  { route: "/other-services/employment", heading: "All Employment locations" },
];

for (const { route, heading } of categories) {
  test(`should show "${heading}" when navigating to ${route}`, async ({
    page,
  }) => {
    await page.goto(route);

    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.locator("#locations")).toBeVisible();
  });
}
