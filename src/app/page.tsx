// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import type { Metadata } from "next";
import { Footer } from "../components/footer";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import GTranslateWrapper from "@/components/gtranslate-wrapper";
import { TranslatableText } from "@/components/translatable-text";
import Image from "next/image";

export const metadata: Metadata = {
  title: "New York City Services & Resources For Unhoused People | YourPeer",
  description:
    "Find housing, food pantries, clothing assistance, personal care resources, healthcare services, and more resources for unhoused people in NYC verified by the community with YourPeer.",
};

const services = [
  {
    name: "Shelter & Housing",
    icon: "/img/icons/services/house.svg",
    href: "/shelters-housing",
  },
  { name: "Food", icon: "/img/icons/services/food.svg", href: "/food" },
  {
    name: "Clothing",
    icon: "/img/icons/services/clothing.svg",
    href: "/clothing",
  },
  {
    name: "Personal Care",
    icon: "/img/icons/services/personal-care.svg",
    href: "/personal-care",
  },
  {
    name: "Health",
    icon: "/img/icons/services/health.svg",
    href: "/health-care",
  },
  {
    name: "Mental Health",
    icon: "/img/icons/services/mental-health.svg",
    href: "/health-care/mental-health",
  },
  {
    name: "Legal Services",
    icon: "/img/icons/services/legal.svg",
    href: "/other-services/legal-services",
  },
  {
    name: "Employment",
    icon: "/img/icons/services/employment.svg",
    href: "/other-services/employment",
  },
  {
    name: "Other",
    icon: "/img/icons/services/other.svg",
    href: "/other-services",
  },
];

