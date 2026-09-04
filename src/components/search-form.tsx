// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import { useFilters, useViewStore } from "@/lib/store";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { TranslatableText } from "@/components/translatable-text";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  AI_SEARCH_PARAM,
  LOCATION_ROUTE,
  SEARCH_PARAM,
  SearchParams,
} from "./common";
import { isAiSearchEnabled } from "./feature-flags";
import { PreviousParams } from "./get-previous-params";
import {
  getUrlWithNewFilterParameter,
  isOnLocationDetailPage,
  paramsToPathname,
  parsePathnameToSubRouteParams,
} from "./navigation";
import { usePreviousParamsOnClient } from "./use-previous-params-client";

// Carry the AI flag on the URL only while it is on, so that URLs stay free of
// aiSearch=false noise when the feature is disabled. Deleting (rather than
// omitting) matters because the param may already be present on the URL we are
// building from.
function setAiSearchParam(url: URL, aiEnabled: boolean) {
  if (aiEnabled) {
    url.searchParams.set(AI_SEARCH_PARAM, "true");
  } else {
    url.searchParams.delete(AI_SEARCH_PARAM);
  }
}

function SearchPanel({
  currentSearch,
  paramsToUseForNextUrl,
  aiSearchEnabled,
}: {
  currentSearch: string;
  paramsToUseForNextUrl: PreviousParams;
  aiSearchEnabled: boolean;
}) {
  const { setShowMapViewOnMobile } = useViewStore();
  const setLoading = useFilters((state) => state.setLoading);
  const router = useRouter();

  function handleSearchPanelClick() {
    if (currentSearch) {
      if (shouldStartLoading(currentSearch, paramsToUseForNextUrl)) {
        setLoading(true);
      }
      setShowMapViewOnMobile(false);
      const baseUrl = getUrlWithNewFilterParameter(
        paramsToPathname(paramsToUseForNextUrl.params),
        paramsToUseForNextUrl.searchParams,
        SEARCH_PARAM,
        currentSearch,
      );
      const url = new URL(baseUrl, "http://localhost");
      setAiSearchParam(url, aiSearchEnabled);
      router.push(url.pathname + (url.search ? url.search : ""));
    }
  }

  return (
    <div
      className="bg-white fixed md:absolute bottom-0 md:bottom-auto w-full top-[104.6px] md:top-full inset-x-0 rounded border md:border-gray-300"
      id="search_panel"
    >
      <div>
        <div
          className="flex items-center px-5 py-4 hover:bg-gray-200 transition"
          onClick={handleSearchPanelClick}
          id="search_panel_link"
        >
          <img
            src="/img/icons/search-icon.png"
            className="flex-shrink-0 w-6 h-6 max-h-6 object-contain"
            alt=""
          />
          <div className="flex-1 text-dark">
            <span>Search for</span>{" "}
            <span id="search_for" translate="no">
              {currentSearch}
            </span>
          </div>
          <span className="text-dark">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M3.75 12a.75.75 0 01.75-.75h13.19l-5.47-5.47a.75.75 0 011.06-1.06l6.75 6.75a.75.75 0 010 1.06l-6.75 6.75a.75.75 0 11-1.06-1.06l5.47-5.47H4.5a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex items-center justify-center flex-col p-5 sm:p-7">
          <img
            src="/img/icons/search-icon.png"
            className="w-9 h-9 max-h-9 object-contain"
            alt=""
          />
          <p className="mt-5 text-base text-dark text-center ">
            <span>Search for keywords&nbsp;</span>
            <br />
            <span>&nbsp;in our service listings</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function convertReadonlyURLSearchParamsToSearchParams(
  readonlyURLSearchParams: ReadonlyURLSearchParams,
): SearchParams {
  return Object.fromEntries(Array.from(readonlyURLSearchParams.entries()));
}

function getSearchParamValue(previousParams: PreviousParams): string {
  const searchParamValue = previousParams.searchParams?.[SEARCH_PARAM];

  if (Array.isArray(searchParamValue)) {
    return searchParamValue[0] ?? "";
  }

  return searchParamValue ?? "";
}

function shouldStartLoading(
  nextSearchValue: string,
  paramsToUseForNextUrl: PreviousParams,
): boolean {
  return getSearchParamValue(paramsToUseForNextUrl) !== nextSearchValue;
}

export default function SearchForm() {
  const { setShowMapViewOnMobile } = useViewStore();
  const [search, setSearch] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams() as ReadonlyURLSearchParams;
  const searchParamFromQuery = searchParams && searchParams.get(SEARCH_PARAM);
  const [inputHasFocus, setInputHasFocus] = useState(false);
  const router = useRouter();
  const pathname = usePathname() as string;
  const previousParams = usePreviousParamsOnClient();
  const setLoading = useFilters((state) => state.setLoading);
  const searchParamFromCookie = previousParams?.searchParams[
    SEARCH_PARAM
  ] as string;
  const currentParams = parsePathnameToSubRouteParams(pathname);
  const defaultPreviousParams: PreviousParams = {
    searchParams: {},
    params: {
      route: LOCATION_ROUTE,
    },
  };

  const isCurrentlyOnLocationDetailPage = isOnLocationDetailPage(currentParams);
  const paramsToUseForNextUrl: PreviousParams = isCurrentlyOnLocationDetailPage
    ? previousParams || defaultPreviousParams
    : {
        params: currentParams,
        searchParams:
          convertReadonlyURLSearchParamsToSearchParams(searchParams),
      };

  const aiSearchFromQuery = searchParams && searchParams.get(AI_SEARCH_PARAM);
  const aiSearchFromCookie = previousParams?.searchParams[AI_SEARCH_PARAM] as
    | string
    | undefined;

  const aiSearchAvailable = isAiSearchEnabled();

  const [aiSearchEnabled, setAiSearchEnabled] = useState(
    aiSearchAvailable &&
      (isCurrentlyOnLocationDetailPage
        ? aiSearchFromCookie === "true"
        : aiSearchFromQuery === "true"),
  );

  useEffect(() => {
    setSearch(
      isCurrentlyOnLocationDetailPage
        ? searchParamFromCookie
        : searchParamFromQuery,
    );
  }, [setSearch, searchParamFromQuery, searchParamFromCookie]);

  useEffect(() => {
    setAiSearchEnabled(
      aiSearchAvailable &&
        (isCurrentlyOnLocationDetailPage
          ? aiSearchFromCookie === "true"
          : aiSearchFromQuery === "true"),
    );
  }, [
    aiSearchAvailable,
    aiSearchFromQuery,
    aiSearchFromCookie,
    isCurrentlyOnLocationDetailPage,
  ]);

  function buildSearchUrl(searchValue: string, aiEnabled: boolean): string {
    const baseUrl = getUrlWithNewFilterParameter(
      paramsToPathname(paramsToUseForNextUrl.params),
      paramsToUseForNextUrl.searchParams,
      SEARCH_PARAM,
      searchValue,
    );
    const url = new URL(baseUrl, "http://localhost");
    setAiSearchParam(url, aiEnabled);
    return url.pathname + (url.search ? url.search : "");
  }

  function clearSearch() {
    setSearch("");
    if (inputRef.current) inputRef.current.value = "";
    if (shouldStartLoading("", paramsToUseForNextUrl)) {
      setLoading(true);
    }
    setShowMapViewOnMobile(false);
    // Route through buildSearchUrl so clearing the search follows the same
    // aiSearch rules as submitting one: the param is dropped when AI search is
    // off, rather than lingering on the URL from a previous navigation.
    router.push(buildSearchUrl("", aiSearchEnabled));
  }

  function toggleAiSearch() {
    if (!aiSearchAvailable) return;
    const next = !aiSearchEnabled;
    setAiSearchEnabled(next);
    if (search) {
      router.push(buildSearchUrl(search, next));
    }
  }

  function doSetSearch(e: ChangeEvent) {
    setSearch((e.target as HTMLFormElement).value);

    if ((e.target as HTMLFormElement).value === "") {
      clearSearch();
    }
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    setInputHasFocus(true);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    // we add a small delay to allow time for page to navigate
    setTimeout(() => setInputHasFocus(false), 250);
  }

  function doSearchSubmit() {
    window["gtag"]("event", "search_event", {
      search_term: search,
    });

    if (search) {
      if (shouldStartLoading(search, paramsToUseForNextUrl)) {
        setLoading(true);
      }
      setShowMapViewOnMobile(false);
      router.push(buildSearchUrl(search, aiSearchEnabled));
      setInputHasFocus(false);
    }
  }

  return (
    <>
      <div className="flex items-center ml-2 relative flex-1" role="form">
        <input
          className="text-xs md:pl-3 sm:text-sm text-gray-600 w-full border-none p-0 focus:ring-0 block mt-0"
          type="text"
          placeholder="Search"
          id="search_input"
          name="search"
          onChange={doSetSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
          ref={inputRef}
          defaultValue={search || ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              doSearchSubmit();
            }
          }}
        />
        {aiSearchAvailable ? (
          <button
            type="button"
            onClick={toggleAiSearch}
            id="ai_search_toggle"
            title={aiSearchEnabled ? "AI Search on" : "AI Search off"}
            className={`flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-all duration-200 hover:shadow-[0_0_10px_2px_rgba(255,220,0,0.6)] ${
              aiSearchEnabled
                ? "bg-primary text-black border-primary"
                : "bg-white text-gray-400 border-gray-300"
            }`}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <TranslatableText text="AI mode" />
          </button>
        ) : undefined}
        {search ? (
          <button
            onClick={clearSearch}
            className="ml-1"
            id="search_clear_button"
          >
            <XMarkIcon className="w-5 h-5 text-black" />
          </button>
        ) : undefined}
      </div>
      {inputHasFocus && search ? (
        <SearchPanel
          currentSearch={search}
          paramsToUseForNextUrl={paramsToUseForNextUrl}
          aiSearchEnabled={aiSearchEnabled}
        />
      ) : undefined}
    </>
  );
}
