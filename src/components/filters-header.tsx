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
  HEALTH_PARAM,
  HEALTH_PARAM_MENTAL_HEALTH,
  LOCATION_ROUTE,
  OTHER_PARAM,
  OTHER_PARAM_EMPLOYMENT_VALUE,
  OTHER_PARAM_LEGAL_VALUE,
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

const otherCategories = [
  {
    category: HEALTH_PARAM_MENTAL_HEALTH,
    parent_category: HEALTH_PARAM,
    name: "Mental Health",
    icon: "/img/icons/services/mental-health-small.svg",
    href: "/health-care/mental-health",
  },
  {
    category: OTHER_PARAM_LEGAL_VALUE,
    parent_category: OTHER_PARAM,
    name: "Legal Services",
    icon: "/img/icons/services/legal-small.svg",
    href: "/other-services/legal-services",
  },
  {
    category: OTHER_PARAM_EMPLOYMENT_VALUE,
    parent_category: OTHER_PARAM,
    name: "Employment",
    icon: "/img/icons/services/employment-small.svg",
    href: "/other-services/employment",
  },
];

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
  console.log({ currentCategory, subCategory, searchParams });
  return (
    <div className="sticky top-0 w-full inset-x-0 bg-white z-10">
      <div className="flex gap-2 py-3 px-4  flex-nowrap lg:flex-wrap items-center overflow-x-auto border-b border-dotted border-neutral-200 scrollbar-hide">
        {CATEGORIES.filter(
          (thisCategory) =>
            (currentCategory === thisCategory || currentCategory === null) &&
            otherCategories.every((item) => item.category !== thisCategory),
        ).map((thisCategory) =>
          (thisCategory === "other" || thisCategory === "health-care") &&
          subCategory !== null ? null : (
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
          ),
        )}

        {otherCategories
          .filter(
            (item) => subCategory === item.category || currentCategory === null,
          )
          .map((item, idx) => (
            <Link
              key={idx}
              style={linkHeight}
              className={classNames(
                commonClassNames,
                subCategory === item.category
                  ? { "bg-primary": true }
                  : { "bg-neutral-100": true },
              )}
              href={item.href}
            >
              <img src={item.icon} className="w-4 h-4" alt="" />
              <span>{item.name}</span>
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
