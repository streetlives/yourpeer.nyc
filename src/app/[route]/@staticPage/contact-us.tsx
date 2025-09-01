// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { TranslatableText } from "@/components/translatable-text";

export function ContactUsPage() {
  return (
    <section className="bg-white py-12 pt-28 lg:pt-32 lg:py-20">
      <div className="px-5 max-w-xl mx-auto">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-black text-2xl md:text-4xl font-extrabold mb-6 text-center">
            <TranslatableText text="Contact us" />
          </h1>
          <p className="text-dark text-center mb-6">
            <TranslatableText text="Thank you for your interest in YourPeer." />
          </p>
          <p className="text-dark text-center mb-6">
            <TranslatableText text="If you have general questions or feedback for us, please email us at" />{" "}
            <a
              href="mailto:yourpeer@streetlives.nyc"
              className="link notranslate"
            >
              yourpeer@streetlives.nyc
            </a>
            <span className="notranslate">.</span>
          </p>
          <p className="text-dark text-center mb-6">
            <TranslatableText text="If you are an organization or individual interested in working with us, please email us at" />{" "}
            <a
              href="mailto:yourpeerpartner@streetlives.nyc"
              className="link notranslate"
            >
              yourpeerpartner@streetlives.nyc
            </a>
            <span className="notranslate">.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
