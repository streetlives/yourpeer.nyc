// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import { TranslatableText } from "@/components/translatable-text";

export function AboutUsPage() {
  return (
    <>
      <section className="bg-white py-12 pt-28 lg:pt-32 lg:py-20">
        <div className="px-5 max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-black text-2xl md:text-4xl mb-10 text-center font-extrabold">
              <TranslatableText text="About Us" />
            </h1>
            <p className="text-dark text-center mb-8">
              <TranslatableText text="YourPeer is a Streetlives product. Streetlives is a US nonprofit based in New York City." />
            </p>
            <p className="text-dark text-center">
              <TranslatableText text="We build technology in collaboration with unhoused people, people with lived experience of homelessness, New York social service providers, government, funders, and other system stakeholders in a whole-of-community partnership." />{" "}
              <span>For more information please</span>{" "}
              <a
                href="https://www.streetlives.nyc"
                target="_blank"
                className="text-blue underline"
              >
                visit our website
              </a>
              <span>.</span>
            </p>

            <div className="flex justify-center">
              <a href="https://www.streetlives.nyc" target="_blank">
                <img
                  src="/img/about-logo.png"
                  className="object-contain max-h-52"
                  alt=""
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-20 bg-neutral-50">
        <div className="px-5 max-w-5xl mx-auto">
          <div className="flex flex-col mb-8 items-center justify-center max-w-5xl mx-auto">
            <h2 className="text-gray-900 font-bold text-xl md:text-3xl mb-6 text-center">
              <TranslatableText text="Our information is peer-validated" />
            </h2>
            <p className="text-dark text-base text-center">
              <TranslatableText text="YourPeer's social service information is validated by our information specialists who all have lived experiences navigating the support system. They work hard to collect social services' information and keep them up-to-date." />{" "}
            </p>
          </div>

          <Swiper
            id="aboutSwiperContainer"
            className="w-full h-auto !py-12 carousel-wrapper"
            modules={[Pagination]}
            spaceBetween={50}
            slidesPerView={
              typeof window !== "undefined" && window.innerWidth <= 600 ? 1 : 3
            }
            pagination={{ clickable: true }}
          >
            <SwiperSlide className="swiper-slide w-full">
              <div className="px-6">
                <div className="flex items-center justify-center mb-6">
                  <img
                    src="/img/partners/one.png"
                    className="w-20 h-20 rounded-full object-cover object-center overflow-hidden  border-4 border-primary"
                    alt=""
                  />
                </div>
                <h3
                  className="text-gray-900 font-medium text-lg mb-2 text-center"
                  translate="no"
                >
                  <TranslatableText text="Antoinette" />{" "}
                  <TranslatableText text="(they/them)" />
                </h3>
                <div className="text-base text-gray-800 text-center">
                  <TranslatableText text="I am passionate about helping others and participating in NYC DYCD’s plans to eradicate homelessness." />
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide className="swiper-slide w-full">
              <div className="px-6">
                <div className="flex items-center justify-center mb-6">
                  <img
                    src="/img/partners/kiesha.jpg"
                    className="w-20 h-20 rounded-full object-cover object-center overflow-hidden border-4 border-primary"
                    alt=""
                  />
                </div>
                <h3
                  className="text-gray-900 font-medium text-lg mb-2 text-center"
                  translate="no"
                >
                  <TranslatableText text="Kiesha" />{" "}
                  <TranslatableText text="(she/her)" />
                </h3>
                <div className="text-base text-gray-800 text-center">
                  <TranslatableText text="Because of my previous work experience, I’m knowledgeable about health-related services." />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide className="swiper-slide w-full">
              <div className="px-6">
                <div className="flex items-center justify-center mb-6">
                  <img
                    src="/img/gavallan.png"
                    className="w-20 h-20 rounded-full object-cover object-center overflow-hidden border-4 border-primary"
                    alt=""
                  />
                </div>
                <h3
                  className="text-gray-900 font-medium text-lg mb-2 text-center"
                  translate="no"
                >
                  <TranslatableText text="Gavilán" />{" "}
                  <TranslatableText text="(he/him)" />
                </h3>
                <div className="text-base text-gray-800 text-center">
                  <TranslatableText text="My background in user research, marketing, and lived experience helps develop and promote YourPeer." />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide className="swiper-slide w-full">
              <div className="px-6">
                <div className="flex items-center justify-center mb-6">
                  <img
                    src="/img/partners/anthony.png"
                    className="w-20 h-20 rounded-full object-cover object-center overflow-hidden border-4 border-primary"
                    alt=""
                  />
                </div>
                <h3 className="text-gray-900 font-medium text-lg mb-2 text-center">
                  <TranslatableText text="Anthony" />{" "}
                  <TranslatableText text="(he/him)" />
                </h3>
                <div className="text-base text-gray-800 text-center">
                  <TranslatableText text="I have experience working with students and families and personally navigating homelessness in NYC." />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide className="swiper-slide w-full">
              <div className="px-6">
                <div className="flex items-center justify-center mb-6">
                  <img
                    src="/img/liz.jpg"
                    className="w-20 h-20 rounded-full object-cover object-center overflow-hidden border-4 border-primary"
                    alt=""
                  />
                </div>
                <h3 className="text-gray-900 font-medium text-lg mb-2 text-center">
                  <TranslatableText text="Liz" />{" "}
                  <TranslatableText text="(she/her)" />
                </h3>
                <div className="text-base text-gray-800 text-center">
                  <TranslatableText text="I'm naturally eager to support my community because I want the future generation to avoid facing my predicament." />
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>
    </>
  );
}
