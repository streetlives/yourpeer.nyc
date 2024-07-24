// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import _ from "underscore";
import {
  Category,
  CATEGORY_TO_TAXONOMY_NAME_MAP,
  LocationDetailData,
  SHELTER_PARAM,
  SHELTER_PARAM_FAMILY_VALUE,
  SHELTER_PARAM_SINGLE_VALUE,
  YourPeerParsedRequestParams,
  TaxonomyResponse,
  Taxonomy,
  SimplifiedLocationData,
  FullLocationData,
  YourPeerLegacyServiceData,
  YourPeerLegacyLocationData,
  YourPeerLegacyServiceDataWrapper,
  setIntersection,
  TaxonomyCategory,
  FOOD_PARAM,
  FOOD_PARAM_SOUP_KITCHEN_VALUE,
  FOOD_PARAM_PANTRY_VALUE,
  CLOTHING_PARAM,
  CLOTHING_PARAM_CASUAL_VALUE,
  CLOTHING_PARAM_PROFESSIONAL_VALUE,
  AMENITIES_PARAM,
  AmenitiesSubCategory,
  AMENITY_TO_TAXONOMY_NAME_MAP,
  TaxonomySubCategory,
} from "./common";
import moment from "moment";

const NEXT_PUBLIC_GO_GETTA_PROD_URL = process.env.NEXT_PUBLIC_GO_GETTA_PROD_URL;
const DEFAULT_PAGE_SIZE = 20;

export interface LocationsDataResponse<T extends SimplifiedLocationData> {
  locations: T[];
  numberOfPages: number;
  resultCount: number;
}

export async function fetchLocationsData<T extends SimplifiedLocationData>({
  page = 0,
  pageSize,
  taxonomies = null,
  taxonomySpecificAttributes = null,
  noRequirement,
  referralRequired,
  membershipRequired,
  open = false,
  search = undefined,
  location_fields_only,
  age = undefined,
  shelter = undefined,
}: {
  page?: number;
  pageSize?: number;
  taxonomies: string[] | null;
  taxonomySpecificAttributes?: string[] | null;
  noRequirement?: boolean;
  referralRequired?: boolean;
  membershipRequired?: boolean;
  open?: boolean | null;
  search?: string | null;
  location_fields_only?: boolean;
  age?: number | null;
  shelter?: string | null;
}): Promise<LocationsDataResponse<T>> {
  // TODO: handle shelter type by looking up the appropriate taxonomy
  // TODO: maybe convert this function to use a url parse library, as opposed to string concatenation
  let query_url = `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/locations?occasion=COVID19`;
  if (page !== undefined && pageSize !== undefined) {
    query_url += `&pageNumber=${page}&pageSize=${pageSize}`;
  }
  if (location_fields_only) {
    query_url += `&locationFieldsOnly=true`;
  }
  if (age) {
    query_url += `&age=${age}`;
  }
  if (taxonomies && taxonomies.length) {
    query_url += `&taxonomyId=${taxonomies.join(",")}`;
  }
  if (taxonomySpecificAttributes) {
    query_url +=
      "&" +
      taxonomySpecificAttributes
        .map((a, i) => `taxonomySpecificAttribute[${i}]=${a}`)
        .join("&");
  }

  // one of these needs to be selected to apply filter logic
  if (noRequirement || referralRequired || membershipRequired) {
    if (noRequirement) {
      if (!referralRequired) {
        query_url += `&referralRequired=false`;
      }
      if (!membershipRequired) {
        query_url += `&membership=false`;
      }
    } else {
      query_url += `&referralRequired=${referralRequired}&membership=${membershipRequired}`;
    }
  }

  if (search) {
    query_url += `&searchString=${search}`;
  }

  if (open) {
    query_url += `&openAt=${new Date().toISOString()}`;
  }

  console.log("query_url", query_url);

  const gogetta_response = await fetch(query_url);
  if (gogetta_response.status !== 200) {
    if (gogetta_response.status === 404) {
      throw new Error404Response();
    }
    throw new Error5XXResponse();
  }
  const numberOfPages =
    parseInt(gogetta_response.headers.get("Pagination-Count") || "0", 10) - 1; // FIXME: I think there's a bug where it's returning the wrong number of pages, so decrement by 1 here
  const resultCount = parseInt(
    gogetta_response.headers.get("Total-Count") || "0",
    10,
  );
  const locations = recursiveParseUpdatedAt<T>(
    (await gogetta_response.json()) as unknown,
  );
  return {
    locations,
    numberOfPages,
    resultCount,
  };
}

