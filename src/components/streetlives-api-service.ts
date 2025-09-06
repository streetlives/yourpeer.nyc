// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import _ from "underscore";
import {
  AMENITIES_PARAM,
  AmenitiesSubCategory,
  AMENITY_TO_TAXONOMY_NAME_MAP,
  Category,
  CATEGORY_TO_TAXONOMY_NAME_MAP,
  CLOTHING_PARAM,
  CLOTHING_PARAM_CASUAL_VALUE,
  CLOTHING_PARAM_PROFESSIONAL_VALUE,
  Comment,
  CommentContent,
  CommentHighlights,
  FOOD_PARAM,
  FOOD_PARAM_PANTRY_VALUE,
  FOOD_PARAM_SOUP_KITCHEN_VALUE,
  FullLocationData,
  HEALTH_PARAM,
  HEALTH_PARAM_MENTAL_HEALTH,
  LocationDetailData,
  NEARBY_SORT_BY_VALUE,
  OTHER_PARAM,
  OTHER_PARAM_EMPLOYMENT_VALUE,
  OTHER_PARAM_LEGAL_VALUE,
  Reply,
  ScheduleData,
  setIntersection,
  SHELTER_PARAM,
  SHELTER_PARAM_FAMILY_VALUE,
  SHELTER_PARAM_SINGLE_VALUE,
  SimplifiedLocationData,
  Taxonomy,
  TaxonomyCategory,
  TaxonomyResponse,
  TaxonomySubCategory,
  YourPeerLegacyLocationData,
  YourPeerLegacyServiceData,
  YourPeerLegacyServiceDataWrapper,
  YourPeerParsedRequestParams,
} from "./common";
import moment from "moment";
import axios from "axios";
import { getAuthToken } from "@/components/auth";
import { redirect } from "next/navigation";

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
  sortBy = null,
  latitude,
  longitude,
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
  sortBy?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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
        .map((a, i) => `taxonomySpecificAttributes[${i}]=${a}`)
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

  if (sortBy) {
    query_url += `&sortBy=${sortBy}`;

    if (sortBy === NEARBY_SORT_BY_VALUE && !(latitude && longitude)) {
      throw new Error(
        `If sortBy is set to ${NEARBY_SORT_BY_VALUE}, then latitude and longitude must be defined`,
      );
    }

    if (sortBy === NEARBY_SORT_BY_VALUE && latitude && longitude) {
      query_url += `&latitude=${latitude}&longitude=${longitude}`;
    }
  }

  console.log(query_url);

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
  sortBy?: string | null;
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
  sortBy,
  latitude,
  longitude,
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
  sortBy?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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
    sortBy,
    age,
    shelter,
    location_fields_only: false,
    latitude,
    longitude,
  });
}

function isServiceClosed(schedule: ScheduleData[]) {
  const isScheduleKnown = schedule && schedule.length;

  let isClosed = false;
  let openDays;
  if (isScheduleKnown) {
    openDays = schedule.filter(({ closed }) => !closed);

    if (!openDays.length) {
      isClosed = true;
    }
  }
  return isClosed;
}

function filter_services_by_name(
  d: FullLocationData | LocationDetailData,
  is_location_detail: boolean,
  category_name: Category,
): YourPeerLegacyServiceDataWrapper {
  const services: YourPeerLegacyServiceData[] = [];
  for (let service of d.Services) {
    let age_eligibilities = null;
    let taxonomiesForService = new Set(
      service.Taxonomies.flatMap((taxonomy) => [
        taxonomy.name,
        taxonomy.parent_name,
      ]).filter((t) => t !== null),
    );
    if (category_name == "health-care") {
      taxonomiesForService = new Set(
        service.Taxonomies.map((taxonomy) => taxonomy.name),
      );
    }
    if (
      !category_name ||
      taxonomiesForService.has(CATEGORY_TO_TAXONOMY_NAME_MAP[category_name])
    ) {
      if (is_location_detail && service.Eligibilities) {
        age_eligibilities = [];
        for (let elig of service.Eligibilities) {
          if (elig.EligibilityParameter.name === "age") {
            if (!elig.eligible_values.length) {
              continue;
            }
            for (let elig_value of elig.eligible_values) {
              age_eligibilities.push(elig_value);
            }
          }
        }
      }
      if (service["Taxonomies"].length !== 0) {
        services.push({
          id: service.id,
          name: service["name"],
          description: service["description"],
          category: service["Taxonomies"][0]["parent_name"],
          subcategory: service["Taxonomies"][0]["name"],
          // FIXME: there's some bug in the stack where the server is returning duplicate EventRelatedInfos
          // We de-deuplicate here as a workaround
          info: Array.from(
            new Set(
              service?.EventRelatedInfos?.map((x) => x.information).filter(
                (information) => information !== null,
              ),
            ),
          ),
          closed: isServiceClosed(service.HolidaySchedules),
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
                    .filter((elig_value) => typeof elig_value === "string")
                    .map((elig_value) => elig_value.toLowerCase())
                    .includes("false"),
              ).length
            : null,
          age: age_eligibilities,
        });
      }
    }
  }

  return { services };
}

