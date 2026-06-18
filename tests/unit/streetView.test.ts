import { describe, expect, it, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "test-api-key");

import { buildStreetViewUrls } from "@/lib/streetView";

const BASE_LOCATION = { lat: 40.7484, lng: -73.9857 };

describe("buildStreetViewUrls", () => {
  describe("null streetview — falls back to location coordinates", () => {
    it("uses location lat/lng in image URL", () => {
      const { imageUrl } = buildStreetViewUrls({
        ...BASE_LOCATION,
        streetview: null,
      });
      expect(imageUrl).toContain("location=40.7484%2C-73.9857");
      expect(imageUrl).not.toContain("pano=");
    });

    it("uses viewpoint in maps URL", () => {
      const { mapsUrl } = buildStreetViewUrls({
        ...BASE_LOCATION,
        streetview: null,
      });
      expect(mapsUrl).toContain("viewpoint=40.7484%2C-73.9857");
      expect(mapsUrl).not.toContain("pano=");
    });
  });

  describe("pano_id present", () => {
    const sv = {
      pano_id: "abc123pano",
      lat: null,
      lng: null,
      heading: null,
      pitch: null,
      fov: null,
    };

    it("uses pano instead of location in image URL", () => {
      const { imageUrl } = buildStreetViewUrls({
        ...BASE_LOCATION,
        streetview: sv,
      });
      expect(imageUrl).toContain("pano=abc123pano");
      expect(imageUrl).not.toContain("location=");
    });

    it("uses pano instead of viewpoint in maps URL", () => {
      const { mapsUrl } = buildStreetViewUrls({
        ...BASE_LOCATION,
        streetview: sv,
      });
      expect(mapsUrl).toContain("pano=abc123pano");
      expect(mapsUrl).not.toContain("viewpoint=");
    });
  });

  describe("custom lat/lng without pano_id", () => {
    const sv = {
      pano_id: null,
      lat: 40.6892,
      lng: -74.0445,
      heading: null,
      pitch: null,
      fov: null,
    };

    it("uses streetview lat/lng over location coordinates", () => {
      const { imageUrl } = buildStreetViewUrls({
        ...BASE_LOCATION,
        streetview: sv,
      });
      expect(imageUrl).toContain("location=40.6892%2C-74.0445");
      expect(imageUrl).not.toContain("40.7484");
    });
  });

  describe("heading", () => {
    it("omits heading param when heading is null", () => {
      const { imageUrl, mapsUrl } = buildStreetViewUrls({
        ...BASE_LOCATION,
        streetview: {
          pano_id: null,
          lat: null,
          lng: null,
          heading: null,
          pitch: null,
          fov: null,
        },
      });
      expect(imageUrl).not.toContain("heading=");
      expect(mapsUrl).not.toContain("heading=");
    });

    it("includes heading param when provided", () => {
      const { imageUrl, mapsUrl } = buildStreetViewUrls({
        ...BASE_LOCATION,
        streetview: {
          pano_id: null,
          lat: null,
          lng: null,
          heading: 180,
          pitch: null,
          fov: null,
        },
      });
      expect(imageUrl).toContain("heading=180");
      expect(mapsUrl).toContain("heading=180");
    });
  });

  describe("pitch and fov", () => {
    it("defaults pitch to 0 and fov to 90 when null", () => {
      const { imageUrl, mapsUrl } = buildStreetViewUrls({
        ...BASE_LOCATION,
        streetview: {
          pano_id: null,
          lat: null,
          lng: null,
          heading: null,
          pitch: null,
          fov: null,
        },
      });
      expect(imageUrl).toContain("pitch=0");
      expect(imageUrl).toContain("fov=90");
      expect(mapsUrl).toContain("pitch=0");
      expect(mapsUrl).toContain("fov=90");
    });

    it("uses provided pitch and fov values", () => {
      const { imageUrl, mapsUrl } = buildStreetViewUrls({
        ...BASE_LOCATION,
        streetview: {
          pano_id: null,
          lat: null,
          lng: null,
          heading: null,
          pitch: -10,
          fov: 120,
        },
      });
      expect(imageUrl).toContain("pitch=-10");
      expect(imageUrl).toContain("fov=120");
      expect(mapsUrl).toContain("pitch=-10");
      expect(mapsUrl).toContain("fov=120");
    });
  });

  describe("full custom payload", () => {
    const sv = {
      pano_id: "xyz789",
      lat: 40.6892,
      lng: -74.0445,
      heading: 270,
      pitch: 5,
      fov: 75,
    };

    it("builds the correct image URL", () => {
      const { imageUrl } = buildStreetViewUrls({
        ...BASE_LOCATION,
        streetview: sv,
      });
      expect(imageUrl).toMatch(
        /^https:\/\/maps\.googleapis\.com\/maps\/api\/streetview\?/,
      );
      expect(imageUrl).toContain("pano=xyz789");
      expect(imageUrl).toContain("heading=270");
      expect(imageUrl).toContain("pitch=5");
      expect(imageUrl).toContain("fov=75");
      expect(imageUrl).toContain("key=test-api-key");
    });

    it("builds the correct Google Maps URL", () => {
      const { mapsUrl } = buildStreetViewUrls({
        ...BASE_LOCATION,
        streetview: sv,
      });
      expect(mapsUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/@\?/);
      expect(mapsUrl).toContain("pano=xyz789");
      expect(mapsUrl).toContain("heading=270");
      expect(mapsUrl).toContain("pitch=5");
      expect(mapsUrl).toContain("map_action=pano");
    });
  });

  describe("size option", () => {
    it("uses default size 600x400", () => {
      const { imageUrl } = buildStreetViewUrls(BASE_LOCATION);
      expect(imageUrl).toContain("size=600x400");
    });

    it("accepts a custom size", () => {
      const { imageUrl } = buildStreetViewUrls(BASE_LOCATION, {
        size: "800x600",
      });
      expect(imageUrl).toContain("size=800x600");
    });
  });
});
