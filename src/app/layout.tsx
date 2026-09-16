// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { LanguageTranslationProvider } from "@/components/language-translation-context";
import "./globals.css";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import { CookiesProvider } from "next-client-cookies/server";
import Script from "next/script";
import { Toaster } from "sonner";
import QueryClientProvider from "@/app/QueryClientProvider";
import GTProdGuardScript from "@/components/gt-prod-guard-script";
import { AiSearchEnabledProvider } from "@/components/ai-search-context";
import { isAiSearchEnabled } from "@/components/feature-flags";
import { inter } from "./fonts";
import PublicCallingProvider from "@/components/calling/public-calling-provider";
import { isPublicCallingConfigured } from "@/lib/public-calling-server";

export const viewport: Viewport = {
  themeColor: "#FFD54F",
};

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
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
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <GTProdGuardScript />
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
          <LanguageTranslationProvider>
            <AiSearchEnabledProvider enabled={isAiSearchEnabled()}>
              <QueryClientProvider>
                <PublicCallingProvider
                  enabled={isPublicCallingConfigured()}
                  sitekey={process.env.PUBLIC_CALLING_TURNSTILE_SITE_KEY || ""}
                >
                  {children}
                </PublicCallingProvider>
              </QueryClientProvider>
            </AiSearchEnabledProvider>
          </LanguageTranslationProvider>
        </CookiesProvider>
        <Toaster />
        <GoogleAnalytics gaId={GOOGLE_ANALYTICS_MEASUREMENT_ID} />
        <GoogleTagManager gtmId="GTM-ND2QBSQH" />
      </body>
    </html>
  );
}
