// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ChangeEvent, useContext } from "react";
import {
  DEFAULT_SORT_BY_VALUE,
  NEARBY_SORT_BY_VALUE,
  SEARCH_PARAM,
  SORT_BY_LABELS,
  SORT_BY_QUERY_PARAM,
} from "./common";
import { getUrlWithNewFilterParameter } from "./navigation";
import {
  GeoCoordinatesContext,
  GeoCoordinatesContextType,
} from "./geo-context";

export function SortDropdown() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userPosition } = useContext(
    GeoCoordinatesContext,
  ) as GeoCoordinatesContextType;

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedLocationSort = e.target?.value;
    if (selectedLocationSort) {
      router.push(
        getUrlWithNewFilterParameter(
          pathname,
          searchParams,
          SORT_BY_QUERY_PARAM,
          e.target?.value,
        ),
      );
    }
  };

  const _sortBy = searchParams?.get(SORT_BY_QUERY_PARAM);
  const sortBy = _sortBy ? _sortBy : DEFAULT_SORT_BY_VALUE;

  const search = searchParams.get(SEARCH_PARAM);

  return !search || search.length === 0 ? (
    <select
      name="select_sort"
      className="w-auto border-transparent cursor-pointer text-sm"
      onChange={handleChange}
      value={sortBy}
    >
      {Object.entries(SORT_BY_LABELS).map(([k, v]) => (
        <option
          key={k}
          value={k}
          disabled={
            k === NEARBY_SORT_BY_VALUE && !userPosition ? true : undefined
          }
        >
          {v}
        </option>
      ))}
    </select>
  ) : (
    <></>
  );
}
