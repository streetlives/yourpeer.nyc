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

export async function getPreviousParams(): Promise<PreviousParams | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(LAST_SET_PARAMS_COOKIE_NAME);

  if (cookie && cookie.value) {
    return JSON.parse(cookie.value) as unknown as PreviousParams;
  } else {
    return null;
  }
}
