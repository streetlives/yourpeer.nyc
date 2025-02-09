// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import assert from "assert";
import { Error404Response } from "./streetlives-api-service";
import { Cookies } from "next-client-cookies";

export const CATEGORIES = [
  "shelters-housing",
  "food",
  "clothing",
  "personal-care",
  "health-care",
  "other",
] as const;

// TODO: other pages

export type CategoryNotNull = (typeof CATEGORIES)[number];

export type Category = CategoryNotNull | null;

export const CATEGORY_TO_ROUTE_MAP: Record<CategoryNotNull, string> = {
  "health-care": "health-care",
  other: "other-services",
  "shelters-housing": "shelters-housing",
  food: "food",
  clothing: "clothing",
  "personal-care": "personal-care",
};

export const ROUTE_TO_CATEGORY_MAP: Record<string, CategoryNotNull> =
  Object.fromEntries(
    Object.entries(CATEGORY_TO_ROUTE_MAP).map(([k, v]) => [
      v,
      k as CategoryNotNull,
    ]),
  );

export const LOCATION_ROUTE = "locations";

export const ABOUT_US_ROUTE = "about-us";
export const CONTACT_US_ROUTE = "contact-us";
export const DONATE_ROUTE = "donate";
export const TERMS_OF_USE_ROUTE = "terms-of-use";
export const PRIVACY_POLICY_ROUTE = "privacy-policy";
export const LOGIN_ROUTE = "login";

export const COMPANY_ROUTES = [
  ABOUT_US_ROUTE,
  CONTACT_US_ROUTE,
  DONATE_ROUTE,
  TERMS_OF_USE_ROUTE,
  PRIVACY_POLICY_ROUTE,
  LOGIN_ROUTE,
] as const;

export type CompanyRoute = (typeof COMPANY_ROUTES)[number];

export function parseCategoryFromRoute(route: string): Category {
  //console.log(route, ROUTE_TO_CATEGORY_MAP)
  if (route === LOCATION_ROUTE) {
    return null;
  } else if (route in ROUTE_TO_CATEGORY_MAP) {
    return ROUTE_TO_CATEGORY_MAP[route];
  } else if (
    AMENITIES_PARAM_SUBCATEGORY_AND_CANONICAL_ORDERING.includes(
      route as AmenitiesSubCategory,
    )
  ) {
    return PERSONAL_CARE_CATEGORY;
  }
  throw new Error("Received unexpected route: " + route);
}

export const CATEGORY_DESCRIPTION_MAP: Record<CategoryNotNull, string> = {
  "health-care": "Health",
  other: "Other",
  "shelters-housing": "Shelter & Housing",
  food: "Food",
  clothing: "Clothing",
  "personal-care": "Personal Care",
};

export const CATEGORY_ICON_SRC_MAP: Record<CategoryNotNull, string> = {
  "health-care": "health",
  other: "dots",
  "shelters-housing": "shelter-icon",
  food: "food-icon",
  clothing: "clothing",
  "personal-care": "personal-care",
};

export const CATEGORY_FILTER_ICON_SRC_MAP: Record<CategoryNotNull, string> = {
  "health-care": "health-icon",
  other: "dots-icon",
  "shelters-housing": "home-icon",
  food: "food-icon-2",
  clothing: "clothing-icon",
  "personal-care": "personal-care-2",
};

export function getIconPath(iconName: string): string {
  return `/img/icons/${iconName}.svg`;
}

export const SEARCH_PARAM = "search";
export const AGE_PARAM = "age";
export const OPEN_PARAM = "open";
export const SHELTER_PARAM = "shelter";
export const SHELTER_PARAM_SINGLE_VALUE = "adult";
export const SHELTER_PARAM_FAMILY_VALUE = "families";
export type ShelterValues =
  | typeof SHELTER_PARAM_SINGLE_VALUE
  | typeof SHELTER_PARAM_FAMILY_VALUE;
export const SHOW_ADVANCED_FILTERS_PARAM = "adv";

export const FOOD_PARAM = "food";
export const FOOD_PARAM_SOUP_KITCHEN_VALUE = "soup-kitchens";
export const FOOD_PARAM_PANTRY_VALUE = "pantry";
export type FoodValues =
  | typeof FOOD_PARAM_SOUP_KITCHEN_VALUE
  | typeof FOOD_PARAM_PANTRY_VALUE;

