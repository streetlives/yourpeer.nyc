// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { useFilters } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { OPEN_PARAM } from "./common";
import {
  getUrlWithNewFilterParameter,
  getUrlWithoutFilterParameter,
} from "./navigation";
import { TranslatableText } from "./translatable-text";
import { useNormalizedSearchParams } from "./use-normalized-search-params";

export default function FilterHours() {
  const router = useRouter();
  const pathname = usePathname();
  const { normalizedSearchParams } = useNormalizedSearchParams();
  const setLoading = useFilters((state) => state.setLoading);
  const [openValue, setOpenValue] = useState<string | null>(null);
  const openParam = normalizedSearchParams?.get(OPEN_PARAM)
    ? OPEN_PARAM
    : "any";

  useEffect(() => {
    setOpenValue(openParam);
  }, [openParam]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setOpenValue(e.target.value);
    setLoading(true);

    if (e.target.value === OPEN_PARAM) {
      router.push(
        getUrlWithNewFilterParameter(
          pathname,
          normalizedSearchParams,
          OPEN_PARAM,
        ),
      );
    } else {
      router.push(
        getUrlWithoutFilterParameter(
          pathname,
          normalizedSearchParams,
          OPEN_PARAM,
        ),
      );
    }
  };

  const options = [
    { value: "any", label: "Any" },
    { value: OPEN_PARAM, label: "Open now" },
  ];

  return (
    <fieldset className="mt-6" id="filter_hours">
      <legend className="text-xs font-semibold leading-6 text-dark">
        <TranslatableText text="Opening hours" />
      </legend>

      <div className="mt-2 flex w-full">
        {options.map((option) => (
          <label
            key={option.value}
            className="text-xs relative flex-1 flex flex-col items-center justify-center cursor-pointer border py-2 px-5 focus:outline-none text-center first:rounded-l-lg last:rounded-r-lg has-[:checked]:bg-primary has-[:checked]:border-black"
          >
            <input
              type="radio"
              name="open-now"
              value={option.value}
              checked={option.value === openValue}
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
