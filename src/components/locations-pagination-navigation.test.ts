// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import test from "node:test";
import assert from "node:assert/strict";
import {
  applyPaginationNavigation,
  getPaginationUrl,
} from "./locations-pagination-cache";

test("getPaginationUrl preserves existing filters and updates the display page", () => {
  const searchParams = new URLSearchParams("search=&sortBy=nearby&page=6");

  assert.equal(
    getPaginationUrl({
      pathname: "/locations",
      searchParams: searchParams.entries(),
      pageNumber: 6,
    }),
    "/locations?search=&sortBy=nearby&page=7",
  );

  assert.equal(
    getPaginationUrl({
      pathname: "/locations",
      searchParams: searchParams.entries(),
      pageNumber: 0,
    }),
    "/locations?search=&sortBy=nearby",
  );
});

test("applyPaginationNavigation pushes the new URL and resets the list scroll position", () => {
  const pushedUrls: string[] = [];
  const locationsContainer = { scrollTop: 125 };

  const nextUrl = applyPaginationNavigation({
    pathname: "/locations",
    searchParams: new URLSearchParams("sortBy=nearby&page=6").entries(),
    pageNumber: 7,
    pushState: (url) => {
      pushedUrls.push(url);
    },
    locationsContainer,
  });

  assert.equal(nextUrl, "/locations?sortBy=nearby&page=8");
  assert.deepEqual(pushedUrls, ["/locations?sortBy=nearby&page=8"]);
  assert.equal(locationsContainer.scrollTop, 0);
});
