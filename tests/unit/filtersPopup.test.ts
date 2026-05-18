// Unit tests for the filters popup URL-building utilities.
// These functions are the core logic behind every filter interaction:
// they build the next URL whenever a user toggles a filter, changes
// a category, or clears all selections.

import { describe, expect, it, vi } from "vitest";

// --- Module mocks (hoisted before imports) ---

vi.mock("next/navigation", () => ({
  ReadonlyURLSearchParams: class ReadonlyURLSearchParams extends URLSearchParams {},
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

vi.mock("next/dist/server/web/spec-extension/adapters/request-cookies", () => ({
  ReadonlyRequestCookies: class {},
}));

vi.mock("@/components/streetlives-api-service", async () => {
  class Error404Response extends Error {
    constructor() {
      super("Not Found");
    }
  }
  return { Error404Response };
});

// --- Imports under test ---

import {
  getUrlWithNewCategory,
  getUrlWithNewCategoryAndSubcategory,
  getUrlWithNewFilterParameter,
  getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved,
  getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved,
  getUrlWithSubCategoryAddedOrRemoved,
  getUrlWithoutFilterParameter,
  getUrlWithoutFilterParameters,
} from "@/components/navigation";

import { parseRequirementParam } from "@/components/common";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a Map from a plain object for concise test inputs. */
const params = (obj: Record<string, string> = {}): Map<string, string> =>
  new Map(Object.entries(obj));

// ---------------------------------------------------------------------------
// parseRequirementParam
// ---------------------------------------------------------------------------

describe("parseRequirementParam", () => {
  it("returns empty array for null", () => {
    expect(parseRequirementParam(null)).toEqual([]);
  });

  it("returns empty array for undefined", () => {
    expect(parseRequirementParam(undefined)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseRequirementParam("")).toEqual([]);
  });

  it("parses a single requirement", () => {
    expect(parseRequirementParam("no")).toEqual(["no"]);
  });

  it("parses two space-separated requirements", () => {
    expect(parseRequirementParam("no referral-letter")).toEqual([
      "no",
      "referral-letter",
    ]);
  });

  it("parses all three requirements", () => {
    expect(
      parseRequirementParam("no referral-letter registered-client"),
    ).toEqual(["no", "referral-letter", "registered-client"]);
  });
});

// ---------------------------------------------------------------------------
// getUrlWithoutFilterParameters
// ---------------------------------------------------------------------------

describe("getUrlWithoutFilterParameters", () => {
  it("always returns /locations", () => {
    expect(getUrlWithoutFilterParameters()).toBe("/locations");
  });
});

// ---------------------------------------------------------------------------
// getUrlWithNewFilterParameter
// ---------------------------------------------------------------------------

describe("getUrlWithNewFilterParameter", () => {
  it("throws when pathname is null", () => {
    expect(() =>
      getUrlWithNewFilterParameter(null, params(), "age", "25"),
    ).toThrow("Expected pathname to not be null");
  });

  it("appends a new query parameter to a clean path", () => {
    expect(
      getUrlWithNewFilterParameter("/locations", params(), "age", "25"),
    ).toBe("/locations?age=25");
  });

  it("preserves existing query parameters", () => {
    const url = getUrlWithNewFilterParameter(
      "/locations",
      params({ open: "" }),
      "age",
      "25",
    );
    expect(url).toContain("age=25");
    expect(url).toContain("open=");
  });

  it("overrides an existing parameter with a new value", () => {
    expect(
      getUrlWithNewFilterParameter(
        "/locations",
        params({ age: "30" }),
        "age",
        "25",
      ),
    ).toBe("/locations?age=25");
  });

  it('uses "yes" as the default value when none is provided', () => {
    expect(getUrlWithNewFilterParameter("/locations", params(), "open")).toBe(
      "/locations?open=yes",
    );
  });

  it("strips the page parameter when adding a filter", () => {
    const url = getUrlWithNewFilterParameter(
      "/locations",
      params({ open: "", page: "3" }),
      "age",
      "25",
    );
    expect(url).not.toContain("page=");
    expect(url).toContain("age=25");
  });
});

// ---------------------------------------------------------------------------
// getUrlWithoutFilterParameter
// ---------------------------------------------------------------------------

describe("getUrlWithoutFilterParameter", () => {
  it("throws when pathname is null", () => {
    expect(() =>
      getUrlWithoutFilterParameter(null, params({ age: "25" }), "age"),
    ).toThrow("Expected pathname to not be null");
  });

  it("removes the specified query parameter", () => {
    expect(
      getUrlWithoutFilterParameter("/locations", params({ age: "25" }), "age"),
    ).toBe("/locations");
  });

  it("keeps other parameters when removing one", () => {
    const url = getUrlWithoutFilterParameter(
      "/locations",
      params({ age: "25", open: "" }),
      "age",
    );
    expect(url).not.toContain("age=");
    expect(url).toContain("open=");
  });

  it("is a no-op when the parameter does not exist", () => {
    expect(
      getUrlWithoutFilterParameter("/locations", params({ open: "" }), "age"),
    ).toBe("/locations?open=");
  });

  it("strips the page parameter when removing a filter", () => {
    const url = getUrlWithoutFilterParameter(
      "/locations",
      params({ age: "25", page: "2" }),
      "age",
    );
    expect(url).not.toContain("page=");
    expect(url).not.toContain("age=");
  });
});

// ---------------------------------------------------------------------------
// getUrlWithNewCategory
// ---------------------------------------------------------------------------

describe("getUrlWithNewCategory", () => {
  it("navigates to the category route", () => {
    expect(getUrlWithNewCategory("food", null)).toBe("/food");
  });

  it("maps 'other' to /other-services", () => {
    expect(getUrlWithNewCategory("other", null)).toBe("/other-services");
  });

  it("preserves age and open filter params across category change", () => {
    const url = getUrlWithNewCategory("food", params({ age: "25", open: "" }));
    expect(url).toBe("/food?age=25&open=");
  });

  it("strips the page param on category change", () => {
    const url = getUrlWithNewCategory("food", params({ age: "25", page: "2" }));
    expect(url).not.toContain("page=");
    expect(url).toContain("age=25");
  });

  it("strips the requirement param when changing to any category", () => {
    // When getUrlWithNewCategory passes the bare category name (no leading slash)
    // to removeExtraneousSearchParams, the route is parsed as undefined, so
    // requirement is always stripped — this is the intended behaviour when
    // changing categories.
    const url = getUrlWithNewCategory(
      "clothing",
      params({ requirement: "no" }),
    );
    expect(url).not.toContain("requirement=");
  });

  it("strips the personal-care amenities param on category change", () => {
    const url = getUrlWithNewCategory(
      "food",
      params({ "personal-care": "showers" }),
    );
    expect(url).not.toContain("personal-care=");
  });

  it("strips sortBy when a search param is present", () => {
    const url = getUrlWithNewCategory(
      "food",
      params({ search: "soup", sortBy: "nearby" }),
    );
    expect(url).not.toContain("sortBy=");
    expect(url).toContain("search=soup");
  });
});

// ---------------------------------------------------------------------------
// getUrlWithNewCategoryAndSubcategory
// ---------------------------------------------------------------------------

describe("getUrlWithNewCategoryAndSubcategory", () => {
  it("builds a URL with category and subcategory", () => {
    expect(
      getUrlWithNewCategoryAndSubcategory("health-care", "mental-health", null),
    ).toBe("/health-care/mental-health");
  });

  it("maps 'other' with legal-services subcategory to the correct route", () => {
    expect(
      getUrlWithNewCategoryAndSubcategory("other", "legal-services", null),
    ).toBe("/other-services/legal-services");
  });

  it("preserves age filter param", () => {
    const url = getUrlWithNewCategoryAndSubcategory(
      "health-care",
      "mental-health",
      params({ age: "30" }),
    );
    expect(url).toContain("age=30");
  });

  it("strips the page param", () => {
    const url = getUrlWithNewCategoryAndSubcategory(
      "health-care",
      "mental-health",
      params({ age: "30", page: "2" }),
    );
    expect(url).not.toContain("page=");
  });
});

// ---------------------------------------------------------------------------
// getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved
// ---------------------------------------------------------------------------

describe("getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved", () => {
  it("throws when pathname is null", () => {
    expect(() =>
      getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
        null,
        params(),
        "no",
        true,
      ),
    ).toThrow("Expected pathname to not be null");
  });

  it("adds the first requirement", () => {
    const url = getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
      "/clothing",
      params(),
      "no",
      true,
    );
    expect(url).toBe("/clothing?requirement=no");
  });

  it("adds a second requirement in canonical order (no before referral-letter)", () => {
    const url = getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
      "/clothing",
      params({ requirement: "no" }),
      "referral-letter",
      true,
    );
    expect(url).toBe("/clothing?requirement=no+referral-letter");
  });

  it("inserts into canonical order regardless of add sequence", () => {
    // Adding "no" when "registered-client" already exists → "no registered-client"
    const url = getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
      "/clothing",
      params({ requirement: "registered-client" }),
      "no",
      true,
    );
    expect(url).toBe("/clothing?requirement=no+registered-client");
  });

  it("adds all three requirements in canonical order", () => {
    const withTwo = getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
      "/clothing",
      params({ requirement: "no referral-letter" }),
      "registered-client",
      true,
    );
    expect(withTwo).toBe(
      "/clothing?requirement=no+referral-letter+registered-client",
    );
  });

  it("is idempotent — adding an already-present requirement changes nothing", () => {
    const url = getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
      "/clothing",
      params({ requirement: "no" }),
      "no",
      true,
    );
    expect(url).toBe("/clothing?requirement=no");
  });

  it("removes a requirement from a multi-value set", () => {
    const url = getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
      "/clothing",
      params({ requirement: "no referral-letter" }),
      "referral-letter",
      false,
    );
    expect(url).toBe("/clothing?requirement=no");
  });

  it("deletes the param entirely when the last requirement is removed", () => {
    const url = getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
      "/clothing",
      params({ requirement: "no" }),
      "no",
      false,
    );
    expect(url).toBe("/clothing");
  });

  it("removing a requirement that is not present leaves the URL unchanged", () => {
    const url = getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
      "/clothing",
      params({ requirement: "no" }),
      "referral-letter",
      false,
    );
    expect(url).toBe("/clothing?requirement=no");
  });

  it("strips the page param when changing requirements", () => {
    const url = getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
      "/clothing",
      params({ page: "2" }),
      "no",
      true,
    );
    expect(url).not.toContain("page=");
    expect(url).toContain("requirement=no");
  });
});

