// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { ReadonlyURLSearchParams, redirect } from "next/navigation";
import {
  AMENITIES_PARAM,
  AMENITIES_PARAM_SUBCATEGORY_AND_CANONICAL_ORDERING,
  AmenitiesSubCategory,
  Category,
  CATEGORY_TO_ROUTE_MAP,
  ClothingValues,
  FoodValues,
  getParsedAmenities,
  getParsedSubCategory,
  LATITUDE_COOKIE_NAME,
  LOCATION_ROUTE,
  LONGITUDE_COOKIE_NAME,
  NEARBY_SORT_BY_VALUE,
  PAGE_PARAM,
  parsePageParam,
  parsePathnameToCategoryAndSubCategory,
  parseRequirementParam,
  PERSONAL_CARE_CATEGORY,
  REQUIREMENT_PARAM,
  REQUIREMENT_PARAM_CANONICAL_ORDERING,
  RequirementValue,
  RouteParams,
  SEARCH_PARAM,
  SearchParams,
  ShelterValues,
  SORT_BY_QUERY_PARAM,
  SubRouteParams,
  UrlParamName,
} from "./common";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

function removeExtraneousSearchParams(
  pathname: string | null,
  currentUrlSearchParams: URLSearchParams,
): void {
  // always delete the current page
  currentUrlSearchParams.delete(PAGE_PARAM);
  if (!pathname) {
    currentUrlSearchParams.delete(PERSONAL_CARE_CATEGORY);
  } else {
    const params = parsePathnameToSubRouteParams(pathname);
    if (params.route !== PERSONAL_CARE_CATEGORY) {
      currentUrlSearchParams.delete(PERSONAL_CARE_CATEGORY);
    }
  }
  // when search is set, SORT_BY_QUERY_PARAM  should get unset
  if (currentUrlSearchParams.has(SEARCH_PARAM)) {
    currentUrlSearchParams.delete(SORT_BY_QUERY_PARAM);
  }
}

// Change category
export function getUrlWithNewCategory(
  newCategory: Category,
  searchParams:
    | ReadonlyURLSearchParams
    | SearchParams
    | Map<string, string>
    | undefined
    | null,
): string {
  const searchParamsList: string[][] = getSearchParamsList(searchParams);
  const currentUrlSearchParams = new URLSearchParams(searchParamsList);

  // always delete the current page
  removeExtraneousSearchParams(newCategory, currentUrlSearchParams);
  const newSearchParamsStr = currentUrlSearchParams.toString();
  const query = newSearchParamsStr ? `?${newSearchParamsStr}` : "";
  return `/${newCategory ? CATEGORY_TO_ROUTE_MAP[newCategory] : LOCATION_ROUTE}${query}`;
}

function getSearchParamsList(
  searchParams:
    | ReadonlyURLSearchParams
    | SearchParams
    | Map<string, string>
    | undefined
    | null,
): string[][] {
  return !searchParams
    ? []
    : searchParams instanceof ReadonlyURLSearchParams ||
        searchParams instanceof Map
      ? Array.from(searchParams.entries())
      : (Object.entries(searchParams)
          .filter(([k, v]) => v !== undefined)
          .flatMap(([k, v]) =>
            Array.isArray(v) ? v.map((w) => [k, w]) : [[k, v]],
          ) as string[][]);
}

// Add filter parameter
export function getUrlWithNewFilterParameter(
  pathname: string | null,
  searchParams:
    | ReadonlyURLSearchParams
    | SearchParams
    | Map<string, string>
    | undefined
    | null,
  urlParamName: UrlParamName,
  urlParamValue: string = "yes",
): string {
  if (!pathname) {
    throw new Error("Expected pathname to not be null");
  }
  const searchParamsList: string[][] = getSearchParamsList(searchParams);

  const currentUrlSearchParams = new URLSearchParams(searchParamsList);

  currentUrlSearchParams.set(urlParamName, urlParamValue);

  // always delete the current page
  // FIXME: should we just call removeExtraneousSearchParams instead of duplicating the logic here?
  currentUrlSearchParams.delete(PAGE_PARAM);
  if (currentUrlSearchParams.has(SEARCH_PARAM)) {
    currentUrlSearchParams.delete(SORT_BY_QUERY_PARAM);
  }

  const newSearchParamsStr = currentUrlSearchParams.toString();

  const query = newSearchParamsStr ? `?${newSearchParamsStr}` : "";
  return `${pathname}${query}`;
}

