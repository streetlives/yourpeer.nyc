import { describe, expect, it } from "vitest";
import { shouldLoadGoogleMap } from "@/components/map-loading";

describe("shouldLoadGoogleMap", () => {
  it("does not load a map behind a hidden mobile location detail panel", () => {
    expect(
      shouldLoadGoogleMap({
        viewportWidth: 390,
        showMapViewOnMobile: false,
        isLocationDetail: true,
      }),
    ).toBe(false);
  });

  it("does not load the hidden map when a mobile location detail route is opened", () => {
    expect(
      shouldLoadGoogleMap({
        viewportWidth: 390,
        showMapViewOnMobile: true,
        isLocationDetail: true,
      }),
    ).toBe(false);
  });

  it("loads the map for a mobile list page after the map toggle changes", () => {
    const mobileList = { viewportWidth: 390, isLocationDetail: false };

    expect(
      shouldLoadGoogleMap({ ...mobileList, showMapViewOnMobile: false }),
    ).toBe(false);
    expect(
      shouldLoadGoogleMap({ ...mobileList, showMapViewOnMobile: true }),
    ).toBe(true);
  });

  it("re-evaluates to load the map after a resize to desktop", () => {
    expect(
      shouldLoadGoogleMap({
        viewportWidth: 1024,
        showMapViewOnMobile: false,
        isLocationDetail: true,
      }),
    ).toBe(true);
  });

  it("loads the map on desktop regardless of the mobile toggle state", () => {
    expect(
      shouldLoadGoogleMap({
        viewportWidth: 768,
        showMapViewOnMobile: false,
        isLocationDetail: false,
      }),
    ).toBe(true);
  });
});