export default async function HomePage() {
  return (
    <>
      <GTranslateWrapper />
      <Navbar background={false} />

      <div className="relative w-full flex flex-col bg-center pt-16 overflow-hidden bg-cover bg-no-repeat bg-amber-300">
        <Image
          src={"/img/home-banner.avif"}
          alt="Hero background"
          fill
          priority
          fetchPriority="high"
          quality={60}
          sizes="100vw"
          className="object-cover"
        />

        <div className="pb-12 relative z-10 pt-28 lg:pt-40 sm:pb-36 px-8 sm:px-12 flex flex-col justify-center items-center md:flex-1 max-w-2xl mx-auto">
          <h1
            className="customTranslation text-grey-900 font-extrabold text-3xl md:text-5xl text-center lg:leading-tight"
            data-text="Free support services validated by your peers"
          >
            <TranslatableText text="Free support services validated by your peers"></TranslatableText>
          </h1>
          <p className="text-base text-grey-900 text-center my-5 sm:my-6 font-semibold">
            <TranslatableText
              text={`Search through 2,800+ free support services across NYC`}
            ></TranslatableText>
          </p>
          <div className="w-full max-w-sm mx-auto flex justify-center">
            <Link href="/locations" className="primary-button ">
              <TranslatableText text="Explore services" />
            </Link>
          </div>
        </div>
      </div>

      <section
        className="max-w-5xl mx-auto w-full px-4 lg:-mt-8 -mt-4 mb-8 relative z-10"
        id="servicesList"
      >
        <ul
          className="w-full grid grid-cols-2 md:grid-cols-3 gap-3 "
          style={{ gridAutoRows: "1fr" }}
        >
          {services.map((s) => (
            <li key={s.name}>
              <Link
                href={s.href}
                className="flex h-24 sm:h-28 items-center justify-center flex-col px-5 py-4 lg:py-5 rounded sm:px-8 bg-white hover:bg-gray-100 transition shadow-service w-full"
              >
                <Image
                  src={s.icon}
                  width="37"
                  height="36"
                  className="object-contain flex-shrink-0"
                  alt={s.name + " icon"}
                />
                <div className="text-[13px] text-dark mt-2 font-semibold text-center">
                  <TranslatableText text={s.name} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="Testimonial"
        className="max-w-5xl mx-auto w-full px-5 py-12 lg:py-16"
      >
        <ul className="w-full flex flex-col lg:flex-row gap-10">
          <li className="lg:flex-1">
            <figure className="px-6">
              <div className="flex items-center justify-center">
                <Image
                  src="/img/avatar-n-1.avif"
                  width="80"
                  height="80"
                  className="w-20 h-20 rounded-full object-cover object-center border-4 border-pink-200"
                  alt="Avatar of Timantti"
                />
              </div>
              <blockquote className="mt-6 mb-3">
                <p className="text-gray-900 font-semibold text-xl text-center">
                  <TranslatableText text="YourPeer offers hope" />
                </p>
              </blockquote>

              <figcaption
                className="text-base text-grey-700 text-center"
                translate="no"
              >
                Timantti
              </figcaption>
            </figure>
          </li>
          <li className="lg:flex-1">
            <figure className="px-6">
              <div className="flex items-center justify-center">
                <Image
                  src="/img/avatar-3.avif"
                  width="80"
                  height="80"
                  className="w-20 h-20 rounded-full object-cover object-center border-4 border-[#B3E5FC]"
                  alt="Avatar of Kenia"
                />
              </div>
              <blockquote className="mt-6 mb-3">
                <p className="text-gray-900 font-semibold text-xl text-center">
                  <TranslatableText text="Usually, if I need something, I ask. But this is faster, easier, better." />
                </p>
              </blockquote>

              <figcaption
                className="text-base text-grey-700 text-center"
                translate="no"
              >
                Kenia
              </figcaption>
            </figure>
          </li>
          <li className="lg:flex-1">
            <figure className="px-6">
              <div className="flex items-center justify-center">
                <Image
                  src="/img/avatar-1.avif"
                  width="80"
                  height="80"
                  className="w-20 h-20 rounded-full object-cover object-center border-4 border-[#A5D6A7]"
                  alt="Avatar of Jeffrey"
                />
              </div>
              <blockquote className="mt-6 mb-3">
                <p className="text-gray-900 font-semibold text-xl text-center">
                  <TranslatableText text="I know this information is good. It's from people like me." />
                </p>
              </blockquote>

              <figcaption
                className="text-base text-grey-700 text-center"
                translate="no"
              >
                Jeffrey
              </figcaption>
            </figure>
          </li>
        </ul>
      </section>

      <section className="py-12 bg-white">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-center text-3xl text-gray-700 font-bold mb-9">
            <TranslatableText text="Our Partners and Collaborators" />
          </h2>
          <div className="w-full grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 justify-center place-content-center items-center gap-x-3">
            <div className="flex items-center justify-center">
              <Image
                className="object-cover object-center w-24 sm:w-36 flex-shrink-0"
                src="/img/partners/nyc-fund-logo.avif"
                width={144}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-new-2.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-new-3.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-20 sm:w-24 h-20 sm:h-24 flex-shrink-0"
                src="/img/partners/logo-new-4.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-cover object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-5.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-cover object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-6.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-new-7.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-cover object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-10.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-new-8.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-new-9.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-new-10.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-new-11.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-cover object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-11.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/housing-works.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-cover object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-3.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-cover object-center w-20 sm:w-24 h-20 sm:h-24 flex-shrink-0"
                src="/img/partners/logo-new-12.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>

            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/start-care.png"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-20 sm:w-24 h-20 sm:h-24 flex-shrink-0"
                src="/img/partners/logo-new-14.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-cover object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-8.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <a
              href={"https://doobneek.org/"}
              target="_blank"
              className="flex items-center justify-center"
            >
              <Image
                className="object-cover object-center w-20 sm:w-24 flex-shrink-0"
                src="/img/partners/logo-21.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </a>

            <div className="flex items-center justify-center">
              <Image
                className="object-cover object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-4.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-cover object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-20.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-new-15.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-cover object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-18.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-cover object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-12.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/nyc-continuum-coc-of-care.avif"
                width={144}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-cover object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-17.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-cover object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-16.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-new-16.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-new-17.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-new-13.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-cover object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-9.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-new-18.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/convenant-house.avif"
                width={144}
                height={144}
                alt="Logo"
              />
            </div>
            <div className="flex items-center justify-center">
              <Image
                className="object-contain object-center w-24 sm:w-36 h-24 sm:h-36 flex-shrink-0"
                src="/img/partners/logo-new-20.avif"
                width={96}
                height={144}
                alt="Logo"
              />
            </div>
          </div>

          <p className="text-sm text-gray-800 text-center mb-6 px-5 mt-8 md:mt-16">
            <TranslatableText text="Food service information provided with the help of Hunter College NYC Food Policy Center." />
          </p>

          <p className="text-sm text-gray-800 text-center mb-6 px-5">
            <TranslatableText text="For more information, visit" />{" "}
            <a
              href="https://www.nycfoodpolicy.org/food/"
              className="text-blue-700 underline hover:no-underline"
            >
              www.nycfoodpolicy.org/food
            </a>
          </p>
        </div>
      </section>

      <section className="py-12 bg-neutral-50">
        <div className="px-5 max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            <Image
              src="/img/icons/unity-icon.svg"
              className="w-28 mx-auto object-contain mb-10"
              width={112}
              height={112}
              alt=""
            />
            <h2 className="text-3xl text-dark mb-8 text-center font-bold">
              <TranslatableText text="You’re not alone in this journey" />
            </h2>
            <p className="text-center text-gray-800 text-sm px-2 mb-5">
              <TranslatableText text="People rely on social services for many reasons. We’re building YourPeer so it's easier for you to find the right service." />
            </p>
            <div>
              <Link href="/locations" className="primary-button">
                <TranslatableText text="Explore services" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