// ---------------------------------------------------------------------------
// getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved
// ---------------------------------------------------------------------------

describe("getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved", () => {
  it("throws when pathname is null", () => {
    expect(() =>
      getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved(
        null,
        params(),
        "showers",
        true,
      ),
    ).toThrow("Expected pathname to not be null");
  });

  it("adds the first amenity as a path component", () => {
    const url =
      getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved(
        "/personal-care",
        params(),
        "showers",
        true,
      );
    expect(url).toBe("/personal-care/showers");
  });

  it("adds a second amenity: canonical-first in path, second in query", () => {
    // showers (index 2) comes before toiletries (index 3) in canonical order
    const url =
      getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved(
        "/personal-care/showers",
        params(),
        "toiletries",
        true,
      );
    expect(url).toBe("/personal-care/showers?personal-care=toiletries");
  });

  it("re-sorts path when a higher-priority amenity is added", () => {
    // laundry-services (index 0) sorts before showers (index 2)
    // → laundry-services becomes the path, showers goes into query
    const url =
      getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved(
        "/personal-care/showers",
        params(),
        "laundry-services",
        true,
      );
    expect(url).toBe("/personal-care/laundry-services?personal-care=showers");
  });

  it("is idempotent — adding an already-present amenity changes nothing", () => {
    const url =
      getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved(
        "/personal-care/showers",
        params(),
        "showers",
        true,
      );
    expect(url).toBe("/personal-care/showers");
  });

  it("removes the only amenity and returns to /personal-care", () => {
    const url =
      getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved(
        "/personal-care/showers",
        params(),
        "showers",
        false,
      );
    expect(url).toBe("/personal-care");
  });

  it("removing path amenity promotes the query amenity to the path", () => {
    const url =
      getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved(
        "/personal-care/showers",
        params({ "personal-care": "toiletries" }),
        "showers",
        false,
      );
    expect(url).toBe("/personal-care/toiletries");
  });

  it("removing query amenity keeps the path amenity intact", () => {
    const url =
      getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved(
        "/personal-care/showers",
        params({ "personal-care": "toiletries" }),
        "toiletries",
        false,
      );
    expect(url).toBe("/personal-care/showers");
  });

  it("strips the page param", () => {
    const url =
      getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved(
        "/personal-care",
        params({ page: "2" }),
        "showers",
        true,
      );
    expect(url).not.toContain("page=");
  });
});

