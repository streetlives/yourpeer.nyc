// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { useFilters } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent } from "react";
import { AGE_PARAM } from "./common";
import { getUrlWithNewFilterParameter } from "./navigation";
import { TranslatableText } from "./translatable-text";
import { useNormalizedSearchParams } from "./use-normalized-search-params";
import { useTranslatedText } from "./use-translated-text-hook";

export default function FilterAge() {
  const { normalizedSearchParams, ageParam, setAgeParam } =
    useNormalizedSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const setLoading = useFilters((state) => state.setLoading);

  const enterAgeSourceText = "Enter Age";
  const ageTranslation = useTranslatedText({
    text: enterAgeSourceText,
  }) as string;

  function handleSubmit(value: string) {
    setLoading(true);
    router.push(
      getUrlWithNewFilterParameter(
        pathname,
        normalizedSearchParams,
        AGE_PARAM,
        value,
      ),
    );
  }

  function handleAgeInputChange(e: ChangeEvent) {
    setAgeParam(parseInt((e.target as HTMLFormElement).value, 10));
  }

  return (
    <fieldset className="mt-6">
      <legend className="text-xs font-semibold leading-6 text-dark">
        <TranslatableText text="Age" id="#filters-popup-age-label" />
      </legend>
      <div className="mt-2 flex w-full">
        <input
          className="w-full rounded-lg"
          type="number"
          id="age_filter"
          placeholder={ageTranslation || enterAgeSourceText}
          min="0"
          max="120"
          pattern="[0-9][0-9][0-9]"
          inputMode="numeric"
          value={ageParam ? ageParam.toString() : ""}
          onBlur={(e) => handleSubmit(e.target.value)}
          onChange={handleAgeInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(e.currentTarget.value);
            }
          }}
        />
      </div>
    </fieldset>
  );
}
