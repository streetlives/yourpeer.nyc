import { act, render, screen } from "@testing-library/react";
import { type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "test-api-key";
});

vi.mock("next-client-cookies", () => ({
  useCookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/locations/example",
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="google-map-provider">{children}</div>
  ),
  Map: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Marker: () => null,
  useMap: () => null,
}));

vi.mock("@/components/location-stub-marker", () => ({ default: () => null }));
vi.mock("@/components/mobile-tray", () => ({ MobileTray: () => null }));

import LocationsMap from "@/components/map";
import { GeoCoordinatesContext } from "@/components/geo-context";
import { useViewStore } from "@/lib/store";
import { type SimplifiedLocationData } from "@/components/common";

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
}

function renderMap(locationDetailStub?: SimplifiedLocationData) {
  return render(
    <GeoCoordinatesContext.Provider
      value={{ userPosition: undefined, refreshUserPosition: vi.fn() }}
    >
      <LocationsMap locationDetailStub={locationDetailStub} />
    </GeoCoordinatesContext.Provider>,
  );
}

describe("LocationsMap responsive loading", () => {
  beforeEach(() => {
    useViewStore.setState({ showMapViewOnMobile: false });
  });

  it("initializes Google Maps on desktop", () => {
    setViewportWidth(1024);
    renderMap();

    expect(screen.getByTestId("google-map-provider")).toBeInTheDocument();
  });

  it("defers Google Maps on mobile until the map toggle is selected", () => {
    setViewportWidth(390);
    renderMap();

    expect(screen.queryByTestId("google-map-provider")).not.toBeInTheDocument();

    act(() => useViewStore.getState().setShowMapViewOnMobile(true));

    expect(screen.getByTestId("google-map-provider")).toBeInTheDocument();
  });

  it("does not initialize a hidden map on a mobile location detail route", () => {
    setViewportWidth(390);
    useViewStore.setState({ showMapViewOnMobile: true });
    renderMap({} as SimplifiedLocationData);

    expect(screen.queryByTestId("google-map-provider")).not.toBeInTheDocument();
  });

  it("preserves an initialized map while resizing in both directions", () => {
    setViewportWidth(1024);
    renderMap();
    expect(screen.getByTestId("google-map-provider")).toBeInTheDocument();

    act(() => {
      setViewportWidth(390);
      window.dispatchEvent(new Event("resize"));
    });
    expect(screen.getByTestId("google-map-provider")).toBeInTheDocument();

    act(() => {
      setViewportWidth(1024);
      window.dispatchEvent(new Event("resize"));
    });
    expect(screen.getByTestId("google-map-provider")).toBeInTheDocument();
  });

  it("preserves an initialized map when mobile map view is toggled", () => {
    setViewportWidth(390);
    renderMap();

    act(() => useViewStore.getState().setShowMapViewOnMobile(true));
    expect(screen.getByTestId("google-map-provider")).toBeInTheDocument();

    act(() => useViewStore.getState().setShowMapViewOnMobile(false));
    expect(screen.getByTestId("google-map-provider")).toBeInTheDocument();

    act(() => useViewStore.getState().setShowMapViewOnMobile(true));
    expect(screen.getByTestId("google-map-provider")).toBeInTheDocument();
  });
});