// ---------------------------------------------------------------------------
// getUrlWithSubCategoryAddedOrRemoved
// ---------------------------------------------------------------------------

describe("getUrlWithSubCategoryAddedOrRemoved", () => {
  it("throws when pathname is null", () => {
    expect(() =>
      getUrlWithSubCategoryAddedOrRemoved(null, params(), "soup-kitchens"),
    ).toThrow("Expected pathname to not be null");
  });

  it("sets a food subcategory", () => {
    const url = getUrlWithSubCategoryAddedOrRemoved(
      "/food",
      params(),
      "soup-kitchens",
    );
    expect(url).toBe("/food/soup-kitchens");
  });

  it("switches food subcategory", () => {
    const url = getUrlWithSubCategoryAddedOrRemoved(
      "/food/soup-kitchens",
      params(),
      "pantry",
    );
    expect(url).toBe("/food/pantry");
  });

  it("clears a subcategory when null is passed", () => {
    const url = getUrlWithSubCategoryAddedOrRemoved(
      "/food/soup-kitchens",
      params(),
      null,
    );
    expect(url).toBe("/food");
  });

  it("sets a shelter subcategory", () => {
    const url = getUrlWithSubCategoryAddedOrRemoved(
      "/shelters-housing",
      params(),
      "families",
    );
    expect(url).toBe("/shelters-housing/families");
  });

  it("sets a clothing subcategory", () => {
    const url = getUrlWithSubCategoryAddedOrRemoved(
      "/clothing",
      params(),
      "casual",
    );
    expect(url).toBe("/clothing/casual");
  });

  it("strips the page param", () => {
    const url = getUrlWithSubCategoryAddedOrRemoved(
      "/food",
      params({ page: "3" }),
      "pantry",
    );
    expect(url).not.toContain("page=");
    expect(url).toContain("/food/pantry");
  });

  it("strips the amenities param", () => {
    const url = getUrlWithSubCategoryAddedOrRemoved(
      "/food",
      params({ "personal-care": "showers" }),
      "pantry",
    );
    expect(url).not.toContain("personal-care=");
  });

  it("preserves age and open params", () => {
    const url = getUrlWithSubCategoryAddedOrRemoved(
      "/food",
      params({ age: "25", open: "" }),
      "pantry",
    );
    expect(url).toContain("age=25");
    expect(url).toContain("open=");
  });
});
