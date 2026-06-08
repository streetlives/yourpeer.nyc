// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { useFilters } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
  const [, subCategory] = parsePathnameToCategoryAndSubCategory(pathname);
  const shelterParam =
    (normalizedSearchParams && normalizedSearchParams.get(SHELTER_PARAM)) ||
    subCategory ||
    "any";

  const handleChange = (value: string) => {
    setLoading(true);
    router.push(
      getUrlWithSubCategoryAddedOrRemoved(
        pathname,
        normalizedSearchParams,
        value === "any" ? null : (value as ShelterValues),
      ),
    );
  };

  return (
    <fieldset className="mt-6">
      <legend className="text-xs font-semibold leading-6 text-dark">
        <TranslatableText text="Shelter & Housing type" />
      </legend>
      <Select value={shelterParam as string} onValueChange={handleChange}>
        <SelectTrigger className="mt-2 w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value ?? "any"}
              value={option.value ?? "any"}
              className="text-xs"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </fieldset>
  );
}