export const CLOTHING_PARAM = "clothing";
export const CLOTHING_PARAM_CASUAL_VALUE = "casual";
export const CLOTHING_PARAM_PROFESSIONAL_VALUE = "professional";
export type ClothingValues =
  | typeof CLOTHING_PARAM_PROFESSIONAL_VALUE
  | typeof CLOTHING_PARAM_CASUAL_VALUE;

export const REQUIREMENT_PARAM = "requirement";
export const REQUIREMENT_PARAM_NO_REQUIREMENTS_VALUE = "no";
export const REQUIREMENT_PARAM_REFERRAL_LETTER_VALUE = "referral-letter";
export const REQUIREMENT_PARAM_REGISTERED_CLIENT_VALUE = "registered-client";
export type RequirementValue =
  | typeof REQUIREMENT_PARAM_NO_REQUIREMENTS_VALUE
  | typeof REQUIREMENT_PARAM_REFERRAL_LETTER_VALUE
  | typeof REQUIREMENT_PARAM_REGISTERED_CLIENT_VALUE;

export const REQUIREMENT_PARAM_CANONICAL_ORDERING = [
  REQUIREMENT_PARAM_NO_REQUIREMENTS_VALUE,
  REQUIREMENT_PARAM_REFERRAL_LETTER_VALUE,
  REQUIREMENT_PARAM_REGISTERED_CLIENT_VALUE,
];

export function parseRequirementParam(
  requirementParam: string | null | undefined,
): RequirementValue[] {
  return requirementParam
    ? (requirementParam.split(" ") as RequirementValue[])
    : [];
}

export const PERSONAL_CARE_CATEGORY = CATEGORIES[3];
export const AMENITIES_PARAM = PERSONAL_CARE_CATEGORY;
export const AMENITIES_PARAM_LAUNDRY_VALUE = "laundry-services";
export const AMENITIES_PARAM_RESTROOM_VALUE = "restrooms";
export const AMENITIES_PARAM_SHOWER_VALUE = "showers";
export const AMENITIES_PARAM_TOILETRIES_VALUE = "toiletries";
export type PersonalCareValue =
  | typeof AMENITIES_PARAM_LAUNDRY_VALUE
  | typeof AMENITIES_PARAM_RESTROOM_VALUE
  | typeof AMENITIES_PARAM_SHOWER_VALUE
  | typeof AMENITIES_PARAM_TOILETRIES_VALUE;

export const AMENITIES_PARAM_SUBCATEGORY_AND_CANONICAL_ORDERING = [
  AMENITIES_PARAM_LAUNDRY_VALUE,
  AMENITIES_PARAM_RESTROOM_VALUE,
  AMENITIES_PARAM_SHOWER_VALUE,
  AMENITIES_PARAM_TOILETRIES_VALUE,
] as const;

export type AmenitiesSubCategory =
  (typeof AMENITIES_PARAM_SUBCATEGORY_AND_CANONICAL_ORDERING)[number];

export function parseAmenitiesQueryParam(
  amenitiesParam: string | null | undefined,
): AmenitiesSubCategory[] {
  return amenitiesParam
    ? (amenitiesParam.split(" ") as AmenitiesSubCategory[])
    : [];
}

export type SubCategory =
  | AmenitiesSubCategory
  | ClothingValues
  | FoodValues
  | ShelterValues;

export function getParsedSubCategory(
  params: SubRouteParams,
): SubCategory | null {
  console.log("getParsedSubCategory");
  const category = params.route;
  const subCategory = params.locationSlugOrPersonalCareSubCategory;
  if (!subCategory) {
    return null;
  } else if (
    category === CATEGORY_TO_ROUTE_MAP["personal-care"] &&
    AMENITIES_PARAM_SUBCATEGORY_AND_CANONICAL_ORDERING.indexOf(
      subCategory as AmenitiesSubCategory,
    ) > -1
  ) {
    return subCategory as AmenitiesSubCategory;
  } else if (
    category === CATEGORY_TO_ROUTE_MAP["clothing"] &&
    (!subCategory ||
      subCategory === CLOTHING_PARAM_CASUAL_VALUE ||
      subCategory === CLOTHING_PARAM_PROFESSIONAL_VALUE)
  ) {
    return subCategory as ClothingValues;
  } else if (
    category === CATEGORY_TO_ROUTE_MAP["food"] &&
    (!subCategory ||
      subCategory === FOOD_PARAM_PANTRY_VALUE ||
      subCategory === FOOD_PARAM_SOUP_KITCHEN_VALUE)
  ) {
    return subCategory as FoodValues;
  } else if (
    category === CATEGORY_TO_ROUTE_MAP["shelters-housing"] &&
    (!subCategory ||
      subCategory === SHELTER_PARAM_FAMILY_VALUE ||
      subCategory === SHELTER_PARAM_SINGLE_VALUE)
  ) {
    return subCategory as ShelterValues;
  } else {
    throw new Error404Response("Received unexpected value for subcategory");
  }
}

