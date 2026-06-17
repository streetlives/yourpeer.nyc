import { describe, expect, it, vi } from "vitest";

// common.ts imports Error404Response from the api-service module, which transitively
// pulls in axios / next runtime code we don't want to evaluate in unit tests. Stub it
// the same way the other unit tests do.
vi.mock("@/components/streetlives-api-service", () => {
  class Error404Response extends Error {
    constructor() {
      super("Not Found");
    }
  }
  return { Error404Response };
});

vi.mock("next/navigation", () => ({
  ReadonlyURLSearchParams: class extends URLSearchParams {},
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

vi.mock("next/dist/server/web/spec-extension/adapters/request-cookies", () => ({
  ReadonlyRequestCookies: class {},
}));

import {
  NONEXISTENT_TAXONOMY_ID,
  SHELTER_PARAM_DROP_IN_VALUE,
  SHELTER_PARAM_FAMILY_VALUE,
  SHELTER_PARAM_SINGLE_VALUE,
  SHELTER_PARAM_YOUTH_VALUE,
  SHELTER_SUBCATEGORY_TO_TAXONOMY_NAME,
  getShelterTaxonomies,
  parsePathnameToCategoryAndSubCategory,
  type Taxonomy,
  type TaxonomyResponse,
} from "@/components/common";

const now = new Date();

function child(id: string, name: string): Taxonomy {
  return {
    id,
    name,
    parent_name: "Shelter",
    parent_id: "tax-shelter",
    createdAt: now,
    updatedAt: now,
  };
}

// Mirrors the flattened shape getTaxonomies builds: the parent (with its children) plus
// each child appended as its own top-level entry.
function buildTaxonomyResponse(childNames: string[]): TaxonomyResponse[] {
  const children = childNames.map((name, i) => child(`tax-${i}`, name));
  const shelterParent: TaxonomyResponse = {
    id: "tax-shelter",
    name: "Shelter",
    parent_name: null,
    parent_id: null,
    createdAt: now,
    updatedAt: now,
    children,
  };
  return [shelterParent, ...children];
}

const FULL_RESPONSE = buildTaxonomyResponse([
  "Single Adult",
  "Families",
  "Drop-in Center",
  "Youth",
]);

const ids = (taxonomies: Taxonomy[]) => taxonomies.map((t) => t.id);

describe("drop-in-center route parsing", () => {
  it("accepts /shelters-housing/drop-in-center as a valid subcategory", () => {
    expect(
      parsePathnameToCategoryAndSubCategory("/shelters-housing/drop-in-center"),
    ).toEqual(["shelters-housing", SHELTER_PARAM_DROP_IN_VALUE]);
  });

  it("still accepts the existing shelter subcategories", () => {
    expect(
      parsePathnameToCategoryAndSubCategory("/shelters-housing/adult"),
    ).toEqual(["shelters-housing", SHELTER_PARAM_SINGLE_VALUE]);
    expect(
      parsePathnameToCategoryAndSubCategory("/shelters-housing/families"),
    ).toEqual(["shelters-housing", SHELTER_PARAM_FAMILY_VALUE]);
    expect(
      parsePathnameToCategoryAndSubCategory("/shelters-housing/youth"),
    ).toEqual(["shelters-housing", SHELTER_PARAM_YOUTH_VALUE]);
    expect(parsePathnameToCategoryAndSubCategory("/shelters-housing")).toEqual([
      "shelters-housing",
      null,
    ]);
  });

  it("rejects an unknown shelter subcategory", () => {
    expect(() =>
      parsePathnameToCategoryAndSubCategory("/shelters-housing/not-real"),
    ).toThrow();
  });
});

describe("getShelterTaxonomies", () => {
  it("maps drop-in-center to the 'Drop-in Center' child taxonomy", () => {
    const result = getShelterTaxonomies(
      FULL_RESPONSE,
      "Shelter",
      SHELTER_PARAM_DROP_IN_VALUE,
    );
    expect(ids(result)).toEqual(["tax-2"]);
    expect(result.every((t) => t.name === "Drop-in Center")).toBe(true);
  });

  it("maps single-adult and families to their child taxonomies", () => {
    expect(
      ids(
        getShelterTaxonomies(
          FULL_RESPONSE,
          "Shelter",
          SHELTER_PARAM_SINGLE_VALUE,
        ),
      ),
    ).toEqual(["tax-0"]);
    expect(
      ids(
        getShelterTaxonomies(
          FULL_RESPONSE,
          "Shelter",
          SHELTER_PARAM_FAMILY_VALUE,
        ),
      ),
    ).toEqual(["tax-1"]);
  });

  it("maps the unfiltered and youth cases to the parent Shelter taxonomy", () => {
    expect(ids(getShelterTaxonomies(FULL_RESPONSE, "Shelter", null))).toEqual([
      "tax-shelter",
    ]);
    expect(
      ids(
        getShelterTaxonomies(
          FULL_RESPONSE,
          "Shelter",
          SHELTER_PARAM_YOUTH_VALUE,
        ),
      ),
    ).toEqual(["tax-shelter"]);
  });

  it("degrades to a non-matching sentinel (no throw, no empty set) when the taxonomy is missing", () => {
    // If the upstream taxonomy were renamed or removed, an empty result would drop the
    // taxonomy filter entirely and return every location, while throwing would 500 the
    // page. Instead we log and return a sentinel id that matches nothing -> zero results.
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const responseWithoutDropIn = buildTaxonomyResponse([
      "Single Adult",
      "Families",
    ]);

    const result = getShelterTaxonomies(
      responseWithoutDropIn,
      "Shelter",
      SHELTER_PARAM_DROP_IN_VALUE,
    );

    expect(ids(result)).toEqual([NONEXISTENT_TAXONOMY_ID]);
    expect(errorSpy).toHaveBeenCalledOnce();
    expect(errorSpy.mock.calls[0][0]).toMatch(/Drop-in Center/);
    errorSpy.mockRestore();
  });
});

describe("SHELTER_SUBCATEGORY_TO_TAXONOMY_NAME", () => {
  it("pins the exact upstream taxonomy names the filters depend on", () => {
    expect(SHELTER_SUBCATEGORY_TO_TAXONOMY_NAME).toEqual({
      [SHELTER_PARAM_SINGLE_VALUE]: "Single Adult",
      [SHELTER_PARAM_FAMILY_VALUE]: "Families",
      [SHELTER_PARAM_DROP_IN_VALUE]: "Drop-in Center",
    });
  });
});
