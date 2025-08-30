import { cookies } from "next/headers";
import {
  LAST_SET_PARAMS_COOKIE_NAME,
  RouteParams,
  SearchParams,
} from "./common";

export interface PreviousParams {
  searchParams: SearchParams;
  params: RouteParams;
}

export function getPreviousParams(): PreviousParams | null {
  const cookie = cookies().get(LAST_SET_PARAMS_COOKIE_NAME);
  console.log("cookie", cookie);
  if (cookie && cookie.value) {
    return JSON.parse(cookie.value) as unknown as PreviousParams;
  } else {
    return null;
  }
}
