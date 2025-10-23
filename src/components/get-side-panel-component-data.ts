import { Cookies } from "next-client-cookies";
import {
  Category,
  REQUIREMENT_PARAM,
  RouteParams,
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
  cookies: Cookies;
}): Promise<SidePanelComponentData> {
  console.log({ params });
  console.log(searchParams);
  const category = parseCategoryFromRoute(params.route);
  const subCategory = getParsedSubCategory(params);
  const parsedSearchParams = parseRequest({ params, searchParams, cookies });
  console.log(parsedSearchParams);
  const taxonomiesResults = await getTaxonomies(category, parsedSearchParams);
  console.log("taxonomyresults", taxonomiesResults);
  const { locations, numberOfPages, resultCount } =
    await await getFullLocationData({
      ...parsedSearchParams,
      ...parsedSearchParams[REQUIREMENT_PARAM],
      ...taxonomiesResults,
      sortBy: parsedSearchParams[SORT_BY_QUERY_PARAM],
    });

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
