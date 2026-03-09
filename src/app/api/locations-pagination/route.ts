// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  REQUIREMENT_PARAM,
  RESOURCE_ROUTES,
  SHELTER_PARAM_SINGLE_VALUE,
  SHELTER_PARAM_YOUTH_VALUE,
  SORT_BY_QUERY_PARAM,
  SearchParams,
  SubRouteParams,
  parseCategoryFromRoute,
  parseRequest,
} from "@/components/common";
import {
  getFullLocationData,
  getTaxonomies,
  map_gogetta_to_yourpeer,
} from "@/components/streetlives-api-service";
import {
  parseLocationsBackgroundPageNumber,
  parseLocationsBackgroundPageSize,
} from "@/lib/locations-pagination-request";

function toSearchParamsObject(
  urlSearchParams: URLSearchParams,
  excludedKeys: Set<string>,
): SearchParams {
  const entries = new Map<string, string[]>();

  urlSearchParams.forEach((value, key) => {
    if (excludedKeys.has(key)) {
      return;
    }

    const existing = entries.get(key);
    if (existing) {
      existing.push(value);
      return;
    }

    entries.set(key, [value]);
  });

  return Object.fromEntries(
    Array.from(entries.entries()).map(([key, values]) => [
      key,
      values.length === 1 ? values[0] : values,
    ]),
  );
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const route = requestUrl.searchParams.get("route");

  if (!route || !RESOURCE_ROUTES.includes(route)) {
    return NextResponse.json(
      { error: "Expected a valid route query parameter." },
      { status: 400 },
    );
  }

  const locationSlugOrPersonalCareSubCategory =
    requestUrl.searchParams.get("locationSlugOrPersonalCareSubCategory") ||
    undefined;

  const params: SubRouteParams | { route: string } =
    locationSlugOrPersonalCareSubCategory
      ? {
          route,
          locationSlugOrPersonalCareSubCategory,
        }
      : { route };

  const page = parseLocationsBackgroundPageNumber(
    requestUrl.searchParams.get("pageNumber"),
  );
  if (page === null) {
    return NextResponse.json(
      {
        error: "pageNumber exceeds the supported background pagination range.",
      },
      { status: 400 },
    );
  }
  const pageSize = parseLocationsBackgroundPageSize(
    requestUrl.searchParams.get("pageSize"),
  );

  const searchParams = toSearchParamsObject(
    requestUrl.searchParams,
    new Set([
      "route",
      "locationSlugOrPersonalCareSubCategory",
      "page",
      "pageNumber",
      "pageSize",
    ]),
  );

  const parsedSearchParams = parseRequest({
    params,
    searchParams,
    cookies: await cookies(),
  });
  const category = parseCategoryFromRoute(route);
  const taxonomiesResults = await getTaxonomies(category, parsedSearchParams);

  const locationParams = {
    ...parsedSearchParams,
    ...parsedSearchParams[REQUIREMENT_PARAM],
    ...taxonomiesResults,
    page,
    pageSize,
    sortBy: parsedSearchParams[SORT_BY_QUERY_PARAM],
    ...(locationSlugOrPersonalCareSubCategory === SHELTER_PARAM_YOUTH_VALUE && {
      ageMin: 16,
      ageMax: 24,
    }),
    ...(locationSlugOrPersonalCareSubCategory ===
      SHELTER_PARAM_SINGLE_VALUE && {
      ageMin: 18,
      ageMax: 99,
    }),
  };

  const { locations, resultCount } = await getFullLocationData(locationParams);

  return NextResponse.json({
    pageNumber: page,
    pageSize,
    resultCount,
    locations: locations.map((location) =>
      map_gogetta_to_yourpeer(location, false),
    ),
  });
}
