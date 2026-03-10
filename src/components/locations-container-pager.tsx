// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import { usePathname } from "next/navigation";
import { SearchParams } from "./common";
import {
  getPaginationUrl,
  getSearchParamEntries,
} from "./locations-pagination-cache";
import { TranslatableText } from "./translatable-text";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import React from "react";

export function LocationsContainerPager({
  searchParams,
  numberOfPages,
  currentPage,
  onPageChange,
}: {
  searchParams: SearchParams;
  numberOfPages: number;
  currentPage: number;
  onPageChange?: (pageNumber: number) => void;
}) {
  const pathname = usePathname();
  const baseSearchParams = React.useMemo(
    () => getSearchParamEntries(searchParams),
    [searchParams],
  );
  const hasPreviousPage = currentPage > 0;
  const hasNextPage = currentPage < numberOfPages;

  const firstPageHref = hasPreviousPage
    ? getPaginationUrl({
        pathname,
        searchParams: baseSearchParams,
        pageNumber: 0,
      })
    : undefined;
  const previousPageHref = hasPreviousPage
    ? getPaginationUrl({
        pathname,
        searchParams: baseSearchParams,
        pageNumber: currentPage - 1,
      })
    : undefined;
  const nextPageHref = hasNextPage
    ? getPaginationUrl({
        pathname,
        searchParams: baseSearchParams,
        pageNumber: currentPage + 1,
      })
    : undefined;
  const lastPageHref = hasNextPage
    ? getPaginationUrl({
        pathname,
        searchParams: baseSearchParams,
        pageNumber: numberOfPages,
      })
    : undefined;

  function handlePageChange(
    event: React.MouseEvent<HTMLAnchorElement>,
    pageNumber: number,
  ) {
    if (!onPageChange || pageNumber < 0 || pageNumber > numberOfPages) {
      return;
    }

    event.preventDefault();
    onPageChange(pageNumber);
  }

  return (
    <div className="p-6 border-t border-neutral-100 mb-14 md:mb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <a
            className={`text-dark inline-flex space-x-1 disabled:text-muted ${
              !hasPreviousPage ? "text-muted cursor-not-allowed" : ""
            }`}
            href={firstPageHref}
            onClick={(event) => handlePageChange(event, 0)}
          >
            <ChevronsLeft className="w-6 h-6" />
          </a>

          <a
            className={`text-dark inline-flex space-x-1 disabled:text-muted ${
              !hasPreviousPage ? "text-muted cursor-not-allowed" : ""
            }`}
            href={previousPageHref}
            onClick={(event) => handlePageChange(event, currentPage - 1)}
          >
            <ChevronLeft className="w-6 h-6" />
            <TranslatableText text="Previous" />
          </a>
        </div>

        <div translate="no" className="text-dark font-medium">
          <span> {currentPage + 1} </span>
          <span>&nbsp;of&nbsp;</span>
          <span>{numberOfPages + 1}</span>
        </div>

        <div className="flex items-center space-x-4">
          <a
            className={`inline-flex space-x-1 disabled:text-muted ${
              hasNextPage ? "text-dark" : "text-muted cursor-not-allowed"
            }`}
            href={nextPageHref}
            onClick={(event) => handlePageChange(event, currentPage + 1)}
          >
            <TranslatableText text="Next" />
            <ChevronRight className="w-6 h-6" />
          </a>

          <a
            className={`inline-flex space-x-1 disabled:text-muted ${
              hasNextPage ? "text-dark" : "text-muted cursor-not-allowed"
            }`}
            href={lastPageHref}
            onClick={(event) => handlePageChange(event, numberOfPages)}
          >
            <ChevronsRight className="w-6 h-6" />
          </a>
        </div>
      </div>
    </div>
  );
}
