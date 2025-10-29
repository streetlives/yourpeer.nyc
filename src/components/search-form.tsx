// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";
import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { LOCATION_ROUTE, SEARCH_PARAM, SearchParams } from "./common";
import {
  getUrlWithNewFilterParameter,
  getUrlWithoutFilterParameter,
  isOnLocationDetailPage,
  paramsToPathname,
  parsePathnameToSubRouteParams,
} from "./navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { SearchContext, SearchContextType } from "./search-context";
import { PreviousParams } from "./get-previous-params";
import { usePreviousParamsOnClient } from "./use-previous-params-client";

function SearchPanel({
  currentSearch,
  paramsToUseForNextUrl,
}: {
  currentSearch: string;
  paramsToUseForNextUrl: PreviousParams;
}) {
  const { setShowMapViewOnMobile } = useContext(
    SearchContext,
  ) as SearchContextType;
  const router = useRouter();

  //console.log("currentSearch", currentSearch);

  function handleSearchPanelClick() {
    if (currentSearch) {
      setShowMapViewOnMobile(false);
      router.push(
        getUrlWithNewFilterParameter(
          // TODO
          paramsToPathname(paramsToUseForNextUrl.params),
          paramsToUseForNextUrl.searchParams,
          SEARCH_PARAM,
          currentSearch,
        ),
      );
    }
  }

  return (
    <div
      className="bg-white fixed md:absolute bottom-0 md:bottom-auto w-full top-[49.6px] md:top-full inset-x-0 rounded border md:border-gray-300"
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

export default function SearchForm() {
  // TODO: if we are on the location detail screen,
  // then we want to use the cookie to get the previous searchParams,
  // construct the same URL we would use on the back button,
  // but with modified search parameter,
  // then navigate to the new URL
  const { search, setSearch, showMapViewOnMobile, setShowMapViewOnMobile } =
    useContext(SearchContext) as SearchContextType;
  const searchParams = useSearchParams() as ReadonlyURLSearchParams;
  const searchParamFromQuery = searchParams && searchParams.get(SEARCH_PARAM);
  const [inputHasFocus, setInputHasFocus] = useState(false);
  const router = useRouter();
  const pathname = usePathname() as string;
  const previousParams = usePreviousParamsOnClient();
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

  useEffect(() => {
    setSearch(
      isCurrentlyOnLocationDetailPage
        ? searchParamFromCookie
        : searchParamFromQuery,
    );
  }, [setSearch, searchParamFromQuery, searchParamFromCookie]);

  function clearSearch() {
    setSearch("");
    setShowMapViewOnMobile(false);
    router.push(
      getUrlWithoutFilterParameter(
        paramsToPathname(paramsToUseForNextUrl.params),
        paramsToUseForNextUrl.searchParams,
        SEARCH_PARAM,
      ),
    );
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

  function doSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    window["gtag"]("event", "search_event", {
      search_term: search,
    });

    if (search) {
      setShowMapViewOnMobile(false);
      router.push(
        getUrlWithNewFilterParameter(
          paramsToPathname(paramsToUseForNextUrl.params),
          paramsToUseForNextUrl.searchParams,
          SEARCH_PARAM,
          search,
        ),
      );
      setInputHasFocus(false);
    }
  }

  return (
    <>
      <form
        className="flex items-center ml-2 relative flex-1"
        id="search_form"
        onSubmit={doSearchSubmit}
      >
        <input
          className="text-xs md:pl-3 sm:text-sm text-gray-600 w-full border-none p-0 focus:ring-0 block mt-0"
          type="text"
          placeholder="Search"
          id="search_input"
          name="search"
          onChange={doSetSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={search || ""}
        />
        {search ? (
          <Link
            // onClick={clearSearch}
            href={getUrlWithoutFilterParameter(
              paramsToPathname(paramsToUseForNextUrl.params),
              paramsToUseForNextUrl.searchParams,
              SEARCH_PARAM,
            )}
          >
            <XMarkIcon className="w-5 h-5 text-black" />
          </Link>
        ) : undefined}
      </form>
      {inputHasFocus && search ? (
        <SearchPanel
          currentSearch={search}
          paramsToUseForNextUrl={paramsToUseForNextUrl}
        />
      ) : undefined}
    </>
  );
}
