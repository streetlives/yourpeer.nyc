import { useCookies } from "next-client-cookies";
import {
  LAST_SET_PARAMS_COOKIE_NAME,
  SEARCH_PARAM,
  SearchParams,
} from "./common";
import { PreviousParams } from "./get-previous-params";

export function serializeToQueryParams(searchParams: SearchParams): string {
  return Object.entries(searchParams)
    .map(([k, v]) =>
      typeof v === "string"
        ? `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
        : "",
    )
    .filter(Boolean)
    .join("&");
}

export function buildPreviousRoute(
  cookieValue: string | undefined,
  overrideSearchParam: string | null | undefined = undefined,
): string | undefined {
  if (!cookieValue) return undefined;
  const previousParams = JSON.parse(cookieValue) as unknown as PreviousParams;
  if (overrideSearchParam === null) {
    delete previousParams.searchParams[SEARCH_PARAM];
  } else if (typeof overrideSearchParam === "string") {
    previousParams.searchParams[SEARCH_PARAM] = overrideSearchParam;
  }
  const qs = serializeToQueryParams(previousParams.searchParams);
  return `/${previousParams.params.route}${previousParams.params.locationSlugOrPersonalCareSubCategory ? `/${previousParams.params.locationSlugOrPersonalCareSubCategory}` : ""}${qs ? `?${qs}` : ""}`;
}

export function usePreviousRoute(
  overrideSearchParam: string | null | undefined = undefined,
): string | undefined {
  const cookies = useCookies();
  return buildPreviousRoute(
    cookies.get(LAST_SET_PARAMS_COOKIE_NAME),
    overrideSearchParam,
  );
}
