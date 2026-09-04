// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import { createContext, useContext } from "react";

// Whether the experimental AI search feature is available.
//
// The value is resolved on the server at request time (see the root layout) and
// handed to the client tree through this context. It deliberately does NOT read
// process.env here: NEXT_PUBLIC_* variables are inlined into the client bundle
// at build time, so a client-side read can disagree with what the server used —
// which renders the "AI mode" toggle on the server and then removes it during
// hydration. Passing the value down keeps a single runtime source of truth and
// means flipping the flag needs a restart, not a rebuild.
const AiSearchEnabledContext = createContext(false);

export function AiSearchEnabledProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <AiSearchEnabledContext.Provider value={enabled}>
      {children}
    </AiSearchEnabledContext.Provider>
  );
}

export function useAiSearchEnabled(): boolean {
  return useContext(AiSearchEnabledContext);
}
