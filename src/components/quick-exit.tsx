// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import { useContext, useEffect, useState } from "react";
import { useTranslatedText } from "./use-translated-text-hook";
import {
  getTargetLanguage,
  LanguageTranslationContext,
  LanguageTranslationContextType,
} from "./language-translation-context";

const LAYOUT_THRESHOLD = 370;

export default function QuickExit() {
  // FIXME: there is technical debt here - it would be better to clean this up and use CSS for layout instead
  const sourceText = "Quick Exit";

  const { gTranslateCookie } = useContext(
    LanguageTranslationContext,
  ) as LanguageTranslationContextType;

  const translation = useTranslatedText({
    text: sourceText,
  }) as string;

  const targetLanguage = gTranslateCookie
    ? getTargetLanguage(gTranslateCookie)
    : null;

  const textToRender = translation || sourceText;

  const [firstWord, secondWord] = textToRender.split(/ +/);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" && window.innerWidth,
  );
  useEffect(() => {
    window.addEventListener("resize", () => {
      setScreenWidth(window.innerWidth);
    });
  }, []);

  return (
    <a
      href="https://www.google.com"
      id="quickExitLink"
      className="flex-shrink-0 inline-flex ml-auto items-center text-[10px] sm:text-xs font-medium text-black space-x-1 truncate"
    >
      <span
        className={`inline-block ${!gTranslateCookie || targetLanguage == "en" || translation ? "notranslate" : ""}`}
      >
        {screenWidth >= LAYOUT_THRESHOLD ? (
          textToRender
        ) : (
          <>
            <span>{firstWord}</span>
            <br />
            <span>{secondWord}</span>
          </>
        )}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M10.79 16.29C11.18 16.68 11.81 16.68 12.2 16.29L15.79 12.7C16.18 12.31 16.18 11.68 15.79 11.29L12.2 7.7C11.81 7.31 11.18 7.31 10.79 7.7C10.4 8.09 10.4 8.72 10.79 9.11L12.67 11H4C3.45 11 3 11.45 3 12C3 12.55 3.45 13 4 13H12.67L10.79 14.88C10.4 15.27 10.41 15.91 10.79 16.29ZM19 3H5C3.89 3 3 3.9 3 5V8C3 8.55 3.45 9 4 9C4.55 9 5 8.55 5 8V6C5 5.45 5.45 5 6 5H18C18.55 5 19 5.45 19 6V18C19 18.55 18.55 19 18 19H6C5.45 19 5 18.55 5 18V16C5 15.45 4.55 15 4 15C3.45 15 3 15.45 3 16V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"
          fill="#212121"
        ></path>
      </svg>
    </a>
  );
}
