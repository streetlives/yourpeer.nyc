import { describe, expect, it, vi } from "vitest";

vi.mock("next-client-cookies", () => ({ useCookies: vi.fn() }));

import {
  computeNewGoogTransCookieValue,
  getTargetLanguage,
  parseGoogTransCookie,
} from "@/components/language-translation-context";

describe("parseGoogTransCookie", () => {
  it("returns 'en|en' when cookie is absent", () => {
    expect(parseGoogTransCookie(undefined)).toBe("en|en");
  });

  it("converts slash-separated cookie to pipe-separated, dropping leading slash", () => {
    expect(parseGoogTransCookie("/en/es")).toBe("en|es");
    expect(parseGoogTransCookie("/en/zh-CN")).toBe("en|zh-CN");
    expect(parseGoogTransCookie("/en/fr")).toBe("en|fr");
  });
});

describe("getTargetLanguage", () => {
  it("extracts the target language from a pipe-separated cookie", () => {
    expect(getTargetLanguage("en|es")).toBe("es");
    expect(getTargetLanguage("en|en")).toBe("en");
    expect(getTargetLanguage("en|zh-CN")).toBe("zh-CN");
  });
});

describe("computeNewGoogTransCookieValue", () => {
  it("returns undefined for English (triggers cookie removal)", () => {
    expect(computeNewGoogTransCookieValue("en|en")).toBeUndefined();
  });

  it("returns slash-formatted value for non-English language", () => {
    expect(computeNewGoogTransCookieValue("en|es")).toBe("/en/es");
    expect(computeNewGoogTransCookieValue("en|zh-CN")).toBe("/en/zh-CN");
    expect(computeNewGoogTransCookieValue("en|fr")).toBe("/en/fr");
  });

  it("round-trip: cookie set then parsed returns the original language pair", () => {
    const original = "en|es";
    const cookieValue = computeNewGoogTransCookieValue(original);
    expect(cookieValue).toBeDefined();
    expect(parseGoogTransCookie(cookieValue)).toBe(original);
  });
});
