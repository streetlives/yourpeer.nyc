import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/auth", () => ({
  getAuthToken: vi.fn(),
  getAuthPayload: vi.fn(),
}));

import locationDetailFixture from "../fixtures/location-detail.json";
import {
  map_gogetta_to_yourpeer,
  parseStreetviewUrl,
} from "@/components/streetlives-api-service";
import type { LocationDetailData } from "@/components/common";

const BASE = locationDetailFixture as unknown as LocationDetailData;

describe("map_gogetta_to_yourpeer — Streetview mapping", () => {
  it("maps null Streetview to null streetview", () => {
    const result = map_gogetta_to_yourpeer(BASE, true);
    expect(result.streetview).toBeNull();
  });

  it("passes a non-null Streetview payload through to streetview", () => {
    const fixture = {
      ...BASE,
      Streetview: {
        pano_id: "test-pano-123",
        lat: 40.6892,
        lng: -74.0445,
        heading: 90,
        pitch: -5,
        fov: 75,
      },
    } as LocationDetailData;
    const result = map_gogetta_to_yourpeer(fixture, true);
    expect(result.streetview).toEqual({
      pano_id: "test-pano-123",
      lat: 40.6892,
      lng: -74.0445,
      heading: 90,
      pitch: -5,
      fov: 75,
    });
  });

  it("treats an absent Streetview field as null when no streetview_url is present", () => {
    const { Streetview: _omitted, ...rest } = BASE as any;
    const result = map_gogetta_to_yourpeer(rest as LocationDetailData, true);
    expect(result.streetview).toBeNull();
  });

  it("falls back to parsed streetview_url when Streetview is absent", () => {
    // Backward-compat: if the backend still returns the legacy Google Maps URL,
    // parse it into a StreetviewData object so custom views are not silently dropped.
    const fixture = {
      ...BASE,
      Streetview: null,
      streetview_url:
        "https://www.google.com/maps/@40.7484,-73.9857,3a,75y,90h,88t/data=!3m6!1e1!3m4!1sabc123pano!2e0",
    } as any;
    const result = map_gogetta_to_yourpeer(fixture as LocationDetailData, true);
    expect(result.streetview).toEqual({
      pano_id: "abc123pano",
      lat: 40.7484,
      lng: -73.9857,
      heading: 90,
      pitch: 88,
      fov: 75,
    });
  });

  it("prefers Streetview over streetview_url when both are present", () => {
    const fixture = {
      ...BASE,
      Streetview: {
        pano_id: "new-pano",
        lat: 40.6892,
        lng: -74.0445,
        heading: 45,
        pitch: 0,
        fov: 90,
      },
      streetview_url:
        "https://www.google.com/maps/@40.7484,-73.9857,3a,75y,90h,88t",
    } as any;
    const result = map_gogetta_to_yourpeer(fixture as LocationDetailData, true);
    expect(result.streetview?.pano_id).toBe("new-pano");
  });
});

