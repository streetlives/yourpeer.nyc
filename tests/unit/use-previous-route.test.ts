import { describe, expect, it, vi } from "vitest";

vi.mock("next-client-cookies", () => ({ useCookies: vi.fn() }));

import {
  buildPreviousRoute,
  serializeToQueryParams,
} from "@/components/use-previous-route";

describe("buildPreviousRoute", () => {
  it("returns undefined for missing cookie", () => {
    expect(buildPreviousRoute(undefined)).toBeUndefined();
  });

  it("builds a simple route with no search params", () => {
    const cookie = JSON.stringify({
      params: { route: "food" },
      searchParams: {},
    });
    expect(buildPreviousRoute(cookie)).toBe("/food");
  });

  it("includes locationSlug when present", () => {
    const cookie = JSON.stringify({
      params: {
        route: "locations",
        locationSlugOrPersonalCareSubCategory: "some-shelter-123",
      },
      searchParams: {},
    });
    expect(buildPreviousRoute(cookie)).toBe("/locations/some-shelter-123");
  });

  it("serializes search params into query string", () => {
    const cookie = JSON.stringify({
      params: { route: "shelters-housing" },
      searchParams: { search: "soup kitchen", page: "2" },
    });
    const result = buildPreviousRoute(cookie);
    expect(result).toMatch(/^\/shelters-housing\?/);
    expect(result).toContain("search=soup%20kitchen");
    expect(result).toContain("page=2");
  });

  it("with overrideSearchParam=null removes the search param", () => {
    const cookie = JSON.stringify({
      params: { route: "food" },
      searchParams: { search: "bread" },
    });
    expect(buildPreviousRoute(cookie, null)).toBe("/food");
  });

  it("with overrideSearchParam string replaces the search param", () => {
    const cookie = JSON.stringify({
      params: { route: "food" },
      searchParams: { search: "old value" },
    });
    const result = buildPreviousRoute(cookie, "new value");
    expect(result).toContain("search=new%20value");
    expect(result).not.toContain("old%20value");
  });

  it("with default overrideSearchParam preserves existing search param", () => {
    const cookie = JSON.stringify({
      params: { route: "clothing" },
      searchParams: { search: "jacket" },
    });
    expect(buildPreviousRoute(cookie)).toContain("search=jacket");
  });
});

describe("serializeToQueryParams", () => {
  it("encodes special characters", () => {
    expect(serializeToQueryParams({ search: "soup & bread" })).toBe(
      "search=soup%20%26%20bread",
    );
  });

  it("returns empty string for empty object", () => {
    expect(serializeToQueryParams({})).toBe("");
  });

  it("skips non-string values", () => {
    expect(
      serializeToQueryParams({
        search: "test",
        arr: ["a", "b"] as unknown as string,
      }),
    ).toBe("search=test");
  });
});
