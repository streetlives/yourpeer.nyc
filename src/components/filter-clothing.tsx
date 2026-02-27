// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { useFilters } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent } from "react";
import {
  CLOTHING_PARAM,
  CLOTHING_PARAM_CASUAL_VALUE,
  CLOTHING_PARAM_PROFESSIONAL_VALUE,
  ClothingValues,
  parsePathnameToCategoryAndSubCategory,
} from "./common";
import { getUrlWithSubCategoryAddedOrRemoved } from "./navigation";
import { RequirementFieldset } from "./requirements-fieldset";
import { TranslatableText } from "./translatable-text";
import { useNormalizedSearchParams } from "./use-normalized-search-params";

const options = [
  { value: null, label: "Any" },
  {
    value: CLOTHING_PARAM_CASUAL_VALUE,
    label: "Casual",
  },
  {
    value: CLOTHING_PARAM_PROFESSIONAL_VALUE,
    label: "Professional",
  },
];

export default function FilterClothing() {
  const router = useRouter();
  const pathname = usePathname() as string;
  const { normalizedSearchParams } = useNormalizedSearchParams();
  const [category, subCategory] =
    parsePathnameToCategoryAndSubCategory(pathname);

  const clothingParam =
    (normalizedSearchParams && normalizedSearchParams.get(CLOTHING_PARAM)) ||
    subCategory;
  const setLoading = useFilters((state) => state.setLoading);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as ClothingValues | "any";

    setLoading(true);
    router.push(
      getUrlWithSubCategoryAddedOrRemoved(
        pathname,
        normalizedSearchParams,
        value === "any" ? null : value,
      ),
    );
  };

  return (
    <>
      <fieldset className="mt-6">
        <legend className="text-xs font-semibold leading-6 text-dark">
          <TranslatableText text="Clothing type" />
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
                defaultChecked={clothingParam === option.value}
                className="sr-only"
                onChange={handleChange}
              />
              <TranslatableText text={option.label} />
            </label>
          ))}
        </div>
      </fieldset>
      <RequirementFieldset />
    </>
  );
}
