import { RESOURCE_ROUTES } from "./common";

const ROUTES_TO_REDIRECT_TO_NEARBY = new Set(
  RESOURCE_ROUTES.map((route) => `/${route}`),
);

export function shouldRedirectToNearbyPath(pathname: string | null): boolean {
  if (!pathname) {
    return false;
  }
  const normalizedPath = pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
  return ROUTES_TO_REDIRECT_TO_NEARBY.has(normalizedPath);
}

export function shouldAutoRedirectToNearby({
  pathname,
  sortBy,
  searchText,
  isLocationDetail,
}: {
  pathname: string | null;
  sortBy: string | null;
  searchText: string | null;
  isLocationDetail: boolean;
}): boolean {
  return (
    !sortBy &&
    !searchText &&
    !isLocationDetail &&
    shouldRedirectToNearbyPath(pathname)
  );
}
