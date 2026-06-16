"use client";

import { useCookies } from "next-client-cookies";
import { PreviousParams } from "./get-previous-params";
import { LAST_SET_PARAMS_COOKIE_NAME } from "./common";

export function parsePreviousParamsCookie(
  cookieValue: string | undefined,
): PreviousParams | null {
  if (cookieValue) {
    return JSON.parse(cookieValue) as unknown as PreviousParams;
  }
  return null;
}

export function usePreviousParamsOnClient(): PreviousParams | null {
  const cookies = useCookies();
  return parsePreviousParamsCookie(cookies.get(LAST_SET_PARAMS_COOKIE_NAME));
}
