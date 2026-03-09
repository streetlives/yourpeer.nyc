// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import test from "node:test";
import assert from "node:assert/strict";
import type { YourPeerLegacyLocationData } from "./common";
import {
  getDisplayNumberOfPages,
  getTotalBackgroundPages,
  getVisibleLocationsForPage,
  mergeBackgroundPage,
  splitLocationsIntoDisplayPages,
} from "./locations-pagination-cache";

function createLocation(id: number): YourPeerLegacyLocationData {
  return {
    id: id.toString(),
    location_name: `Location ${id}`,
    organization_id: null,
    email: null,
    address: null,
    city: null,
    region: null,
    state: null,
    zip: null,
    lat: 0,
    lng: 0,
    area: null,
    info: null,
    slug: `/locations/${id}`,
    partners: false,
    last_updated: "today",
    last_updated_date: new Date("2026-03-09T00:00:00.000Z"),
    name: `Organization ${id}`,
    phones: null,
    url: null,
    streetview_url: null,
    accommodation_services: { services: [] },
    food_services: { services: [] },
    clothing_services: { services: [] },
    personal_care_services: { services: [] },
    health_services: { services: [] },
    other_services: { services: [] },
    legal_services: { services: [] },
    mental_health_services: { services: [] },
    employment_services: { services: [] },
    closed: false,
  };
}

function createLocations(count: number): YourPeerLegacyLocationData[] {
  return Array.from({ length: count }, (_, index) => createLocation(index + 1));
}

test("getDisplayNumberOfPages uses the display page size", () => {
  assert.equal(getDisplayNumberOfPages(0), 0);
  assert.equal(getDisplayNumberOfPages(20), 0);
  assert.equal(getDisplayNumberOfPages(21), 1);
  assert.equal(getDisplayNumberOfPages(1221), 61);
});

test("splitLocationsIntoDisplayPages slices a background chunk into display pages", () => {
  const splitPages = splitLocationsIntoDisplayPages(1, createLocations(45));

  assert.deepEqual(Object.keys(splitPages), ["10", "11", "12"]);
  assert.equal(splitPages[10]?.length, 20);
  assert.equal(splitPages[11]?.length, 20);
  assert.equal(splitPages[12]?.length, 5);
});

test("mergeBackgroundPage keeps display-page bounds derived from resultCount", () => {
  const mergedDataset = mergeBackgroundPage(
    {
      pages: { 0: createLocations(20) },
      loadedBackgroundPages: [],
      loadingBackgroundPages: [1],
      resultCount: 1221,
      numberOfPages: 61,
    },
    {
      pageNumber: 1,
      pageSize: 200,
      resultCount: 1221,
      locations: createLocations(45),
    },
  );

  assert.equal(mergedDataset.numberOfPages, 61);
  assert.deepEqual(mergedDataset.loadedBackgroundPages, [1]);
  assert.deepEqual(mergedDataset.loadingBackgroundPages, []);
  assert.equal(mergedDataset.pages[10]?.length, 20);
  assert.equal(mergedDataset.pages[12]?.length, 5);
});

test("getTotalBackgroundPages converts display-page bounds to background chunks", () => {
  assert.equal(getTotalBackgroundPages(0), 1);
  assert.equal(getTotalBackgroundPages(9), 1);
  assert.equal(getTotalBackgroundPages(10), 2);
  assert.equal(getTotalBackgroundPages(61), 7);
});

test("getVisibleLocationsForPage falls back to the last resolved page while loading", () => {
  const firstPage = createLocations(20);
  const fallbackPage = createLocations(5);

  assert.equal(
    getVisibleLocationsForPage({
      pages: { 0: firstPage, 3: fallbackPage },
      currentPage: 3,
      lastResolvedPage: 0,
    }),
    fallbackPage,
  );

  assert.equal(
    getVisibleLocationsForPage({
      pages: { 0: firstPage, 3: fallbackPage },
      currentPage: 5,
      lastResolvedPage: 0,
    }),
    firstPage,
  );
});
