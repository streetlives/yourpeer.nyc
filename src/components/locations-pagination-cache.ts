// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { PAGE_PARAM, SearchParams, YourPeerLegacyLocationData } from "./common";

export const DISPLAY_PAGE_SIZE = 20;
export const BACKGROUND_PAGE_SIZE = 200;
export const DISPLAY_PAGES_PER_BACKGROUND_PAGE =
  BACKGROUND_PAGE_SIZE / DISPLAY_PAGE_SIZE;
export const MAX_PARALLEL_BACKGROUND_REQUESTS = 3;

export interface CachedLocationsDataset {
  pages: Record<number, YourPeerLegacyLocationData[]>;
  loadedBackgroundPages: number[];
  loadingBackgroundPages: number[];
  resultCount: number;
  numberOfPages: number;
}

export interface BackgroundLocationsResponse {
  locations: YourPeerLegacyLocationData[];
  pageNumber: number;
  pageSize: number;
  resultCount: number;
}

export function getSearchParamEntries(searchParams: SearchParams): string[][] {
  return Object.entries(searchParams)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .flatMap(([key, value]): string[][] => {
      if (key === PAGE_PARAM || value === undefined) {
        return [];
      }

      if (Array.isArray(value)) {
        return value
          .slice()
          .sort((left, right) => left.localeCompare(right))
          .map((item) => [key, item]);
      }

      return [[key, value]];
    });
}

export function getDisplayNumberOfPages(resultCount: number): number {
  if (!Number.isFinite(resultCount) || resultCount <= 0) {
    return 0;
  }

  return Math.max(0, Math.ceil(resultCount / DISPLAY_PAGE_SIZE) - 1);
}

export function splitLocationsIntoDisplayPages(
  backgroundPageNumber: number,
  locations: YourPeerLegacyLocationData[],
): Record<number, YourPeerLegacyLocationData[]> {
  const nextPages: Record<number, YourPeerLegacyLocationData[]> = {};
  const startingDisplayPage =
    backgroundPageNumber * DISPLAY_PAGES_PER_BACKGROUND_PAGE;

  for (let offset = 0; offset < locations.length; offset += DISPLAY_PAGE_SIZE) {
    const displayPageNumber = startingDisplayPage + offset / DISPLAY_PAGE_SIZE;
    nextPages[displayPageNumber] = locations.slice(
      offset,
      offset + DISPLAY_PAGE_SIZE,
    );
  }

  return nextPages;
}

export function mergeBackgroundPage(
  currentDataset: CachedLocationsDataset,
  response: BackgroundLocationsResponse,
): CachedLocationsDataset {
  return {
    pages: {
      ...currentDataset.pages,
      ...splitLocationsIntoDisplayPages(
        response.pageNumber,
        response.locations,
      ),
    },
    loadedBackgroundPages: Array.from(
      new Set(currentDataset.loadedBackgroundPages.concat(response.pageNumber)),
    ).sort((left, right) => left - right),
    loadingBackgroundPages: currentDataset.loadingBackgroundPages.filter(
      (pageNumber) => pageNumber !== response.pageNumber,
    ),
    resultCount: response.resultCount,
    numberOfPages: getDisplayNumberOfPages(response.resultCount),
  };
}

export function getTotalBackgroundPages(numberOfPages: number): number {
  return Math.ceil((numberOfPages + 1) / DISPLAY_PAGES_PER_BACKGROUND_PAGE);
}

export function getVisibleLocationsForPage({
  pages,
  currentPage,
  lastResolvedPage,
}: {
  pages: Record<number, YourPeerLegacyLocationData[]>;
  currentPage: number;
  lastResolvedPage: number;
}): YourPeerLegacyLocationData[] {
  return pages[currentPage] || pages[lastResolvedPage] || [];
}

export function getPaginationUrl({
  pathname,
  searchParams,
  pageNumber,
}: {
  pathname: string;
  searchParams: Iterable<[string, string]>;
  pageNumber: number;
}): string {
  const nextSearchParams = new URLSearchParams(Array.from(searchParams));

  if (pageNumber > 0) {
    nextSearchParams.set(PAGE_PARAM, (pageNumber + 1).toString());
  } else {
    nextSearchParams.delete(PAGE_PARAM);
  }

  return `${pathname}${
    nextSearchParams.toString() ? `?${nextSearchParams.toString()}` : ""
  }`;
}

export function applyPaginationNavigation({
  pathname,
  searchParams,
  pageNumber,
  pushState,
  locationsContainer,
}: {
  pathname: string;
  searchParams: Iterable<[string, string]>;
  pageNumber: number;
  pushState: (url: string) => void;
  locationsContainer?: { scrollTop: number } | null;
}): string {
  const nextUrl = getPaginationUrl({
    pathname,
    searchParams,
    pageNumber,
  });

  pushState(nextUrl);

  if (locationsContainer) {
    locationsContainer.scrollTop = 0;
  }

  return nextUrl;
}
