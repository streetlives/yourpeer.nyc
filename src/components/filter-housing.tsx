// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { useFilters } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent } from "react";
import {
  parsePathnameToCategoryAndSubCategory,
  SHELTER_PARAM,
  SHELTER_PARAM_FAMILY_VALUE,
  parsePathnameToCategoryAndSubCategory,
  SHELTER_PARAM_YOUTH_VALUE,
  SHELTER_PARAM_SINGLE_VALUE,
  ShelterValues,
} from "./common";
import { getUrlWithSubCategoryAddedOrRemoved } from "./navigation";
import { TranslatableText } from "./translatable-text";
import { useNormalizedSearchParams } from "./use-normalized-search-params";

const options = [
  { value: null, label: "Any" },
  {
    value: SHELTER_PARAM_SINGLE_VALUE,
    label: "Single Adult",
  },
  {
    value: SHELTER_PARAM_FAMILY_VALUE,
    label: "Families",
  },
    {
    value: SHELTER_PARAM_YOUTH_VALUE,
    label: "Youth",
  },
];

export default function FilterHousing() {
  const router = useRouter();
  const pathname = usePathname() as string;
  const { normalizedSearchParams } = useNormalizedSearchParams();
  const setLoading = useFilters((state) => state.setLoading);
  const [category, subCategory] =
    parsePathnameToCategoryAndSubCategory(pathname);
  const shelterParam =
    (normalizedSearchParams && normalizedSearchParams.get(SHELTER_PARAM)) ||
    subCategory;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as ShelterValues | "any";

    setLoading(true);
    router.push(
      getUrlWithSubCategoryAddedOrRemoved(
        pathname,
        normalizedSearchParams,
        value === "any" ? null : value,
      ),
    );
  };

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
        {options.map((option) => (
          <label
            key={option.value}
            className="text-xs relative flex-1 flex flex-col items-center justify-center cursor-pointer border py-2 px-5 focus:outline-none text-center first:rounded-l-lg last:rounded-r-lg has-[:checked]:bg-primary has-[:checked]:border-black"
          >
            <input
              type="radio"
              name="shelter-type"
              value={option.value ?? "any"}
              defaultChecked={shelterParam === option.value}
              className="sr-only"
              onChange={handleChange}
            />
            <TranslatableText text={option.label} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
