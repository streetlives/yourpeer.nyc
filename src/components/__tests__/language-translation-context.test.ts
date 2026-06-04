import assert from "node:assert/strict";
import test from "node:test";

import {
  computeNewGoogTransCookieValue,
  getTargetLanguage,
  parseGoogTransCookie,
} from "../language-translation-context";

test("parseGoogTransCookie returns 'en|en' when cookie is absent", () => {
  assert.equal(parseGoogTransCookie(undefined), "en|en");
});

test("parseGoogTransCookie converts slash-separated cookie to pipe-separated, dropping leading slash", () => {
  assert.equal(parseGoogTransCookie("/en/es"), "en|es");
  assert.equal(parseGoogTransCookie("/en/zh-CN"), "en|zh-CN");
  assert.equal(parseGoogTransCookie("/en/fr"), "en|fr");
});

test("getTargetLanguage extracts the target language from a pipe-separated cookie", () => {
  assert.equal(getTargetLanguage("en|es"), "es");
  assert.equal(getTargetLanguage("en|en"), "en");
  assert.equal(getTargetLanguage("en|zh-CN"), "zh-CN");
});

test("computeNewGoogTransCookieValue returns undefined when target language is English (triggers cookie removal)", () => {
  assert.equal(computeNewGoogTransCookieValue("en|en"), undefined);
});

test("computeNewGoogTransCookieValue returns slash-formatted value for non-English language", () => {
  assert.equal(computeNewGoogTransCookieValue("en|es"), "/en/es");
  assert.equal(computeNewGoogTransCookieValue("en|zh-CN"), "/en/zh-CN");
  assert.equal(computeNewGoogTransCookieValue("en|fr"), "/en/fr");
});

test("round-trip: cookie set then parsed returns the original language pair", () => {
  const original = "en|es";
  const cookieValue = computeNewGoogTransCookieValue(original);
  assert.ok(cookieValue !== undefined);
  assert.equal(parseGoogTransCookie(cookieValue), original);
});