//1. Laundry
//2. Restroom
//3. Shower
//4. Toiletries

// TODO: apply canonical ordering to the query params?

export const FILTERS_THAT_APPLY_TO_ALL_CATEGORIES = [
  SEARCH_PARAM,
  AGE_PARAM,
  OPEN_PARAM,
  SHOW_ADVANCED_FILTERS_PARAM,
];

export const SORT_BY_QUERY_PARAM = "sortBy";

export const URL_PARAM_NAMES = [
  SEARCH_PARAM,
  AGE_PARAM,
  OPEN_PARAM,
  SHELTER_PARAM,
  FOOD_PARAM,
  CLOTHING_PARAM,
  SHOW_ADVANCED_FILTERS_PARAM,
  SORT_BY_QUERY_PARAM,
] as const;

export type UrlParamName = (typeof URL_PARAM_NAMES)[number];

export type SearchParams = { [key: string]: string | string[] | undefined };

export interface YourPeerParsedRequestParams {
  [SEARCH_PARAM]: string | null;
  [AGE_PARAM]: number | null;
  [OPEN_PARAM]: boolean | null;
  [SHELTER_PARAM]: ShelterValues | null;
  [FOOD_PARAM]: FoodValues | null;
  [CLOTHING_PARAM]: ClothingValues | null;
  [SHOW_ADVANCED_FILTERS_PARAM]: boolean;
  [REQUIREMENT_PARAM]: ParsedRequirements;
  [AMENITIES_PARAM]: ParsedAmenities;
  [PAGE_PARAM]: number;
  [SORT_BY_QUERY_PARAM]: string | null;
  [LATITUDE_COOKIE_NAME]: number | null;
  [LONGITUDE_COOKIE_NAME]: number | null;
}

export interface ParsedRequirements {
  noRequirement: boolean;
  referralRequired: boolean;
  membershipRequired: boolean;
}

export interface ParsedAmenities {
  [AMENITIES_PARAM_LAUNDRY_VALUE]: boolean;
  [AMENITIES_PARAM_RESTROOM_VALUE]: boolean;
  [AMENITIES_PARAM_SHOWER_VALUE]: boolean;
  [AMENITIES_PARAM_TOILETRIES_VALUE]: boolean;
}

type CategoryAndSubCategory = [Category, SubCategory | null];

export function parsePathnameToCategoryAndSubCategory(
  pathname: string,
): CategoryAndSubCategory {
  const pathComponents = pathname.split("/");
  const [_, firstPathComponent, secondPathComponent] = pathComponents;
  assert(firstPathComponent in ROUTE_TO_CATEGORY_MAP);
  const subCategory = getParsedSubCategory({
    route: firstPathComponent,
    locationSlugOrPersonalCareSubCategory: secondPathComponent,
  });
  return [ROUTE_TO_CATEGORY_MAP[firstPathComponent], subCategory];
}

export interface RouteParams {
  route: string;
  locationSlugOrPersonalCareSubCategory?: string;
}

export interface SubRouteParams extends RouteParams {
  locationSlugOrPersonalCareSubCategory: string;
}

function parseRouteParamsToCategoryAndSubCategory(
  params: RouteParams | SubRouteParams,
): CategoryAndSubCategory {
  let category,
    subcategory = null;
  assert(RESOURCE_ROUTES.includes(params.route));
  category = params.route as Category;
  const subRouteParams: SubRouteParams = params as SubRouteParams;
  // we want to get a category and subcategory out of this
  if (subRouteParams.locationSlugOrPersonalCareSubCategory) {
    subcategory = getParsedSubCategory(subRouteParams);
  }
  return [category, subcategory];
}

