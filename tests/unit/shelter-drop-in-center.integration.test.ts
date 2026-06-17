import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Integration-style coverage for the drop-in-center shelter filter: it drives the real
// fetch-based getTaxonomies + getSimplifiedLocationData (only the network boundary and
// Next/auth runtime are stubbed) against a fixture shaped like the real /taxonomy
// response, proving the "Drop-in Center" name resolves to the right taxonomy id, flows
// into the locations query, and never turns the page into a 500.

vi.mock("next/navigation", () => ({
  ReadonlyURLSearchParams: class extends URLSearchParams {},
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

vi.mock("next/dist/server/web/spec-extension/adapters/request-cookies", () => ({
  ReadonlyRequestCookies: class {},
}));

vi.mock("@/components/auth", () => ({
  getAuthToken: vi.fn(async () => null),
}));

const API_BASE = "http://test-api.local";

const DROP_IN_ID = "1b6de3a4-61d9-4d09-99a7-b988a82fa5dd";
const SINGLE_ADULT_ID = "single-adult-id";
const FAMILIES_ID = "families-id";
const SHELTER_PARENT_ID = "shelter-parent-id";

// Shaped like the real GET /taxonomy response: parents with nested `children`.
function shelterChild(id: string, name: string) {
  return {
    id,
    name,
    parent_name: "Shelter",
    parent_id: SHELTER_PARENT_ID,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };
}

function buildTaxonomyApiResponse(shelterChildNames: string[]) {
  return [
    {
      id: SHELTER_PARENT_ID,
      name: "Shelter",
      parent_name: null,
      parent_id: null,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      children: shelterChildNames.map((name) => {
        if (name === "Drop-in Center") return shelterChild(DROP_IN_ID, name);
        if (name === "Single Adult") return shelterChild(SINGLE_ADULT_ID, name);
        if (name === "Families") return shelterChild(FAMILIES_ID, name);
        return shelterChild(`${name}-id`, name);
      }),
    },
  ];
}

const FULL_TAXONOMY = buildTaxonomyApiResponse([
  "Single Adult",
  "Families",
  "Drop-in Center",
  "Youth",
]);

const TAXONOMY_WITHOUT_DROP_IN = buildTaxonomyApiResponse([
  "Single Adult",
  "Families",
]);

function jsonResponse(body: unknown, headers: Record<string, string> = {}) {
  return {
    status: 200,
    headers: { get: (name: string) => headers[name] ?? null },
    json: async () => body,
  };
}

// Captures the location-query URLs the code under test issues so we can assert which
// taxonomyId it filtered on.
const locationRequestUrls: string[] = [];

function installFetchMock(taxonomyBody: unknown, totalCount = "3") {
  const fetchMock = vi.fn(async (url: string) => {
    if (url.includes("/taxonomy")) {
      return jsonResponse(taxonomyBody);
    }
    if (url.includes("/locations")) {
      locationRequestUrls.push(url);
      return jsonResponse([], {
        "Pagination-Count": "1",
        "Total-Count": totalCount,
      });
    }
    throw new Error(`Unexpected fetch in test: ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// The module reads NEXT_PUBLIC_GO_GETTA_PROD_URL into a const at load time, so set it
// before importing and import dynamically.
async function importServiceAndCommon() {
  process.env.NEXT_PUBLIC_GO_GETTA_PROD_URL = API_BASE;
  const service = await import("@/components/streetlives-api-service");
  const common = await import("@/components/common");
  return { service, common };
}

function parsedParamsForSubcategory(
  common: typeof import("@/components/common"),
  subcategory: string,
) {
  return common.parseRequest({
    params: {
      route: "shelters-housing",
      locationSlugOrPersonalCareSubCategory: subcategory,
    },
    searchParams: {},
  });
}

beforeEach(() => {
  locationRequestUrls.length = 0;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getTaxonomies for shelters-housing (realistic fixture)", () => {
  it("resolves drop-in-center to the real 'Drop-in Center' taxonomy id without throwing", async () => {
    installFetchMock(FULL_TAXONOMY);
    const { service, common } = await importServiceAndCommon();

    const result = await service.getTaxonomies(
      "shelters-housing",
      parsedParamsForSubcategory(common, "drop-in-center"),
    );

    expect(result.taxonomies).toEqual([DROP_IN_ID]);
  });

  it("resolves the existing single/families subcategories from the same fixture", async () => {
    installFetchMock(FULL_TAXONOMY);
    const { service, common } = await importServiceAndCommon();

    expect(
      (
        await service.getTaxonomies(
          "shelters-housing",
          parsedParamsForSubcategory(common, "adult"),
        )
      ).taxonomies,
    ).toEqual([SINGLE_ADULT_ID]);

    expect(
      (
        await service.getTaxonomies(
          "shelters-housing",
          parsedParamsForSubcategory(common, "families"),
        )
      ).taxonomies,
    ).toEqual([FAMILIES_ID]);
  });

  it("falls back to the parent Shelter taxonomy for the unfiltered index page", async () => {
    installFetchMock(FULL_TAXONOMY);
    const { service, common } = await importServiceAndCommon();

    const result = await service.getTaxonomies(
      "shelters-housing",
      parsedParamsForSubcategory(common, undefined as unknown as string),
    );

    expect(result.taxonomies).toEqual([SHELTER_PARENT_ID]);
  });
});

describe("end-to-end taxonomy -> locations query for drop-in-center", () => {
  it("passes the resolved Drop-in Center taxonomyId into the locations request", async () => {
    installFetchMock(FULL_TAXONOMY);
    const { service, common } = await importServiceAndCommon();

    const { taxonomies } = await service.getTaxonomies(
      "shelters-housing",
      parsedParamsForSubcategory(common, "drop-in-center"),
    );

    await service.getSimplifiedLocationData({
      taxonomies,
      taxonomySpecificAttributes: null,
    });

    expect(locationRequestUrls).toHaveLength(1);
    expect(locationRequestUrls[0]).toContain(`taxonomyId=${DROP_IN_ID}`);
  });

  it("does not 500 and returns zero results (not all locations) when the taxonomy is missing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    // Locations endpoint returns total-count 0 for an unknown taxonomyId.
    installFetchMock(TAXONOMY_WITHOUT_DROP_IN, "0");
    const { service, common } = await importServiceAndCommon();

    const { taxonomies } = await service.getTaxonomies(
      "shelters-housing",
      parsedParamsForSubcategory(common, "drop-in-center"),
    );

    // The filter is still applied (a sentinel id), so the query cannot silently widen to
    // every location.
    expect(taxonomies).toEqual([common.NONEXISTENT_TAXONOMY_ID]);
    expect(errorSpy).toHaveBeenCalledOnce();

    const locations = await service.getSimplifiedLocationData({
      taxonomies,
      taxonomySpecificAttributes: null,
    });

    expect(locationRequestUrls).toHaveLength(1);
    expect(locationRequestUrls[0]).toContain(
      `taxonomyId=${common.NONEXISTENT_TAXONOMY_ID}`,
    );
    expect(locations).toHaveLength(0);
  });
});
