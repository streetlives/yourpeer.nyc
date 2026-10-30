import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fixture from "../fixtures/location-detail.json";
import type { LocationDetailData } from "@/components/common";

const { router } = vi.hoisted(() => ({ router: { push: vi.fn() } }));

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("next/link", () => ({
  default: ({
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
}));
vi.mock("@/components/common", () => ({
  CATEGORIES: [],
  CATEGORY_ICON_SRC_MAP: {},
  LOCATION_ROUTE: "locations",
  getIconPath: vi.fn(),
  getServicesWrapper: vi.fn(),
}));
vi.mock("@/components/locations-container", () => ({
  ServicesList: () => null,
}));
vi.mock("@/lib/store", () => ({
  useFilters: (
    selector: (state: { setDetailPanelLoading: () => void }) => unknown,
  ) => selector({ setDetailPanelLoading: vi.fn() }),
  useViewStore: (
    selector: (state: { setShowMapViewOnMobile: () => void }) => unknown,
  ) => selector({ setShowMapViewOnMobile: vi.fn() }),
}));
vi.mock("@/components/streetlives-api-service", () => ({
  fetchLocationsDetailData: vi.fn(),
  map_gogetta_to_yourpeer: vi.fn((location: LocationDetailData) => ({
    name: location.name,
    area: "Manhattan",
    last_updated: "Today",
    closed: false,
    slug: `/locations/${location.slug}`,
  })),
}));

import { MobileTray } from "@/components/mobile-tray";
import {
  fetchLocationsDetailData,
  map_gogetta_to_yourpeer,
} from "@/components/streetlives-api-service";

const location = fixture as unknown as LocationDetailData;

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe("mobile tray availability", () => {
  const setSelectedSlug = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchLocationsDetailData).mockReset();
  });
  afterEach(cleanup);

  it.each(["404", "API unavailable", "NEXT_REDIRECT"])(
    "closes the tray and opens the server route when loading rejects with %s",
    async (message) => {
      vi.mocked(fetchLocationsDetailData).mockRejectedValueOnce(
        new Error(message),
      );
      render(
        <MobileTray
          locationSlugClickedOnMobile="unavailable/location"
          setLocationSlugClickedOnMobile={setSelectedSlug}
        />,
      );

      await waitFor(() => {
        expect(setSelectedSlug).toHaveBeenCalledExactlyOnceWith(undefined);
        expect(router.push).toHaveBeenCalledExactlyOnceWith(
          "/locations/unavailable%2Flocation",
        );
      });
    },
  );

  it("ignores a late successful load after the selected marker changes", async () => {
    const first = deferred<LocationDetailData>();
    const second = deferred<LocationDetailData>();
    vi.mocked(fetchLocationsDetailData)
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const { rerender } = render(
      <MobileTray
        locationSlugClickedOnMobile="first"
        setLocationSlugClickedOnMobile={setSelectedSlug}
      />,
    );

    rerender(
      <MobileTray
        locationSlugClickedOnMobile="second"
        setLocationSlugClickedOnMobile={setSelectedSlug}
      />,
    );
    await act(async () => {
      second.resolve({ ...location, name: "Current location", slug: "second" });
    });
    expect(
      screen.getByRole("heading", { name: "Current location" }),
    ).toBeVisible();

    await act(async () => {
      first.resolve({ ...location, name: "Previous location", slug: "first" });
    });
    expect(
      screen.getByRole("heading", { name: "Current location" }),
    ).toBeVisible();
    expect(map_gogetta_to_yourpeer).toHaveBeenCalledTimes(1);
    expect(setSelectedSlug).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });

  it("ignores a late failed load after the selected marker changes", async () => {
    const first = deferred<LocationDetailData>();
    vi.mocked(fetchLocationsDetailData)
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce({ ...location, name: "Current location" });
    const { rerender } = render(
      <MobileTray
        locationSlugClickedOnMobile="first"
        setLocationSlugClickedOnMobile={setSelectedSlug}
      />,
    );

    rerender(
      <MobileTray
        locationSlugClickedOnMobile="second"
        setLocationSlugClickedOnMobile={setSelectedSlug}
      />,
    );
    await screen.findByRole("heading", { name: "Current location" });
    await act(async () => {
      first.reject(new Error("No service hours"));
    });

    expect(
      screen.getByRole("heading", { name: "Current location" }),
    ).toBeVisible();
    expect(setSelectedSlug).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });

  it.each(["resolve", "reject"] as const)(
    "ignores a late %s after the tray unmounts",
    async (settlement) => {
      const pending = deferred<LocationDetailData>();
      vi.mocked(fetchLocationsDetailData).mockReturnValueOnce(pending.promise);
      const { unmount } = render(
        <MobileTray
          locationSlugClickedOnMobile="first"
          setLocationSlugClickedOnMobile={setSelectedSlug}
        />,
      );
      unmount();

      await act(async () => {
        if (settlement === "resolve") pending.resolve(location);
        else pending.reject(new Error("No service hours"));
      });

      expect(map_gogetta_to_yourpeer).not.toHaveBeenCalled();
      expect(setSelectedSlug).not.toHaveBeenCalled();
      expect(router.push).not.toHaveBeenCalled();
    },
  );
});
