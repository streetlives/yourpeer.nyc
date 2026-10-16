import { beforeEach, describe, expect, it, vi } from "vitest";
import detail from "../fixtures/location-detail.json";
import type { SimplifiedLocationData } from "@/components/common";

vi.mock("@/components/streetlives-api-service", () => ({
  Error404Response: class extends Error {},
  getSimplifiedLocationData: vi.fn(),
  fetchLocationsData: vi.fn(),
}));

import sitemap from "@/app/sitemap";
import {
  fetchLocationsData,
  getSimplifiedLocationData,
} from "@/components/streetlives-api-service";

describe("location sitemap availability", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the API availability flag to omit unavailable locations", async () => {
    vi.mocked(getSimplifiedLocationData).mockResolvedValue([
      { slug: "active", has_service_hours: true },
      { slug: "unavailable", has_service_hours: false },
    ] as SimplifiedLocationData[]);
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).toContain("https://yourpeer.nyc/locations/active");
    expect(urls).not.toContain("https://yourpeer.nyc/locations/unavailable");
    expect(fetchLocationsData).not.toHaveBeenCalled();
  });

  it("supports an older API using one unpaginated full search", async () => {
    vi.mocked(getSimplifiedLocationData).mockResolvedValue([
      { slug: "active" },
    ] as SimplifiedLocationData[]);
    vi.mocked(fetchLocationsData).mockResolvedValue({
      locations: [
        { ...detail, slug: "active" },
        { ...detail, slug: "no-services", Services: [] },
        {
          ...detail,
          slug: "no-hours",
          Services: detail.Services.map((service) => ({
            ...service,
            HolidaySchedules: [],
          })),
        },
      ],
      numberOfPages: 0,
      resultCount: 3,
    } as never);
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).toContain("https://yourpeer.nyc/locations/active");
    expect(urls).not.toContain("https://yourpeer.nyc/locations/no-services");
    expect(urls).not.toContain("https://yourpeer.nyc/locations/no-hours");
    expect(fetchLocationsData).toHaveBeenCalledExactlyOnceWith({
      taxonomies: null,
      location_fields_only: false,
    });
  });
});
