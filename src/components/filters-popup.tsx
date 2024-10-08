// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import {
  Category,
  CategoryNotNull,
  LOCATION_ROUTE,
  SHOW_ADVANCED_FILTERS_PARAM,
  AGE_PARAM,
} from "./common";
import React, { ChangeEvent } from "react";
import classNames from "classnames";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import FilterHours from "./filter-hours";
import FilterHousing from "./filter-housing";
import {
  getUrlWithNewCategory,
  getUrlWithNewFilterParameter,
  getUrlWithoutFilterParameter,
} from "./navigation";
import FilterFood from "./filter-food";
import FilterClothing from "./filter-clothing";
import FilterPersonalCare from "./filter-personal-care";
import { useNormalizedSearchParams } from "./use-normalized-search-params";
import { TranslatableText } from "./translatable-text";
import { useTranslatedText } from "./use-translated-text-hook";

function CategoryFilterLabel({
  labelCategory,
  currentCategory,
  imgSrc,
  activeImgSrc,
  labelText,
  normalizedSearchParams,
}: {
  labelCategory: CategoryNotNull;
  currentCategory: Category;
  imgSrc: string;
  activeImgSrc: string;
  labelText: string;
  normalizedSearchParams?: Map<string, string>;
}) {
  const isActive = labelCategory == currentCategory;

  return (
    <Link
      href={getUrlWithNewCategory(labelCategory, normalizedSearchParams)}
      aria-labelledby="service-type-0-label"
      aria-describedby="service-type-0-description-0 service-type-0-description-1"
      className={classNames(
        "relative",
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "cursor-pointer",
        "border",
        "p-5",
        "focus:outline-none",
        "overflow-hidden",
        "rounded",
        isActive
          ? { "bg-primary": true, "border-black": true }
          : { "bg-white": true, "border-gray-300": true },
      )}
    >
      <input type="radio" className="sr-only" />
      <img
        src={isActive ? activeImgSrc : imgSrc}
        className="max-h-8 w-8 h-8 object-contain"
        alt=""
      />
      <div
        className="text-center text-xs text-dark mt-3"
        style={{
          width: "100%",
          overflowWrap: "break-word",
          hyphens: "auto",
        }}
      >
        <TranslatableText text={labelText} />
      </div>
    </Link>
  );
}

