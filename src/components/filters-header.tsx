// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import {
  AGE_PARAM,
  CATEGORIES,
  Category,
  CATEGORY_DESCRIPTION_MAP,
  CATEGORY_ICON_SRC_MAP,
  CATEGORY_TO_ROUTE_MAP,
  getIconPath,
  LOCATION_ROUTE,
  SearchParams,
  SHOW_ADVANCED_FILTERS_PARAM,
  SubCategory,
} from "./common";
import Link from "next/link";
import classNames from "classnames";
import {
  getUrlWithNewCategory,
  getUrlWithNewFilterParameter,
  getUrlWithoutFilterParameter,
} from "./navigation";
import { TranslatableText } from "./translatable-text";

export default function FiltersHeader({
  category: currentCategory,
  subCategory,
  searchParams,
}: {
  category: Category;
  subCategory: SubCategory | null;
  searchParams: SearchParams;
}) {
  // TODO: I think there is a functionn for this
  const pathname = `/${
    currentCategory === null
      ? LOCATION_ROUTE
      : CATEGORY_TO_ROUTE_MAP[currentCategory]
  }${subCategory ? `/${subCategory}` : ""}`;
  const commonClassNames = [
    "inline-flex",
    "flex-shrink-0",
    "overflow-hidden",
    "items-center",
    "space-x-2",
    "text-dark",
    "rounded-full",
    "text-xs",
    "py-1",
    "px-3",
    "transition",
    "location_filter",
  ];
  const linkHeight = { minHeight: "24px" };
  return (
    <div className="sticky top-0 w-full inset-x-0 bg-white z-10">
      <div className="flex gap-2 py-3 px-4  flex-nowrap lg:flex-wrap items-center overflow-x-auto border-b border-dotted border-neutral-200 scrollbar-hide">
        {CATEGORIES.filter(
          (thisCategory) =>
            currentCategory === thisCategory || currentCategory === null,
        ).map((thisCategory) => (
          <Link
            key={thisCategory}
            style={linkHeight}
            className={classNames(
              commonClassNames,
              currentCategory === thisCategory
                ? { "bg-primary": true }
                : { "bg-neutral-100": true },
            )}
            href={getUrlWithNewCategory(
              currentCategory === thisCategory ? null : thisCategory,
              searchParams,
            )}
          >
            <img
              src={getIconPath(CATEGORY_ICON_SRC_MAP[thisCategory])}
              className="w-4 h-4"
              alt=""
            />
            <TranslatableText
              text={CATEGORY_DESCRIPTION_MAP[thisCategory]}
              className="leading-3 truncate"
            />
          </Link>
        ))}
        {searchParams[AGE_PARAM] ? (
          <Link
            className="bg-primary inline-flex flex-shrink-0 overflow-hidden items-center space-x-2 text-dark rounded-full text-xs py-1 px-3 transition location_filter"
            style={linkHeight}
            href={getUrlWithoutFilterParameter(
              pathname,
              searchParams,
              AGE_PARAM,
            )}
          >
            <span className="leading-3 truncate">
              Age: {searchParams[AGE_PARAM]}
            </span>
          </Link>
        ) : undefined}
        <Link
          className="inline-flex flex-shrink-0 overflow-hidden items-center space-x-2 text-dark bg-neutral-100 rounded-full text-xs py-1 px-3"
          style={linkHeight}
          href={getUrlWithNewFilterParameter(
            pathname,
            searchParams,
            SHOW_ADVANCED_FILTERS_PARAM,
          )}
        >
          <img src="/img/icons/filters.svg" className="w-4 h-4" alt="" />
          <TranslatableText text="All Filters" className="leading-3 truncate" />
        </Link>
      </div>
    </div>
  );
}
