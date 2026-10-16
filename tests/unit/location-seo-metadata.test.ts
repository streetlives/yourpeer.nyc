import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/streetlives-api-service", () => ({
  Error404Response: class extends Error {},
  fetchLocationsDetailData: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_HTTP_ERROR_FALLBACK;404");
  }),
}));

import { generateMetadata } from "@/components/metadata";
import {
  Error404Response,
  fetchLocationsDetailData,
} from "@/components/streetlives-api-service";

const props = {
  params: Promise.resolve({
    route: "locations",
    locationSlugOrPersonalCareSubCategory: "example",
  }),
  searchParams: Promise.resolve({}),
};

describe("location SEO metadata", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stops unavailable location metadata with a 404", async () => {
    vi.mocked(fetchLocationsDetailData).mockRejectedValue(
      new Error404Response(),
    );
    await expect(generateMetadata(props)).rejects.toThrow(
      "NEXT_HTTP_ERROR_FALLBACK;404",
    );
  });

  it.each([new Error("NEXT_REDIRECT"), new Error("API unavailable")])(
    "preserves redirects and server failures instead of swallowing them",
    async (error) => {
      vi.mocked(fetchLocationsDetailData).mockRejectedValue(error);
      await expect(generateMetadata(props)).rejects.toBe(error);
    },
  );
});
