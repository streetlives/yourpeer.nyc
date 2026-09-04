// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

// AI search is still experimental, so it is opt-in: set AI_SEARCH_ENABLED=true
// to show the "AI mode" toggle and to honor the aiSearch URL param. When the
// variable is absent (production default) the toggle is hidden and aiSearch=true
// in a URL is ignored, so every query falls back to the regular keyword search.
//
// Deliberately NOT named NEXT_PUBLIC_*. Next.js inlines NEXT_PUBLIC_ variables
// into the compiled output at build time — in server components as well as
// client ones — so such a flag can only ever be changed by rebuilding, and a
// build/runtime mismatch makes the server and the browser disagree. A plain
// server-side variable is read from the real environment on every request.
//
// This is server-only: call it in server code, and pass the result to the client
// tree through AiSearchEnabledProvider (see the root layout). Client components
// must read it via useAiSearchEnabled(), never from process.env.
export function isAiSearchEnabled(): boolean {
  return process.env.AI_SEARCH_ENABLED === "true";
}