describe("parseStreetviewUrl", () => {
  it("returns null for null input", () => {
    expect(parseStreetviewUrl(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(parseStreetviewUrl(undefined)).toBeNull();
  });

  it("returns null when the URL has no parseable Street View data", () => {
    expect(parseStreetviewUrl("https://maps.google.com/")).toBeNull();
  });

  it("parses lat/lng, heading, pitch, fov, and pano_id from a full Google Maps URL", () => {
    const url =
      "https://www.google.com/maps/@40.7484,-73.9857,3a,75y,90h,88t/data=!3m6!1e1!3m4!1sabc123!2e0";
    expect(parseStreetviewUrl(url)).toEqual({
      pano_id: "abc123",
      lat: 40.7484,
      lng: -73.9857,
      heading: 90,
      pitch: 88,
      fov: 75,
    });
  });

  it("parses a URL with pano_id but no lat/lng", () => {
    const url = "https://www.google.com/maps/!1smyPanoId!2e0";
    const result = parseStreetviewUrl(url);
    expect(result?.pano_id).toBe("myPanoId");
    expect(result?.lat).toBeNull();
    expect(result?.lng).toBeNull();
  });

  it("fills optional fields with null when absent from the URL", () => {
    const url = "https://www.google.com/maps/@40.7484,-73.9857";
    const result = parseStreetviewUrl(url);
    expect(result?.heading).toBeNull();
    expect(result?.pitch).toBeNull();
    expect(result?.fov).toBeNull();
    expect(result?.pano_id).toBeNull();
  });

  it("decodes a percent-encoded pano_id so URLSearchParams does not double-encode it", () => {
    // Real Google Maps URLs encode pano IDs; capturing the raw encoded form and
    // then passing it through URLSearchParams produces %25XX (double-encoding).
    // The parser must decodeURIComponent before storing.
    const encoded = "5G7xi0rjQI9bMsP93dBAJA%3D%3D"; // trailing == signs encoded
    const url = `https://www.google.com/maps/@40.7484,-73.9857,3a,75y,90h,88t/data=!1s${encoded}!2e0`;
    const result = parseStreetviewUrl(url);
    expect(result?.pano_id).toBe("5G7xi0rjQI9bMsP93dBAJA==");
    expect(result?.pano_id).not.toContain("%");
  });

  it("handles an already-decoded pano_id without corrupting it", () => {
    const url =
      "https://www.google.com/maps/@40.7484,-73.9857,3a,75y,90h,88t/data=!1sabc123!2e0";
    const result = parseStreetviewUrl(url);
    expect(result?.pano_id).toBe("abc123");
  });

  it("does not throw on a malformed percent-escape in the pano_id — returns raw string", () => {
    // A truncated or invalid escape like %GG would cause decodeURIComponent to
    // throw URIError. The parser must catch it and return the raw captured string
    // rather than propagating the error and breaking location rendering.
    const url =
      "https://www.google.com/maps/@40.7484,-73.9857,3a,75y,90h,88t/data=!1sBadPano%GG!2e0";
    expect(() => parseStreetviewUrl(url)).not.toThrow();
    const result = parseStreetviewUrl(url);
    expect(result?.pano_id).toBe("BadPano%GG");
  });
});

describe("map_gogetta_to_yourpeer — LocationPhoto mapping", () => {
  const PHOTO = {
    url: "https://photos.yourpeer.nyc/location-photos/abc/def.jpg",
    content_type: "image/jpeg",
    byte_size: 548000,
    width: 1600,
    height: 1200,
    original_filename: "storefront.jpg",
  };

  it("maps a missing LocationPhoto to null photo", () => {
    const result = map_gogetta_to_yourpeer(BASE, true);
    expect(result.photo).toBeNull();
  });

  it("maps an explicitly null LocationPhoto to null photo", () => {
    const fixture = { ...BASE, LocationPhoto: null } as LocationDetailData;
    expect(map_gogetta_to_yourpeer(fixture, true).photo).toBeNull();
  });

  it("passes a photo payload through", () => {
    const fixture = { ...BASE, LocationPhoto: PHOTO } as LocationDetailData;
    expect(map_gogetta_to_yourpeer(fixture, true).photo).toEqual(PHOTO);
  });

  // The photo and the Street View override are independent: a location can have
  // one, both or neither, and the API keeps them in separate tables so that
  // clearing an override cannot remove a photo.
  it("keeps photo and streetview independent", () => {
    const fixture = {
      ...BASE,
      LocationPhoto: PHOTO,
      Streetview: null,
    } as LocationDetailData;
    const result = map_gogetta_to_yourpeer(fixture, true);

    expect(result.photo).toEqual(PHOTO);
    expect(result.streetview).toBeNull();
  });

  // The API composes `url` at read time from a stored object key, and returns
  // null when photo storage is unconfigured. The UI has to treat that as "no
  // photo" rather than rendering an empty src.
  it("passes through a photo whose url is null", () => {
    const fixture = {
      ...BASE,
      LocationPhoto: { ...PHOTO, url: null },
    } as LocationDetailData;

    expect(map_gogetta_to_yourpeer(fixture, true).photo?.url).toBeNull();
  });
});
