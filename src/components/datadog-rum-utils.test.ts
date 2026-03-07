import test from "node:test";
import assert from "node:assert/strict";
import {
  RUM_WINDOW_GUARD_KEY,
  isRumAlreadyInitialized,
  markRumAsInitialized,
  normalizePathnameForViewName,
  sanitizeStringValue,
} from "@/components/datadog-rum-utils";

test("normalizePathnameForViewName normalizes numeric and tokenized segments", () => {
  assert.equal(normalizePathnameForViewName("/"), "route:/");
  assert.equal(
    normalizePathnameForViewName("/locations/123"),
    "route:/locations/:id",
  );
  assert.equal(
    normalizePathnameForViewName(
      "/users/550e8400-e29b-41d4-a716-446655440000/profile",
    ),
    "route:/users/:id/profile",
  );
  assert.equal(
    normalizePathnameForViewName(
      "/auth/abcdefghijklmnopqrstuvwxyz1234567890/callback",
    ),
    "route:/auth/:id/callback",
  );
});

test("normalizePathnameForViewName caps deeply nested paths", () => {
  assert.equal(
    normalizePathnameForViewName("/a/b/c/d/e/f"),
    "route:/a/b/c/d/*",
  );
});

test("sanitizeStringValue strips query/hash and redacts emails", () => {
  assert.equal(
    sanitizeStringValue(
      "https://example.com/reset?email=test@example.com#section",
    ),
    "https://example.com/reset",
  );
  assert.equal(
    sanitizeStringValue("Error for person@example.org happened"),
    "Error for [redacted-email] happened",
  );
});

test("single-init guard behaves correctly", () => {
  const mockWindow = {} as Window & { [RUM_WINDOW_GUARD_KEY]?: boolean };

  assert.equal(isRumAlreadyInitialized(mockWindow), false);
  markRumAsInitialized(mockWindow);
  assert.equal(isRumAlreadyInitialized(mockWindow), true);
});
