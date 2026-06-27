// Tests that aiSearchEnabled state stays in sync when the URL changes
// (browser back/forward or programmatic navigation between URLs with different aiSearch values).

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";

// Mutable container so individual tests can control useSearchParams without
// re-creating the vi.mock closure.
const mockNav = {
  searchParams: new URLSearchParams(),
  routerPush: vi.fn(),
};

vi.mock("next/navigation", () => ({
  ReadonlyURLSearchParams: URLSearchParams,
  useSearchParams: () => mockNav.searchParams,
  usePathname: () => "/food",
  useRouter: () => ({ push: mockNav.routerPush }),
}));

vi.mock("@/lib/store", () => ({
  useFilters: (selector: (s: { setLoading: () => void }) => unknown) =>
    selector({ setLoading: vi.fn() }),
  useViewStore: () => ({ setShowMapViewOnMobile: vi.fn() }),
}));

vi.mock("@/components/use-previous-params-client", () => ({
  usePreviousParamsOnClient: () => null,
}));

vi.mock("@/components/navigation", () => ({
  parsePathnameToSubRouteParams: () => ({ route: "food" }),
  isOnLocationDetailPage: () => false,
  paramsToPathname: () => "/food",
  getUrlWithNewFilterParameter: (
    pathname: string,
    _searchParams: unknown,
    key: string,
    value: string,
  ) => `${pathname}?${key}=${encodeURIComponent(value)}`,
}));

vi.mock("@/components/streetlives-api-service", () => ({
  Error404Response: class Error404Response extends Error {
    constructor() {
      super("Not Found");
    }
  },
}));

vi.mock("next/dist/server/web/spec-extension/adapters/request-cookies", () => ({
  ReadonlyRequestCookies: class {},
}));

// search-form calls window["gtag"] on submit; provide a no-op so it doesn't throw
Object.defineProperty(window, "gtag", { value: vi.fn(), writable: true });

import SearchForm from "@/components/search-form";

describe("SearchForm — aiSearchEnabled sync with URL changes", () => {
  beforeEach(() => {
    mockNav.searchParams = new URLSearchParams();
    mockNav.routerPush.mockClear();
  });

  it("initializes AI toggle as off when aiSearch param is absent", () => {
    render(<SearchForm />);
    expect(screen.getByTitle("AI Search off")).toBeTruthy();
  });

  it("initializes AI toggle as on when aiSearch=true is in the URL", () => {
    mockNav.searchParams = new URLSearchParams({ aiSearch: "true" });
    render(<SearchForm />);
    expect(screen.getByTitle("AI Search on")).toBeTruthy();
  });

  it("syncs toggle to off after URL changes from aiSearch=true to aiSearch=false", () => {
    mockNav.searchParams = new URLSearchParams({ aiSearch: "true" });
    const { rerender } = render(<SearchForm />);
    expect(screen.getByTitle("AI Search on")).toBeTruthy();

    // Simulate browser back: URL now has aiSearch=false
    act(() => {
      mockNav.searchParams = new URLSearchParams({ aiSearch: "false" });
      rerender(<SearchForm />);
    });

    expect(screen.getByTitle("AI Search off")).toBeTruthy();
  });

  it("syncs toggle to on after URL changes from no param to aiSearch=true", () => {
    mockNav.searchParams = new URLSearchParams();
    const { rerender } = render(<SearchForm />);
    expect(screen.getByTitle("AI Search off")).toBeTruthy();

    // Simulate forward navigation: URL now has aiSearch=true
    act(() => {
      mockNav.searchParams = new URLSearchParams({ aiSearch: "true" });
      rerender(<SearchForm />);
    });

    expect(screen.getByTitle("AI Search on")).toBeTruthy();
  });

  it("keeps toggle off when aiSearch param uses non-'true' string values", () => {
    for (const value of ["1", "yes", "TRUE", "on"]) {
      mockNav.searchParams = new URLSearchParams({ aiSearch: value });
      const { unmount } = render(<SearchForm />);
      expect(screen.getByTitle("AI Search off")).toBeTruthy();
      unmount();
    }
  });
});
