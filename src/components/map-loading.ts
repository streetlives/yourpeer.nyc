export function shouldLoadGoogleMap({
  viewportWidth,
  showMapViewOnMobile,
}: {
  viewportWidth: number;
  showMapViewOnMobile: boolean;
}): boolean {
  return viewportWidth >= 768 || showMapViewOnMobile;
}
