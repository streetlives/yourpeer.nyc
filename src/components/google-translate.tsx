"use client";

import { useEffect, useState } from "react";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "zh-CN", name: "中文" },
  { code: "bn", name: "বাংলা" },
  { code: "fr", name: "Français" },
  { code: "ru", name: "Русский" },
  { code: "ff", name: "Fulfulde" },
  { code: "wo", name: "Wolof" },
];

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export default function LanguageSelector() {
  const [selected, setSelected] = useState("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang) {
      setSelected(savedLang);
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: languages.map((l) => l.code).join(","),
        },
        "google_translate_element",
      );
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const changeLanguage = (lang: string) => {
    setSelected(lang);
    localStorage.setItem("selectedLanguage", lang);

    const tryChange = () => {
      const selectEl =
        document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (selectEl) {
        selectEl.value = lang;
        const event = new Event("change", { bubbles: true });
        selectEl.dispatchEvent(event);
      } else {
        setTimeout(tryChange, 100);
      }
    };

    setTimeout(tryChange, 200);
  };

  useEffect(() => {
    console.log(selected);
  }, []);

  return (
    <div>
      <div id="google_translate_element" style={{ display: "none" }} />

      <select
        value={selected}
        onChange={(e) => changeLanguage(e.target.value)}
        className="border-none bg-transparent w-28 text-sm font-medium rounded p-2 notranslate"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
