// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { usePathname, useRouter } from "next/navigation";
import classNames from "classnames";
import {
  SHELTER_PARAM,
  SHELTER_PARAM_SINGLE_VALUE,
  SHELTER_PARAM_FAMILY_VALUE,
  parsePathnameToCategoryAndSubCategory,
  SHELTER_PARAM_YOUTH_VALUE,
} from "./common";
import { getUrlWithSubCategoryAddedOrRemoved } from "./navigation";
import { useNormalizedSearchParams } from "./use-normalized-search-params";
import { TranslatableText } from "./translatable-text";

export default function FilterHousing() {
  const router = useRouter();
  const pathname = usePathname() as string;
  const { normalizedSearchParams } = useNormalizedSearchParams();
  const [category, subCategory] =
    parsePathnameToCategoryAndSubCategory(pathname);
  const shelterParam =
    (normalizedSearchParams && normalizedSearchParams.get(SHELTER_PARAM)) ||
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

  function handleIsSingleAdultClick() {
    router.push(
      getUrlWithSubCategoryAddedOrRemoved(
        pathname,
        normalizedSearchParams,
        SHELTER_PARAM_SINGLE_VALUE,
      ),
    );
  }

  function handleIsFamiliesClick() {
    router.push(
      getUrlWithSubCategoryAddedOrRemoved(
        pathname,
        normalizedSearchParams,
        SHELTER_PARAM_FAMILY_VALUE,
      ),
    );
  }

  function handleIsYouthClick() {
    router.push(
      getUrlWithSubCategoryAddedOrRemoved(
        pathname,
        normalizedSearchParams,
        SHELTER_PARAM_YOUTH_VALUE,
      ),
    );
  }

  return (
    <fieldset className="mt-6">
      <legend className="text-xs font-semibold leading-6 text-dark">
        <TranslatableText text="Shelter & Housing type" />
      </legend>
      <div className="mt-2 flex w-full">
        <label
          className={classNames.call(
            null,
            commonClasses
              .concat("rounded-l-lg")
              .concat(!shelterParam ? selectedClasses : notSelectedClasses),
          )}
        >
          <input
            type="radio"
            id="filter_shelter_type_any"
            name="accommodation-type"
            value={!shelterParam ? "true" : undefined}
            className="sr-only"
            aria-labelledby="accommodationType-0-label"
            aria-describedby="accommodationType-0-description-0 accommodationType-0-description-1"
            onClick={handleIsAnyClick}
          />
          <TranslatableText id="#filter-housing-Any" text="Any" />
        </label>
        <label
          className={classNames.call(
            null,
            commonClasses.concat(
              shelterParam == SHELTER_PARAM_SINGLE_VALUE
                ? selectedClasses
                : notSelectedClasses,
            ),
          )}
        >
          <input
            type="radio"
            id="filter_shelter_type_single_adult"
            name="accom"
            value={
              shelterParam == SHELTER_PARAM_SINGLE_VALUE ? "true" : undefined
            }
            className="sr-only"
            aria-labelledby="accommodationType-0-label"
            aria-describedby="accommodationType-0-description-0 accommodationType-0-description-1"
            onClick={handleIsSingleAdultClick}
          />
          <TranslatableText text="Single Adult" />
        </label>
        <label
          className={classNames.call(
            null,
            commonClasses.concat(
              shelterParam == SHELTER_PARAM_FAMILY_VALUE
                ? selectedClasses
                : notSelectedClasses,
            ),
          )}
        >
          <input
            type="radio"
            id="filter_shelter_type_families"
            name="accommodationType"
            value={
              shelterParam == SHELTER_PARAM_FAMILY_VALUE ? "true" : undefined
            }
            className="sr-only"
            aria-labelledby="accommodationType-0-label"
            aria-describedby="accommodationType-0-description-0 accommodationType-0-description-1"
            onClick={handleIsFamiliesClick}
          />
          <TranslatableText text="Families" />
        </label>
        <label
          className={classNames.call(
            null,
            commonClasses
              .concat("rounded-r-lg")
              .concat(
                shelterParam == SHELTER_PARAM_YOUTH_VALUE
                  ? selectedClasses
                  : notSelectedClasses,
              ),
          )}
        >
          <input
            type="radio"
            id="filter_shelter_type_youth"
            name="accommodationType"
            value={
              shelterParam == SHELTER_PARAM_YOUTH_VALUE ? "true" : undefined
            }
            className="sr-only"
            onClick={handleIsYouthClick}
          />
          <TranslatableText text="Youth" />
        </label>
      </div>
    </fieldset>
  );
}
