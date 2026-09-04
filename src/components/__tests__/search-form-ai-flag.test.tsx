// Tests the AI_SEARCH_ENABLED feature flag.
//
// The client half of the flag arrives through AiSearchEnabledProvider, which the
// root layout feeds from the server at request time; these tests supply it
// directly. The server half (parseRequest) still reads the environment variable
// at runtime, so those cases set process.env.
//
// With the flag off the "AI mode" toggle is not rendered at all, and an
// aiSearch=true URL param cannot switch AI search back on.

import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

const state = vi.hoisted(() => ({
  searchParams: new URLSearchParams() as URLSearchParams,
  routerPush: vi.fn(),
  isOnDetailPage: false,
}));

vi.mock("next/navigation", () => ({
  ReadonlyURLSearchParams: URLSearchParams,
  useSearchParams: () => state.searchParams,
  usePathname: () => "/food",
  useRouter: () => ({ push: state.routerPush }),
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
    searchParams: Record<string, string> | undefined,
    key: string,
    value: string,
  ) => {
    const params = new URLSearchParams(searchParams ?? {});
    params.set(key, value);
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  },
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

vi.mock("@/components/translatable-text", () => ({
  TranslatableText: ({ text }: { text: string }) => text,
}));

Object.defineProperty(window, "gtag", { value: vi.fn(), writable: true });

import SearchForm from "@/components/search-form";
import { AiSearchEnabledProvider } from "@/components/ai-search-context";
import { parseRequest } from "@/components/common";

function renderSearchForm(enabled: boolean) {
  return render(
    <AiSearchEnabledProvider enabled={enabled}>
      <SearchForm />
    </AiSearchEnabledProvider>,
  );
}

// tests/unit/setup.ts turns the flag on for the rest of the suite; these tests
// describe the production default, so turn it back off here.
const flagFromSetup = process.env.AI_SEARCH_ENABLED;

describe("AI search disabled via AI_SEARCH_ENABLED", () => {
  beforeEach(() => {
    delete process.env.AI_SEARCH_ENABLED;
    state.searchParams = new URLSearchParams();
    state.routerPush.mockClear();
  });

  afterAll(() => {
    process.env.AI_SEARCH_ENABLED = flagFromSetup;
  });

  it("does not render the AI mode toggle", () => {
    renderSearchForm(false);
    expect(screen.queryByTitle("AI Search off")).toBeNull();
    expect(screen.queryByTitle("AI Search on")).toBeNull();
  });

  it("does not render the toggle even when aiSearch=true is in the URL", () => {
    state.searchParams = new URLSearchParams({ aiSearch: "true" });
    renderSearchForm(false);
    expect(screen.queryByTitle("AI Search on")).toBeNull();
  });

  it("ignores aiSearch=true in the URL when parsing the request", () => {
    const parsed = parseRequest({
      params: { route: "food" },
      searchParams: { aiSearch: "true" },
    });
    expect(parsed.aiSearch).toBe(false);
  });

  it("drops a lingering aiSearch param when clearing the search", () => {
    state.searchParams = new URLSearchParams({
      search: "food",
      aiSearch: "true",
    });
    const { container } = renderSearchForm(false);
    const clearButton = container.querySelector("#search_clear_button");
    expect(clearButton).not.toBeNull();
    fireEvent.click(clearButton as Element);
    const pushedUrl = state.routerPush.mock.calls.at(-1)?.[0] as string;
    expect(pushedUrl).not.toContain("aiSearch");
  });

  it("does not put aiSearch on the URL when submitting a search", () => {
    state.searchParams = new URLSearchParams({ aiSearch: "true" });
    renderSearchForm(false);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "food pantry" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(state.routerPush).toHaveBeenCalled();
    const pushedUrl = state.routerPush.mock.calls.at(-1)?.[0] as string;
    expect(pushedUrl).not.toContain("aiSearch");
  });
});

describe("AI search enabled via AI_SEARCH_ENABLED", () => {
  beforeEach(() => {
    process.env.AI_SEARCH_ENABLED = "true";
    state.searchParams = new URLSearchParams();
    state.routerPush.mockClear();
  });

  afterAll(() => {
    process.env.AI_SEARCH_ENABLED = flagFromSetup;
  });

  it("renders the AI mode toggle", () => {
    renderSearchForm(true);
    expect(screen.getByTitle("AI Search off")).toBeTruthy();
  });

  it("honors aiSearch=true in the URL when parsing the request", () => {
    const parsed = parseRequest({
      params: { route: "food" },
      searchParams: { aiSearch: "true" },
    });
    expect(parsed.aiSearch).toBe(true);
  });

  it("keeps aiSearch=true when clearing the search while AI mode is on", () => {
    state.searchParams = new URLSearchParams({
      search: "food",
      aiSearch: "true",
    });
    const { container } = renderSearchForm(true);
    const clearButton = container.querySelector("#search_clear_button");
    expect(clearButton).not.toBeNull();
    fireEvent.click(clearButton as Element);
    const pushedUrl = state.routerPush.mock.calls.at(-1)?.[0] as string;
    expect(pushedUrl).toContain("aiSearch=true");
  });

  it("puts aiSearch=true on the URL once the toggle is turned on", () => {
    renderSearchForm(true);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "food pantry" } });
    fireEvent.click(screen.getByTitle("AI Search off"));
    expect(state.routerPush).toHaveBeenCalled();
    const pushedUrl = state.routerPush.mock.calls.at(-1)?.[0] as string;
    expect(pushedUrl).toContain("aiSearch=true");
  });
});
