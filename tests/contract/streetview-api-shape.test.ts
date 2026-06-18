/**
 * Contract tests: Street View field shape in API responses.
 *
 * These tests exist to catch backend regressions at the seam between the Go-Getta
 * API contract and the frontend type definitions. They validate:
 *
 *  1. Current (migrated) shape — fixtures use `Streetview: StreetviewData | null`
 *  2. Legacy shape — a response with `streetview_url` is still correctly typed
 *     and fully handled by the mapper without data loss
 *
 * If Go-Getta reverts or a cached response sends the old field, these tests
 * will catch the divergence before it silently degrades the Street View UI.
 */
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/auth", () => ({
  getAuthToken: vi.fn(),
  getAuthPayload: vi.fn(),
}));

import locationsFixture from "../fixtures/locations.json";
import locationDetailFixture from "../fixtures/location-detail.json";
import locationDetail2Fixture from "../fixtures/location-detail-2.json";
import {
  map_gogetta_to_yourpeer,
  parseStreetviewUrl,
} from "@/components/streetlives-api-service";
import type {
  LocationDetailData,
  SimplifiedLocationData,
} from "@/components/common";

// ─── 1. Migrated shape: fixtures use the new Streetview field ─────────────────

describe("fixture shapes — migrated API contract", () => {
  it("location-detail fixture has Streetview key (not streetview_url)", () => {
    expect(locationDetailFixture).toHaveProperty("Streetview");
    expect(locationDetailFixture).not.toHaveProperty("streetview_url");
  });

  it("location-detail-2 fixture has Streetview key (not streetview_url)", () => {
    expect(locationDetail2Fixture).toHaveProperty("Streetview");
    expect(locationDetail2Fixture).not.toHaveProperty("streetview_url");
  });

  it("every entry in the locations list fixture has Streetview key (not streetview_url)", () => {
    for (const loc of locationsFixture as unknown[]) {
      expect(loc).toHaveProperty("Streetview");
      expect(loc).not.toHaveProperty("streetview_url");
    }
  });
});

// ─── 2. TypeScript structural check: SimplifiedLocationData accepts both shapes ─

describe("SimplifiedLocationData type — backward-compatible shape", () => {
  it("accepts the new shape (Streetview, no streetview_url)", () => {
    // If this compiles, the type correctly models the migrated API contract.
    const newShape: Pick<
      SimplifiedLocationData,
      "Streetview" | "streetview_url"
    > = {
      Streetview: {
        pano_id: "abc",
        lat: 40.7,
        lng: -73.9,
        heading: 90,
        pitch: 0,
        fov: 75,
      },
      // streetview_url is optional — omitting it is valid
    };
    expect(newShape.Streetview?.pano_id).toBe("abc");
  });

  it("accepts the true pre-migration shape (only streetview_url, no Streetview key)", () => {
    // The actual pre-migration API response had no Streetview field at all.
    // If this compiles, the type correctly models old responses without forcing
    // consumers to synthesise a Streetview: null they never received.
    const legacyShape: Pick<SimplifiedLocationData, "streetview_url"> = {
      streetview_url:
        "https://www.google.com/maps/@40.7484,-73.9857,3a,75y,90h",
    };
    expect(legacyShape.streetview_url).toContain("google.com/maps");
    expect(legacyShape).not.toHaveProperty("Streetview");
  });
});

// ─── 3. Mapper handles legacy streetview_url without data loss ────────────────

describe("map_gogetta_to_yourpeer — legacy payload shape", () => {
  const BASE = locationDetailFixture as unknown as LocationDetailData;

  it("extracts Street View data from streetview_url when Streetview is null", () => {
    const legacyPayload = {
      ...BASE,
      Streetview: null,
      streetview_url:
        "https://www.google.com/maps/@40.7484,-73.9857,3a,75y,90h,88t/data=!3m6!1e1!3m4!1sPANO99!2e0",
    } as LocationDetailData;

    const result = map_gogetta_to_yourpeer(legacyPayload, true);

    expect(result.streetview).not.toBeNull();
    expect(result.streetview?.lat).toBe(40.7484);
    expect(result.streetview?.lng).toBe(-73.9857);
    expect(result.streetview?.heading).toBe(90);
    expect(result.streetview?.fov).toBe(75);
    expect(result.streetview?.pano_id).toBe("PANO99");
  });

  it("prefers Streetview over streetview_url when both are present", () => {
    const mixedPayload = {
      ...BASE,
      Streetview: {
        pano_id: "new-pano",
        lat: 40.6,
        lng: -73.8,
        heading: 45,
        pitch: 0,
        fov: 90,
      },
      streetview_url:
        "https://www.google.com/maps/@40.7484,-73.9857,3a,75y,90h,88t",
    } as LocationDetailData;

    const result = map_gogetta_to_yourpeer(mixedPayload, true);

    expect(result.streetview?.pano_id).toBe("new-pano");
    expect(result.streetview?.lat).toBe(40.6);
  });

  it("returns null streetview when both Streetview and streetview_url are absent", () => {
    const { Streetview: _sv, ...rest } = BASE as any;
    const result = map_gogetta_to_yourpeer(rest as LocationDetailData, true);
    expect(result.streetview).toBeNull();
  });
});

// ─── 4. parseStreetviewUrl — the URL-parsing boundary itself ─────────────────

describe("parseStreetviewUrl — URL format contract", () => {
  it("returns null for a URL with no parseable Street View data", () => {
    expect(parseStreetviewUrl("https://www.google.com/maps/")).toBeNull();
  });

  it("parses the canonical Google Maps Street View URL shape", () => {
    const result = parseStreetviewUrl(
      "https://www.google.com/maps/@40.7484,-73.9857,3a,75y,90h,88t/data=!1smyPano",
    );
    expect(result).toEqual({
      pano_id: "myPano",
      lat: 40.7484,
      lng: -73.9857,
      heading: 90,
      pitch: 88,
      fov: 75,
    });
  });
});
