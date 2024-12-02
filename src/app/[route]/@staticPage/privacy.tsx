// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import Link from "next/link";
import { LOCATION_ROUTE, TERMS_OF_USE_ROUTE } from "../../../components/common";
import { useContext } from "react";
import {
  getTargetLanguage,
  LanguageTranslationContext,
  LanguageTranslationContextType,
} from "@/components/language-translation-context";
import { PrivacyPolicyRussianTranslation } from "@/components/translations/privacy";

export function PrivacyPage() {
  const { gTranslateCookie } = useContext(
    LanguageTranslationContext
  ) as LanguageTranslationContextType;

  const targetLanguage = gTranslateCookie
    ? getTargetLanguage(gTranslateCookie)
    : null;

  return targetLanguage === "ru" ? (
    <PrivacyPolicyRussianTranslation />
  ) : (
    <>
      <section className="bg-white pt-28 lg:pt-32 lg:py-20">
        <div className="px-5 max-w-3xl mx-auto">
          <h1 className="text-center font-medium text-2xl lg:text-4xl mb-8">
            Privacy Policy
          </h1>
          <div className="text-base text-dark prose">
            <p>
              <span>Last Updated&nbsp;</span>
              <time dateTime="2023-08-15">November 28, 2024</time>
              <span>.</span>
            </p>
            <p>
              <span>
                This Privacy Policy applies to your access and use of all
                products and services that are made available through
                Streetlives, Inc. (“Streetlives”) website, located at
              </span>{" "}
              <Link href="https://yourpeer.nyc">https://yourpeer.nyc</Link>
              <span>
                &nbsp;(the “Site”), and is incorporated into and is the subject
                to Streetlives’
              </span>{" "}
              <Link href={`/${TERMS_OF_USE_ROUTE}`}>Terms of Use</Link>
              <span>
                &nbsp;(the “Terms”). Capitalized terms that are not defined in
                the Privacy Policy have the meaning given to them in the Terms.
              </span>
            </p>
            <p>
              This Privacy Policy only applies to information collected on the
              Site and is not intended to fully describe the privacy policies of
              Streetlives. It describes the information that we gather from you,
              how we use and disclose your information, and the steps we take to
              protect your information.
            </p>

            <h2>The information that we collect:</h2>
            <ul>
              <li className="">
                <strong>Personal Information</strong> <br />
                <p>
                  Generally, you can visit the Site without telling us who you
                  are or revealing any Personal Information (when we use the
                  term “Personal Information,” we mean information that can be
                  associated with a specific person and can be used to identify
                  that person, such as name, e-mail address, mailing address,
                  mobile phone number, age, gender, date of birth, as well as
                  additional sensitive information such as your social security
                  number, financial information, financial account information,
                  and other similar types of information). If you do provide us
                  with Personal Information, we will store and use that
                  information in accordance with this Policy. For example, you
                  may provide us with Personal Information when you contact us
                  or request information about us, this Site and our products or
                  services (whether by email or other means).
                </p>
              </li>
              <li>
                <strong>Cookies Information</strong> <br />
                <p>
                  When you use the Site, we may send one or more Cookies (which
                  are small text files containing a string of alphanumeric
                  characters) to your computer or mobile device, to help analyze
                  our web page flow, customize our content, measure promotional
                  effectiveness, and promote trust and safety. You are always
                  free to decline our cookies if your browser permits, although
                  doing so may interfere with your ability to use the Site or
                  certain features of the Site. We may also use Google Analytics
                  or a similar service that uses Cookies to help us analyze how
                  users use the Site.
                </p>
              </li>
              <li>
                <strong>Automatically Collected Information</strong> <br />
                <p>
                  When you visit the Site, we may automatically receive and
                  record certain information from your computer, web browser
                  and/or mobile device, including your IP address or other
                  device address or ID, web browser and/or device type, hardware
                  and software settings and configurations, the web pages or
                  sites that you visit just before or just after visiting the
                  Site, the pages you view on the Site, your actions on the
                  Site, and the dates and times that you visit, access, or use
                  the Site. When you use the Site on a mobile device, we may
                  also collect the physical location of your device by, for
                  example, using satellite, cell phone tower or wireless local
                  area network signals.
                </p>
              </li>
            </ul>

            <h2>How we use the information we collect:</h2>
            <ul>
              <li>
                <p>
                  We use non-identifying information about your use of the Site
                  to understand and analyze the usages trends and preferences of
                  our users, to improve the Site, and to improve fraud detection
                  and information security.
                </p>
              </li>
              <li>
                <p>
                  We may use your email address to contact you for
                  administrative purposes such as confirming your Streetlives
                  Partner feedback was submitted successfully. Please note that
                  if you share your email address with a Streetlives Partner
                  when you submit feedback on the Site, such Partner may contact
                  you with updates about your feedback or their services. Please
                  review the providers’ privacy policies for more information
                  about how they use your Personal Information.
                </p>
              </li>
              <li>
                <p>
                  We may use Cookies Information and Automatically Collected
                  Information to: (a) personalize our services; (b) provide
                  customized content and information; (c) monitor and analyze
                  the effectiveness of the Site; and (d) monitor aggregate site
                  usage metrics such as total number of visitors and pages
                  viewed.
                </p>
              </li>
            </ul>

            <h2>When we disclose information:</h2>
            <ul>
              <li>
                <p>
                  We may disclose your information to our vendors and other
                  service providers to perform services for us such as creation,
                  maintenance, hosting, delivery, and marketing of our Sites.
                </p>
              </li>
              <li>
                <p>
                  We may disclose your information if required to do so by law
                  or in the good-faith belief that such action is necessary to
                  take precautions against liability; to protect Streetlives
                  from fraudulent, abusive, or unlawful uses or activity; to
                  protect the security or integrity of the Site; to investigate
                  and defend ourselves against any third party claims or
                  allegations; to assist government enforcement agencies; or to
                  comply with state and federal laws, in response to a court
                  order, judicial or other government subpoena or warrant.
                </p>
              </li>
              <li>
                <p>
                  When you submit feedback about a Streetlives Partner on the
                  Site, we make your feedback available to the applicable
                  Partner to comply with various reporting obligations, and for
                  the Partner to improve their services. When possible, we
                  provide this information in a de-identified way. If you choose
                  to share your email address with a Streetlives Partner when
                  you submit feedback on the Site, we will share your email
                  address with the Partner so that the providers may contact you
                  with updates about your feedback or their services. Please
                  review the Partners’ privacy policies for more information
                  about how the Partner may use your Personal Information.
                </p>
              </li>

              <li>
                <p>
                  In the event Streetlives were to be engaged in or
                  contemplating a divestiture, merger, consolidation, or asset
                  sale, or in the unlikely event of a bankruptcy, Streetlives
                  may transfer or assign the data, including Personal
                  Information, that we have collected from users.
                </p>
              </li>
            </ul>

            <h2>Your Choices:</h2>
            <ul>
              <li>
                <p>
                  You may, of course, decline to share certain information with
                  us, in which case we may not be able to provide to you some of
                  the features and functionality of the Site.
                </p>
              </li>
              <li>
                <p>
                  <span>
                    As we may collect certain Personal Information, you may
                    request to access, correct, delete, or restrict use of
                    certain Personal Information covered by this Privacy Policy.
                    While Streetlives will make reasonable efforts to
                    accommodate your request, we also reserve the right to
                    impose restrictions and requirements on such requests, if
                    allowed or required by applicable laws, and we are under no
                    obligation to grant such a request, unless required by
                    applicable laws. Please note that it may also take some time
                    to process your request. For inquiries, please contact us at
                  </span>{" "}
                  <a href="mailto:privacy@streetlives.nyc">
                    privacy@streetlives.nyc
                  </a>
                  <span>.</span>
                </p>
              </li>
            </ul>

            <h2>Our Commitment to Children’s Privacy:</h2>
            <p>
              <span>
                We do not and will not knowingly collect personal information
                (as defined in the U.S. Children&apos;s Online Privacy Protection
                Act) from any unsupervised child under the age of 13. As stated
                in our
              </span>
              <Link href="/terms-of-use" className="ml-1">Streetlives Terms of Use</Link>
              <span>
                you must be at least eighteen (18) years of age to use the Site,
                unless your parent or guardian has provided us with their
                consent for your use of the Services
              </span>
            </p>

            <h2>Our Commitment to Data Security:</h2>
            <p>
              We use certain physical, managerial, and technical safeguards that
              are designed to protect the integrity and security of your
              information; however, no security measures are perfect or
              impenetrable, so we cannot ensure or warrant the security of any
              information you transmit to us through the Site, and you do so at
              your own risk. We also cannot guarantee that such information may
              not be accessed, disclosed, altered, or destroyed by breach of any
              of our physical, technical, or managerial safeguards. We cannot
              control the actions of other users or other third parties with
              whom you may choose to share your information and therefore we
              cannot and do not guarantee that information you post through the
              Site will not be viewed by unauthorized persons. We are not
              responsible for circumvention of any privacy settings or security
              measures contained on the Site. Even after removal, copies of
              information that you have posted may remain viewable in cached and
              archived pages or if other users have copied or stored such
              information. We retain information as long as it is reasonably
              necessary and relevant for our operations, and/or to comply with
              the law, prevent fraud, collect any fees owed, resolve disputes,
              troubleshoot problems, assist with any investigation, or enforce
              our Terms or other agreements.
            </p>

            <h2>Visitors from Outside the United States:</h2>
            <p>
              This Site is controlled and operated by Streetlives in the United
              States. If you choose to access the Site from outside the United
              States, you acknowledge that you will be transferring your
              information, including Personal Information, outside of those
              regions to the United States for storage and processing, as
              necessary to provide to you the products and services available
              through the Site. Where required, we comply with applicable legal
              frameworks relating to the collection, storage, use, and transfer
              of personal information.
            </p>

            <h2>Changes and Updates to this Privacy Policy:</h2>
            <p>
              We reserve the right to make changes to this Privacy Policy at any
              time. We will notify you about significant changes in the way we
              treat your information, including by placing a prominent notice on
              the Site or by sending you an email so that you can choose whether
              to continue using the Site. Material modifications are effective
              30 calendar days after our initial notification or upon your
              acceptance of the modified Terms. Immaterial modifications are
              effective upon posting of the updated Privacy Policy or Terms of
              Service on the Site. Please revisit this page periodically to stay
              aware of any changes to this Privacy Policy. For the avoidance of
              doubt, disputes arising hereunder will be resolved in accordance
              with the Privacy Policy in effect at the time the dispute arose.
            </p>

            <h2>Our Contact Information:</h2>
            <p>
              <span>
                Please contact us with any questions or comments about this
                Privacy Policy, your personal information, our use and disclosure
                practices, or your consent choices by e-mail at
              </span>
              <a href="mailto:privacy@streetlives.nyc" className="ml-1">
                privacy@streetlives.nyc.
              </a>
            </p>

            <address>
              <span>Attn: Privacy</span>
              <br />
              <span>Streetlives, Inc.</span>
              <br />
              <span>251 Little Falls Drive</span>
              <br />
              <span>Wilmington, DE 19808</span>
            </address>
          </div>
        </div>
      </section>
      <section className="py-12 bg-neutral-50 mt-12 lg:mt-0">
        <div className="px-5 max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            <img
              src="/img/icons/unity-icon.svg"
              className="w-28 mx-auto object-contain mb-10"
              alt=""
            />
            <h2 className="text-4xl text-dark mb-10 text-center font-light">
              You&apos;re not alone in this journey
            </h2>
            <p className="text-center text-gray-800 text-sm px-2 mb-5">
              People rely on social services for many reasons. Our information
              specialists all have lived experiences navigating the support
              system and apply their knowledge collecting the information you
              find here. We&apos;re building YourPeer so it&apos;s easier for
              you to find the right service.
            </p>
            <div>
              <Link href={`/${LOCATION_ROUTE}`} className="primary-button">
                {" "}
                Explore services{" "}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
