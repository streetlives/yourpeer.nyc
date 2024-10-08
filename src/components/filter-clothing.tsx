// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { usePathname, useRouter } from "next/navigation";
import classNames from "classnames";
import {
  CLOTHING_PARAM_CASUAL_VALUE,
  CLOTHING_PARAM,
  CLOTHING_PARAM_PROFESSIONAL_VALUE,
  parsePathnameToCategoryAndSubCategory,
} from "./common";
import { getUrlWithSubCategoryAddedOrRemoved } from "./navigation";
import { RequirementFieldset } from "./requirements-fieldset";
import { useNormalizedSearchParams } from "./use-normalized-search-params";
import { TranslatableText } from "./translatable-text";

export default function FilterClothing() {
  const router = useRouter();
  const pathname = usePathname() as string;
  const { normalizedSearchParams } = useNormalizedSearchParams();
  const [category, subCategory] =
    parsePathnameToCategoryAndSubCategory(pathname);

  const clothingParam =
    (normalizedSearchParams && normalizedSearchParams.get(CLOTHING_PARAM)) ||
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

  function handleIsCasualClick() {
    router.push(
      getUrlWithSubCategoryAddedOrRemoved(
        pathname,
        normalizedSearchParams,
        CLOTHING_PARAM_CASUAL_VALUE,
      ),
    );
  }

  function handleIsProfessionalClick() {
    router.push(
      getUrlWithSubCategoryAddedOrRemoved(
        pathname,
        normalizedSearchParams,
        CLOTHING_PARAM_PROFESSIONAL_VALUE,
      ),
    );
  }

  return (
    <>
      <fieldset className="mt-6">
        <legend className="text-xs font-semibold leading-6 text-dark">
          <TranslatableText text="Clothing type" />
        </legend>
        <div className="mt-2 flex w-full">
          <label
            className={classNames.call(
              null,
              commonClasses
                .concat("rounded-l-lg")
                .concat(!clothingParam ? selectedClasses : notSelectedClasses),
            )}
          >
            <input
              type="radio"
              id="filter_shelter_type_any"
              name="accommodation-type"
              value={!clothingParam ? "true" : undefined}
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
                clothingParam == CLOTHING_PARAM_CASUAL_VALUE
                  ? selectedClasses
                  : notSelectedClasses,
              ),
            )}
          >
            <input
              type="radio"
              id="filter_clothing_casual"
              name="filter_clothing_casual"
              value={
                clothingParam == CLOTHING_PARAM_CASUAL_VALUE
                  ? "true"
                  : undefined
              }
              className="sr-only"
              onClick={handleIsCasualClick}
            />
            <TranslatableText text="Casual" />
          </label>
          <label
            className={classNames.call(
              null,
              commonClasses
                .concat("rounded-r-lg")
                .concat(
                  clothingParam == CLOTHING_PARAM_PROFESSIONAL_VALUE
                    ? selectedClasses
                    : notSelectedClasses,
                ),
            )}
          >
            <input
              type="radio"
              id="filter_clothing_professional"
              name="filter_clothing_professional"
              value={
                clothingParam == CLOTHING_PARAM_PROFESSIONAL_VALUE
                  ? "true"
                  : undefined
              }
              className="sr-only"
              onClick={handleIsProfessionalClick}
            />
            <TranslatableText text="Professional" />
          </label>
        </div>
      </fieldset>
      <RequirementFieldset />
    </>
  );
}
