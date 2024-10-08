// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { usePathname, useRouter } from "next/navigation";
import classNames from "classnames";
import {
  FOOD_PARAM,
  FOOD_PARAM_SOUP_KITCHEN_VALUE,
  FOOD_PARAM_PANTRY_VALUE,
  parsePathnameToCategoryAndSubCategory,
} from "./common";
import { getUrlWithSubCategoryAddedOrRemoved } from "./navigation";
import { useNormalizedSearchParams } from "./use-normalized-search-params";
import { TranslatableText } from "./translatable-text";

export default function FilterFood() {
  const router = useRouter();
  const pathname = usePathname() as string;
  const { normalizedSearchParams } = useNormalizedSearchParams();
  const [category, subCategory] =
    parsePathnameToCategoryAndSubCategory(pathname);
  const foodParam =
    (normalizedSearchParams && normalizedSearchParams.get(FOOD_PARAM)) ||
    subCategory;
  const commonClasses = [
    "text-xs",
    "relative",
    "flex-1",
    "flex",
    "flex-col",
    "items-center",
    "justify-center",
    "cursor-pointer",
    "border",
    "py-2",
    "px-5",
    "focus:outline-none",
    "text-center",
  ];
  //rounded-l-lg
  //rounded-r-lg
  const selectedClasses = ["bg-primary", "border-black"];
  const notSelectedClasses = ["bg-white", "border-gray-300"];

  function handleIsAnyClick() {
    router.push(
      getUrlWithSubCategoryAddedOrRemoved(
        pathname,
        normalizedSearchParams,
        null,
      ),
    );
  }

  function handleIsSoupKItchenClick() {
    router.push(
      getUrlWithSubCategoryAddedOrRemoved(
        pathname,
        normalizedSearchParams,
        FOOD_PARAM_SOUP_KITCHEN_VALUE,
      ),
    );
  }

  function handleIsPantryClick() {
    router.push(
      getUrlWithSubCategoryAddedOrRemoved(
        pathname,
        normalizedSearchParams,
        FOOD_PARAM_PANTRY_VALUE,
      ),
    );
  }

  return (
    <fieldset className="mt-6">
      <legend className="text-xs font-semibold leading-6 text-dark">
        <TranslatableText text="Food type" />
      </legend>
      <div className="mt-2 flex w-full">
        <label
          className={classNames.call(
            null,
            commonClasses
              .concat("rounded-l-lg")
              .concat(!foodParam ? selectedClasses : notSelectedClasses),
          )}
        >
          <input
            type="radio"
            id="filter_shelter_type_any"
            name="accommodation-type"
            value={!foodParam ? "true" : undefined}
            className="sr-only"
            aria-labelledby="accommodationType-0-label"
            aria-describedby="accommodationType-0-description-0 accommodationType-0-description-1"
            onClick={handleIsAnyClick}
          />
          <TranslatableText text="Any" />
        </label>
        <label
          className={classNames.call(
            null,
            commonClasses.concat(
              foodParam == FOOD_PARAM_SOUP_KITCHEN_VALUE
                ? selectedClasses
                : notSelectedClasses,
            ),
          )}
        >
          <input
            type="radio"
            id="filter_food_type_soup_kitchen"
            name="filter_food_type_soup_kitchen"
            value={
              foodParam == FOOD_PARAM_SOUP_KITCHEN_VALUE ? "true" : undefined
            }
            className="sr-only"
            onClick={handleIsSoupKItchenClick}
          />
          <TranslatableText text="Soup Kitchen" />
        </label>
        <label
          className={classNames.call(
            null,
            commonClasses
              .concat("rounded-r-lg")
              .concat(
                foodParam == FOOD_PARAM_PANTRY_VALUE
                  ? selectedClasses
                  : notSelectedClasses,
              ),
          )}
        >
          <input
            type="radio"
            id="filter_food_type_pantry"
            name="accommodationType"
            value={foodParam == FOOD_PARAM_PANTRY_VALUE ? "true" : undefined}
            className="sr-only"
            onClick={handleIsPantryClick}
          />
          <TranslatableText text="Food Pantry" />
        </label>
      </div>
    </fieldset>
  );
}
