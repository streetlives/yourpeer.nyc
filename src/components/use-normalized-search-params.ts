import { AGE_PARAM, SEARCH_PARAM, mapsAreEqual } from "./common";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export interface UseNormalizedSearchParamsType {
  normalizedSearchParams?: Map<string, string>;
  ageParam?: number;
  search?: string | null;
  setAgeParam: Dispatch<SetStateAction<number | undefined>>;
}

export function useNormalizedSearchParams(): UseNormalizedSearchParamsType {
  const searchParams = useSearchParams();
  const search = searchParams.get(SEARCH_PARAM);
  const [normalizedSearchParams, setNormalizedSearchParams] =
    useState<Map<string, string>>();
  const [ageParam, setAgeParam] = useState<number>();
  // normalize the search params
  useEffect(() => {
    const localNormalizedSearchParams = searchParams
      ? new Map(searchParams.entries())
      : new Map();
    if (searchParams && searchParams.has(AGE_PARAM) && ageParam === undefined) {
      const age = searchParams.get(AGE_PARAM);
      if (age) {
        setAgeParam(parseInt(age, 10));
      }
      localNormalizedSearchParams.set(AGE_PARAM, age);
    }
    if (search && localNormalizedSearchParams.get(SEARCH_PARAM) !== search) {
      localNormalizedSearchParams.set(SEARCH_PARAM, search);
    }
    if (ageParam && localNormalizedSearchParams.get(AGE_PARAM) !== ageParam) {
      localNormalizedSearchParams.set(AGE_PARAM, ageParam);
    }
    // only set him if he's changed
    if (
      normalizedSearchParams === undefined ||
      !mapsAreEqual(localNormalizedSearchParams, normalizedSearchParams)
    ) {
      setNormalizedSearchParams(localNormalizedSearchParams);
    }
  }, [
    ageParam,
    searchParams,
    normalizedSearchParams,
    setNormalizedSearchParams,
    search,
  ]);
  return { normalizedSearchParams, ageParam, search, setAgeParam };
}
