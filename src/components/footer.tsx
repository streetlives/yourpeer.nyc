// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import Link from "next/link";
import {
  ABOUT_US_ROUTE,
  CATEGORY_TO_ROUTE_MAP,
  CONTACT_US_ROUTE,
  DONATE_ROUTE,
  LOCATION_ROUTE,
  PRIVACY_POLICY_ROUTE,
  TERMS_OF_USE_ROUTE,STATEMENT_ROUTE
} from "./common";
import { TranslatableText } from "./translatable-text";

export function Footer() {
  return (
    <footer className="bg-black px-5 py-8">
      <div className="mx-auto max-w-5xl px-5 flex flex-col pt-11">
        <div>
          <div className="lg:flex">
            <div className="lg:flex-1">
              <h3 className="text-white font-semibold mb-5 text-left">
                <TranslatableText text="Company" />
              </h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-5 ">
                <div>
                  <Link
                    href={`/${ABOUT_US_ROUTE}`}
                    className="text-gray-300 text-base font-normal"
                  >
                    <TranslatableText text="About" />
                  </Link>
                </div>
                <div>
                  <Link
                    href={`/${TERMS_OF_USE_ROUTE}`}
                    className="text-gray-300 text-base font-normal"
                  >
                    <TranslatableText text="Terms" />
                  </Link>
                </div>               <div>
                  <Link
                    href={`/${STATEMENT_ROUTE}`}
                    className="text-gray-300 text-base font-normal"
                  >
                    <TranslatableText text="Statement" />
                  </Link>
                </div>
                <div>
                  <Link
                    href={`/${CONTACT_US_ROUTE}`}
                    className="text-gray-300 text-base font-normal"
                  >
                    <TranslatableText text="Contact" />
                  </Link>
                </div>
                <div>
                  <Link
                    href={`/${PRIVACY_POLICY_ROUTE}`}
                    className="text-gray-300 text-base font-normal"
                  >
                    <TranslatableText text="Privacy" />
                  </Link>
                </div>
                <div>
                  <Link
                    href={`/${DONATE_ROUTE}`}
                    className="text-gray-300 text-base font-normal"
                  >
                    <TranslatableText text="Donate" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="lg:flex-1 mt-8 lg:mt-0">
              <h3 className="text-white font-semibold mb-5 text-left">
                <TranslatableText text="Resources" />
              </h3>
              <div className="flex gap-x-5">
                <div className="flex flex-col gap-y-2 flex-1">
                  <div>
                    <Link
                      href={`/${LOCATION_ROUTE}`}
                      className="text-gray-300 text-base font-normal"
                    >
                      <TranslatableText text="All locations" />
                    </Link>
                  </div>
                  <div>
                    <Link
                      href={`/${CATEGORY_TO_ROUTE_MAP["shelters-housing"]}`}
                      className="text-gray-300 text-base font-normal"
                    >
                      <TranslatableText text="Shelter & Housing" />
                    </Link>
                  </div>
                  <div>
                    <Link
                      href={`/${CATEGORY_TO_ROUTE_MAP["food"]}`}
                      className="text-gray-300 text-base font-normal"
                    >
                      <TranslatableText text="Food" />
                    </Link>
                  </div>
                  <div>
                    <Link
                      href={`/${CATEGORY_TO_ROUTE_MAP["clothing"]}`}
                      className="text-gray-300 text-base font-normal"
                    >
                      <TranslatableText text="Clothing" />
                    </Link>
                  </div>
                </div>
                <div className="flex flex-col gap-y-2 flex-1">
                  <div>
                    <Link
                      href={`/${CATEGORY_TO_ROUTE_MAP["personal-care"]}`}
                      className="text-gray-300 text-base font-normal"
                    >
                      <TranslatableText text="Personal Care" />
                    </Link>
                  </div>
                  <div>
                    <Link
                      href={`/${CATEGORY_TO_ROUTE_MAP["personal-care"]}`}
                      className="text-gray-300 text-base font-normal"
                    >
                      <TranslatableText text="Health Care" />
                    </Link>
                  </div>
                  <div>
                    <Link
                      href={`/${CATEGORY_TO_ROUTE_MAP["other"]}`}
                      className="text-gray-300 text-base font-normal"
                    >
                      <TranslatableText text="Other Services" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 lg:mt-0">
              <h3 className="text-white font-semibold mb-5 text-left">
                <TranslatableText text="Social" />
              </h3>
              <div className="flex gap-x-5">
                <div className="flex flex-col gap-y-2 flex-1">
                  <div>
                    <Link
                      href="https://www.tiktok.com/@YourPeer.NYC"
                      target="_blank"
                      className="text-gray-300 text-base font-normal notranslate"
                    >
                      Tiktok
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="https://www.instagram.com/YourPeer.NYC"
                      target="_blank"
                      className="text-gray-300 text-base font-normal notranslate"
                    >
                      Instagram
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="https://www.facebook.com/yourpeer.nyc"
                      target="_blank"
                      className="text-gray-300 text-base font-normal notranslate"
                    >
                      Facebook
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-14 pb-4">
            <p className="text-center text-gray-200 notranslate">
              &copy; Streetlives, Inc.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
