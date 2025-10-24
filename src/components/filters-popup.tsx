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
  AGE_PARAM,
  OtherValues,
  OTHER_PARAM_LEGAL_VALUE,
  OTHER_PARAM_EMPLOYMENT_VALUE,
  HEALTH_PARAM_MENTAL_HEALTH,
  HealthValues,
  parseCategoryFromRoute,
} from "./common";
import React, { ChangeEvent, useEffect, useTransition } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import FilterHours from "./filter-hours";
import FilterHousing from "./filter-housing";
import {
  getUrlWithNewCategory,
  getUrlWithNewCategoryAndSubcategory,
  getUrlWithNewFilterParameter,
} from "./navigation";
import FilterFood from "./filter-food";
import FilterClothing from "./filter-clothing";
import FilterPersonalCare from "./filter-personal-care";
import { useNormalizedSearchParams } from "./use-normalized-search-params";
import { TranslatableText } from "./translatable-text";
import { useTranslatedText } from "./use-translated-text-hook";
import { useFilters } from "@/lib/store";
import { XIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";

function CategoryFilterLabel({
  labelCategory,
  currentCategory,
  imgSrc,
  activeImgSrc,
  labelText,
  normalizedSearchParams,
  subcategory,
}: {
  labelCategory: CategoryNotNull;
  currentCategory: Category;
  imgSrc: string;
  activeImgSrc: string;
  labelText: string;
  normalizedSearchParams?: Map<string, string>;
  subcategory?: OtherValues | HealthValues | undefined;
}) {
  const pathname = usePathname() as string;
  const setLoading = useFilters((state) => state.setLoading);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setLoading(isPending);
  }, [isPending, setLoading]);

  let isActive = !subcategory
    ? labelCategory == currentCategory
    : labelCategory == currentCategory && pathname.includes(subcategory);

  if (
    currentCategory === "other" &&
    labelCategory === "other" &&
    !subcategory
  ) {
    // "other" is active if currentCategory is "other" and no subcategory is selected
    isActive =
      pathname.includes(OTHER_PARAM_LEGAL_VALUE) ||
      pathname.includes(OTHER_PARAM_EMPLOYMENT_VALUE)
        ? false
        : true;
  }

  if (
    currentCategory === "health-care" &&
    labelCategory === "health-care" &&
    !subcategory
  ) {
    isActive = pathname.includes(HEALTH_PARAM_MENTAL_HEALTH) ? false : true;
  }

  const handleClick = () => {
    startTransition(() => {
      router.push(
        subcategory !== undefined
          ? getUrlWithNewCategoryAndSubcategory(
              labelCategory,
              subcategory,
              normalizedSearchParams,
            )
          : getUrlWithNewCategory(labelCategory, normalizedSearchParams),
      );
    });
  };

  return (
    <label
      onClick={handleClick}
      className="relative flex flex-col items-center justify-center cursor-pointer border p-5 focus:outline-none overflow-hidden rounded bg-white border-gray-300 has-[:checked]:bg-primary has-[:checked]:border-black"
    >
      <input
        type="radio"
        name="category"
        value={labelCategory}
        defaultChecked={isActive}
        className="sr-only"
      />
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
    </label>
  );
}

export default function FiltersPopup() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { normalizedSearchParams, ageParam, search, setAgeParam } =
    useNormalizedSearchParams();
  const { close, resultsCount, isOpen, isLoading } = useFilters();

  const enterAgeSourceText = "Enter Age";
  const ageTranslation = useTranslatedText({
    text: enterAgeSourceText,
  }) as string;

  const category = parseCategoryFromRoute(params.route as string);

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
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          id="filters_popup"
          className="bg-white fixed md:absolute inset-x-0 top-[49.6px] md:top-0 bottom-0 md:h-full z-40 flex flex-col md:overflow-hidden"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center m-4 justify-between">
            <div className="text-dark text-lg font-medium">
              <TranslatableText text="Filters" />
            </div>
            <button
              id="filters_popup_close_button"
              className="inline-block"
              onClick={close}
            >
              <XIcon />
            </button>
          </div>
          <form
            className="flex-1 px-4 overflow-y-scroll py-5"
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
                  labelCategory={"health-care"}
                  activeImgSrc="/img/icons/services/mental-health-active.svg"
                  imgSrc="/img/icons/services/mental-health-2.svg"
                  labelText="Mental Health"
                  normalizedSearchParams={normalizedSearchParams}
                  subcategory={HEALTH_PARAM_MENTAL_HEALTH}
                />

                <CategoryFilterLabel
                  currentCategory={category}
                  labelCategory={"other"}
                  activeImgSrc="/img/icons/services/legal-active.svg"
                  imgSrc="/img/icons/services/legal-2.svg"
                  labelText="Legal Services"
                  normalizedSearchParams={normalizedSearchParams}
                  subcategory={OTHER_PARAM_LEGAL_VALUE}
                />

                <CategoryFilterLabel
                  currentCategory={category}
                  labelCategory={"other"}
                  activeImgSrc="/img/icons/services/employment-active.svg"
                  imgSrc="/img/icons/services/employment-2.svg"
                  labelText="Employment"
                  normalizedSearchParams={normalizedSearchParams}
                  subcategory={OTHER_PARAM_EMPLOYMENT_VALUE}
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

          <div className="w-full flex p-4 space-x-4">
            <Button
              asChild
              variant={"outline"}
              size={"lg"}
              className="flex-1 w-full"
            >
              <Link href={`/${LOCATION_ROUTE}`} onClick={close}>
                <TranslatableText text="Clear All" />
              </Link>
            </Button>
            <Button
              onClick={close}
              size={"lg"}
              disabled={isLoading}
              className="flex-1 w-full transition-all duration-500"
            >
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                `Show ${resultsCount} results`
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
