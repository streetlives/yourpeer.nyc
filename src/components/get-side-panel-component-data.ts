import {
  Category,
  REQUIREMENT_PARAM,
  RouteParams,
  SearchParams,
  SubRouteParams,
  YourPeerLegacyLocationData,
  YourPeerParsedRequestParams,
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
  resultCount: number;
  numberOfPages: number;
  yourPeerLegacyLocationData: YourPeerLegacyLocationData[];
}

export async function getSidePanelComponentData({
  searchParams,
  params,
}: {
  searchParams: SearchParams;
  params: RouteParams;
}): Promise<SidePanelComponentData> {
  const category = parseCategoryFromRoute(params.route);
  // FIXME: the string composition in the next line is a bit ugly. I should clean up the type used in this interface
  const parsedSearchParams = parseRequest({ params, searchParams });
  const taxonomiesResults = await getTaxonomies(category, parsedSearchParams);
  const { locations, numberOfPages, resultCount } =
    await await getFullLocationData({
      ...parsedSearchParams,
      ...parsedSearchParams[REQUIREMENT_PARAM],
      ...taxonomiesResults,
    });
  const yourPeerLegacyLocationData = locations.map((location) =>
    map_gogetta_to_yourpeer(location, false),
  );
  return {
    params,
    parsedSearchParams,
    category,
    resultCount,
    numberOfPages,
    yourPeerLegacyLocationData,
  };
}