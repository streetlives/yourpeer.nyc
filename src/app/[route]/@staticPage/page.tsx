// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";
import { use } from "react";

import {
  ABOUT_US_ROUTE,
  COMMENT_GUIDELINES_ROUTE,
  CompanyRoute,
  CONTACT_US_ROUTE,
  DONATE_ROUTE,
  LOGIN_ROUTE,
  PRIVACY_POLICY_ROUTE,
  STATEMENT_ROUTE,
  TERMS_OF_USE_ROUTE,
} from "../../../components/common";
import { AboutUsPage } from "./about-us";
import { ContactUsPage } from "./contact-us";
import { DonationPage } from "./donate";
import { Statement } from "./statement";
import { PrivacyPage } from "./privacy";
import { notFound } from "next/navigation";
import { LoginPage } from "./login";
import { Terms } from "./terms";
import { CommentGuidelines } from "./comment-guidelines";

export default function StaticPage(props: {
  params: Promise<{ route: string }>;
}) {
  const params = use(props.params);

  const { route } = params;

  const companyRoute: CompanyRoute = route as CompanyRoute;
  switch (companyRoute) {
    case ABOUT_US_ROUTE:
      return <AboutUsPage />;
    case CONTACT_US_ROUTE:
      return <ContactUsPage />;
    case DONATE_ROUTE:
      return <DonationPage />;
    case STATEMENT_ROUTE:
      return <Statement />;
    case PRIVACY_POLICY_ROUTE:
      return <PrivacyPage />;
    case LOGIN_ROUTE:
      return <LoginPage />;
    case TERMS_OF_USE_ROUTE:
      return <Terms />;
    case COMMENT_GUIDELINES_ROUTE:
      return <CommentGuidelines />;
    default:
      return notFound();
  }
}
