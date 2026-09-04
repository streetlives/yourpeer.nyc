// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

// AI search is still experimental, so it is opt-in: set
// NEXT_PUBLIC_AI_SEARCH_ENABLED=true to show the "AI mode" toggle and to honor
// the aiSearch URL param. When the variable is absent (production default) the
// toggle is hidden and aiSearch=true in a URL is ignored, so every query falls
// back to the regular keyword search.
//
// Read through a function rather than a module-level const so the value is
// evaluated per call (keeps it overridable in tests). The full
// `process.env.NEXT_PUBLIC_*` reference is preserved so Next.js can still
// inline it into the client bundle at build time.
export function isAiSearchEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_SEARCH_ENABLED === "true";
}
