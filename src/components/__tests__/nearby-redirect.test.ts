import { test, expect } from "vitest";
import {
  shouldAutoRedirectToNearby,
  shouldRedirectToNearbyPath,
} from "../nearby-redirect";

test("shouldRedirectToNearbyPath allows all resource index routes", () => {
  expect(shouldRedirectToNearbyPath("/locations")).toBe(true);
  expect(shouldRedirectToNearbyPath("/shelters-housing")).toBe(true);
  expect(shouldRedirectToNearbyPath("/food")).toBe(true);
  expect(shouldRedirectToNearbyPath("/clothing")).toBe(true);
  expect(shouldRedirectToNearbyPath("/personal-care")).toBe(true);
  expect(shouldRedirectToNearbyPath("/health-care")).toBe(true);
  expect(shouldRedirectToNearbyPath("/other-services")).toBe(true);
  expect(shouldRedirectToNearbyPath("/legal-services")).toBe(true);
  expect(shouldRedirectToNearbyPath("/mental-health")).toBe(true);
  expect(shouldRedirectToNearbyPath("/employment")).toBe(true);
});

test("shouldRedirectToNearbyPath rejects detail and unknown routes", () => {
  expect(
    shouldRedirectToNearbyPath(
      "/locations/roman-catholic-archdiocese-of-newark-rcan-629-clinton-ave",
    ),
  ).toBe(false);
  expect(shouldRedirectToNearbyPath("/about-us")).toBe(false);
  expect(shouldRedirectToNearbyPath(null)).toBe(false);
});

test("shouldRedirectToNearbyPath normalizes trailing slash", () => {
  expect(shouldRedirectToNearbyPath("/locations/")).toBe(true);
  expect(shouldRedirectToNearbyPath("/locations/slug/")).toBe(false);
});

test("shouldRedirectToNearbyPath allows locale-prefixed index routes", () => {
  expect(shouldRedirectToNearbyPath("/en/locations")).toBe(true);
  expect(shouldRedirectToNearbyPath("/en-US/food")).toBe(true);
  expect(shouldRedirectToNearbyPath("/es/mental-health")).toBe(true);
  expect(
    shouldRedirectToNearbyPath("/en/locations/roman-catholic-archdiocese"),
  ).toBe(false);
});

test("shouldRedirectToNearbyPath allows basePath-prefixed index routes", () => {
  const previous = process.env.NEXT_PUBLIC_BASE_PATH;
  process.env.NEXT_PUBLIC_BASE_PATH = "app";

  expect(shouldRedirectToNearbyPath("/app/locations")).toBe(true);
  expect(shouldRedirectToNearbyPath("/app/other-services/")).toBe(true);
  expect(
    shouldRedirectToNearbyPath("/app/locations/roman-catholic-archdiocese"),
  ).toBe(false);

  if (previous === undefined) {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
  } else {
    process.env.NEXT_PUBLIC_BASE_PATH = previous;
  }
});

test("shouldRedirectToNearbyPath allows basePath and locale prefixed index routes", () => {
  const previous = process.env.NEXT_PUBLIC_BASE_PATH;
  process.env.NEXT_PUBLIC_BASE_PATH = "app";

  expect(shouldRedirectToNearbyPath("/app/en/locations")).toBe(true);
  expect(shouldRedirectToNearbyPath("/app/en-US/food/")).toBe(true);
  expect(shouldRedirectToNearbyPath("/app/es/mental-health")).toBe(true);
  expect(
    shouldRedirectToNearbyPath("/app/en/locations/roman-catholic-archdiocese"),
  ).toBe(false);

  if (previous === undefined) {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
  } else {
    process.env.NEXT_PUBLIC_BASE_PATH = previous;
  }
});

test("shouldAutoRedirectToNearby enforces all redirect guards", () => {
  expect(
    shouldAutoRedirectToNearby({
      pathname: "/locations",
      sortBy: null,
      searchText: null,
      isLocationDetail: false,
    }),
  ).toBe(true);

  expect(
    shouldAutoRedirectToNearby({
      pathname: "/locations",
      sortBy: "nearby",
      searchText: null,
      isLocationDetail: false,
    }),
  ).toBe(false);

  expect(
    shouldAutoRedirectToNearby({
      pathname: "/locations",
      sortBy: null,
      searchText: "soup kitchen",
      isLocationDetail: false,
    }),
  ).toBe(false);

  expect(
    shouldAutoRedirectToNearby({
      pathname: "/locations",
      sortBy: null,
      searchText: null,
      isLocationDetail: true,
    }),
  ).toBe(false);
});
