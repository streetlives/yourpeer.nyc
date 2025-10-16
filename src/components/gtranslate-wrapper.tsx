// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import {
  lang_array_english,
  lang_array_native,
  languages,
} from "./gtranslate-common";
import { useEffect } from "react";

function googleTranslateElementInit() {
  new (window.google as any).translate.TranslateElement(
    {
      pageLanguage: "auto",
      languages: languages.map((l) => ({
        label: lang_array_english[l as keyof typeof lang_array_native],
        value: l,
      })),
    },
    "google_translate_element",
  );
}

function setNoTranslateOnTitle(): void {
  const titleElement = document.querySelector("title");
  if (titleElement) {
    titleElement.setAttribute("translate", "no");
  }
}

export default function GTranslateWrapper() {
  const GOOGLE_TRANSLATE_ELEMENT_ID = "google_translate_element";
  const SCRIPT_SRC =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

  function setupScript() {
    const script = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (!script) {
      const newScript = document.createElement("script");
      newScript.setAttribute("src", SCRIPT_SRC);
      newScript.setAttribute("strategy", "afterInteractive");
      document.body.appendChild(newScript);
    }
  }

  useEffect(() => {
    function poll() {
      // do not translate the title, in order to prevent Google Translate from breaking the page
      setNoTranslateOnTitle();

      // Set up a Mutation Observer to watch for changes in the head
      const observer = new MutationObserver(() => {
        setNoTranslateOnTitle();
      });

      // Observe the <head> element for child list changes (like a new <title>)
      const headElement = document.querySelector('head');
      if (headElement) {
        observer.observe(headElement, { childList: true });
      }

      if (!window.googleTranslateElementInit) {
        window.googleTranslateElementInit = googleTranslateElementInit;
      }
      let googleTranslateElement = document.querySelector(
        `#${GOOGLE_TRANSLATE_ELEMENT_ID}`,
      );
      if (!googleTranslateElement) {
        const div = document.createElement("div");
        div.setAttribute("id", GOOGLE_TRANSLATE_ELEMENT_ID);
        document.body.appendChild(div);
        setupScript();
      }
    }
    poll();
  }, []);

  return <></>;
}
