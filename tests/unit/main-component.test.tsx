import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const route = vi.hoisted(() => ({ pathname: "/locations" }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
}));

vi.mock("@/components/filters-popup", () => ({ default: () => null }));

import { MainComponent } from "@/components/main-component";
import { useViewStore } from "@/lib/store";

describe("MainComponent mobile route transitions", () => {
  beforeEach(() => {
    useViewStore.setState({ showMapViewOnMobile: false });
    route.pathname = "/locations";
  });

  it("resets map view and displays location details after navigating from the mobile map", () => {
    route.pathname = "/locations/example-location";
    useViewStore.setState({ showMapViewOnMobile: true });

    render(<MainComponent mapContainer={<div />} sidePanel={<div />} />);

    expect(screen.getByRole("main")).toHaveClass("hideMapOnMobile");
    expect(useViewStore.getState().showMapViewOnMobile).toBe(false);
  });

  it("continues to show the map for non-detail mobile routes", () => {
    useViewStore.setState({ showMapViewOnMobile: true });

    render(<MainComponent mapContainer={<div />} sidePanel={<div />} />);

    expect(screen.getByRole("main")).toHaveClass("showMapOnMobile");
  });
});
