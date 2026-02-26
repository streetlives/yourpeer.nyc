import {
  Category,
  REQUIREMENT_PARAM,
  RouteParams,
  SHELTER_PARAM_SINGLE_VALUE,
  SHELTER_PARAM_YOUTH_VALUE,
  SORT_BY_QUERY_PARAM,
  SearchParams,
  SubCategory,
  SubRouteParams,
  YourPeerLegacyLocationData,
  YourPeerParsedRequestParams,
  getParsedSubCategory,
  parseCategoryFromRoute,
  parseRequest,
} from "./common";
import {
  getFullLocationData,
  getTaxonomies,
  map_gogetta_to_yourpeer,
} from "./streetlives-api-service";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export interface SidePanelComponentData {
  params: RouteParams | SubRouteParams;
  parsedSearchParams: YourPeerParsedRequestParams;
  category: Category;
  subCategory: SubCategory | null;
  resultCount: number;
  numberOfPages: number;
  yourPeerLegacyLocationData: YourPeerLegacyLocationData[];
}

export async function getSidePanelComponentData({
  searchParams,
  params,
  cookies,
}: {
  searchParams: SearchParams;
  params: SubRouteParams;
  cookies: ReadonlyRequestCookies;
}): Promise<SidePanelComponentData> {
  const category = parseCategoryFromRoute(params.route);
  const subCategory = getParsedSubCategory(params);
  const parsedSearchParams = parseRequest({ params, searchParams, cookies });
  const taxonomiesResults = await getTaxonomies(category, parsedSearchParams);
  const locationParams = {
    ...parsedSearchParams,
    ...parsedSearchParams[REQUIREMENT_PARAM],
    ...taxonomiesResults,
    sortBy: parsedSearchParams[SORT_BY_QUERY_PARAM],
    ...(subCategory === SHELTER_PARAM_YOUTH_VALUE && {
      ageMin: 16,
      ageMax: 24,
    }),
    ...(subCategory === SHELTER_PARAM_SINGLE_VALUE && {
      ageMin: 18,
      ageMax: 99,
    }),
  };

  const { locations, numberOfPages, resultCount } =
    await getFullLocationData(locationParams);

  const yourPeerLegacyLocationData = locations.map((location) =>
    map_gogetta_to_yourpeer(location, false),
  );

  return {
    params,
    parsedSearchParams,
    category,
    subCategory,
    resultCount,
    numberOfPages,
    yourPeerLegacyLocationData,
  };
}
