import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  ReadonlyURLSearchParams: class extends URLSearchParams {},
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

vi.mock("next/dist/server/web/spec-extension/adapters/request-cookies", () => ({
  ReadonlyRequestCookies: class {},
}));

vi.mock("@/components/auth", () => ({
  getAuthToken: vi.fn().mockResolvedValue(null),
}));

import { fetchLocationsData } from "@/components/streetlives-api-service";

function makeFetchStub(capturedUrls: string[]) {
  return vi.fn().mockImplementation((url: string) => {
    capturedUrls.push(url);
    return Promise.resolve({
      status: 200,
      headers: {
        get: (name: string) => {
          if (name === "Pagination-Count") return "1";
          if (name === "Total-Count") return "0";
          return null;
        },
      },
      json: () => Promise.resolve([]),
    });
  });
}

describe("fetchLocationsData – outgoing API query param selection", () => {
  let capturedUrls: string[];

  beforeEach(() => {
    capturedUrls = [];
    vi.stubGlobal("fetch", makeFetchStub(capturedUrls));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses searchString by default (aiSearch omitted)", async () => {
    await fetchLocationsData({ taxonomies: null, search: "hot meals" });
    expect(capturedUrls[0]).toContain("searchString=hot%20meals");
    expect(capturedUrls[0]).not.toContain("naturalLanguageQuery");
  });

  it("uses searchString when aiSearch is explicitly false", async () => {
    await fetchLocationsData({
      taxonomies: null,
      search: "shelter",
      aiSearch: false,
    });
    expect(capturedUrls[0]).toContain("searchString=shelter");
    expect(capturedUrls[0]).not.toContain("naturalLanguageQuery");
  });

  it("uses naturalLanguageQuery when aiSearch is true", async () => {
    await fetchLocationsData({
      taxonomies: null,
      search: "where can I get food",
      aiSearch: true,
    });
    expect(capturedUrls[0]).toContain(
      "naturalLanguageQuery=where%20can%20I%20get%20food",
    );
    expect(capturedUrls[0]).not.toContain("searchString");
  });

  it("encodes reserved characters to prevent parameter injection", async () => {
    await fetchLocationsData({
      taxonomies: null,
      search: "food&openAt=2099-01-01",
      aiSearch: false,
    });
    const url = capturedUrls[0];
    expect(url).toContain("searchString=food%26openAt%3D2099-01-01");
    expect(url).not.toMatch(/openAt=2099/);
  });

  it("encodes reserved characters in naturalLanguageQuery", async () => {
    await fetchLocationsData({
      taxonomies: null,
      search: "shelter & food = free",
      aiSearch: true,
    });
    const url = capturedUrls[0];
    expect(url).toContain(
      "naturalLanguageQuery=shelter%20%26%20food%20%3D%20free",
    );
    expect(url).not.toContain("searchString");
    expect(url).not.toMatch(/&food/);
  });

  it("adds no search param when search is absent", async () => {
    await fetchLocationsData({ taxonomies: null });
    expect(capturedUrls[0]).not.toContain("searchString");
    expect(capturedUrls[0]).not.toContain("naturalLanguageQuery");
  });

  it("adds no search param when search is null", async () => {
    await fetchLocationsData({
      taxonomies: null,
      search: null,
      aiSearch: true,
    });
    expect(capturedUrls[0]).not.toContain("naturalLanguageQuery");
    expect(capturedUrls[0]).not.toContain("searchString");
  });
});
