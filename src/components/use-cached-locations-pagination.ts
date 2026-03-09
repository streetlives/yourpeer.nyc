"use client";

// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  PAGE_PARAM,
  SearchParams,
  YourPeerLegacyLocationData,
  parsePageParam,
} from "./common";

const DISPLAY_PAGE_SIZE = 20;
const BACKGROUND_PAGE_SIZE = 200;
const DISPLAY_PAGES_PER_BACKGROUND_PAGE =
  BACKGROUND_PAGE_SIZE / DISPLAY_PAGE_SIZE;
const MAX_PARALLEL_BACKGROUND_REQUESTS = 3;

interface CachedLocationsDataset {
  pages: Record<number, YourPeerLegacyLocationData[]>;
  loadedBackgroundPages: number[];
  loadingBackgroundPages: number[];
  resultCount: number;
  numberOfPages: number;
}

interface BackgroundLocationsResponse {
  locations: YourPeerLegacyLocationData[];
  pageNumber: number;
  pageSize: number;
  resultCount: number;
  numberOfPages: number;
}

interface UseCachedLocationsPaginationArgs {
  route: string;
  locationSlugOrPersonalCareSubCategory?: string;
  searchParams: SearchParams;
  initialPage: number;
  initialPageLocations: YourPeerLegacyLocationData[];
  resultCount: number;
  numberOfPages: number;
}

function getSearchParamEntries(searchParams: SearchParams): string[][] {
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

function splitLocationsIntoDisplayPages(
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

function mergeBackgroundPage(
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
    numberOfPages: response.numberOfPages,
  };
}

async function fetchBackgroundPage({
  route,
  locationSlugOrPersonalCareSubCategory,
  serializedSearchParams,
  pageNumber,
}: {
  route: string;
  locationSlugOrPersonalCareSubCategory?: string;
  serializedSearchParams: string;
  pageNumber: number;
}): Promise<BackgroundLocationsResponse> {
  const params = new URLSearchParams(serializedSearchParams);
  params.set("route", route);
  params.set("pageNumber", pageNumber.toString());
  params.set("pageSize", BACKGROUND_PAGE_SIZE.toString());

  if (locationSlugOrPersonalCareSubCategory) {
    params.set(
      "locationSlugOrPersonalCareSubCategory",
      locationSlugOrPersonalCareSubCategory,
    );
  }

  const response = await fetch(
    `/api/locations-pagination?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch cached locations page ${pageNumber}: ${response.status}`,
    );
  }

  return response.json();
}

