// Root wrapper for designs built with the synced yourpeer.nyc components.
// In the app, LanguageTranslationProvider reads the Google Translate cookie via
// next-client-cookies; outside Next.js that isn't available, so this supplies the
// same context with English selected. TranslatableText, QuickExit, Footer and
// ExploreServicesButton read this context and throw without it.

import React, { useState } from "react";
import { LanguageTranslationContext } from "../src/components/language-translation-context";

export function YourPeerProvider({ children }: { children: React.ReactNode }) {
  const [gTranslateCookie, setGTranslateCookie] = useState<string | null>(
    "en|en",
  );
  return (
    <LanguageTranslationContext.Provider
      value={{ gTranslateCookie, setGTranslateCookie }}
    >
      <div className="font-sans text-dark">{children}</div>
    </LanguageTranslationContext.Provider>
  );
}
