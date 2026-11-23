import { render, screen } from "@testing-library/react";
import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "test-api-key";
});

vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  Map: ({ children }: { children: ReactNode }) => (
    <div data-testid="location-mini-map">{children}</div>
  ),
  Marker: () => <div data-testid="location-marker" />,
}));

vi.mock("@/components/location-stub-marker", () => ({ default: () => null }));

import StreetView from "@/components/location-detail/street-view";
import { type YourPeerLegacyLocationData } from "@/components/common";

const LOCATION = {
  lat: 40.6319,
  lng: -74.0298,
  closed: false,
  name: "Example location",
  streetview: null,
} as YourPeerLegacyLocationData;

describe("StreetView", () => {
  it("keeps the interactive location map and marker for the mobile layout", () => {
    render(<StreetView location={LOCATION} />);

    expect(screen.getByTestId("location-mini-map")).toBeInTheDocument();
    expect(screen.getByTestId("location-marker")).toBeInTheDocument();
    expect(
      document.querySelector("#miniMap")?.parentElement?.className,
    ).toContain("md:hidden");
    expect(
      screen.getAllByRole("link", { name: "Open Street View" })[1],
    ).toHaveAttribute("href", expect.stringContaining("google.com/maps"));
  });

  it("keeps the static Street View image for desktop", () => {
    render(<StreetView location={LOCATION} />);

    const image = document.querySelector("img");
    expect(image).not.toBeNull();
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image?.className).toContain("object-cover");
  });

  it("does not render a map or preview for closed locations", () => {
    const { container } = render(
      <StreetView location={{ ...LOCATION, closed: true }} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
