"use client";

import { StatementRussianTranslation } from "@/components/translations/statement";
import { STATEMENT_ROUTE } from "../../../components/common"; // ✅ keep STATEMENT_ROUTE
import { useContext } from "react";
import {
  getTargetLanguage,
  LanguageTranslationContext,
  LanguageTranslationContextType,
} from "@/components/language-translation-context";

export function Statement() {
  const governingLawInternalLinkId = "governing_law_footnote";
  const { gTranslateCookie } = useContext(
    LanguageTranslationContext,
  ) as LanguageTranslationContextType;

  const targetLanguage = gTranslateCookie
    ? getTargetLanguage(gTranslateCookie)
    : null;

  return targetLanguage === "ru" ? (
    <StatementRussianTranslation />
  ) : (
    <>
      <section className="bg-white pt-28 lg:pt-32 lg:py-20">
        <div className="px-5 max-w-3xl mx-auto">
          <h1 className="text-center font-medium text-2xl lg:text-4xl mb-8">
            Streetlives: Here to Help
          </h1>
          <div className="text-base prose prose-a:text-blue">
            <p>
              At Streetlives, we believe everyone deserves access to resources
              that support their well-being, regardless of background or
              immigration status.
            </p>

            <h2 className="text-xl font-semibold mt-6">Who We Are</h2>
            <ul className="list-disc list-inside">
              <li>A diverse team with firsthand experience of homelessness and immigration.</li>
              <li>Members include asylum seekers and individuals from various ethnicities, genders, and orientations.</li>
              <li>Our personal experiences help us relate to the challenges faced by people seeking services.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">What We Offer</h2>
            <ul className="list-disc list-inside ml-4">
              <li>
                Our peer-powered platform with up-to-date information on social
                services in New York City.
                <ul className="list-[circle] list-inside ml-4">
                  <li>Clothing</li>
                  <li>Education</li>
                  <li>Employment</li>
                  <li>Food</li>
                  <li>Housing support</li>
                  <li>Legal aid</li>
                  <li>Medical care</li>
                  <li>Mental health resources</li>
                </ul>
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">How We Support You</h2>
            <ul className="list-disc list-inside">
              <li>We highlight any eligibility requirements so you know what to expect.</li>
              <li>We prioritize your privacy by never collecting personal data.</li>
              <li>We offer language support for non-native English speakers.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 bg-yellow-100 p-3 rounded-md">
              Our Commitment In Uncertain Times
            </h2>
            <div className="bg-yellow-100 p-3 rounded-md">
              <ul className="list-disc list-inside">
                <li>As new policies target reproductive rights, gender self-identification, and immigration, we recognize many feel fear and uncertainty—particularly undocumented individuals who may face ICE encounters.</li>
                <li>Despite these challenges, our dedication to serving you remains unwavering.</li>
              </ul>
            </div>

            <h2 className="text-xl font-semibold mt-6">Connect With Us</h2>
            <ul className="list-disc list-inside">
              <li>Thank you for standing with us.</li>
              <li>
                Have suggestions or concerns? We welcome them at{" "}
                <a
                  href="mailto:team@streetlives.nyc"
                  className="text-blue-600 underline"
                >
                  team@streetlives.nyc
                </a>
                .
              </li>
            </ul>

            <p className="mt-4 font-semibold">
              We’re here to help you find the resources you need—now and always.
            </p>

            <div className="mt-4">
              <a href={`/${STATEMENT_ROUTE}`} className="primary-button">
                Explore services
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
