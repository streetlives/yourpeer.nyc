"use client";

// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { useCookies } from "next-client-cookies";
import {
  LAST_SET_PARAMS_COOKIE_NAME,
  PAGE_PARAM,
  SHOW_ADVANCED_FILTERS_PARAM,
  SearchParams,
} from "./common";
import FiltersHeader from "./filters-header";
import FiltersPopup from "./filters-popup";
import LocationsContainer from "./locations-container";
import { useEffect } from "react";
import { SidePanelComponentData } from "./get-side-panel-component-data";

export function SidePanelComponent({
  searchParams,
  sidePanelComponentData: {
    params,
    parsedSearchParams,
    category,
    resultCount,
    numberOfPages,
    yourPeerLegacyLocationData,
  },
}: {
  searchParams: SearchParams;
  sidePanelComponentData: SidePanelComponentData;
}) {
  const cookies = useCookies();
  useEffect(() => {
    cookies.set(
      LAST_SET_PARAMS_COOKIE_NAME,
      JSON.stringify({
        params,
        searchParams,
      }),
    );
  }, [params, searchParams]);
  return (
    <>
      <div
        className="w-full h-full md:h-full flex flex-col"
        id="filters_and_list_screen"
      >
        {parsedSearchParams[SHOW_ADVANCED_FILTERS_PARAM] ? (
          <FiltersPopup category={category} numLocationResults={resultCount} />
        ) : undefined}
        <FiltersHeader category={category} searchParams={searchParams} />
        <LocationsContainer
          searchParams={searchParams}
          resultCount={resultCount}
          numberOfPages={numberOfPages}
          currentPage={parsedSearchParams[PAGE_PARAM]}
          category={category}
          yourPeerLegacyLocationData={yourPeerLegacyLocationData}
        />
      </div>
    </>
  );
}
