import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/auth", () => ({
  getAuthToken: vi.fn(),
  getAuthPayload: vi.fn(),
}));

import locationDetailFixture from "../fixtures/location-detail.json";
import { map_gogetta_to_yourpeer } from "@/components/streetlives-api-service";
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

  it("treats an absent Streetview field as null (backward-compat with old API shape)", () => {
    const { Streetview: _omitted, ...rest } = BASE as any;
    const result = map_gogetta_to_yourpeer(rest as LocationDetailData, true);
    expect(result.streetview).toBeNull();
  });
});
