// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { useFilters } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  AMENITIES_PARAM_LAUNDRY_VALUE,
  AMENITIES_PARAM_RESTROOM_VALUE,
  AMENITIES_PARAM_SHOWER_VALUE,
  AMENITIES_PARAM_TOILETRIES_VALUE,
  AmenitiesSubCategory,
  getParsedAmenities,
  parsePathnameToCategoryAndSubCategory,
  PERSONAL_CARE_CATEGORY,
} from "./common";
import { getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved } from "./navigation";
import { RequirementFieldset } from "./requirements-fieldset";
import { TranslatableText } from "./translatable-text";
import { useNormalizedSearchParams } from "./use-normalized-search-params";

const options = [
  {
    value: AMENITIES_PARAM_TOILETRIES_VALUE,
    label: "Toiletries",
  },
  {
    value: AMENITIES_PARAM_RESTROOM_VALUE,
    label: "Restrooms",
  },
  {
    value: AMENITIES_PARAM_SHOWER_VALUE,
    label: "Shower",
  },
  {
    value: AMENITIES_PARAM_LAUNDRY_VALUE,
    label: "Laundry",
  },
];

// TODO: route should get a type enum
export default function FilterPersonalCare() {
  const router = useRouter();
  const pathname = usePathname();
  const { normalizedSearchParams } = useNormalizedSearchParams();
  const [selected, setSelected] = useState<AmenitiesSubCategory[]>([]);

  if (!pathname) {
    throw new Error("Expected pathname to not be null");
  }

  const personalCareParam =
    normalizedSearchParams &&
    normalizedSearchParams.get(PERSONAL_CARE_CATEGORY);
  const [category, amenitiesSubCategory] =
    parsePathnameToCategoryAndSubCategory(pathname);

  const parsedAmenities = useMemo(
    () => getParsedAmenities(null, amenitiesSubCategory, personalCareParam),
    [normalizedSearchParams],
  );

  const setLoading = useFilters((state) => state.setLoading);

  useEffect(() => {
    setSelected(parsedAmenities);
  }, [parsedAmenities]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as AmenitiesSubCategory;
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );

    setLoading(true);
    router.push(
      getUrlWithNewPersonalCareServiceSubCategoryAndFilterParameterAddedOrRemoved(
        pathname,
        normalizedSearchParams,
        e.target.value as AmenitiesSubCategory,
        e.target.checked,
      ),
    );
  };

  return (
    <>
      <fieldset className="mt-6">
        <legend className="text-xs font-semibold leading-6 text-dark">
          <TranslatableText text="Amenities" />
        </legend>
        <div className="mt-2 flex w-full flex-col space-y-4 ml-1">
          {options.map((option) => (
            <label
              key={option.value}
              className="relative flex-1 flex space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-5 h-5 text-primary !border-dark !border ring-dark focus:ring-dark"
                checked={selected.includes(
                  option.value as AmenitiesSubCategory,
                )}
                value={option.value}
                onChange={handleChange}
              />
              <TranslatableText
                text={option.label}
                className="text-xs text-dark mt-0.5"
              />
            </label>
          ))}
        </div>
      </fieldset>
      <RequirementFieldset />
    </>
  );
}
