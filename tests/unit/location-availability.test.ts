import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fixture from "../fixtures/location-detail.json";
import type { LocationDetailData } from "@/components/common";

vi.mock("next/navigation", () => ({
  permanentRedirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));
vi.mock("@/components/auth", () => ({ getAuthToken: vi.fn() }));

import { permanentRedirect } from "next/navigation";
import { hasServiceHours } from "@/components/location-availability";
import {
  Error404Response,
  Error5XXResponse,
  fetchLocationsDetailData,
} from "@/components/streetlives-api-service";

const active = fixture as unknown as LocationDetailData;
const noServices = { ...active, Services: [] };
const noHours = {
  ...active,
  Services: active.Services.map((service) => ({
    ...service,
    HolidaySchedules: [],
  })),
};
const closedHours = {
  ...active,
  Services: active.Services.map((service) => ({
    ...service,
    HolidaySchedules: service.HolidaySchedules.map((schedule) => ({
      ...schedule,
      closed: true,
    })),
  })),
};
const reply = (status: number, data?: unknown) => ({
  status,
  json: vi.fn().mockResolvedValue(data),
});

describe("service hours availability", () => {
  it("keeps closed services eligible regardless of retained time values", () => {
    expect(hasServiceHours(closedHours)).toBe(true);
    expect(
      hasServiceHours({
        Services: [
          {
            HolidaySchedules: [
              { closed: true, opens_at: null, closes_at: null },
            ],
          },
        ],
      } as never),
    ).toBe(true);
  });

  it("accepts open hours alongside closed rows with retained times", () => {
    expect(
      hasServiceHours({
        Services: [...closedHours.Services, ...active.Services],
      }),
    ).toBe(true);
  });

  it("rejects only missing services or entirely unknown service hours", () => {
    expect(hasServiceHours(active)).toBe(true);
    expect(hasServiceHours(noServices)).toBe(false);
    expect(hasServiceHours(noHours)).toBe(false);
    for (const times of [
      { opens_at: null, closes_at: null },
      { closed: null, opens_at: null, closes_at: null },
      { closed: false, opens_at: null, closes_at: null },
    ]) {
      const location = structuredClone(active);
      location.Services.forEach((service) => {
        service.HolidaySchedules = [times] as never;
      });
      expect(hasServiceHours(location)).toBe(false);
    }
  });

  it.each([
    { opens_at: "09:00", closes_at: null },
    { opens_at: null, closes_at: "17:00" },
  ])(
    "accepts either recorded time without requiring a complete pair",
    (times) => {
      expect(
        hasServiceHours({ Services: [{ HolidaySchedules: [times] }] } as never),
      ).toBe(true);
    },
  );

  it("accepts one service with hours among services without hours", () => {
    expect(
      hasServiceHours({
        Services: [...noHours.Services, ...active.Services],
      }),
    ).toBe(true);
  });
});

describe("location page lookup", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each([noServices, noHours])(
    "returns a temporary 404 without consulting history for an unavailable current slug",
    async (location) => {
      fetchMock.mockResolvedValueOnce(reply(200, location));
      await expect(
        fetchLocationsDetailData(active.slug),
      ).rejects.toBeInstanceOf(Error404Response);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(permanentRedirect).not.toHaveBeenCalled();
    },
  );

  it("recovers the same URL as soon as service hours return", async () => {
    fetchMock
      .mockResolvedValueOnce(reply(200, noHours))
      .mockResolvedValueOnce(reply(200, active));
    await expect(fetchLocationsDetailData(active.slug)).rejects.toBeInstanceOf(
      Error404Response,
    );
    await expect(fetchLocationsDetailData(active.slug)).resolves.toEqual(
      active,
    );
    for (const [, options] of fetchMock.mock.calls) {
      expect(options.cache).toBe("no-store");
    }
  });

  it("permanently redirects a historical slug directly to an available current slug", async () => {
    fetchMock
      .mockResolvedValueOnce(reply(404))
      .mockResolvedValueOnce(reply(200, { slug: active.slug }))
      .mockResolvedValueOnce(reply(200, active));
    await expect(fetchLocationsDetailData("old-slug")).rejects.toThrow(
      `redirect:/locations/${active.slug}`,
    );
    expect(permanentRedirect).toHaveBeenCalledWith(`/locations/${active.slug}`);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][0]).toContain(
      `/locations-by-slug/${active.slug}`,
    );
  });

  it("keeps historical slugs at 404 until the current location has hours", async () => {
    fetchMock
      .mockResolvedValueOnce(reply(404))
      .mockResolvedValueOnce(reply(200, { slug: active.slug }))
      .mockResolvedValueOnce(reply(200, noHours));
    await expect(fetchLocationsDetailData("old-slug")).rejects.toBeInstanceOf(
      Error404Response,
    );
    expect(permanentRedirect).not.toHaveBeenCalled();
  });

  it("does not turn an API failure into a redirect or 404", async () => {
    const failure = reply(503);
    fetchMock.mockResolvedValueOnce(failure);
    await expect(fetchLocationsDetailData(active.slug)).rejects.toBeInstanceOf(
      Error5XXResponse,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(failure.json).not.toHaveBeenCalled();
  });

  it("handles a missing alias without parsing a possibly non-JSON error body", async () => {
    const missing = reply(404);
    fetchMock.mockResolvedValueOnce(reply(404)).mockResolvedValueOnce(missing);
    await expect(fetchLocationsDetailData("unknown")).rejects.toBeInstanceOf(
      Error404Response,
    );
    expect(missing.json).not.toHaveBeenCalled();
  });

  it("propagates redirect lookup outages", async () => {
    fetchMock
      .mockResolvedValueOnce(reply(404))
      .mockResolvedValueOnce(reply(503));
    await expect(fetchLocationsDetailData("old")).rejects.toBeInstanceOf(
      Error5XXResponse,
    );
  });

  it.each([undefined, null, "", 123, "old"])(
    "rejects an invalid or looping history target (%s)",
    async (slug) => {
      fetchMock
        .mockResolvedValueOnce(reply(404))
        .mockResolvedValueOnce(reply(200, { slug }));
      await expect(fetchLocationsDetailData("old")).rejects.toBeInstanceOf(
        Error404Response,
      );
      expect(fetchMock).toHaveBeenCalledTimes(2);
    },
  );

  it.each([404, 503])(
    "handles a missing or failing current target (%s)",
    async (status) => {
      fetchMock
        .mockResolvedValueOnce(reply(404))
        .mockResolvedValueOnce(reply(200, { slug: active.slug }))
        .mockResolvedValueOnce(reply(status));
      await expect(fetchLocationsDetailData("old")).rejects.toBeInstanceOf(
        status === 404 ? Error404Response : Error5XXResponse,
      );
      expect(permanentRedirect).not.toHaveBeenCalled();
    },
  );
});
