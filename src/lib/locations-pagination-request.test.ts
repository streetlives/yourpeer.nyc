// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import test from "node:test";
import assert from "node:assert/strict";
import {
  parseLocationsBackgroundPageNumber,
  parseLocationsBackgroundPageSize,
  parseNonNegativeInteger,
  parsePositiveInteger,
} from "./locations-pagination-request";

test("parseNonNegativeInteger accepts zero and rejects negative values", () => {
  assert.equal(parseNonNegativeInteger("0", 7), 0);
  assert.equal(parseNonNegativeInteger("15", 7), 15);
  assert.equal(parseNonNegativeInteger("-1", 7), 7);
  assert.equal(parseNonNegativeInteger(null, 7), 7);
});

test("parsePositiveInteger requires values greater than zero", () => {
  assert.equal(parsePositiveInteger("1", 9), 1);
  assert.equal(parsePositiveInteger("0", 9), 9);
  assert.equal(parsePositiveInteger("-2", 9), 9);
  assert.equal(parsePositiveInteger(null, 9), 9);
});

test("parseLocationsBackgroundPageSize clamps malformed and oversized values", () => {
  assert.equal(parseLocationsBackgroundPageSize(null), 200);
  assert.equal(parseLocationsBackgroundPageSize("0"), 200);
  assert.equal(parseLocationsBackgroundPageSize("-5"), 200);
  assert.equal(parseLocationsBackgroundPageSize("50"), 50);
  assert.equal(parseLocationsBackgroundPageSize("500"), 200);
});

test("parseLocationsBackgroundPageNumber rejects page numbers above the supported cap", () => {
  assert.equal(parseLocationsBackgroundPageNumber(null), 0);
  assert.equal(parseLocationsBackgroundPageNumber("0"), 0);
  assert.equal(parseLocationsBackgroundPageNumber("100"), 100);
  assert.equal(parseLocationsBackgroundPageNumber("101"), null);
});
