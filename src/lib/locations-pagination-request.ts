// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

export const DEFAULT_BACKGROUND_PAGE_SIZE = 200;
export const MAX_BACKGROUND_PAGE_SIZE = 200;

export function parseNonNegativeInteger(
  rawValue: string | null,
  fallbackValue: number,
): number {
  if (!rawValue) {
    return fallbackValue;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? parsedValue
    : fallbackValue;
}

export function parsePositiveInteger(
  rawValue: string | null,
  fallbackValue: number,
): number {
  if (!rawValue) {
    return fallbackValue;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallbackValue;
}

export function parseLocationsBackgroundPageSize(
  rawValue: string | null,
): number {
  return Math.min(
    parsePositiveInteger(rawValue, DEFAULT_BACKGROUND_PAGE_SIZE),
    MAX_BACKGROUND_PAGE_SIZE,
  );
}
