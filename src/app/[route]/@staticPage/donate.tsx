// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import {
  getTargetLanguage,
  LanguageTranslationContext,
  LanguageTranslationContextType,
} from "@/components/language-translation-context";
import { TranslatableText } from "@/components/translatable-text";
import { useContext } from "react";

export function DonationPage() {
  const { gTranslateCookie } = useContext(
    LanguageTranslationContext,
  ) as LanguageTranslationContextType;

  const targetLanguage = gTranslateCookie
    ? getTargetLanguage(gTranslateCookie)
    : null;
  return (
    <section className="bg-white py-12 pt-28 lg:pt-32 lg:py-20 flex-1">
      <div className="px-5 max-w-xl mx-auto">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-black text-2xl md:text-4xl font-medium mb-6 text-center">
            <TranslatableText text="Donate" />
          </h1>
          <p className="text-dark text-center mb-6">
            <TranslatableText text="Thank you for your interest in supporting us. We accept donations through our Open Collective page." />
          </p>
          <p className="text-dark text-center mb-6">
            <TranslatableText text="Each $50 covers an hour's stipend for unhoused people or those with lived expertise to participate in Streetlives' research or product testing." />
          </p>
          {targetLanguage === "ru" ? (
            <p className="text-dark text-center mb-6">
              Страница будет показана на английском языке. Используйте Yandex
              или Google переводчик.
            </p>
          ) : undefined}
          <div className="">
            <a
              href="https://opencollective.com/streetlives#category-CONTRIBUTE"
              className="primary-button block w-full"
            >
              {" "}
              <TranslatableText text="Donate Now" />{" "}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
