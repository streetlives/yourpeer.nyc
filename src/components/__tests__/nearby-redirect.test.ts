import assert from "node:assert/strict";
import test from "node:test";

import {
  shouldAutoRedirectToNearby,
  shouldRedirectToNearbyPath,
} from "../nearby-redirect";

test("shouldRedirectToNearbyPath allows all resource index routes", () => {
  assert.equal(shouldRedirectToNearbyPath("/locations"), true);
  assert.equal(shouldRedirectToNearbyPath("/shelters-housing"), true);
  assert.equal(shouldRedirectToNearbyPath("/food"), true);
  assert.equal(shouldRedirectToNearbyPath("/clothing"), true);
  assert.equal(shouldRedirectToNearbyPath("/personal-care"), true);
  assert.equal(shouldRedirectToNearbyPath("/health-care"), true);
  assert.equal(shouldRedirectToNearbyPath("/other-services"), true);
  assert.equal(shouldRedirectToNearbyPath("/legal-services"), true);
  assert.equal(shouldRedirectToNearbyPath("/mental-health"), true);
  assert.equal(shouldRedirectToNearbyPath("/employment"), true);
});

test("shouldRedirectToNearbyPath rejects detail and unknown routes", () => {
  assert.equal(
    shouldRedirectToNearbyPath(
      "/locations/roman-catholic-archdiocese-of-newark-rcan-629-clinton-ave",
    ),
    false,
  );
  assert.equal(shouldRedirectToNearbyPath("/about-us"), false);
  assert.equal(shouldRedirectToNearbyPath(null), false);
});

test("shouldRedirectToNearbyPath normalizes trailing slash", () => {
  assert.equal(shouldRedirectToNearbyPath("/locations/"), true);
  assert.equal(shouldRedirectToNearbyPath("/locations/slug/"), false);
});

test("shouldAutoRedirectToNearby enforces all redirect guards", () => {
  assert.equal(
    shouldAutoRedirectToNearby({
      pathname: "/locations",
      sortBy: null,
      searchText: null,
      isLocationDetail: false,
    }),
    true,
  );

  assert.equal(
    shouldAutoRedirectToNearby({
      pathname: "/locations",
      sortBy: "nearby",
      searchText: null,
      isLocationDetail: false,
    }),
    false,
  );

  assert.equal(
    shouldAutoRedirectToNearby({
      pathname: "/locations",
      sortBy: null,
      searchText: "soup kitchen",
      isLocationDetail: false,
    }),
    false,
  );

  assert.equal(
    shouldAutoRedirectToNearby({
      pathname: "/locations",
      sortBy: null,
      searchText: null,
      isLocationDetail: true,
    }),
    false,
  );
});
