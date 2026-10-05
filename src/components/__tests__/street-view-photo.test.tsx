// The organization-provided photo replacing the Google Street View still.
//
// Scope of the change under test: the desktop frame only. The mobile branch
// renders an interactive mini map rather than an image, and deliberately still
// does — so these tests also pin that the map is untouched.
//
// @vis.gl/react-google-maps is mocked because the mobile branch mounts
// APIProvider unconditionally and would otherwise try to load the Maps SDK.

import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// TranslatableText reads the target language from a cookie; the rest of the
// suite stubs this module the same way.
vi.mock("next-client-cookies", () => ({ useCookies: vi.fn() }));

vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="maps-api-provider">{children}</div>
  ),
  Map: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="mini-map">{children}</div>
  ),
  Marker: () => <div data-testid="marker" />,
  useMap: () => null,
}));

vi.mock("@/components/location-stub-marker", () => ({
  default: () => <div data-testid="location-stub-marker" />,
}));

import StreetView from "@/components/location-detail/street-view";
import { LanguageTranslationContext } from "@/components/language-translation-context";
import type {
  LocationPhotoData,
  YourPeerLegacyLocationData,
} from "@/components/common";

const PHOTO: LocationPhotoData = {
  url: "https://photos.yourpeer.nyc/location-photos/abc/def.jpg",
  content_type: "image/jpeg",
  byte_size: 548000,
  width: 1600,
  height: 1200,
  original_filename: "storefront.jpg",
};

const baseLocation = (
  overrides: Partial<YourPeerLegacyLocationData> = {},
): YourPeerLegacyLocationData =>
  ({
    id: "loc-1",
    name: "SameCare",
    lat: 40.7128,
    lng: -74.006,
    closed: false,
    streetview: null,
    photo: null,
    ...overrides,
  }) as YourPeerLegacyLocationData;

const CAPTION = "Organization's Image";

// TranslatableText reads gTranslateCookie off this context and throws without a
// provider. English is the default, so the raw strings render as written.
const renderStreetView = (location: YourPeerLegacyLocationData) =>
  render(
    <LanguageTranslationContext.Provider
      value={{ gTranslateCookie: "en|en", setGTranslateCookie: () => {} }}
    >
      <StreetView location={location} />
    </LanguageTranslationContext.Provider>,
  );

// The desktop still is the only <img> in the tree; the mobile branch is a map.
const desktopImage = () =>
  screen.getAllByRole("presentation", { hidden: true })[0] as HTMLImageElement;

beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "test-api-key");
});

describe("StreetView with no organization photo", () => {
  it("shows Google's Street View still", () => {
    renderStreetView(baseLocation());

    expect(desktopImage().getAttribute("src")).toContain(
      "maps.googleapis.com/maps/api/streetview",
    );
  });

  it("shows no caption", () => {
    renderStreetView(baseLocation());

    expect(screen.queryByText(CAPTION)).not.toBeInTheDocument();
  });

  it("keeps the Street View still at its fixed height", () => {
    renderStreetView(baseLocation());

    const box = desktopImage().closest("a");
    expect(box).toHaveClass("h-72");
    expect(screen.queryByTestId("photo-ratio")).not.toBeInTheDocument();
    expect(desktopImage()).not.toHaveClass("absolute");
  });
});

describe("StreetView with an organization photo", () => {
  it("shows the photo instead of the Street View still", () => {
    renderStreetView(baseLocation({ photo: PHOTO }));

    const src = desktopImage().getAttribute("src");
    expect(src).toBe(PHOTO.url);
    expect(src).not.toContain("maps.googleapis.com");
  });

  // Uploads are cropped to 5:3 in streetlives-web's cropper, which promises
  // the specialist that its frame is exactly what shows here.
  it("frames the photo at the 5:3 it was cropped to", () => {
    renderStreetView(baseLocation({ photo: PHOTO }));

    const box = desktopImage().closest("a");
    expect(box).not.toHaveClass("h-72");
    // Padding, not aspect-ratio, which Safari 14 does not support. The real
    // geometry is measured in tests/e2e/street-view-photo.spec.ts.
    expect(box?.className).not.toMatch(/aspect-/);
    expect(screen.getByTestId("photo-ratio")).toHaveClass("pt-[60%]");
    expect(desktopImage()).toHaveClass("absolute", "inset-0");
  });

  it("captions it so it is not mistaken for Street View imagery", () => {
    renderStreetView(baseLocation({ photo: PHOTO }));

    expect(screen.getByText(CAPTION)).toBeInTheDocument();
  });

  // The photo replaces the thumbnail only. The link still goes to Google so
  // people can look around the block and see the current panorama.
  it("still links out to Google Street View", () => {
    renderStreetView(baseLocation({ photo: PHOTO }));

    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      expect(link.getAttribute("href")).toContain(
        "google.com/maps/@?api=1&map_action=pano",
      );
    });
  });

  it("keeps the Open Street View pill", () => {
    renderStreetView(baseLocation({ photo: PHOTO }));

    expect(screen.getAllByText("Open Street View").length).toBeGreaterThan(0);
  });

  it("leaves the mobile mini map in place", () => {
    renderStreetView(baseLocation({ photo: PHOTO }));

    expect(screen.getByTestId("mini-map")).toBeInTheDocument();
  });

  // The API composes the url at read time and returns null when photo storage
  // is unconfigured, so a row can exist with no usable url.
  it("falls back to Street View when the photo has no url", () => {
    const photo = { ...PHOTO, url: null };
    renderStreetView(baseLocation({ photo }));

    expect(desktopImage().getAttribute("src")).toContain("maps.googleapis.com");
    expect(screen.queryByText(CAPTION)).not.toBeInTheDocument();
  });
});

describe("StreetView for a closed location", () => {
  it("renders nothing at all, photo or not", () => {
    const { container } = renderStreetView(
      baseLocation({ photo: PHOTO, closed: true }),
    );

    expect(container).toBeEmptyDOMElement();
  });
});
