// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import { useFilters } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  parseRequirementParam,
  REQUIREMENT_PARAM,
  REQUIREMENT_PARAM_NO_REQUIREMENTS_VALUE,
  REQUIREMENT_PARAM_REFERRAL_LETTER_VALUE,
  REQUIREMENT_PARAM_REGISTERED_CLIENT_VALUE,
  RequirementValue,
} from "./common";
import { getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved } from "./navigation";
import { TranslatableText } from "./translatable-text";
import { useNormalizedSearchParams } from "./use-normalized-search-params";

const options = [
  {
    value: REQUIREMENT_PARAM_NO_REQUIREMENTS_VALUE,
    label: "Only show services with no requirements",
    description:
      "Excludes services that require a referral letter or registered-client status.",
  },
  {
    value: REQUIREMENT_PARAM_REFERRAL_LETTER_VALUE,
    label: "Exclude referral letter",
    description:
      "Excludes services that require a referral letter from another service provider.",
  },
  {
    value: REQUIREMENT_PARAM_REGISTERED_CLIENT_VALUE,
    label: "Exclude registered client only",
    description:
      "Excludes services that are only available to registered clients.",
  },
];

export function RequirementFieldset() {
  const router = useRouter();
  const pathname = usePathname();
  const { normalizedSearchParams } = useNormalizedSearchParams();
  const setLoading = useFilters((state) => state.setLoading);
  const [selected, setSelected] = useState<RequirementValue[]>([]);

  const parsedRequirementParam = useMemo(
    () =>
      parseRequirementParam(
        normalizedSearchParams && normalizedSearchParams.get(REQUIREMENT_PARAM),
      ),
    [normalizedSearchParams],
  );

  useEffect(() => {
    setSelected(
      parsedRequirementParam.includes(REQUIREMENT_PARAM_NO_REQUIREMENTS_VALUE)
        ? [
            REQUIREMENT_PARAM_REFERRAL_LETTER_VALUE,
            REQUIREMENT_PARAM_REGISTERED_CLIENT_VALUE,
          ]
        : parsedRequirementParam,
    );
  }, [parsedRequirementParam]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as RequirementValue;
    setSelected((prev) => {
      if (value === REQUIREMENT_PARAM_NO_REQUIREMENTS_VALUE) {
        return e.target.checked
          ? [
              REQUIREMENT_PARAM_REFERRAL_LETTER_VALUE,
              REQUIREMENT_PARAM_REGISTERED_CLIENT_VALUE,
            ]
          : [];
      }

      return e.target.checked
        ? [...prev, value]
        : prev.filter((item) => item !== value);
    });

    setLoading(true);
    router.push(
      getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
        pathname,
        normalizedSearchParams,
        value as RequirementValue,
        e.target.checked,
      ),
    );
  };

  return (
    <fieldset className="mt-6">
      <legend className="text-xs font-semibold leading-6 text-dark">
        <TranslatableText text="Requirement type" />
      </legend>
      <div className="mt-2 flex w-full flex-col space-y-4 ml-1">
        {options.map((option) => (
          <label
            key={option.value}
            className="relative flex-1 flex space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              name="requirementType"
              className="w-5 h-5 text-primary !border-dark !border ring-dark focus:ring-dark"
              value={option.value}
              checked={
                option.value === REQUIREMENT_PARAM_NO_REQUIREMENTS_VALUE
                  ? selected.includes(REQUIREMENT_PARAM_REFERRAL_LETTER_VALUE) &&
                    selected.includes(REQUIREMENT_PARAM_REGISTERED_CLIENT_VALUE)
                  : selected.includes(option.value as RequirementValue)
              }
              onChange={handleChange}
            />
            <div className="text-xs text-dark mt-0.5">
              <div>
                <TranslatableText text={option.label} />
              </div>
              {option.description && (
                <p className="text-gray-600">
                  <TranslatableText text={option.description} />
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