export function parsePageParam(
  currentPageValueStr: string | string[] | undefined | null,
): number {
  if (Array.isArray(currentPageValueStr)) {
    throw new Error("Did not expect to receive multiple page params");
  }
  return currentPageValueStr && !isNaN(parseInt(currentPageValueStr, 10))
    ? parseInt(currentPageValueStr, 10) - 1
    : 0;
}

export function getParsedAmenities(
  params: SubRouteParams | null,
  amenitiesSubCategory: SubCategory | null,
  amenitiesQueryParam: string | null | undefined,
): AmenitiesSubCategory[] {
  if (!params || params.route === AMENITIES_PARAM) {
    const parsedAmenitiesFromQueryParam: AmenitiesSubCategory[] =
      parseAmenitiesQueryParam(amenitiesQueryParam);

    const combinedParsedAmenitiesFromPathAndQueryParams = (
      amenitiesSubCategory ? [amenitiesSubCategory as AmenitiesSubCategory] : []
    ).concat(parsedAmenitiesFromQueryParam);

    return combinedParsedAmenitiesFromPathAndQueryParams;
  } else {
    return [];
  }
}

// the idea here is we pass in all the raw request stuff that we can get from nextjs
// this can either be the pathname, if we in a client component, and can use usePathname()
// or it can be the route and locationSlugOrPersonalCareSubCategory params which we get as page params from nextjs
// We then parse it to the form that is used in the search
export function parseRequest({
  pathname,
  searchParams,
  params,
  cookies,
}: {
  pathname?: string;
  searchParams: SearchParams;
  params: RouteParams | SubRouteParams;
  cookies?: Cookies;
}): YourPeerParsedRequestParams {
  console.log("parseRequest", parseRequest);
  assert.ok(pathname !== undefined || params !== undefined);
  // TODO: validate searchParams with Joi
  // TODO: return 400 on validation error

  // if we got a pathname, first parse it to category, subcategory
  const [category, subCategory] = pathname
    ? parsePathnameToCategoryAndSubCategory(pathname)
    : parseRouteParamsToCategoryAndSubCategory(params);

  const parsedRequirements = parseRequirementParam(
    searchParams[REQUIREMENT_PARAM] as string,
  );
  const parsedSubCategory = getParsedSubCategory(params as SubRouteParams);
  const parsedAmenities = getParsedAmenities(
    params as SubRouteParams,
    parsedSubCategory,
    searchParams[AMENITIES_PARAM] as string,
  );
  const latitudeCookie = cookies && cookies.get(LATITUDE_COOKIE_NAME);
  const longitudeCookie = cookies && cookies.get(LONGITUDE_COOKIE_NAME);
  return {
    [SEARCH_PARAM]:
      typeof searchParams[SEARCH_PARAM] === "string"
        ? (searchParams[SEARCH_PARAM] as string)
        : null,
    [AGE_PARAM]:
      typeof searchParams[AGE_PARAM] === "string" &&
      !isNaN(parseInt(searchParams[AGE_PARAM] as string, 10))
        ? parseInt(searchParams[AGE_PARAM] as string, 10)
        : null,
    [OPEN_PARAM]: typeof searchParams[OPEN_PARAM] === "string" ? true : null,
    [SHELTER_PARAM]:
      (typeof searchParams[SHELTER_PARAM] === "string" &&
        searchParams[SHELTER_PARAM] === SHELTER_PARAM_SINGLE_VALUE) ||
      searchParams[SHELTER_PARAM] === SHELTER_PARAM_FAMILY_VALUE
        ? (searchParams[SHELTER_PARAM] as ShelterValues)
        : (parsedSubCategory as ShelterValues),
    [FOOD_PARAM]:
      (typeof searchParams[FOOD_PARAM] === "string" &&
        searchParams[FOOD_PARAM] === FOOD_PARAM_SOUP_KITCHEN_VALUE) ||
      searchParams[FOOD_PARAM] === FOOD_PARAM_PANTRY_VALUE
        ? (searchParams[FOOD_PARAM] as FoodValues)
        : (parsedSubCategory as FoodValues),
    [CLOTHING_PARAM]:
      (typeof searchParams[CLOTHING_PARAM] === "string" &&
        searchParams[CLOTHING_PARAM] === CLOTHING_PARAM_CASUAL_VALUE) ||
      searchParams[CLOTHING_PARAM] === CLOTHING_PARAM_PROFESSIONAL_VALUE
        ? (searchParams[CLOTHING_PARAM] as ClothingValues)
        : (parsedSubCategory as ClothingValues),
    [SHOW_ADVANCED_FILTERS_PARAM]: !!searchParams[SHOW_ADVANCED_FILTERS_PARAM],
    [REQUIREMENT_PARAM]: {
      noRequirement: parsedRequirements.includes(
        REQUIREMENT_PARAM_NO_REQUIREMENTS_VALUE,
      ),
      referralRequired: parsedRequirements.includes(
        REQUIREMENT_PARAM_REFERRAL_LETTER_VALUE,
      ),
      membershipRequired: parsedRequirements.includes(
        REQUIREMENT_PARAM_REGISTERED_CLIENT_VALUE,
      ),
    },
    [AMENITIES_PARAM]: {
      [AMENITIES_PARAM_LAUNDRY_VALUE]: parsedAmenities.includes(
        AMENITIES_PARAM_LAUNDRY_VALUE,
      ),
      [AMENITIES_PARAM_RESTROOM_VALUE]: parsedAmenities.includes(
        AMENITIES_PARAM_RESTROOM_VALUE,
      ),
      [AMENITIES_PARAM_SHOWER_VALUE]: parsedAmenities.includes(
        AMENITIES_PARAM_SHOWER_VALUE,
      ),
      [AMENITIES_PARAM_TOILETRIES_VALUE]: parsedAmenities.includes(
        AMENITIES_PARAM_TOILETRIES_VALUE,
      ),
    },
    [PAGE_PARAM]: parsePageParam(searchParams[PAGE_PARAM]),
    [SORT_BY_QUERY_PARAM]: searchParams[SORT_BY_QUERY_PARAM]
      ? (searchParams[SORT_BY_QUERY_PARAM] as string)
      : null,
    [LATITUDE_COOKIE_NAME]: latitudeCookie ? parseFloat(latitudeCookie) : null,
    [LONGITUDE_COOKIE_NAME]: longitudeCookie
      ? parseFloat(longitudeCookie)
      : null,
  };
}

