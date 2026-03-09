import { RESOURCE_ROUTES } from "./common";

const ROUTES_TO_REDIRECT_TO_NEARBY = new Set(
  RESOURCE_ROUTES.map((route) => `/${route}`),
);

function trimTrailingSlashes(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

function isLocaleSegment(segment: string): boolean {
  return /^[a-z]{2}(?:-[a-z]{2})?$/i.test(segment);
}

function removeKnownPrefix(pathname: string): string {
  const normalizedPath = trimTrailingSlashes(pathname);
  const segments = normalizedPath.split("/").filter(Boolean);

  if (!segments.length) {
    return normalizedPath;
  }

  const nextPublicBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim().replace(
    /^\/+|\/+$/g,
    "",
  );

  if (nextPublicBasePath && segments[0] === nextPublicBasePath) {
    return `/${segments.slice(1).join("/") || ""}` || "/";
  }

  if (isLocaleSegment(segments[0])) {
    return `/${segments.slice(1).join("/") || ""}` || "/";
  }

  return normalizedPath;
}

export function shouldRedirectToNearbyPath(pathname: string | null): boolean {
  if (!pathname) {
    return false;
  }

  const normalizedPath = trimTrailingSlashes(pathname);
  const deprefixedPath = removeKnownPrefix(normalizedPath);

  return (
    ROUTES_TO_REDIRECT_TO_NEARBY.has(normalizedPath) ||
    ROUTES_TO_REDIRECT_TO_NEARBY.has(deprefixedPath)
  );
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
