import test from "node:test";
import assert from "node:assert/strict";
import {
  RUM_WINDOW_GUARD_KEY,
  hasDatadogConsent,
  isRumAlreadyInitialized,
  markRumAsInitialized,
  normalizePathnameForViewName,
  parseCookieValue,
  sanitizeRumEvent,
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

test("sanitizeRumEvent sanitizes nested event values", () => {
  const event = {
    a: {
      b: ["https://x.y/path?token=1", "hello test@example.com"],
    },
  };

  sanitizeRumEvent(event);

  assert.deepEqual(event, {
    a: {
      b: ["https://x.y/path", "hello [redacted-email]"],
    },
  });
});

test("sanitizeRumEvent sanitizes values beyond six levels deep", () => {
  const event: any = {
    level1: {
      level2: {
        level3: {
          level4: {
            level5: {
              level6: {
                level7: {
                  secret: "user@example.com?token=super-secret",
                },
              },
            },
          },
        },
      },
    },
  };

  sanitizeRumEvent(event);

  assert.equal(
    event.level1.level2.level3.level4.level5.level6.level7.secret,
    "[redacted-email]",
  );
});
test("consent helper reads cookie values", () => {
  const mockWindow = {
    document: {
      cookie: "session=abc; analytics_consent=granted; x=1",
    },
  } as Window;

  assert.equal(parseCookieValue(mockWindow, "analytics_consent"), "granted");
  assert.equal(hasDatadogConsent(mockWindow, "analytics_consent"), true);
});

test("parseCookieValue does not throw on malformed percent encoding", () => {
  const mockWindow = {
    document: {
      cookie: "analytics_consent=%E0%A4%A; x=1",
    },
  } as Window;

  assert.doesNotThrow(() => parseCookieValue(mockWindow, "analytics_consent"));
  assert.equal(parseCookieValue(mockWindow, "analytics_consent"), "%e0%a4%a");
  assert.equal(hasDatadogConsent(mockWindow, "analytics_consent"), false);
});
test("single-init guard behaves correctly", () => {
  const mockWindow = {} as Window & { [RUM_WINDOW_GUARD_KEY]?: boolean };

  assert.equal(isRumAlreadyInitialized(mockWindow), false);
  markRumAsInitialized(mockWindow);
  assert.equal(isRumAlreadyInitialized(mockWindow), true);
});