// TODO: this should get exported by the streetlives-api REST API or a shared types library, rather than being embedded here
export interface SimplifiedLocationData {
  id: string;
  name: string | null;
  description: string | null;
  transportation: string | null;
  position: {
    coordinates: [number, number];
  };
  additional_info: string | null;
  slug: string;
  last_validated_at: Date;
  createdAt: Date;
  updatedAt: Date;
  organization_id: string;
  closed: boolean;
}

export interface ScheduleData {
  id: string;
  closed: boolean;
  opens_at: string;
  closes_at: string;
  start_date: string | null;
  end_date: string | null;
  weekday: number | null;
  occasion: string | null;
  createdAt: Date;
  updatedAt: Date;
  location_id: string | null;
  service_id: string | null;
  service_at_location_id: string | null;
}

export interface ServiceData {
  id: string;
  name: string | null;
  description: string | null;
  url: string | null;
  email: string | null;
  interpretation_services: string | null;
  fees: string | null;
  additional_info: string | null;
  createdAt: Date;
  updatedAt: Date;
  organization_id: string | null;
  ServiceAtLocation: {
    id: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    location_id: string;
    service_id: string;
  };
  Eligibilities: {
    id: string;
    eligible_values: any[]; // TODO
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    parameter_id: string;
    service_id: string;
    EligibilityParameter: {
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }[];
  ServiceTaxonomySpecificAttributes: any[]; // TODO
  Taxonomies: {
    id: string;
    name: TaxonomyCategory;
    parent_name: TaxonomyCategory | null;
    createdAt: Date;
    updatedAt: Date;
    parent_id: string | null;
    ServiceTaxonomy: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      service_id: string;
      taxonomy_id: string;
    };
  }[];
  RegularSchedules: [];
  HolidaySchedules: ScheduleData[];
  Languages: {
    id: string;
    language: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    ServiceLanguages: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      language_id: string;
      service_id: string;
    };
  }[];
  RequiredDocuments: {
    id: string;
    document: string;
    createdAt: Date;
    updatedAt: Date;
    service_id: string;
  }[];
  DocumentsInfo: {
    id: string;
    recertification_time: string;
    grace_period: string;
    additional_info: string;
    createdAt: Date;
    updatedAt: Date;
    service_id: string;
  };
  Phones: [];
  EventRelatedInfos: {
    id: string;
    event: string | null;
    information: string | null;
    createdAt: Date;
    updatedAt: Date;
    location_id: string | null;
    service_id: string | null;
  }[];
  ServiceAreas: {
    id: string;
    postal_codes: string[];
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    service_id: string;
  }[];
}