function recursiveParseUpdatedAt<T extends SimplifiedLocationData>(
  gogetta_response: any,
): T[] {
  Object.entries(gogetta_response).forEach(([k, v]) => {
    if (k === "updatedAt" || k === "last_validated_at") {
      gogetta_response[k] = new Date(v as string);
    } else if (typeof v === "object" && v) {
      recursiveParseUpdatedAt(v);
    }
  });
  return gogetta_response;
}

export async function getSimplifiedLocationData({
  taxonomies,
  taxonomySpecificAttributes = null,
  noRequirement,
  referralRequired,
  membershipRequired,
  open = false,
  search = undefined,
  age = undefined,
  shelter = undefined,
}: {
  page?: number;
  pageSize?: number;
  taxonomies: string[] | null;
  taxonomySpecificAttributes: string[] | null;
  noRequirement?: boolean;
  referralRequired?: boolean;
  membershipRequired?: boolean;
  open?: boolean | null;
  search?: string | null;
  age?: number | null;
  shelter?: string | null;
}): Promise<SimplifiedLocationData[]> {
  const response: LocationsDataResponse<SimplifiedLocationData> =
    await fetchLocationsData<SimplifiedLocationData>({
      taxonomies,
      taxonomySpecificAttributes,
      noRequirement,
      referralRequired,
      membershipRequired,
      open,
      search,
      age,
      shelter,
      location_fields_only: true,
    });
  return response.locations;
}

export async function getFullLocationData({
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE,
  taxonomies,
  taxonomySpecificAttributes,
  noRequirement,
  referralRequired,
  membershipRequired,
  open = false,
  search = undefined,
  age = undefined,
  shelter = undefined,
}: {
  page?: number;
  pageSize?: number;
  taxonomies: string[] | null;
  taxonomySpecificAttributes?: string[] | null;
  noRequirement: boolean;
  referralRequired: boolean;
  membershipRequired: boolean;
  open?: boolean | null;
  search?: string | null;
  age?: number | null;
  shelter?: string | null;
}): Promise<LocationsDataResponse<FullLocationData>> {
  return fetchLocationsData<FullLocationData>({
    page,
    pageSize,
    taxonomies,
    taxonomySpecificAttributes,
    noRequirement,
    referralRequired,
    membershipRequired,
    open,
    search,
    age,
    shelter,
    location_fields_only: false,
  });
}

