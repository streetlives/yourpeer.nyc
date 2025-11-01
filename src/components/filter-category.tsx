"use client";
// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { useFilters } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent } from "react";
import {
  Category,
  CategoryNotNull,
  HEALTH_PARAM_MENTAL_HEALTH,
  HealthValues,
  OTHER_PARAM_EMPLOYMENT_VALUE,
  OTHER_PARAM_LEGAL_VALUE,
  OtherValues,
} from "./common";
import {
  getUrlWithNewCategory,
  getUrlWithNewCategoryAndSubcategory,
} from "./navigation";
import { TranslatableText } from "./translatable-text";

export default function CategoryFilterLabel({
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
  const router = useRouter();

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

  const handleClick = (e: ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    router.push(
      subcategory !== undefined
        ? getUrlWithNewCategoryAndSubcategory(
            labelCategory,
            subcategory,
            normalizedSearchParams,
          )
        : getUrlWithNewCategory(labelCategory, normalizedSearchParams),
    );
  };

  return (
    <label className="relative flex flex-col items-center justify-center cursor-pointer border p-5 focus:outline-none overflow-hidden rounded bg-white border-gray-300 has-[:checked]:bg-primary has-[:checked]:border-black">
      <input
        type="radio"
        name="category"
        value={`${labelCategory}${subcategory ? `/${subcategory}` : ""}`}
        onChange={handleClick}
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