export interface AbstractDetailedLocationData {
  Organization: {
    id: string;
    name: string | null;
    description: string | null;
    email: string | null;
    url: string | null;
    createdAt: Date;
    updatedAt: Date;
    Phones: string[];
  };
  Phones: {
    id: string | null;
    number: string;
    extension: string | null;
    type: string | null;
    language: string | null;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    location_id: string | null;
    organization_id: string | null;
    service_id: string | null;
    service_at_location_id: string | null;
  }[];
  Services: ServiceData[];
  EventRelatedInfos: {
    id: string;
    event: string | null;
    information: string | null;
    createdAt: Date;
    updatedAt: Date;
    location_id: string | null;
    service_id: string | null;
  }[];
}

export interface FullLocationData
  extends SimplifiedLocationData,
    AbstractDetailedLocationData {
  PhysicalAddresses: {
    id: string;
    address_1: string | null;
    city: string | null;
    region: string | null;
    state_province: string | null;
    postal_code: string | null;
    country: string | null;
    createdAt: Date;
    updatedAt: Date;
    location_suggestion_id: string | null;
    location_id: string;
  }[];
}

export interface LocationDetailData
  extends SimplifiedLocationData,
    AbstractDetailedLocationData {
  AccessibilityForDisabilities: any[]; // TODO
  metadata: any; //TODO
  EventRelatedInfos: any[]; // TODO
  additionalInfo: string | null;
  neighborhood: string | null;
  address: {
    street: string | null;
    city: string | null;
    region: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  };
}

export interface Taxonomy {
  id: string;
  name: string;
  parent_name: string | null;
  createdAt: Date;
  updatedAt: Date;
  parent_id: string | null;
}

export interface TaxonomyResponse extends Taxonomy {
  children?: Taxonomy[];
}

export const TAXONOMY_CATEGORIES = [
  "Health",
  "Other service",
  "Shelter",
  "Food",
  "Clothing",
  "Personal Care",
] as const;

const TOILETRIES_TAXONOMY = "Toiletries";
const SHOWER_TAXONOMY = "Shower";
const LAUNDRY_TAXONOMY = "Laundry";
const RESTROOM_TAXONOMY = "Restrooms";
export const TAXONOMY_SUBCATEGORIES = [
  TOILETRIES_TAXONOMY,
  SHOWER_TAXONOMY,
  LAUNDRY_TAXONOMY,
  RESTROOM_TAXONOMY,
] as const;

export type TaxonomyCategory = (typeof TAXONOMY_CATEGORIES)[number];
export type TaxonomySubCategory = (typeof TAXONOMY_SUBCATEGORIES)[number];

export function setIntersection<T>(set1: Set<T>, set2: Set<T>): Set<T> {
  return new Set<T>(Array.from(set1).filter((x) => set2.has(x)));
}

export const CATEGORY_TO_TAXONOMY_NAME_MAP: Record<
  CategoryNotNull,
  TaxonomyCategory
> = {
  "health-care": "Health",
  other: "Other service",
  "shelters-housing": "Shelter",
  food: "Food",
  clothing: "Clothing",
  "personal-care": "Personal Care",
};

export const AMENITY_TO_TAXONOMY_NAME_MAP: Record<
  AmenitiesSubCategory,
  TaxonomySubCategory
> = {
  [AMENITIES_PARAM_LAUNDRY_VALUE]: LAUNDRY_TAXONOMY,
  [AMENITIES_PARAM_RESTROOM_VALUE]: RESTROOM_TAXONOMY,
  [AMENITIES_PARAM_SHOWER_VALUE]: SHOWER_TAXONOMY,
  [AMENITIES_PARAM_TOILETRIES_VALUE]: TOILETRIES_TAXONOMY,
};

