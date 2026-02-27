// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  getFirstPageHref,
  getLastPageHref,
  getUrlToNextOrPreviousPage,
} from "./navigation";
import { TranslatableText } from "./translatable-text";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export function LocationsContainerPager({
  resultCount,
  numberOfPages,
  currentPage,
}: {
  resultCount: number;
  numberOfPages: number;
  currentPage: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasPreviousPage = currentPage > 0;
  const hasNextPage = currentPage < numberOfPages;

  return (
    <div className="p-6 border-t border-neutral-100 mb-14 md:mb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <a
            className={`text-dark inline-flex space-x-1 disabled:text-muted ${
              !hasPreviousPage ? "text-muted cursor-not-allowed" : ""
            }`}
            href={
              hasPreviousPage
                ? getFirstPageHref(pathname, searchParams)
                : undefined
            }
          >
            <ChevronsLeft className="w-6 h-6" />
          </a>

          <a
            className={`text-dark inline-flex space-x-1 disabled:text-muted ${
              !hasPreviousPage ? "text-muted cursor-not-allowed" : ""
            }`}
            href={
              hasPreviousPage
                ? getUrlToNextOrPreviousPage(pathname, searchParams, false)
                : undefined
            }
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
            href={
              hasNextPage
                ? getUrlToNextOrPreviousPage(pathname, searchParams, true)
                : undefined
            }
          >
            <TranslatableText text="Next" />
            <ChevronRight className="w-6 h-6" />
          </a>

          <a
            className={`inline-flex space-x-1 disabled:text-muted ${
              hasNextPage ? "text-dark" : "text-muted cursor-not-allowed"
            }`}
            href={
              hasNextPage
                ? getLastPageHref(pathname, searchParams, numberOfPages)
                : undefined
            }
          >
            <ChevronsRight className="w-6 h-6" />
          </a>
        </div>
      </div>
    </div>
  );
}
