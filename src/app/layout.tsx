// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { LanguageTranslationProvider } from "@/components/language-translation-context";
import "./globals.css";
import {GoogleAnalytics, GoogleTagManager} from "@next/third-parties/google";
import type { Viewport } from "next";
import { CookiesProvider } from "next-client-cookies/server";
import Script from "next/script";
// import Script from "next/script";

export const viewport: Viewport = {
  themeColor: "#FFD54F",
};

const GOOGLE_ANALYTICS_MEASUREMENT_ID = process.env
  .GOOGLE_ANALYTICS_MEASUREMENT_ID as string;

const NEXT_PUBLIC_GOOGLE_TAG_MANAGER_API_KEY = process.env
  .NEXT_PUBLIC_GOOGLE_TAG_MANAGER_API_KEY as string;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>

      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${NEXT_PUBLIC_GOOGLE_TAG_MANAGER_API_KEY}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${NEXT_PUBLIC_GOOGLE_TAG_MANAGER_API_KEY}');
        `}
      </Script>

      <body>
        <CookiesProvider>
          <LanguageTranslationProvider>{children}</LanguageTranslationProvider>
        </CookiesProvider>
        <GoogleAnalytics gaId={GOOGLE_ANALYTICS_MEASUREMENT_ID} />
        <GoogleTagManager gtmId="GTM-ND2QBSQH" />
      </body>
    </html>
  );
}
