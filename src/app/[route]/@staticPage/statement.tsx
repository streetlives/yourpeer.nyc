"use client";

import { StatementRussianTranslation } from "@/components/translations/statement";
import {  LOCATION_ROUTE } from "../../../components/common"; // ✅ keep STATEMENT_ROUTE
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
              <li>
                A diverse team with firsthand experience of homelessness and
                immigration.
              </li>
              <li>
                Members include asylum seekers and individuals from various
                ethnicities, genders, and orientations.
              </li>
              <li>
                Our personal experiences help us relate to the challenges faced
                by people seeking services.
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">What We Offer</h2>
            <ul className="list-disc list-inside ml-4">
              <li>
               <span>
      Our peer-powered platform with up-to-date information on social
      services in New York City.
    </span>
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
              <li>
                We highlight any eligibility requirements so you know what to
                expect.
              </li>
              <li>
                We prioritize your privacy by never collecting personal data.
              </li>
              <li>
                We offer language support for non-native English speakers.
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">
              {" "}
              Our Commitment In Uncertain Times
            </h2>

            <ul className="list-disc list-inside">
              <li>
                As new policies target reproductive rights, gender
                self-identification, and immigration, we recognize many feel
                fear and uncertainty—particularly undocumented individuals who
                may face ICE encounters.
              </li>
              <li>
                Despite these challenges, our dedication to serving you remains
                unwavering.
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">Connect With Us</h2>
            <ul className="list-disc list-inside">
              <li>    <span>
    
    Thank you for standing with us.</span></li>
        <li>
  <span>
    Have suggestions or concerns? We welcome them at{" "}
  </span>
  <a
    href="mailto:team@streetlives.nyc"
    className="text-blue-600 underline"
  >
    team@streetlives.nyc
  </a>
  <span>.</span>
</li>
            </ul>

            <p className="mt-4 font-semibold">
              We’re here to help you find the resources you need—now and always.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-neutral-50">
        <div className="px-5 max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            <img
              src="/img/icons/unity-icon.svg"
              className="w-28 mx-auto object-contain mb-10"
              alt=""
            />
            <h2 className="text-4xl text-dark mb-10 text-center font-light">
              You&apos;re not alone in this journey
            </h2>
            <p className="text-center text-gray-800 text-sm px-2 mb-5">
              People rely on social services for many reasons. Our information
              specialists all have lived experiences navigating the support
              system and apply their knowledge collecting the information you
              find here. We’re building YourPeer so it&apos;s easier for you to
              find the right service.
            </p>
            <div>
              <a href={`/${LOCATION_ROUTE}`} className="primary-button">
                {" "}
                Explore services{" "}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