export function getUrlWithoutFilterParameter(
  pathname: string | null,
  searchParams:
    | ReadonlyURLSearchParams
    | SearchParams
    | Map<string, string>
    | null
    | undefined,
  urlParamName: UrlParamName,
): string {
  if (!pathname) {
    throw new Error("Expected pathname to not be null");
  }
  const searchParamsList: string[][] = getSearchParamsList(searchParams);

  const currentUrlSearchParams = new URLSearchParams(searchParamsList);

  currentUrlSearchParams.delete(urlParamName);

  removeExtraneousSearchParams(pathname, currentUrlSearchParams);

  const newSearchParamsStr = currentUrlSearchParams.toString();

  const query = newSearchParamsStr ? `?${newSearchParamsStr}` : "";
  return `${pathname}${query}`;
}

// Clear all filter parameters
export function getUrlWithoutFilterParameters(): string {
  return `/${LOCATION_ROUTE}`;
}

export function getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
  pathname: string | null,
  searchParams:
    | ReadonlyURLSearchParams
    | SearchParams
    | Map<string, string>
    | undefined
    | null,
  newRequirementTypeToAddOrRemove: RequirementValue,
  addRequirementType: boolean,
): string {
  if (!pathname) {
    throw new Error("Expected pathname to not be null");
  }
  const searchParamsList: string[][] = getSearchParamsList(searchParams);

  const currentUrlSearchParams = new URLSearchParams(searchParamsList);

  const currentRequirementValue = currentUrlSearchParams.get(REQUIREMENT_PARAM);

  const parsedRequirements: RequirementValue[] = parseRequirementParam(
    currentRequirementValue,
  );

  const newParsedRequirements = addRequirementType
    ? !parsedRequirements.includes(newRequirementTypeToAddOrRemove)
      ? parsedRequirements
          .concat(newRequirementTypeToAddOrRemove)
          .sort(
            (a, b) =>
              REQUIREMENT_PARAM_CANONICAL_ORDERING.indexOf(a) -
              REQUIREMENT_PARAM_CANONICAL_ORDERING.indexOf(b),
          )
      : parsedRequirements
    : parsedRequirements.filter(
        (requirement) => requirement !== newRequirementTypeToAddOrRemove,
      );

  if (newParsedRequirements.length) {
    const serializedNewParsedRequirements = newParsedRequirements.join(" ");

    currentUrlSearchParams.set(
      REQUIREMENT_PARAM,
      serializedNewParsedRequirements,
    );
  } else {
    currentUrlSearchParams.delete(REQUIREMENT_PARAM);
  }

  removeExtraneousSearchParams(pathname, currentUrlSearchParams);
  const newSearchParamsStr = currentUrlSearchParams.toString();

  const query = newSearchParamsStr ? `?${newSearchParamsStr}` : "";
  return `${pathname}${query}`;
}

export function getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved(
  pathname: string | null,
  searchParams:
    | ReadonlyURLSearchParams
    | SearchParams
    | Map<string, string>
    | undefined
    | null,
  newAmenityToAddOrRemove: AmenitiesSubCategory,
  addAmenity: boolean,
): string {
  if (!pathname) {
    throw new Error("Expected pathname to not be null");
  }
  const searchParamsList: string[][] = getSearchParamsList(searchParams);

  const currentUrlSearchParams = new URLSearchParams(searchParamsList);

  const currentAmenitiesSubCategoryFromQueryParam =
    currentUrlSearchParams.get(AMENITIES_PARAM);

  const [category, amenitiesSubCategory] =
    parsePathnameToCategoryAndSubCategory(pathname);

  const parsedAmenitiesFromQueryParam = getParsedAmenities(
    null,
    amenitiesSubCategory,
    currentAmenitiesSubCategoryFromQueryParam,
  );

  const newParsedAmenities = addAmenity
    ? !parsedAmenitiesFromQueryParam.includes(newAmenityToAddOrRemove)
      ? parsedAmenitiesFromQueryParam.concat(newAmenityToAddOrRemove)
      : parsedAmenitiesFromQueryParam
    : parsedAmenitiesFromQueryParam.filter(
        (amenity) => amenity !== newAmenityToAddOrRemove,
      );

  // mutate the query params, and get the new path
  let newPath;
  if (newParsedAmenities.length) {
    // special serialization logic:
    // 1. sort the parsed amenities by the canonical ordering
    // 2. the first element becomes the path component
    // 3. the remaining elements go into the query params
    const [amenitySubCategory, ...newAmenitiesQueryParams] =
      newParsedAmenities.sort(
        (a, b) =>
          AMENITIES_PARAM_SUBCATEGORY_AND_CANONICAL_ORDERING.indexOf(a) -
          AMENITIES_PARAM_SUBCATEGORY_AND_CANONICAL_ORDERING.indexOf(b),
      );
    newPath = `/${PERSONAL_CARE_CATEGORY}/${amenitySubCategory}`;

    if (newAmenitiesQueryParams.length) {
      const serializedNewParsedAmenitiesQueryParam =
        newAmenitiesQueryParams.join(" ");
      currentUrlSearchParams.set(
        AMENITIES_PARAM,
        serializedNewParsedAmenitiesQueryParam,
      );
    } else {
      currentUrlSearchParams.delete(AMENITIES_PARAM);
    }
  } else {
    // no more amenities parameter
    // just back to the personal care category.
    currentUrlSearchParams.delete(AMENITIES_PARAM);
    newPath = `/${PERSONAL_CARE_CATEGORY}`;
  }

  // always delete the current page
  currentUrlSearchParams.delete(PAGE_PARAM);

  const newSearchParamsStr = currentUrlSearchParams.toString();

  const query = newSearchParamsStr ? `?${newSearchParamsStr}` : "";
  return `${newPath}${query}`;
}

