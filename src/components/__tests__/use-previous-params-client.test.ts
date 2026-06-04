import assert from "node:assert/strict";
import test from "node:test";

import { parsePreviousParamsCookie } from "../use-previous-params-client";

test("parsePreviousParamsCookie returns null for missing cookie", () => {
  assert.equal(parsePreviousParamsCookie(undefined), null);
});

test("parsePreviousParamsCookie parses a valid cookie into PreviousParams", () => {
  const value = JSON.stringify({
    params: { route: "food", locationSlugOrPersonalCareSubCategory: undefined },
    searchParams: { search: "bread" },
  });
  const result = parsePreviousParamsCookie(value);
  assert.ok(result !== null);
  assert.equal(result.params.route, "food");
  assert.equal(result.searchParams.search, "bread");
});

test("parsePreviousParamsCookie preserves locationSlug in params", () => {
  const value = JSON.stringify({
    params: {
      route: "locations",
      locationSlugOrPersonalCareSubCategory: "shelter-abc-123",
    },
    searchParams: {},
  });
  const result = parsePreviousParamsCookie(value);
  assert.equal(
    result?.params.locationSlugOrPersonalCareSubCategory,
    "shelter-abc-123",
  );
});
