"use client";

import classNames from "classnames";
import { useTranslatedText } from "./use-translated-text-hook";
import { useContext } from "react";
import {
  getTargetLanguage,
  LanguageTranslationContext,
  LanguageTranslationContextType,
} from "./language-translation-context";

export function TranslatableText({
  text,
  id,
  className,
  expectTranslation = true,
  style,
}: {
  text: string;
  id?: string;
  className?: string;
  expectTranslation?: boolean;
  style?: Record<string, string>;
}) {
  const translation = useTranslatedText({
    text,
    id,
    expectTranslation: false,
  });

  const { gTranslateCookie } = useContext(
    LanguageTranslationContext,
  ) as LanguageTranslationContextType;

  const targetLanguage = gTranslateCookie
    ? getTargetLanguage(gTranslateCookie)
    : null;

  const classnames = `${className ? `${className} ` : ""}${classNames({ notranslate: !!translation })}`;
  return (
    <span
      id={id}
      className={classnames}
      lang={translation && targetLanguage ? targetLanguage : undefined}
      style={style}
    >
      {translation || text}
    </span>
  );
}
