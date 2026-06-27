import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/streetlives-api-service", () => {
  class Error404Response extends Error {
    constructor() {
      super("Not Found");
    }
  }
  return { Error404Response };
});

vi.mock("next/navigation", () => ({
  ReadonlyURLSearchParams: class extends URLSearchParams {},
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

vi.mock("next/dist/server/web/spec-extension/adapters/request-cookies", () => ({
  ReadonlyRequestCookies: class {},
}));

import {
  AI_SEARCH_PARAM,
  SEARCH_PARAM,
  parseRequest,
} from "@/components/common";

const BASE_PARAMS = { route: "food" };

function parsed(searchParams: Record<string, string>) {
  return parseRequest({ params: BASE_PARAMS, searchParams });
}

describe("AI_SEARCH_PARAM URL parsing", () => {
  it("parses aiSearch=true as boolean true", () => {
    expect(parsed({ [AI_SEARCH_PARAM]: "true" })[AI_SEARCH_PARAM]).toBe(true);
  });

  it("parses aiSearch=false as boolean false", () => {
    expect(parsed({ [AI_SEARCH_PARAM]: "false" })[AI_SEARCH_PARAM]).toBe(false);
  });

  it("defaults to false when aiSearch param is absent", () => {
    expect(parsed({})[AI_SEARCH_PARAM]).toBe(false);
  });

  it("defaults to false for any non-'true' string value", () => {
    expect(parsed({ [AI_SEARCH_PARAM]: "1" })[AI_SEARCH_PARAM]).toBe(false);
    expect(parsed({ [AI_SEARCH_PARAM]: "yes" })[AI_SEARCH_PARAM]).toBe(false);
    expect(parsed({ [AI_SEARCH_PARAM]: "TRUE" })[AI_SEARCH_PARAM]).toBe(false);
  });
});

describe("search param URL parsing alongside aiSearch", () => {
  it("carries the search string through", () => {
    const result = parsed({
      [SEARCH_PARAM]: "food pantry",
      [AI_SEARCH_PARAM]: "true",
    });
    expect(result[SEARCH_PARAM]).toBe("food pantry");
    expect(result[AI_SEARCH_PARAM]).toBe(true);
  });

  it("search is null when absent, regardless of aiSearch", () => {
    const result = parsed({ [AI_SEARCH_PARAM]: "true" });
    expect(result[SEARCH_PARAM]).toBeNull();
    expect(result[AI_SEARCH_PARAM]).toBe(true);
  });
});
