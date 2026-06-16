import { describe, expect, it, vi } from "vitest";

vi.mock("next-client-cookies", () => ({ useCookies: vi.fn() }));

import { parsePreviousParamsCookie } from "@/components/use-previous-params-client";

describe("parsePreviousParamsCookie", () => {
  it("returns null for missing cookie", () => {
    expect(parsePreviousParamsCookie(undefined)).toBeNull();
  });

  it("parses a valid cookie into PreviousParams", () => {
    const value = JSON.stringify({
      params: { route: "food" },
      searchParams: { search: "bread" },
    });
    const result = parsePreviousParamsCookie(value);
    expect(result).not.toBeNull();
    expect(result?.params.route).toBe("food");
    expect(result?.searchParams.search).toBe("bread");
  });

  it("preserves locationSlug in params", () => {
    const value = JSON.stringify({
      params: {
        route: "locations",
        locationSlugOrPersonalCareSubCategory: "shelter-abc-123",
      },
      searchParams: {},
    });
    expect(
      parsePreviousParamsCookie(value)?.params
        .locationSlugOrPersonalCareSubCategory,
    ).toBe("shelter-abc-123");
  });
});
