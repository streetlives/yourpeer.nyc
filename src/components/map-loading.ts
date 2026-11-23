export function shouldLoadGoogleMap({
  viewportWidth,
  showMapViewOnMobile,
  isLocationDetail,
}: {
  viewportWidth: number;
  showMapViewOnMobile: boolean;
  isLocationDetail: boolean;
}): boolean {
  return viewportWidth >= 768 || (showMapViewOnMobile && !isLocationDetail);
}
