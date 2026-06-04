import { describe, expect, it, vi } from "vitest";

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

const params = (obj: Record<string, string> = {}): Map<string, string> =>
  new Map(Object.entries(obj));

describe("parseRequirementParam", () => {
  it("returns empty array for null/undefined/empty", () => {
    expect(parseRequirementParam(null)).toEqual([]);
    expect(parseRequirementParam(undefined)).toEqual([]);
    expect(parseRequirementParam("")).toEqual([]);
  });

  it("parses space-separated requirements", () => {
    expect(parseRequirementParam("no referral-letter")).toEqual([
      "no",
      "referral-letter",
    ]);
  });
});

describe("getUrlWithoutFilterParameters", () => {
  it("returns /locations", () => {
    expect(getUrlWithoutFilterParameters()).toBe("/locations");
  });
});

describe("getUrlWithNewFilterParameter", () => {
  it("throws when pathname is null", () => {
    expect(() =>
      getUrlWithNewFilterParameter(null, params(), "age", "25"),
    ).toThrow("Expected pathname to not be null");
  });

  it("adds a new filter parameter", () => {
    expect(
      getUrlWithNewFilterParameter("/locations", params(), "age", "25"),
    ).toBe("/locations?age=25");
  });

  it("overrides an existing parameter", () => {
    expect(
      getUrlWithNewFilterParameter(
        "/locations",
        params({ age: "30" }),
        "age",
        "25",
      ),
    ).toBe("/locations?age=25");
  });
});

describe("getUrlWithoutFilterParameter", () => {
  it("throws when pathname is null", () => {
    expect(() =>
      getUrlWithoutFilterParameter(null, params({ age: "25" }), "age"),
    ).toThrow("Expected pathname to not be null");
  });

  it("removes the specified filter parameter", () => {
    expect(
      getUrlWithoutFilterParameter("/locations", params({ age: "25" }), "age"),
    ).toBe("/locations");
  });
});

describe("getUrlWithNewCategory", () => {
  it("navigates to the category route", () => {
    expect(getUrlWithNewCategory("food", null)).toBe("/food");
  });

  it("maps 'other' to /other-services", () => {
    expect(getUrlWithNewCategory("other", null)).toBe("/other-services");
  });

  it("preserves age and open filter params across category change", () => {
    expect(getUrlWithNewCategory("food", params({ age: "25", open: "" }))).toBe(
      "/food?age=25&open=",
    );
  });
});

describe("getUrlWithNewCategoryAndSubcategory", () => {
  it("builds a URL with category and subcategory", () => {
    expect(
      getUrlWithNewCategoryAndSubcategory("health-care", "mental-health", null),
    ).toBe("/health-care/mental-health");
  });

  it("preserves age filter param", () => {
    const url = getUrlWithNewCategoryAndSubcategory(
      "health-care",
      "mental-health",
      params({ age: "30" }),
    );
    expect(url).toContain("age=30");
  });
});

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

  it("adds a requirement", () => {
    const url = getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
      "/clothing",
      params(),
      "no",
      true,
    );
    expect(url).toBe("/clothing?requirement=no");
  });

  it("adds a second requirement in canonical order", () => {
    const url = getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
      "/clothing",
      params({ requirement: "no" }),
      "referral-letter",
      true,
    );
    expect(url).toBe("/clothing?requirement=no+referral-letter");
  });

  it("removes a requirement", () => {
    const url = getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
      "/clothing",
      params({ requirement: "no referral-letter" }),
      "referral-letter",
      false,
    );
    expect(url).toBe("/clothing?requirement=no");
  });

  it("removes the param entirely when the last requirement is removed", () => {
    const url = getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
      "/clothing",
      params({ requirement: "no" }),
      "no",
      false,
    );
    expect(url).toBe("/clothing");
  });
});

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
    const url =
      getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved(
        "/personal-care/showers",
        params(),
        "toiletries",
        true,
      );
    expect(url).toBe("/personal-care/showers?personal-care=toiletries");
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
});

describe("getUrlWithSubCategoryAddedOrRemoved", () => {
  it("throws when pathname is null", () => {
    expect(() =>
      getUrlWithSubCategoryAddedOrRemoved(null, params(), "soup-kitchens"),
    ).toThrow("Expected pathname to not be null");
  });

  it("sets a subcategory", () => {
    expect(
      getUrlWithSubCategoryAddedOrRemoved("/food", params(), "soup-kitchens"),
    ).toBe("/food/soup-kitchens");
  });

  it("switches subcategory", () => {
    expect(
      getUrlWithSubCategoryAddedOrRemoved(
        "/food/soup-kitchens",
        params(),
        "pantry",
      ),
    ).toBe("/food/pantry");
  });

  it("clears a subcategory when null is passed", () => {
    expect(
      getUrlWithSubCategoryAddedOrRemoved(
        "/food/soup-kitchens",
        params(),
        null,
      ),
    ).toBe("/food");
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
