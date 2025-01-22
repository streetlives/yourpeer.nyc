// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import OffCanvasMenu from "@/components/OffCanvasMenu";
import QuickExit from "./quick-exit";
import SearchForm from "./search-form";
import { useState } from "react";
import { GTranslateSelect } from "./gtranslate-select";
import { SignInNavbarLink } from "./sign-in-navbar-link";

export const LocationsNavbarResourceRoutes = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <OffCanvasMenu open={open} onClose={() => setOpen(false)} />
      <div className="bg-white relative z-50 shadow w-full flex flex-col">
        <nav className="flex space-x-3 items-center justify-between px-5 py-2 md:py-3">
          <div className="flex items-center">
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
            <a
              href="/"
              translate="no"
              className="text-sm ml-3 leading-3 hidden sm:inline-block"
            >
              <span className="text-black font-extrabold">YourPeer</span>
              <span>NYC</span>
            </a>
          </div>
          <div id="search_container" className="flex-grow md:flex-none">
            <div className="flex items-center relative rounded py-1 px-2 sm:px-3 md:p-3 border border-gray-300 w-full sm:w-64 md:w-96">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <SearchForm />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <SignInNavbarLink />
            <QuickExit />
          </div>
        </nav>
      </div>
    </>
  );
};

export const LocationsNavbarCompanyRoutes = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <OffCanvasMenu open={open} onClose={() => setOpen(false)} />
      <header className="fixed top-0 inset-x-0 z-10 bg-amber-300" id="header">
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
            <a href="/" translate="no" className="text-[15px]">
              <span className="text-black font-extrabold ">YourPeer</span>
              <span>NYC</span>
            </a>
          </div>
          <div className="flex items-center space-x-2">
            <SignInNavbarLink />
            <GTranslateSelect />
            <QuickExit />
          </div>
        </nav>
      </header>
    </>
  );
};