export function useCachedLocationsPagination({
  route,
  locationSlugOrPersonalCareSubCategory,
  searchParams,
  initialPage,
  initialPageLocations,
  resultCount,
  numberOfPages,
}: UseCachedLocationsPaginationArgs) {
  const liveSearchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [lastResolvedPage, setLastResolvedPage] = useState(initialPage);

  const serializedSearchParams = useMemo(
    () => new URLSearchParams(getSearchParamEntries(searchParams)).toString(),
    [searchParams],
  );

  const queryKey = useMemo(
    () => [
      "cached-locations-pagination",
      route,
      locationSlugOrPersonalCareSubCategory || "",
      serializedSearchParams,
    ],
    [route, locationSlugOrPersonalCareSubCategory, serializedSearchParams],
  );

  const initialDataset = useMemo<CachedLocationsDataset>(
    () => ({
      pages: {
        [initialPage]: initialPageLocations,
      },
      loadedBackgroundPages: [],
      loadingBackgroundPages: [],
      resultCount,
      numberOfPages,
    }),
    [initialPage, initialPageLocations, numberOfPages, resultCount],
  );

  const { data: cachedDataset } = useQuery({
    queryKey,
    queryFn: async () => initialDataset,
    initialData: initialDataset,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    setLastResolvedPage(initialPage);
  }, [initialPage, queryKey]);

  useEffect(() => {
    queryClient.setQueryData<CachedLocationsDataset>(queryKey, (previous) => {
      const dataset = previous || initialDataset;
      return {
        ...dataset,
        pages: {
          ...dataset.pages,
          [initialPage]: initialPageLocations,
        },
        resultCount,
        numberOfPages,
      };
    });
  }, [
    initialDataset,
    initialPage,
    initialPageLocations,
    numberOfPages,
    queryClient,
    queryKey,
    resultCount,
  ]);

  const ensureBackgroundPage = useCallback(
    async (pageNumber: number) => {
      let shouldFetch = false;

      queryClient.setQueryData<CachedLocationsDataset>(queryKey, (previous) => {
        const dataset = previous || initialDataset;
        if (
          dataset.loadedBackgroundPages.includes(pageNumber) ||
          dataset.loadingBackgroundPages.includes(pageNumber)
        ) {
          return dataset;
        }

        shouldFetch = true;
        return {
          ...dataset,
          loadingBackgroundPages:
            dataset.loadingBackgroundPages.concat(pageNumber),
        };
      });

      if (!shouldFetch) {
        return;
      }

      try {
        const response = await fetchBackgroundPage({
          route,
          locationSlugOrPersonalCareSubCategory,
          serializedSearchParams,
          pageNumber,
        });

        queryClient.setQueryData<CachedLocationsDataset>(queryKey, (previous) =>
          mergeBackgroundPage(previous || initialDataset, response),
        );
      } catch (error) {
        queryClient.setQueryData<CachedLocationsDataset>(
          queryKey,
          (previous) => {
            const dataset = previous || initialDataset;
            return {
              ...dataset,
              loadingBackgroundPages: dataset.loadingBackgroundPages.filter(
                (loadingPageNumber) => loadingPageNumber !== pageNumber,
              ),
            };
          },
        );
        console.error(error);
      }
    },
    [
      initialDataset,
      locationSlugOrPersonalCareSubCategory,
      queryClient,
      queryKey,
      route,
      serializedSearchParams,
    ],
  );

  const currentPage = parsePageParam(liveSearchParams?.get(PAGE_PARAM));
  const currentPageLocations = cachedDataset.pages[currentPage];

  useEffect(() => {
    if (currentPageLocations) {
      setLastResolvedPage(currentPage);
      return;
    }

    const backgroundPageNumber = Math.floor(
      currentPage / DISPLAY_PAGES_PER_BACKGROUND_PAGE,
    );
    void ensureBackgroundPage(backgroundPageNumber);
  }, [currentPage, currentPageLocations, ensureBackgroundPage]);

  useEffect(() => {
    if (numberOfPages <= 0) {
      return;
    }

    const totalBackgroundPages = Math.ceil(
      (numberOfPages + 1) / DISPLAY_PAGES_PER_BACKGROUND_PAGE,
    );
    const missingBackgroundPages = Array.from(
      { length: totalBackgroundPages },
      (_, pageNumber) => pageNumber,
    ).filter(
      (pageNumber) =>
        !cachedDataset.loadedBackgroundPages.includes(pageNumber) &&
        !cachedDataset.loadingBackgroundPages.includes(pageNumber),
    );

    if (!missingBackgroundPages.length) {
      return;
    }

    let cancelled = false;

    async function fillCacheInBackground() {
      for (
        let offset = 0;
        offset < missingBackgroundPages.length;
        offset += MAX_PARALLEL_BACKGROUND_REQUESTS
      ) {
        if (cancelled) {
          return;
        }

        const batch = missingBackgroundPages.slice(
          offset,
          offset + MAX_PARALLEL_BACKGROUND_REQUESTS,
        );
        await Promise.all(
          batch.map((pageNumber) => ensureBackgroundPage(pageNumber)),
        );
      }
    }

    void fillCacheInBackground();

    return () => {
      cancelled = true;
    };
  }, [
    cachedDataset.loadedBackgroundPages,
    cachedDataset.loadingBackgroundPages,
    ensureBackgroundPage,
    numberOfPages,
  ]);

  const visibleLocations =
    currentPageLocations || cachedDataset.pages[lastResolvedPage] || [];
  const isPageLoading = !currentPageLocations;

  const navigateToPage = useCallback(
    (pageNumber: number) => {
      const nextSearchParams = new URLSearchParams(
        liveSearchParams ? Array.from(liveSearchParams.entries()) : [],
      );

      if (pageNumber > 0) {
        nextSearchParams.set(PAGE_PARAM, (pageNumber + 1).toString());
      } else {
        nextSearchParams.delete(PAGE_PARAM);
      }

      const nextUrl = `${window.location.pathname}${
        nextSearchParams.toString() ? `?${nextSearchParams.toString()}` : ""
      }`;
      window.history.pushState(null, "", nextUrl);

      const locationsContainer = document.getElementById("locations_container");
      if (locationsContainer) {
        locationsContainer.scrollTop = 0;
      }
    },
    [liveSearchParams],
  );

  return {
    currentPage,
    isPageLoading,
    navigateToPage,
    numberOfPages: cachedDataset.numberOfPages,
    resultCount: cachedDataset.resultCount,
    visibleLocations,
  };
}