function filter_services_by_name(
  d: FullLocationData | LocationDetailData,
  is_location_detail: boolean,
  category_name: Category,
): YourPeerLegacyServiceDataWrapper {
  const services: YourPeerLegacyServiceData[] = [];
  for (let service of d.Services) {
    let age_eligibilities = null;
    const taxonomiesForService = new Set(
      service.Taxonomies.flatMap((taxonomy) => [
        taxonomy.name,
        taxonomy.parent_name,
      ]).filter((t) => t !== null),
    );
    if (
      !category_name ||
      taxonomiesForService.has(CATEGORY_TO_TAXONOMY_NAME_MAP[category_name])
    ) {
      if (is_location_detail && service.Eligibilities) {
        age_eligibilities = [];
        for (let elig of service.Eligibilities) {
          if (elig.EligibilityParameter.name === "age") {
            for (let elig_value of elig.eligible_values) {
              age_eligibilities.push(elig_value);
            }
          }
        }
      }
      services.push({
        id: service.id,
        name: service["name"],
        description: service["description"],
        category: service["Taxonomies"][0]["parent_name"],
        subcategory: service["Taxonomies"][0]["name"],
        info: service?.EventRelatedInfos?.map((x) => x.information).filter(
          (information) => information !== null,
        ),
        closed: !!service?.HolidaySchedules?.filter((x) => x.closed).length,
        schedule: Object.fromEntries(
          Object.entries(
            _.groupBy(
              service.HolidaySchedules.filter(
                (schedule) => schedule.opens_at && schedule.closes_at,
              ),
              "weekday",
            ),
          ).map(([k, v]) => [
            k,
            v.sort((time1, time2) => (time1 < time2 ? 1 : -1)), // sort the times
          ]),
        ),
        docs: is_location_detail
          ? service.RequiredDocuments.filter(
              (doc) => doc.document && doc.document != "None",
            ).map((doc) => doc.document)
          : null,
        referral_letter: is_location_detail
          ? !!service.RequiredDocuments.filter((doc) =>
              doc.document.toLowerCase().includes("referral letter"),
            ).length
          : null,
        eligibility: is_location_detail
          ? service.Eligibilities.map(
              (eligibility) => eligibility.description,
            ).filter((description) => description !== null)
          : null,
        membership: is_location_detail
          ? !!service.Eligibilities.filter(
              (eligibility) =>
                eligibility.EligibilityParameter.name
                  .toLowerCase()
                  .includes("membership") &&
                eligibility.eligible_values.length &&
                !eligibility.eligible_values
                  .map((elig_value) => elig_value.toLowerCase())
                  .includes("false"),
            ).length
          : null,
        age: age_eligibilities,
      });
    }
  }
  return { services };
}

export function map_gogetta_to_yourpeer(
  d: FullLocationData | LocationDetailData,
  is_location_detail: boolean,
): YourPeerLegacyLocationData {
  const org_name = d["Organization"]["name"];
  let address, street, zip, state;
  if (is_location_detail) {
    let locationDetailData = d as LocationDetailData;
    address = locationDetailData.address;
    street = address.street;
    zip = address.postalCode;
    state = address.state;
  } else {
    let fullLocationData = d as FullLocationData;
    address = fullLocationData.PhysicalAddresses[0];
    street = address.address_1;
    zip = address.postal_code;
    state = address.state_province;
  }
  const updated_at = d["last_validated_at"];
  return {
    id: d.id,
    email: d.Organization.email,
    location_name: d["name"],
    address: street,
    city: address.city,
    region: address.region,
    state,
    zip,
    lat: d["position"]["coordinates"][1],
    lng: d["position"]["coordinates"][0],
    area: address.neighborhood,
    info: null,
    slug: `/locations/${d["slug"]}`,
    last_updated: moment(updated_at).fromNow(),
    last_updated_date: updated_at,
    name: org_name,
    phone: d["Phones"] && d["Phones"][0] && d["Phones"][0]["number"],
    url: d["Organization"]["url"],
    accommodation_services: filter_services_by_name(
      d,
      is_location_detail,
      "shelters-housing",
    ),
    food_services: filter_services_by_name(d, is_location_detail, "food"),
    clothing_services: filter_services_by_name(
      d,
      is_location_detail,
      "clothing",
    ),
    personal_care_services: filter_services_by_name(
      d,
      is_location_detail,
      "personal-care",
    ),
    health_services: filter_services_by_name(
      d,
      is_location_detail,
      "health-care",
    ),
    other_services: {
      services: filter_services_by_name(
        d,
        is_location_detail,
        null,
      ).services.filter((service) => {
        const serviceCategorySet = new Set([
          service.category,
          service.subcategory,
        ]);
        return !Array.from(
          setIntersection(
            serviceCategorySet,
            new Set<TaxonomyCategory>([
              "Health",
              "Shelter",
              "Food",
              "Clothing",
              "Personal Care",
            ]),
          ),
        ).length;
      }),
    },
    closed: d["closed"],
  };
}

