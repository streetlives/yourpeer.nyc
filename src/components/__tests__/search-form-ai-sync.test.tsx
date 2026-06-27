// Tests that aiSearchEnabled stays in sync with the URL and with previousParams
// (the cookie that stores the last listing-page search params).
//
// Two navigation paths are covered:
//   1. Listing page  — aiSearchEnabled driven by the current URL's aiSearch param.
//   2. Location detail page — aiSearchEnabled driven by previousParams.searchParams.aiSearch
//      because the detail-page URL does not carry the aiSearch flag.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import type { PreviousParams } from "@/components/get-previous-params";

// vi.hoisted ensures the state object is created before vi.mock factories run,
// so every factory closure can safely reference it.
const state = vi.hoisted(() => ({
  searchParams: new URLSearchParams() as URLSearchParams,
  routerPush: vi.fn(),
  previousParams: null as PreviousParams | null,
  isOnDetailPage: false,
}));

vi.mock("next/navigation", () => ({
  ReadonlyURLSearchParams: URLSearchParams,
  useSearchParams: () => state.searchParams,
  usePathname: () => (state.isOnDetailPage ? "/locations/some-place" : "/food"),
  useRouter: () => ({ push: state.routerPush }),
}));

vi.mock("@/lib/store", () => ({
  useFilters: (selector: (s: { setLoading: () => void }) => unknown) =>
    selector({ setLoading: vi.fn() }),
  useViewStore: () => ({ setShowMapViewOnMobile: vi.fn() }),
}));

vi.mock("@/components/use-previous-params-client", () => ({
  usePreviousParamsOnClient: () => state.previousParams,
}));

vi.mock("@/components/navigation", () => ({
  parsePathnameToSubRouteParams: (_pathname: string) =>
    state.isOnDetailPage
      ? { route: "locations", slug: "some-place" }
      : { route: "food" },
  isOnLocationDetailPage: (_params: unknown) => state.isOnDetailPage,
  paramsToPathname: () =>
    state.isOnDetailPage ? "/locations/some-place" : "/food",
  getUrlWithNewFilterParameter: (
    pathname: string,
    _searchParams: unknown,
    key: string,
    value: string,
  ) => `${pathname}?${key}=${encodeURIComponent(value)}`,
}));

vi.mock("@/components/streetlives-api-service", () => ({
  Error404Response: class extends Error {
    constructor() {
      super("Not Found");
    }
  },
}));

vi.mock("next/dist/server/web/spec-extension/adapters/request-cookies", () => ({
  ReadonlyRequestCookies: class {},
}));

// doSearchSubmit calls window["gtag"]; provide a no-op so tests don't throw.
Object.defineProperty(window, "gtag", { value: vi.fn(), writable: true });

import SearchForm from "@/components/search-form";

// ---------------------------------------------------------------------------
// Listing page — aiSearch driven by current URL params
// ---------------------------------------------------------------------------
describe("SearchForm — aiSearchEnabled on listing page", () => {
  beforeEach(() => {
    state.isOnDetailPage = false;
    state.searchParams = new URLSearchParams();
    state.previousParams = null;
    state.routerPush.mockClear();
  });

  it("initializes toggle as off when aiSearch param is absent", () => {
    render(<SearchForm />);
    expect(screen.getByTitle("AI Search off")).toBeTruthy();
  });

  it("initializes toggle as on when aiSearch=true is in the URL", () => {
    state.searchParams = new URLSearchParams({ aiSearch: "true" });
    render(<SearchForm />);
    expect(screen.getByTitle("AI Search on")).toBeTruthy();
  });

  it("syncs toggle to off when URL changes from aiSearch=true to aiSearch=false", () => {
    state.searchParams = new URLSearchParams({ aiSearch: "true" });
    const { rerender } = render(<SearchForm />);
    expect(screen.getByTitle("AI Search on")).toBeTruthy();

    act(() => {
      state.searchParams = new URLSearchParams({ aiSearch: "false" });
      rerender(<SearchForm />);
    });

    expect(screen.getByTitle("AI Search off")).toBeTruthy();
  });

  it("syncs toggle to on when URL changes from no param to aiSearch=true", () => {
    state.searchParams = new URLSearchParams();
    const { rerender } = render(<SearchForm />);
    expect(screen.getByTitle("AI Search off")).toBeTruthy();

    act(() => {
      state.searchParams = new URLSearchParams({ aiSearch: "true" });
      rerender(<SearchForm />);
    });

    expect(screen.getByTitle("AI Search on")).toBeTruthy();
  });

  it("keeps toggle off for non-'true' string values of aiSearch", () => {
    for (const value of ["1", "yes", "TRUE", "on"]) {
      state.searchParams = new URLSearchParams({ aiSearch: value });
      const { unmount } = render(<SearchForm />);
      expect(screen.getByTitle("AI Search off")).toBeTruthy();
      unmount();
    }
  });
});

// ---------------------------------------------------------------------------
// Location detail page — aiSearch driven by previousParams (cookie), because
// the detail-page URL does not carry the aiSearch flag.
// ---------------------------------------------------------------------------
describe("SearchForm — aiSearchEnabled on location detail page", () => {
  beforeEach(() => {
    state.isOnDetailPage = true;
    // Detail page URL never carries aiSearch.
    state.searchParams = new URLSearchParams();
    state.previousParams = null;
    state.routerPush.mockClear();
  });

  it("restores toggle as on when previousParams has aiSearch=true", () => {
    state.previousParams = {
      params: { route: "food" },
      searchParams: { aiSearch: "true", searchString: "soup kitchen" },
    };
    render(<SearchForm />);
    expect(screen.getByTitle("AI Search on")).toBeTruthy();
  });

  it("keeps toggle off when previousParams has aiSearch=false", () => {
    state.previousParams = {
      params: { route: "food" },
      searchParams: { aiSearch: "false", searchString: "food pantry" },
    };
    render(<SearchForm />);
    expect(screen.getByTitle("AI Search off")).toBeTruthy();
  });

  it("keeps toggle off when previousParams has no aiSearch entry", () => {
    state.previousParams = {
      params: { route: "food" },
      searchParams: { searchString: "shelter" },
    };
    render(<SearchForm />);
    expect(screen.getByTitle("AI Search off")).toBeTruthy();
  });

  it("keeps toggle off when previousParams is null (first visit)", () => {
    state.previousParams = null;
    render(<SearchForm />);
    expect(screen.getByTitle("AI Search off")).toBeTruthy();
  });

  it("syncs toggle when previousParams changes between renders", () => {
    state.previousParams = {
      params: { route: "food" },
      searchParams: { aiSearch: "false" },
    };
    const { rerender } = render(<SearchForm />);
    expect(screen.getByTitle("AI Search off")).toBeTruthy();

    act(() => {
      state.previousParams = {
        params: { route: "food" },
        searchParams: { aiSearch: "true", searchString: "shelter" },
      };
      rerender(<SearchForm />);
    });

    expect(screen.getByTitle("AI Search on")).toBeTruthy();
  });
});
