// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import Link from "next/link";
import { LocationsNavbarCompanyRoutes } from "../components/locations-navbar";
import { Footer } from "../components/footer";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <LocationsNavbarCompanyRoutes />
      <section className="flex-1 flex items-center justify-center bg-white px-5 pt-28 pb-16 lg:pt-32">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
          </div>
          <p className="text-sm font-semibold text-red-500 uppercase tracking-widest mb-3">
            500 — Server Error
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Something went wrong.
          </h1>
          <p className="text-gray-500 mb-10 leading-relaxed">
            We're sorry — an unexpected error occurred on our end. Please try
            again, or head back home.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={reset}>
              Try again
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
