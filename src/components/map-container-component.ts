// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import {
  AI_SEARCH_PARAM,
  REQUIREMENT_PARAM,
  RouteParams,
  SHELTER_PARAM,
  SHELTER_PARAM_YOUTH_VALUE,
  SearchParams,
  SimplifiedLocationData,
  parseCategoryFromRoute,
  parseRequest,
} from "./common";
import {
  getSimplifiedLocationData,
  getTaxonomies,
} from "./streetlives-api-service";

export async function getMapContainerData({
  searchParams,
  params,
}: {
  searchParams: SearchParams;
  params: RouteParams;
}): Promise<SimplifiedLocationData[]> {
  const category = parseCategoryFromRoute(params.route);
  const parsedSearchParams = parseRequest({ params, searchParams });
  const taxonomiesResults = await getTaxonomies(category, parsedSearchParams);
  const locationStubs = await getSimplifiedLocationData({
    ...parsedSearchParams,
    ...parsedSearchParams[REQUIREMENT_PARAM],
    ...taxonomiesResults,
    aiSearch: parsedSearchParams[AI_SEARCH_PARAM],
    ageMin:
      parsedSearchParams[SHELTER_PARAM] === SHELTER_PARAM_YOUTH_VALUE
        ? 16
        : undefined,
    ageMax:
      parsedSearchParams[SHELTER_PARAM] === SHELTER_PARAM_YOUTH_VALUE
        ? 24
        : undefined,
  });
  return locationStubs;
}
