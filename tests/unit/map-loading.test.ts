import { describe, expect, it } from "vitest";
import { shouldLoadGoogleMap } from "@/components/map-loading";

describe("shouldLoadGoogleMap", () => {
  it("does not load a map behind a hidden mobile location detail panel", () => {
    expect(
      shouldLoadGoogleMap({
        viewportWidth: 390,
        showMapViewOnMobile: false,
      }),
    ).toBe(false);
  });

  it("loads the map when a mobile location detail user selects map view", () => {
    expect(
      shouldLoadGoogleMap({
        viewportWidth: 390,
        showMapViewOnMobile: true,
      }),
    ).toBe(true);
  });

  it("loads the map for a mobile list page after the map toggle changes", () => {
    const mobileList = { viewportWidth: 390 };

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
      }),
    ).toBe(true);
  });

  it("loads the map on desktop regardless of the mobile toggle state", () => {
    expect(
      shouldLoadGoogleMap({
        viewportWidth: 768,
        showMapViewOnMobile: false,
      }),
    ).toBe(true);
  });
});
