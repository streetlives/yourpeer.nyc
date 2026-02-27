import { useContext } from "react";
import {
  getTargetLanguage,
  LanguageTranslationContext,
  LanguageTranslationContextType,
} from "./language-translation-context";
import translations from "./translations";
import assert from "assert";

export function useGTranslateCookie(): string | null {
  const { gTranslateCookie } = useContext(
    LanguageTranslationContext,
  ) as LanguageTranslationContextType;
  return gTranslateCookie;
}

export function useTranslatedText({
  text,
  id,
  expectTranslation = false,
}: {
  text: string;
  id?: string;
  expectTranslation?: boolean;
}): string | null {
  const { gTranslateCookie } = useContext(
    LanguageTranslationContext,
  ) as LanguageTranslationContextType;

  return getTranslatedText({
    text,
    id,
    expectTranslation,
    gTranslateCookie,
  });
}

export function getTranslatedText({
  text,
  id,
  expectTranslation = true,
  gTranslateCookie,
}: {
  text: string;
  id?: string;
  expectTranslation?: boolean;
  gTranslateCookie: string | null;
}): string | null {
  const targetLanguage = gTranslateCookie
    ? getTargetLanguage(gTranslateCookie)
    : null;
  const targetLanguageTranslations =
    targetLanguage && translations[targetLanguage];
  if (!targetLanguageTranslations) {
    // we don't support manual translations for this language
    return null;
  }
  const translation =
    (id && targetLanguageTranslations[id]) || targetLanguageTranslations[text];
  if (expectTranslation) {
    assert(
      translation,
      `Expected a translation to exist for target language ${targetLanguage} and translatable text "${text}"`,
    );
    return translation;
  } else {
    // if we are dealing with dynamic-ish text, then we want to allow fallback
    if (!translation) {
      console.warn(
        `Warning: translation not found for target language ${targetLanguage} and translatable text "${text}". Returning original text so that Google Translate can translate for us`,
      );
      return null;
    } else {
      return translation;
    }
  }
}