export interface AgeEligibility {
  age_min: number | null;
  age_max: number | null;
  all_ages: string | null;
  population_served: string | null;
}

export type YourPeerLegacyScheduleData = Record<number, ScheduleData[]>;

export interface YourPeerLegacyServiceData {
  id: string;
  name: string | null;
  description: string | null;
  category: TaxonomyCategory | null;
  subcategory: TaxonomyCategory | null;
  info: string[];
  closed: boolean;
  schedule: YourPeerLegacyScheduleData;
  docs: string[] | null;
  referral_letter: boolean | null;
  eligibility: string[] | null;
  membership: boolean | null;
  age: AgeEligibility[] | null;
}

export interface YourPeerLegacyServiceDataWrapper {
  services: YourPeerLegacyServiceData[];
}

export interface YourPeerLegacyLocationData {
  id: string;
  location_name: string | null;
  organization_id: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  state: string | null;
  zip: string | null;
  lat: number;
  lng: number;
  area: string | null;
  info: string[] | null;
  slug: string;
  last_updated: string;
  last_updated_date: Date;
  name: string | null;
  phone: string | null;
  url: string | null;
  accommodation_services: YourPeerLegacyServiceDataWrapper;
  food_services: YourPeerLegacyServiceDataWrapper;
  clothing_services: YourPeerLegacyServiceDataWrapper;
  personal_care_services: YourPeerLegacyServiceDataWrapper;
  health_services: YourPeerLegacyServiceDataWrapper;
  other_services: YourPeerLegacyServiceDataWrapper;
  closed: boolean;
}

export function getServicesWrapper(
  serviceCategory: Category,
  location: YourPeerLegacyLocationData,
): YourPeerLegacyServiceDataWrapper {
  switch (serviceCategory) {
    case "clothing":
      return location.clothing_services;
    case "food":
      return location.food_services;
    case "health-care":
      return location.health_services;
    case "other":
      return location.other_services;
    case "personal-care":
      return location.personal_care_services;
    case "shelters-housing":
      return location.accommodation_services;
  }
  throw new Error(
    "Received unexpected value for serviceCategory " + serviceCategory,
  );
}

export const RESOURCE_ROUTES = Object.keys(ROUTE_TO_CATEGORY_MAP).concat(
  LOCATION_ROUTE,
);

export const PAGE_PARAM = "page";

// TODO: move these into new cookies module
export const LAST_SET_PARAMS_COOKIE_NAME = "last-set-params";

export const SHOW_MAP_VIEW_COOKIE_NAME = "show-map-view";

export function mapsAreEqual(
  left: Map<string, string>,
  right: Map<string, string>,
): boolean {
  return (
    left.size === right.size &&
    Array.from(left.entries()).every(
      ([k, v]) => right.has(k) && v === right.get(k),
    )
  );
}

export const NEARBY_SORT_BY_VALUE = "nearby";

export const RECENTLY_UPDATED_SORT_BY_VALUE = "recentlyUpdated";

export const DEFAULT_SORT_BY_VALUE = RECENTLY_UPDATED_SORT_BY_VALUE;

export const SORT_BY_VALUES = [
  NEARBY_SORT_BY_VALUE,
  RECENTLY_UPDATED_SORT_BY_VALUE,
  "mostServices",
];

export type SortByType = (typeof SORT_BY_VALUES)[number];

export const SORT_BY_LABELS: Record<SortByType, string> = {
  nearby: "Nearby",
  recentlyUpdated: "Recently Updated",
  mostServices: "Most Services",
};

export const LATITUDE_COOKIE_NAME = "latitude";
export const LONGITUDE_COOKIE_NAME = "longitude";

export interface Position {
  lat: number;
  lng: number;
}

export interface Reply {
  id: string;
  content: string;
  created_at: string;
  posted_by?: string;
}

export type CommentContent =
  | string
  | {
      whatServicesDidYouUse?: string[];
      whatWentWell: string;
      whatCouldBeImproved?: string;
    };

export interface Comment {
  id: string;
  content: CommentContent;
  hidden?: boolean | null;
  report_count: number;
  likes_count: number;
  created_at: string;
  contact_info?: string;
  Replies: Reply[];
  likedByCurrentUser: boolean;
}
