// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { useFilters } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent } from "react";
import {
  SHELTER_PARAM,
  SHELTER_PARAM_FAMILY_VALUE,
  parsePathnameToCategoryAndSubCategory,
  SHELTER_PARAM_YOUTH_VALUE,
  SHELTER_PARAM_SINGLE_VALUE,
  SHELTER_PARAM_DROP_IN_VALUE,
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
  {
    value: SHELTER_PARAM_DROP_IN_VALUE,
    label: "Drop-in Center",
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
      <div className="mt-2 flex flex-col w-full">
        {options.map((option) => (
          <label
            key={option.value}
            className="text-xs relative flex items-center justify-start cursor-pointer border [&:not(:first-child)]:-mt-px py-2 px-5 focus:outline-none text-left first:rounded-t-lg last:rounded-b-lg has-[:checked]:bg-primary has-[:checked]:border-black has-[:checked]:z-10"
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
