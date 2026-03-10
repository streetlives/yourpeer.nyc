"use client";

// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchParams, YourPeerLegacyLocationData } from "./common";
import {
  BACKGROUND_PAGE_SIZE,
  CachedLocationsDataset,
  BackgroundLocationsResponse,
  MAX_SUPPORTED_BACKGROUND_PAGE_COUNT,
  MAX_PARALLEL_BACKGROUND_REQUESTS,
  applyPaginationNavigation,
  canServeDisplayPageLocally,
  getBackgroundPageNumberForDisplayPage,
  getPaginationPageFromSearch,
  getPaginationUrl,
  getSearchParamEntries,
  getSupportedBackgroundPageCount,
  getVisibleLocationsForPage,
  mergeBackgroundPage,
} from "./locations-pagination-cache";

interface UseCachedLocationsPaginationArgs {
  route: string;
  locationSlugOrPersonalCareSubCategory?: string;
  searchParams: SearchParams;
  initialPage: number;
  initialPageLocations: YourPeerLegacyLocationData[];
  resultCount: number;
  numberOfPages: number;
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
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(initialPage);
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
    setCurrentPage(initialPage);
    setLastResolvedPage(initialPage);
  }, [initialPage, queryKey]);

  useEffect(() => {
    function handlePopState() {
      setCurrentPage(getPaginationPageFromSearch(window.location.search));
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

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
      if (pageNumber < 0 || pageNumber >= MAX_SUPPORTED_BACKGROUND_PAGE_COUNT) {
        return;
      }

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

  const currentPageLocations = cachedDataset.pages[currentPage];

  useEffect(() => {
    if (currentPageLocations) {
      setLastResolvedPage(currentPage);
      return;
    }

    const backgroundPageNumber =
      getBackgroundPageNumberForDisplayPage(currentPage);
    if (backgroundPageNumber === null) {
      return;
    }

    void ensureBackgroundPage(backgroundPageNumber);
  }, [currentPage, currentPageLocations, ensureBackgroundPage]);

  useEffect(() => {
    if (cachedDataset.numberOfPages <= 0) {
      return;
    }

    const totalBackgroundPages = getSupportedBackgroundPageCount(
      cachedDataset.numberOfPages,
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
    cachedDataset.numberOfPages,
    ensureBackgroundPage,
  ]);

  const visibleLocations = getVisibleLocationsForPage({
    pages: cachedDataset.pages,
    currentPage,
    lastResolvedPage,
  });
  const isPageLoading = !currentPageLocations;

  const navigateToPage = useCallback(
    (pageNumber: number) => {
      const currentSearchParams = new URLSearchParams(window.location.search);

      if (!canServeDisplayPageLocally(cachedDataset.pages, pageNumber)) {
        window.location.assign(
          getPaginationUrl({
            pathname: window.location.pathname,
            searchParams: currentSearchParams.entries(),
            pageNumber,
          }),
        );
        return;
      }

      applyPaginationNavigation({
        pathname: window.location.pathname,
        searchParams: currentSearchParams.entries(),
        pageNumber,
        pushState: (nextUrl) => {
          window.history.pushState(null, "", nextUrl);
        },
        locationsContainer: document.getElementById("locations_container"),
      });
      setCurrentPage(pageNumber);
    },
    [cachedDataset.pages],
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
