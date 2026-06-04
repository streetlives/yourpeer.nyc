import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPreviousRoute,
  serializeToQueryParams,
} from "../use-previous-route";

test("buildPreviousRoute returns undefined for missing cookie", () => {
  assert.equal(buildPreviousRoute(undefined), undefined);
});

test("buildPreviousRoute builds a simple route with no search params", () => {
  const cookie = JSON.stringify({
    params: { route: "food" },
    searchParams: {},
  });
  assert.equal(buildPreviousRoute(cookie), "/food");
});

test("buildPreviousRoute includes locationSlug when present", () => {
  const cookie = JSON.stringify({
    params: {
      route: "locations",
      locationSlugOrPersonalCareSubCategory: "some-shelter-123",
    },
    searchParams: {},
  });
  assert.equal(buildPreviousRoute(cookie), "/locations/some-shelter-123");
});

test("buildPreviousRoute serializes search params into query string", () => {
  const cookie = JSON.stringify({
    params: { route: "shelters-housing" },
    searchParams: { search: "soup kitchen", page: "2" },
  });
  const result = buildPreviousRoute(cookie);
  assert.ok(result?.startsWith("/shelters-housing?"));
  assert.ok(result?.includes("search=soup%20kitchen"));
  assert.ok(result?.includes("page=2"));
});

test("buildPreviousRoute with overrideSearchParam=null removes the search param", () => {
  const cookie = JSON.stringify({
    params: { route: "food" },
    searchParams: { search: "bread" },
  });
  const result = buildPreviousRoute(cookie, null);
  assert.equal(result, "/food");
});

test("buildPreviousRoute with overrideSearchParam string replaces the search param", () => {
  const cookie = JSON.stringify({
    params: { route: "food" },
    searchParams: { search: "old value" },
  });
  const result = buildPreviousRoute(cookie, "new value");
  assert.ok(result?.includes("search=new%20value"));
  assert.ok(!result?.includes("old%20value"));
});

test("buildPreviousRoute with default overrideSearchParam preserves existing search param", () => {
  const cookie = JSON.stringify({
    params: { route: "clothing" },
    searchParams: { search: "jacket" },
  });
  const result = buildPreviousRoute(cookie);
  assert.ok(result?.includes("search=jacket"));
});

test("serializeToQueryParams encodes special characters", () => {
  const result = serializeToQueryParams({ search: "soup & bread" });
  assert.equal(result, "search=soup%20%26%20bread");
});

test("serializeToQueryParams returns empty string for empty object", () => {
  assert.equal(serializeToQueryParams({}), "");
});

test("serializeToQueryParams skips non-string values", () => {
  const result = serializeToQueryParams({
    search: "test",
    arr: ["a", "b"] as unknown as string,
  });
  assert.equal(result, "search=test");
});