interface TaxonomiesResult {
  taxonomies: string[] | null;
  taxonomySpecificAttributes: string[] | null;
}

// TODO: we probably don't want to look this up every time. We probably at least want to cache it
// TODO: add support for HTTP caching (e.g. ETag or Last-Modified headers) on streetlives-api
export async function getTaxonomies(
  category: Category,
  parsedSearchParams: YourPeerParsedRequestParams,
): Promise<TaxonomiesResult> {
  const query_url = `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/taxonomy`;
  const taxonomyResponse = (
    await fetch(query_url).then(
      (response) => response.json() as unknown as TaxonomyResponse[],
    )
  ).flatMap((taxonomyResponse) =>
    [taxonomyResponse].concat(taxonomyResponse.children || []),
  );

  if (!category)
    return {
      taxonomies: null,
      taxonomySpecificAttributes: null,
    };
  const parentTaxonomyName = CATEGORY_TO_TAXONOMY_NAME_MAP[category];

  const selectedAmenities = Object.entries(parsedSearchParams[AMENITIES_PARAM])
    .filter(([k, v]) => v)
    .map(([k, v]) => k) as AmenitiesSubCategory[];
  let hasSelectedSomeAmenities = !!selectedAmenities.length;

  const selectedAmenityTaxonomies = selectedAmenities.map(
    (amenity) => AMENITY_TO_TAXONOMY_NAME_MAP[amenity],
  );

  console.log(
    "taxonomyResponse",
    taxonomyResponse.map((r) => r.name),
    "selectedAmenities",
    selectedAmenities,
    "selectedAmenityTaxonomies",
    selectedAmenityTaxonomies,
  );

  // FIXME: currently it's only two layers deep. Technically, taxonomy can be arbitrary depth, and we should handle that case
  let taxonomies: Taxonomy[] = [];
  let taxonomySpecificAttributes: string[] | null = null;
  switch (category) {
    case "clothing":
      // TODO: do this after we finish the other filters

      // query = TAXONOMIES_BASE_SQL + " and t.name = 'Clothing'"
      // if is_casual:
      //     taxonomy_specific_attributes.append('clothingOccasion')
      //     taxonomy_specific_attributes.append('everyday')
      // elif is_professional:
      //     taxonomy_specific_attributes.append('clothingOccasion')
      //     taxonomy_specific_attributes.append('interview')

      taxonomies = taxonomyResponse.flatMap((r) =>
        r.name === parentTaxonomyName ? [r as Taxonomy] : [],
      );
      // FIXME: specifying taxonomySpecificAttributes does not seem to have any effect on the returned results
      switch (parsedSearchParams[CLOTHING_PARAM]) {
        case CLOTHING_PARAM_CASUAL_VALUE:
          taxonomySpecificAttributes = ["clothingOccasion", "everyday"];
          break;
        case CLOTHING_PARAM_PROFESSIONAL_VALUE:
          taxonomySpecificAttributes = ["clothingOccasion", "interview"];
          break;
      }
      break;
    case "food":
      // if food_pantry:
      //     query += "and t.name='Food Pantry'"
      // elif soup_kitchen:
      //     query += "and t.name='Soup Kitchen'"
      // else:
      //     query += "and t.name='Food'"
      switch (parsedSearchParams[FOOD_PARAM]) {
        case null:
          taxonomies = taxonomyResponse.flatMap((r) =>
            r.name === parentTaxonomyName ? [r as Taxonomy] : [],
          );
          break;
        case FOOD_PARAM_SOUP_KITCHEN_VALUE:
          taxonomies = taxonomyResponse.flatMap((r) =>
            !r.children
              ? []
              : r.children.filter((t) => t.name === "Soup Kitchen"),
          );
          break;
        case FOOD_PARAM_PANTRY_VALUE:
          taxonomies = taxonomyResponse.flatMap((r) =>
            !r.children
              ? []
              : r.children.filter((t) => t.name === "Food Pantry"),
          );
          break;
      }
      break;
    case "health-care":
      //    query = TAXONOMIES_BASE_SQL + " and (t.name='Health' or t.parent_name = 'Health')"
      taxonomies = taxonomyResponse.flatMap((r) =>
        r.name === parentTaxonomyName
          ? [r as Taxonomy].concat(r.children ? r.children : [])
          : [],
      );
      break;
    case "other":
      //query = TAXONOMIES_BASE_SQL + " and (t.name = 'Other service' or t.parent_name = 'Other service')"
      taxonomies = taxonomyResponse.flatMap((r) =>
        r.name === parentTaxonomyName
          ? [r as Taxonomy].concat(r.children ? r.children : [])
          : [],
      );
      break;
    case "personal-care":
      // TODO: do this after we finish the other filters

      // if not has_care_type:
      //     query += " and t.name = 'Personal Care'"
      // else:
      //     conditions = []
      //     if is_toiletries:
      //         conditions.append('Toiletries')
      //     if is_shower:
      //         conditions.append('Shower')
      //     if is_laundry:
      //         conditions.append('Laundry')
      //     if is_haircut:
      //         conditions.append('Haircut')
      //     if is_restrooms:
      //         conditions.append('Restrooms')
      //    conditions_in_quotes = [f"'{c}'" for c in conditions]
      //    query += f" and t.parent_name = 'Personal Care' and t.name in ({','.join(conditions_in_quotes) })"

      taxonomies = hasSelectedSomeAmenities
        ? taxonomyResponse.flatMap((r) => {
            return selectedAmenityTaxonomies.includes(
              r.name as TaxonomySubCategory,
            )
              ? [r as Taxonomy]
              : [];
          })
        : taxonomyResponse.flatMap((r) =>
            r.name === parentTaxonomyName ? [r as Taxonomy] : [],
          );
      break;
    case "shelters-housing":
      // if is_single:
      //     query += " and t.name = 'Single Adult' and t.parent_name = 'Shelter'"
      // elif is_family:
      //     query += " and t.name = 'Families' and t.parent_name = 'Shelter'"
      // else:
      //     query += " and t.name = 'Shelter'"
      switch (parsedSearchParams[SHELTER_PARAM]) {
        case null:
          taxonomies = taxonomyResponse.flatMap((r) =>
            r.name === parentTaxonomyName ? [r as Taxonomy] : [],
          );
          break;
        case SHELTER_PARAM_FAMILY_VALUE:
          taxonomies = taxonomyResponse.flatMap((r) =>
            !r.children
              ? []
              : r.children.filter(
                  (t) =>
                    t.parent_name === parentTaxonomyName &&
                    t.name === "Families",
                ),
          );
        case SHELTER_PARAM_SINGLE_VALUE:
          taxonomies = taxonomyResponse.flatMap((r) =>
            !r.children
              ? []
              : r.children.filter(
                  (t) =>
                    t.parent_name === parentTaxonomyName &&
                    t.name === "Single Adult",
                ),
          );
          break;
      }
  }
  console.log(
    "taxonomies",
    taxonomies.map((t) => t.id),
  );
  return {
    taxonomies: taxonomies.map((t) => t.id),
    taxonomySpecificAttributes,
  };
}

export interface AllLocationsData
  extends LocationsDataResponse<FullLocationData> {
  locationStubs: SimplifiedLocationData[];
}

// fetch the location data for a particular slug
export async function fetchLocationsDetailData(
  slug: string,
): Promise<LocationDetailData> {
  const query_url = `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/locations-by-slug/${slug}`;
  const response = await fetch(query_url);
  if (response.status !== 200) {
    if (response.status === 404) {
      throw new Error404Response();
    }
    throw new Error5XXResponse();
  }
  return response.json();
}

export class Error404Response extends Error {}

export class Error5XXResponse extends Error {}
