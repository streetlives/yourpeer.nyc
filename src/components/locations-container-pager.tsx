// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { getUrlToNextOrPreviousPage } from "./navigation";
import { TranslatableText } from "./translatable-text";

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          <TranslatableText text="Previous" />
        </a>
        <div className="text-dark font-medium" translate="no">
          <span> {currentPage + 1} </span>
          <span>&nbsp;of&nbsp;</span>
          <span>{numberOfPages + 1}</span>
        </div>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
