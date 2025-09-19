import { useCookies } from "next-client-cookies";
import {
  LAST_SET_PARAMS_COOKIE_NAME,
  SEARCH_PARAM,
  SearchParams,
} from "./common";
import { PreviousParams } from "./get-previous-params";

function serializeToQueryParams(searchParams: SearchParams): string {
  return Object.entries(searchParams)
    .map(([k, v]) =>
      typeof v === "string"
        ? `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
        : "",
    )
    .join("&");
}

export function usePreviousRoute(
  overrideSearchParam: string | null | undefined = undefined,
): string | undefined {
  const cookies = useCookies();

  const lastSetParamsCookie = cookies.get(LAST_SET_PARAMS_COOKIE_NAME);
  if (lastSetParamsCookie) {
    const previousParams = JSON.parse(
      lastSetParamsCookie,
    ) as unknown as PreviousParams;
    if (overrideSearchParam === null) {
      delete previousParams.searchParams[SEARCH_PARAM];
    } else if (typeof overrideSearchParam === "string") {
      previousParams.searchParams[SEARCH_PARAM] = overrideSearchParam;
    }
    return `/${previousParams.params.route}${previousParams.params.locationSlugOrPersonalCareSubCategory ? `/${previousParams.params.locationSlugOrPersonalCareSubCategory}` : ""}${Object.keys(previousParams).length ? `?${serializeToQueryParams(previousParams.searchParams)}` : ""}`;
  }
}
