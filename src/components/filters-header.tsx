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
  CLOTHING_PARAM_CASUAL_VALUE,
  CLOTHING_PARAM_PROFESSIONAL_VALUE,
  FOOD_PARAM_PANTRY_VALUE,
  FOOD_PARAM_SOUP_KITCHEN_VALUE,
  getIconPath,
  getParsedAmenities,
  LOCATION_ROUTE,
  OPEN_PARAM,
  parsePathnameToCategoryAndSubCategory,
  parseRequirementParam,
  PERSONAL_CARE_CATEGORY,
  REQUIREMENT_PARAM,
  REQUIREMENT_PARAM_REFERRAL_LETTER_VALUE,
  REQUIREMENT_PARAM_REGISTERED_CLIENT_VALUE,
  SearchParams,
  SHELTER_PARAM_FAMILY_VALUE,
  SHELTER_PARAM_SINGLE_VALUE,
  SHOW_ADVANCED_FILTERS_PARAM,
  SubCategory,
} from "./common";
import Link from "next/link";
import classNames from "classnames";
import {
  getUrlWithNewCategory,
  getUrlWithNewFilterParameter,
  getUrlWithoutFilterParameter,
  getUrlWithSubCategoryAddedOrRemoved,
} from "./navigation";
import { TranslatableText } from "./translatable-text";
import { useNormalizedSearchParams } from "@/components/use-normalized-search-params";

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

  const { normalizedSearchParams } = useNormalizedSearchParams();

  const personalCareParam =
    normalizedSearchParams &&
    normalizedSearchParams.get(PERSONAL_CARE_CATEGORY);

  const parsedRequirementParam = parseRequirementParam(
    normalizedSearchParams && normalizedSearchParams.get(REQUIREMENT_PARAM),
  );

  const [category, amenitiesSubCategory] =
    parsePathnameToCategoryAndSubCategory(pathname);

  const parsedAmenities = getParsedAmenities(
    null,
    amenitiesSubCategory,
    personalCareParam,
  );

  const renderRequirementText = (text: string) => {
    if (text === REQUIREMENT_PARAM_REFERRAL_LETTER_VALUE)
      return "Referral letter";
    if (text === REQUIREMENT_PARAM_REGISTERED_CLIENT_VALUE)
      return "Registered client only";

    return "No Requirements";
  };

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
      <div className="flex gap-2 py-3 px-4  flex-nowrap md:flex-wrap items-center overflow-x-auto border-b border-dotted border-neutral-200 scrollbar-hide">
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
        {searchParams[OPEN_PARAM] ? (
          <Link
            className="bg-primary inline-flex flex-shrink-0 overflow-hidden items-center space-x-2 text-dark rounded-full text-xs py-1 px-3 transition location_filter"
            style={linkHeight}
            href={getUrlWithoutFilterParameter(
              pathname,
              searchParams,
              OPEN_PARAM,
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                clipRule="evenodd"
              />
            </svg>
            <TranslatableText
              text={"Open now"}
              className="leading-3 truncate"
            />
          </Link>
        ) : undefined}

        {subCategory == FOOD_PARAM_SOUP_KITCHEN_VALUE ||
        subCategory == FOOD_PARAM_PANTRY_VALUE ? (
          <Link
            className="bg-primary inline-flex flex-shrink-0 overflow-hidden items-center space-x-2 text-dark rounded-full text-xs py-1 px-3 transition location_filter"
            style={linkHeight}
            href={getUrlWithSubCategoryAddedOrRemoved(
              pathname,
              normalizedSearchParams,
              null,
            )}
          >
            <img src={getIconPath("food-icon")} className="w-4 h-4" alt="" />

            {subCategory == FOOD_PARAM_PANTRY_VALUE ? (
              <TranslatableText
                text="Food Pantry"
                className="leading-3 truncate"
              />
            ) : (
              <TranslatableText
                text="Soup Kitchen"
                className="leading-3 truncate"
              />
            )}
          </Link>
        ) : undefined}

        {subCategory == CLOTHING_PARAM_CASUAL_VALUE ||
        subCategory == CLOTHING_PARAM_PROFESSIONAL_VALUE ? (
          <Link
            className="bg-primary inline-flex flex-shrink-0 overflow-hidden items-center space-x-2 text-dark rounded-full text-xs py-1 px-3 transition location_filter"
            style={linkHeight}
            href={getUrlWithSubCategoryAddedOrRemoved(
              pathname,
              normalizedSearchParams,
              null,
            )}
          >
            <img src={getIconPath("clothing")} className="w-4 h-4" alt="" />

            {subCategory == CLOTHING_PARAM_CASUAL_VALUE ? (
              <TranslatableText text="Casual" className="leading-3 truncate" />
            ) : (
              <TranslatableText
                text="Professional"
                className="leading-3 truncate"
              />
            )}
          </Link>
        ) : undefined}
        {/* getUrlWithNewFilterParameter */}
        {currentCategory === "shelters-housing" &&
        (subCategory === SHELTER_PARAM_FAMILY_VALUE ||
          subCategory === SHELTER_PARAM_SINGLE_VALUE) ? (
          <Link
            className="bg-primary inline-flex flex-shrink-0 overflow-hidden items-center space-x-2 text-dark rounded-full text-xs py-1 px-3 transition location_filter"
            style={linkHeight}
            href={getUrlWithSubCategoryAddedOrRemoved(
              pathname,
              normalizedSearchParams,
              null,
            )}
          >
            <img src={getIconPath("shelter-icon")} className="w-4 h-4" alt="" />
            {subCategory === SHELTER_PARAM_FAMILY_VALUE ? (
              <TranslatableText
                text={"Families"}
                className="leading-3 truncate"
              />
            ) : (
              <TranslatableText
                text={"Single Adult"}
                className="leading-3 truncate"
              />
            )}
          </Link>
        ) : undefined}

        {parsedAmenities.length && currentCategory === "personal-care" ? (
          <Link
            className="bg-primary inline-flex flex-shrink-0 overflow-hidden items-center space-x-2 text-dark rounded-full text-xs py-1 px-3 transition location_filter"
            style={linkHeight}
            href={getUrlWithNewFilterParameter(
              pathname,
              searchParams,
              SHOW_ADVANCED_FILTERS_PARAM,
            )}
          >
            <img
              src={getIconPath("personal-care")}
              className="w-4 h-4"
              alt=""
            />

            {parsedAmenities.length > 1 ? (
              <TranslatableText
                text={`${parsedAmenities.length} Amenities`}
                className="leading-3 truncate"
              />
            ) : (
              <span className="capitalize">
                <TranslatableText
                  text={parsedAmenities[0]}
                  className="leading-3 truncate"
                />
              </span>
            )}
          </Link>
        ) : undefined}

        {parsedRequirementParam.length ? (
          <Link
            className="bg-primary inline-flex flex-shrink-0 overflow-hidden items-center space-x-2 text-dark rounded-full text-xs py-1 px-3 transition location_filter"
            style={linkHeight}
            href={getUrlWithNewFilterParameter(
              pathname,
              searchParams,
              SHOW_ADVANCED_FILTERS_PARAM,
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>

            {parsedRequirementParam.length > 1 ? (
              <TranslatableText
                text={`${parsedRequirementParam.length} Requirements`}
                className="leading-3 truncate"
              />
            ) : (
              <TranslatableText
                text={renderRequirementText(parsedRequirementParam[0])}
                className="leading-3 truncate"
              />
            )}
          </Link>
        ) : undefined}

        {currentCategory !== null && (
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
            <TranslatableText
              text="All Filters"
              className="leading-3 truncate"
            />
          </Link>
        )}
      </div>
    </div>
  );
}
