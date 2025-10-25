// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  parseRequirementParam,
  REQUIREMENT_PARAM,
  REQUIREMENT_PARAM_NO_REQUIREMENTS_VALUE,
  REQUIREMENT_PARAM_REFERRAL_LETTER_VALUE,
  REQUIREMENT_PARAM_REGISTERED_CLIENT_VALUE,
  RequirementValue,
} from "./common";
import { usePathname, useRouter } from "next/navigation";
import { getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved } from "./navigation";
import { useNormalizedSearchParams } from "./use-normalized-search-params";
import { TranslatableText } from "./translatable-text";
import { useFilters } from "@/lib/store";

const options = [
  {
    value: REQUIREMENT_PARAM_NO_REQUIREMENTS_VALUE,
    label: "No requirements",
  },
  {
    value: REQUIREMENT_PARAM_REFERRAL_LETTER_VALUE,
    label: "Referral letter",
    description:
      "You must bring a letter from another service provider stating that you require this service.",
  },
  {
    value: REQUIREMENT_PARAM_REGISTERED_CLIENT_VALUE,
    label: "Registered client only",
    description:
      "You must be a registered client of their organization to access their services.",
  },
];

export function RequirementFieldset() {
  const router = useRouter();
  const pathname = usePathname();
  const { normalizedSearchParams } = useNormalizedSearchParams();
  const setLoading = useFilters((state) => state.setLoading);
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<RequirementValue[]>([]);

  const parsedRequirementParam = useMemo(
    () =>
      parseRequirementParam(
        normalizedSearchParams && normalizedSearchParams.get(REQUIREMENT_PARAM),
      ),
    [normalizedSearchParams?.get(REQUIREMENT_PARAM)],
  );

  useEffect(() => {
    setSelected([...parsedRequirementParam]);
  }, [parsedRequirementParam]);

  useEffect(() => {
    setLoading(isPending);
  }, [isPending, setLoading]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as RequirementValue;
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );

    startTransition(() => {
      router.push(
        getUrlWithNewRequirementTypeFilterParameterAddedOrRemoved(
          pathname,
          normalizedSearchParams,
          value as RequirementValue,
          e.target.checked,
        ),
      );
    });
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
              checked={selected.includes(option.value as RequirementValue)}
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
