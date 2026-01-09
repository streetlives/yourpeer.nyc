// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import OffCanvasMenu from "./OffCanvasMenu";
import { GTranslateSelect } from "./gtranslate-select";
import "@aws-amplify/ui-react/styles.css";
import { SignInNavbarLink } from "./sign-in-navbar-link";
import DonationBanner from "./donation-banner";

const SHOW_DONATION_BANNER = process.env.NEXT_PUBLIC_DONATION_BANNER === "true";

export default function Navbar({ background = true }: { background: boolean }) {
  const [open, setOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const handleScroll = (e: Event): void => {
    let scrollPosition = window.scrollY;

    // Check if the scroll position is greater than or equal to 50px
    if (scrollPosition >= 50) {
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <OffCanvasMenu open={open} onClose={() => setOpen(false)} />
      <header
        className={`fixed top-0 inset-x-0 z-10 transition-colors ${
          background || isSticky ? "bg-amber-300" : ""
        }`}
        id="header"
      >
        {SHOW_DONATION_BANNER && <DonationBanner />}
        <nav className="flex items-center justify-between px-5 py-5 h-16 max-w-5xl mx-auto w-full">
          <div className="flex items-center space-x-3">
            <button
              className="hover:cursor-pointer text-gray-900 hover:text-gray-600 hover:brightness-125 inline-block transition"
              id="offCanvasMenuButton"
              onClick={() => setOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <Link href="/" translate="no" className="text-[15px] pt-[2px]">
              <span className="text-black font-extrabold ">YourPeer</span>
              <span>NYC</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <GTranslateSelect />
            <SignInNavbarLink />
          </div>
        </nav>
      </header>
    </>
  );
}
