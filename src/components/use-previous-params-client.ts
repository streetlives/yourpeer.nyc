"use client";

import { useCookies } from "next-client-cookies";
import { PreviousParams } from "./get-previous-params";
import { LAST_SET_PARAMS_COOKIE_NAME } from "./common";

export function usePreviousParamsOnClient(): PreviousParams | null {
  const cookies = useCookies();
  const cookie = cookies.get(LAST_SET_PARAMS_COOKIE_NAME);
  if (cookie) {
    return JSON.parse(cookie) as unknown as PreviousParams;
  } else {
    return null;
  }
}