export default function FiltersPopup({
  category,
  numLocationResults,
}: {
  category: Category;
  numLocationResults: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { normalizedSearchParams, ageParam, search, setAgeParam } =
    useNormalizedSearchParams();

  const enterAgeSourceText = "Enter Age";
  const ageTranslation = useTranslatedText({
    text: enterAgeSourceText,
  }) as string;

  console.log(
    "search",
    search,
    "normalizedSearchParams",
    normalizedSearchParams,
  );

  function handleFilterFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (ageParam) {
      router.push(
        getUrlWithNewFilterParameter(
          pathname,
          normalizedSearchParams,
          AGE_PARAM,
          ageParam.toString(),
        ),
      );
    }
  }

  function handleAgeInputBlur(e: React.FocusEvent<HTMLInputElement>) {
    router.push(
      getUrlWithNewFilterParameter(
        pathname,
        normalizedSearchParams,
        AGE_PARAM,
        e.target.value,
      ),
    );
  }

  function handleAgeInputChange(e: ChangeEvent) {
    setAgeParam(parseInt((e.target as HTMLFormElement).value, 10));
  }

  return (
    <div
      id="filters_popup"
      className="bg-white fixed md:absolute inset-x-0 top-[49.6px] md:top-0 bottom-0 md:h-full z-40 flex flex-col md:overflow-hidden"
    >
      <div className="flex items-center m-4 justify-between">
        <div className="text-dark text-lg font-medium">
          <TranslatableText text="Filters" />
        </div>
        <Link
          id="filters_popup_close_button"
          className="inline-block"
          href={getUrlWithoutFilterParameter(
            pathname,
            normalizedSearchParams,
            SHOW_ADVANCED_FILTERS_PARAM,
          )}
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Link>
      </div>
      <form
        className="flex-1 px-4 overflow-y-scroll scrollbar-hide py-5"
        id="filters_form"
        onSubmit={handleFilterFormSubmit}
      >
        <fieldset>
          <input
            type="hidden"
            name="is_advanced_filters"
            value=""
            id="is_advanced_filters"
          />
          <legend className="text-xs font-semibold leading-6 text-dark">
            <TranslatableText text="Service type" />
          </legend>
          <div className="mt-2 grid gap-2 sm:gap-5 grid-cols-3">
            <CategoryFilterLabel
              currentCategory={category}
              labelCategory={"shelters-housing"}
              activeImgSrc="/img/icons/active-home-icon.svg"
              imgSrc="/img/icons/home-icon.svg"
              labelText="Shelter & Housing"
              normalizedSearchParams={normalizedSearchParams}
            />
            <CategoryFilterLabel
              currentCategory={category}
              labelCategory={"food"}
              activeImgSrc="/img/icons/active-food-icon.svg"
              imgSrc="/img/icons/food-icon-2.svg"
              labelText="Food"
              normalizedSearchParams={normalizedSearchParams}
            />
            <CategoryFilterLabel
              currentCategory={category}
              labelCategory={"clothing"}
              activeImgSrc="/img/icons/active-clothing-icon.svg"
              imgSrc="/img/icons/clothing-icon.svg"
              labelText="Clothing"
              normalizedSearchParams={normalizedSearchParams}
            />
            <CategoryFilterLabel
              currentCategory={category}
              labelCategory={"personal-care"}
              activeImgSrc="/img/icons/active-personal-care.svg"
              imgSrc="/img/icons/personal-care-2.svg"
              labelText="Personal Care"
              normalizedSearchParams={normalizedSearchParams}
            />
            <CategoryFilterLabel
              currentCategory={category}
              labelCategory={"health-care"}
              activeImgSrc="/img/icons/active-health-icon.svg"
              imgSrc="/img/icons/health-icon.svg"
              labelText="Health"
              normalizedSearchParams={normalizedSearchParams}
            />
            <CategoryFilterLabel
              currentCategory={category}
              labelCategory={"other"}
              activeImgSrc="/img/icons/active-dots-icon.svg"
              imgSrc="/img/icons/dots-icon.svg"
              labelText="Other"
              normalizedSearchParams={normalizedSearchParams}
            />
          </div>
        </fieldset>
        <fieldset className="mt-6">
          <legend className="text-xs font-semibold leading-6 text-dark">
            <TranslatableText text="Age" id="#filters-popup-age-label" />
          </legend>
          <div className="mt-2 flex w-full">
            <input
              type="number"
              style={{ width: "100%", borderRadius: ".25rem" }}
              id="age_filter"
              placeholder={ageTranslation || enterAgeSourceText}
              min="0"
              max="120"
              aria-labelledby="age_filter-0-label"
              aria-describedby="age_filter-0-description-0"
              pattern="[0-9][0-9][0-9]"
              inputMode="numeric"
              value={ageParam ? ageParam.toString() : undefined}
              onBlur={handleAgeInputBlur}
              onChange={handleAgeInputChange}
            />
          </div>
        </fieldset>
        <FilterHours />
        {category === "shelters-housing" ? <FilterHousing /> : undefined}
        {category === "food" ? <FilterFood /> : undefined}
        {category === "clothing" ? <FilterClothing /> : undefined}
        {category === "personal-care" ? <FilterPersonalCare /> : undefined}
      </form>
      <table className="w-full">
        <tbody>
          <tr>
            <td className="w-1/2 relative">
              <div
                style={{
                  position: "absolute",
                  top: "1rem",
                  bottom: "1rem",
                  left: "1rem",
                  right: ".5rem",
                }}
              >
                <Link
                  className="outline-button block"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  href={`/${LOCATION_ROUTE}`}
                >
                  <TranslatableText
                    text="Clear All"
                    className="block text-center w-full"
                  />
                </Link>
              </div>
            </td>
            <td
              style={{
                width: "50%",
                paddingLeft: ".5rem",
                paddingRight: "1rem",
                paddingTop: "1rem",
                paddingBottom: "1rem",
              }}
            >
              <Link
                href={getUrlWithoutFilterParameter(
                  pathname,
                  normalizedSearchParams,
                  SHOW_ADVANCED_FILTERS_PARAM,
                )}
                className="primary-button block px-5"
              >
                Show {numLocationResults} results
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