export function getUrlWithSubCategoryAddedOrRemoved(
  pathname: string | null,
  searchParams:
    | ReadonlyURLSearchParams
    | SearchParams
    | Map<string, string>
    | undefined
    | null,
  newSubCategoryToAddOrRemove:
    | FoodValues
    | ClothingValues
    | ShelterValues
    | null,
): string {
  if (!pathname) {
    throw new Error("Expected pathname to not be null");
  }
  const searchParamsList: string[][] = getSearchParamsList(searchParams);

  const currentUrlSearchParams = new URLSearchParams(searchParamsList);

  const [category, subCategory] =
    parsePathnameToCategoryAndSubCategory(pathname);

  let newSubCategory = getParsedSubCategory({
    route: category as string,
    locationSlugOrPersonalCareSubCategory:
      newSubCategoryToAddOrRemove as string,
  });

  const newPath = `/${category}${newSubCategory ? `/${newSubCategory}` : ""}`;

  // always delete the current page
  currentUrlSearchParams.delete(PAGE_PARAM);

  const newSearchParamsStr = currentUrlSearchParams.toString();

  const query = newSearchParamsStr ? `?${newSearchParamsStr}` : "";
  return `${newPath}${query}`;
}

export function getUrlToNextOrPreviousPage(
  pathname: string | null,
  searchParams:
    | ReadonlyURLSearchParams
    | SearchParams
    | Map<string, string>
    | undefined
    | null,
  nextPage: boolean,
) {
  if (!pathname) {
    throw new Error("Expected pathname to not be null");
  }
  const searchParamsList: string[][] = getSearchParamsList(searchParams);

  const currentUrlSearchParams = new URLSearchParams(searchParamsList);

  const currentPageValueStr = currentUrlSearchParams.get(PAGE_PARAM);
  const currentPageValue = parsePageParam(currentPageValueStr);

  let newPageValue;
  if (nextPage) {
    newPageValue = currentPageValue + 1;
  } else {
    if (currentPageValue > 0) {
      newPageValue = currentPageValue - 1;
    } else {
      throw new Error("Cannot get previous page when current page is 0");
    }
  }

  if (newPageValue > 0) {
    currentUrlSearchParams.set(PAGE_PARAM, (newPageValue + 1).toString());
  } else {
    currentUrlSearchParams.delete(PAGE_PARAM);
  }

  const newSearchParamsStr = currentUrlSearchParams.toString();

  const query = newSearchParamsStr ? `?${newSearchParamsStr}` : "";
  return `${pathname}${query}`;
}

export function parsePathnameToSubRouteParams(
  pathname: string,
): SubRouteParams {
  const [ignore, route, locationSlugOrPersonalCareSubCategory] =
    pathname.split("/");
  return {
    route,
    locationSlugOrPersonalCareSubCategory,
  };
}

export function isOnLocationDetailPage(params: SubRouteParams): boolean {
  return (
    params.route === LOCATION_ROUTE &&
    params.locationSlugOrPersonalCareSubCategory !== undefined
  );
}

export function paramsToPathname(params: RouteParams): string {
  return `/${params.route}${params.locationSlugOrPersonalCareSubCategory ? `/${params.locationSlugOrPersonalCareSubCategory}` : ""}`;
}

export function redirectIfNearbyAndIfLatitudeAndLongitudeIsNotSet({
  searchParams,
  params,
  cookies,
}: {
  searchParams: SearchParams;
  params: RouteParams | SubRouteParams;
  cookies: ReadonlyRequestCookies;
}) {
  if (
    searchParams[SORT_BY_QUERY_PARAM] === NEARBY_SORT_BY_VALUE &&
    !(cookies.get(LATITUDE_COOKIE_NAME) && cookies.get(LONGITUDE_COOKIE_NAME))
  ) {
    return redirect(
      `/${params.route}${params.locationSlugOrPersonalCareSubCategory ? `/${params.locationSlugOrPersonalCareSubCategory}` : ""}`,
    );
  }
}
