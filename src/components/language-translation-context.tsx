// https://vercel.com/guides/react-context-state-management-nextjs

"use client";

import { useCookies } from "next-client-cookies";
import React, { createContext, useState } from "react";

export const LanguageTranslationContext =
  createContext<LanguageTranslationContextType | null>(null);

export type LanguageTranslationContextType = {
  gTranslateCookie: string | null;
  setGTranslateCookie: (gTranslateCookie: string | null) => void;
};

const GOOGLE_TRANLATE_COOKIE_NAME = "googtrans";

export function getTargetLanguage(gTranslateCookie: string) {
  return gTranslateCookie.split("|")[1];
}

export function parseGoogTransCookie(raw: string | undefined): string {
  return raw ? raw.replace(/\//g, "|").slice(1) : "en|en";
}

export function computeNewGoogTransCookieValue(
  gTranslateCookie: string,
): string | undefined {
  const targetLanguage = getTargetLanguage(gTranslateCookie);
  return targetLanguage === "en"
    ? undefined
    : `/${gTranslateCookie.replace("|", "/")}`;
}

export const LanguageTranslationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const cookies = useCookies();

  const [gTranslateCookie, setGTranslateCookie] = useState<string | null>(
    parseGoogTransCookie(cookies.get("googtrans")),
  );
  return (
    <LanguageTranslationContext.Provider
      value={{
        gTranslateCookie,
        setGTranslateCookie: (gTranslateCookie: string | null) => {
          setGTranslateCookie(gTranslateCookie);
          if (gTranslateCookie) {
            const newCookieValue =
              computeNewGoogTransCookieValue(gTranslateCookie);
            // we clear the cookie if it's english so that we do not run google translate
            if (newCookieValue) {
              cookies.set(GOOGLE_TRANLATE_COOKIE_NAME, newCookieValue);
            } else {
              cookies.remove(GOOGLE_TRANLATE_COOKIE_NAME);
            }
          }
        },
      }}
    >
      {children}
    </LanguageTranslationContext.Provider>
  );
};