export function map_gogetta_to_yourpeer(
  d: FullLocationData | LocationDetailData,
  is_location_detail: boolean,
): YourPeerLegacyLocationData {
  // Debug logging removed for production.
  const org_name = d["Organization"]["name"];
  let address,
    street,
    zip,
    state,
    neighborhood = null;
  if (is_location_detail) {
    let locationDetailData = d as LocationDetailData;
    address = locationDetailData.address;
    street = address.street;
    zip = address.postalCode;
    state = address.state;
    neighborhood = locationDetailData.neighborhood;
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
    organization_id: d["Organization"]["id"],
    address: street,
    city: address.city,
    region: address.region,
    state,
    zip,
    lat: d["position"]["coordinates"][1],
    lng: d["position"]["coordinates"][0],
    area: neighborhood,
    info: d.EventRelatedInfos.map((info) => info.information),
    slug: `/locations/${d["slug"]}`,
    last_updated: moment(updated_at).fromNow(),
    last_updated_date: updated_at,
    name: org_name,
    phone: d["Phones"] && d["Phones"][0] && d["Phones"][0]["number"],
    url: d["Organization"]["url"],
    streetview_url: d["streetview_url"],
    partners: d["Organization"]["partners"],
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
    legal_services: filter_services_by_name(
      d,
      is_location_detail,
      "legal-services",
    ),

    mental_health_services: filter_services_by_name(
      d,
      is_location_detail,
      "mental-health",
    ),

    employment_services: filter_services_by_name(
      d,
      is_location_detail,
      "employment",
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
              "Mental Health",
              "Legal Services",
              "Employment",
              "Advocates / Legal Aid",
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
          taxonomySpecificAttributes = ["clothingOccasion", "Everyday"];
          break;
        case CLOTHING_PARAM_PROFESSIONAL_VALUE:
          taxonomySpecificAttributes = ["clothingOccasion", "Job Interview"];
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
      switch (parsedSearchParams[HEALTH_PARAM]) {
        case null:
          taxonomies = taxonomyResponse.flatMap((r) =>
            r.name === parentTaxonomyName
              ? [r as Taxonomy].concat(r.children ? r.children : [])
              : [],
          );
          break;
        case HEALTH_PARAM_MENTAL_HEALTH:
          taxonomies = taxonomyResponse.flatMap((r) =>
            !r.children
              ? []
              : r.children.filter((t) => t.name === "Mental Health"),
          );
          break;
      }
      break;
    case "other":
      //query = TAXONOMIES_BASE_SQL + " and (t.name = 'Other service' or t.parent_name = 'Other service')"
      switch (parsedSearchParams[OTHER_PARAM]) {
        case null:
          taxonomies = taxonomyResponse.flatMap((r) =>
            r.name === parentTaxonomyName
              ? [r as Taxonomy].concat(r.children ? r.children : [])
              : [],
          );
          break;
        case OTHER_PARAM_LEGAL_VALUE:
          taxonomies = taxonomyResponse.flatMap((r) =>
            !r.children
              ? []
              : r.children.filter((t) => t.name === "Legal Services"),
          );
          break;
        case OTHER_PARAM_EMPLOYMENT_VALUE:
          taxonomies = taxonomyResponse.flatMap((r) =>
            !r.children
              ? []
              : r.children.filter((t) => t.name === "Employment"),
          );
          break;
      }
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
          break;
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
    const redirect_url = `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/location-slug-redirects/${slug}`;
    const redirect_res = await fetch(redirect_url);
    const redirect_data = await redirect_res.json();

    if (redirect_res.status && redirect_data.slug) {
      redirect(`/locations/${redirect_data.slug}`);
    }

    if (response.status === 404) {
      throw new Error404Response();
    }
    throw new Error5XXResponse();
  }
  return response.json();
}

export async function fetchComments(locationId: string): Promise<Comment[]> {
  const res = await axios.get<Comment[]>(
    `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/comments?locationId=${locationId}`,
  );

  const comments = res.data.sort((a, b) => {
    if (b.likes_count !== a.likes_count) {
      return b.likes_count - a.likes_count;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return comments.map((comment) => {
    let content;
    try {
      content = JSON.parse(comment.content as string);
    } catch (e) {
      content = comment.content;
    }

    return { ...comment, content };
  });
}

export async function getFeedbackHighlights(
  locationId: string,
): Promise<CommentHighlights> {
  const res = await axios.get<CommentHighlights>(
    `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/comment-highlights?locationId=${locationId}`,
  );

  return res.data;
}

export async function postComment(data: {
  locationId: string;
  content: CommentContent;
}): Promise<Comment> {
  const res = await axios.post(`${NEXT_PUBLIC_GO_GETTA_PROD_URL}/comments`, {
    locationId: data.locationId,
    content: JSON.stringify(data.content),
  });

  return res.data;
}

export async function hideComment(
  commentId: string,
  hidden: boolean,
): Promise<Comment> {
  const token = await getAuthToken();
  const res = await axios.put(
    `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/comments/${commentId}/hidden`,
    {
      hidden,
    },
    {
      headers: {
        Authorization: token,
      },
    },
  );

  return res.data;
}

export async function excludeComment(
  commentId: string,
  exclude: boolean,
): Promise<Comment> {
  const token = await getAuthToken();
  const res = await axios.put(
    `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/comments/${commentId}/exclude`,
    {
      exclude,
    },
    {
      headers: {
        Authorization: token,
      },
    },
  );

  return res.data;
}

export async function submitCommentEmail(
  commentId: string,
  email: string,
): Promise<unknown> {
  const res = await axios.put(
    `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/comments/email/${commentId}`,
    {
      email,
    },
  );

  return res.data;
}

export async function reportComment(commentId: string): Promise<unknown> {
  const res = await axios.put(
    `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/comments/report/${commentId}`,
  );

  return res.data;
}

export async function unReportComment(commentId: string): Promise<unknown> {
  const res = await axios.put(
    `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/comments/unreport/${commentId}`,
  );

  return res.data;
}

export async function likeComment(commentId: string): Promise<unknown> {
  const res = await axios.put(
    `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/comments/like/${commentId}`,
  );
  return res.data;
}

export async function undoLikeComment(commentId: string): Promise<unknown> {
  const res = await axios.delete(
    `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/comments/like/${commentId}`,
  );
  return res.data;
}

export async function postCommentReply(
  commentId: string,
  postedBy: string,
  content: string,
): Promise<Reply> {
  const data = {
    postedBy,
    content,
  };
  const token = await getAuthToken();
  const res = await axios.post(
    `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/comments/${commentId}/reply`,
    data,
    {
      headers: {
        Authorization: token,
      },
    },
  );

  return res.data;
}

export async function editCommentReply(
  replyId: string,
  content: string,
): Promise<Reply> {
  const data = {
    content,
  };
  const token = await getAuthToken();
  const res = await axios.put(
    `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/comments/replies/${replyId}`,
    data,
    {
      headers: {
        Authorization: token,
      },
    },
  );

  return res.data;
}

export async function getServicesCount(): Promise<unknown> {
  const res = await axios.get(
    `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/services/get-count`,
  );
  return res.data;
}

export class Error404Response extends Error {}

export class Error5XXResponse extends Error {}
