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
    LanguageTranslationContext,
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
          <div className="text-base text-dark prose prose-a:text-blue">
            <p>
              <span>Last Updated&nbsp;</span>
              <time dateTime="2023-08-15">July 1, 2025</time>
              <span>.</span>
            </p>
            <p>
              <span>
                <span>This&nbsp;</span>
                <strong>Privacy Policy</strong>
                <span>
                  &nbsp;applies to your access and use of all products and
                  services that are made available through Streetlives, Inc. (
                </span>
              </span>
              {'"'}
              <strong>Streetlives</strong>
              {'"'}
              <span>,&nbsp;</span>
              {'"'}
              <strong>we</strong>
              {'"'}
              <span>&nbsp;or&nbsp;</span>
              {'"'}
              <strong>us</strong>
              {'"'}
              <span>
                <span>) websites, including those located at&nbsp;</span>
                <a href="https://yourpeer.nyc">https://yourpeer.nyc</a>
                <span>
                  <span>,&nbsp;</span>
                  <a href="https://streetlives.nyc">https://streetlives.nyc</a>
                  <span>
                    <span>
                      , and any other Streetlives website, mobile application,
                      online portal, electronic form, survey or other channel
                      that we manage or operate (the&nbsp;
                    </span>
                    {'"'}
                    <strong>Site</strong>
                    {'"'}
                    <span>
                      ), and is incorporated into and is the subject to
                      Streetlives
                    </span>
                    {"'"}
                    <span>
                      &nbsp;
                      <a href={TERMS_OF_USE_ROUTE}>Terms of Use</a>
                      <span>&nbsp;(the&nbsp;</span>
                    </span>
                    {'"'}
                    <strong>Terms</strong>
                    {'"'}
                    <span>
                      ). Capitalized terms that are not defined in this Privacy
                      Policy have the meaning given to them in the Terms.
                    </span>
                  </span>
                </span>
              </span>
            </p>
            <p>
              This Privacy Policy only applies to information collected on the
              Site and is not intended to fully describe the privacy policies of
              Streetlives. It describes the information that we gather from you,
              how we use and disclose your information, and the steps we take to
              protect your information.
            </p>

            <p>
              In particular, this Privacy Policy does not apply to data
              collected by any third party, including any application or content
              (including advertising content) that may link to or otherwise be
              accessible from the Site. We are not responsible for any of the
              content or privacy practices of any third-party sites or services.
              Any data that is collected by any linked third-party site will be
              governed by that third party&apos;s applicable privacy notices and
              its terms of use. We strongly encourage you to read them.
            </p>

            <h2>The information that we collect:</h2>
            <ul>
              <li>
                <strong>Personal Information</strong> <br />
                <p>
                  <span>
                    Generally, you can visit the Site without telling us who you
                    are or revealing any Personal Information. When we use the
                    term&nbsp;
                  </span>
                  {'"'}
                  <strong>Personal Information</strong>
                  {'"'}
                  <span>
                    <span>
                      , we mean information that can be associated with a
                      specific person and can be used to identify that person,
                      such as name, e-mail address, mailing address, mobile
                      phone number, age, gender, date of birth, as well as
                      additional sensitive information such as your social
                      security number, financial information, financial account
                      information and other similar types of information. If you
                      do provide us with Personal Information, we will store and
                      use that information in accordance with this Policy. For
                      example, you may provide us with some or all of the
                      following categories of Personal Information:
                    </span>
                    <sup>1</sup>
                  </span>
                </p>
                <ul className="list-[circle]">
                  <li>
                    <p>Information about reviews and ratings, including:</p>
                    <ul className="list-disc">
                      <li>Which organization you reviewed.</li>
                      <li>
                        The date(s) you wrote your review and the date of your
                        experience with the organization you wrote the review
                        about.
                      </li>
                      <li>Your review content.</li>
                      <li>The location of the organization you reviewed.</li>
                      <li>
                        The date of your experience with the organization you
                        wrote the review about.
                      </li>
                    </ul>
                  </li>
                  <li>
                    Contact information: Your name and email address, or any
                    other contact details you may provide us from time to time.
                  </li>
                  <li>Information about your reviews and ratings.</li>
                  <li>
                    Device and location information: Your IP address, browser
                    settings (the type of browser you use, browser language,
                    time zone), and location.
                  </li>
                  <li>
                    Communication with our AI chatbots, including information
                    the user shares and that the chatbot generates.
                  </li>
                  <li>Preference information.</li>
                </ul>
              </li>

              <li>
                <strong>Cookies Information</strong> <br />
                <p>
                  <span>
                    <span>
                      When you use the Site, we may send one or more Cookies
                      (which are small text files containing a string of
                      alphanumeric characters) or similar tracking technologies
                      to your computer or mobile device to help analyze our web
                      page flow, customize our content, measure promotional
                      effectiveness, and promote trust and safety. You are
                      always free to decline our cookies if your browser
                      permits, although doing so may interfere with your ability
                      to use the Site or certain features of the Site. We may
                      also use Google Analytics or a similar service that uses
                      Cookies to help us analyze how users use the Site. For
                      more information about Google Analytics, please refer
                      to&nbsp;
                    </span>
                    <a
                      href="https://policies.google.com/technologies/partner-sites"
                      target="_blank"
                    >
                      https://policies.google.com/technologies/partner-sites.
                    </a>
                    <span>
                      &nbsp; All of the information described in this section is
                      called&nbsp;
                    </span>
                  </span>
                  <strong>&quot;Cookies Information&quot;</strong>
                  <span>.</span>
                </p>
              </li>
              <li>
                <strong>Automatically Collected Information</strong> <br />
                <p>
                  <span>
                    When you visit the Site, we may automatically receive and
                    record certain information from your computer, web browser
                    and/or mobile device, including your IP address or other
                    device address or ID, web browser and/or device type,
                    hardware and software settings and configurations, the web
                    pages or sites that you visit just before or just after
                    visiting the Site, the pages you view on the Site, your
                    actions on the Site and the dates and times that you visit,
                    access, or use the Site. When you use the Site on a mobile
                    device, we may also collect the physical location of your
                    device by, for example, using satellite, cell phone tower,
                    or wireless local area network signals. All of the
                    information described in this section is called&nbsp;
                  </span>
                  <strong>
                    &quot;Automatically Collected Information&quot;
                  </strong>
                  <span>.</span>
                </p>
              </li>
            </ul>

            <h2>How we use the information we collect:</h2>
            <ul>
              <li>
                <p>
                  We use information about your use of the Site to understand
                  and analyze the usage trends and preferences of our users, to
                  improve the Site, and to improve fraud detection and
                  information security.
                </p>
              </li>
              <li>
                <p>
                  <span>
                    [We may use your e-mail address to contact you for
                    administrative purposes, such as confirming your feedback
                    was submitted successfully.]
                  </span>
                  <sup>2</sup>
                </p>
              </li>
              <li>
                <p>
                  We may use Cookies Information and Automatically Collected
                  Information to: (a) personalize our services, including
                  remembering your information so you that you will not have to
                  re-enter it during your visit or the next time you visit the
                  Site; (b) provide customized content and information; (c)
                  monitor and analyze the effectiveness of the Site; and (d)
                  monitor aggregate site usage metrics such as total number of
                  visitors and pages viewed.{" "}
                </p>
              </li>
              <li>
                <p>
                  To protect us, our employees, and the public (including for
                  fraud prevention), or to protect our rights.{" "}
                </p>
              </li>
              <li>
                <p>
                  To fulfill legal, security, and safety obligations and to
                  establish, exercise, or defend a legal claim.{" "}
                </p>
              </li>

              <li>
                <p>To market the Site. </p>
              </li>

              <li>
                <p>
                  To improve our existing offerings and develop new offerings,
                  and conduct related research and analytics.{" "}
                </p>
              </li>
            </ul>

            <h2>When we disclose information:</h2>
            <ul>
              <li>
                <p>
                  We may disclose your information to our vendors and other
                  service providers to perform services for us, such as
                  creation, maintenance, hosting, delivery, and marketing of our
                  Sites. These third parties may also use the information to
                  improve their own products and services, which could include
                  training their artificial intelligence tools that are made
                  available to us or through our services.
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
                  We may disclose your information to vendors and service
                  providers who help us operate and improve our services,
                  including those that provide artificial intelligence tools,
                  such as chatbots or automated assistants.
                </p>
              </li>

              <li>
                <p>
                  We may disclose your reviews, comments, or other submitted
                  content to the organization or service provider you reviewed,
                  to help them understand and respond to feedback, consistent
                  with the purpose of our platform.
                </p>
              </li>
              <li>
                <p>
                  When you submit feedback, including reviews, comments, and
                  other submitted content, about an organization on the Site, we
                  make that feedback available to the applicable organization
                  and for the organization to understand and respond to
                  feedback. When possible, we provide this information in a
                  de-identified way. Please note that if you choose to share
                  your email address with any such organization when you submit
                  feedback on the Site, we will share your email address with
                  that organization so that it may contact you with updates
                  about your feedback or its services. Please review the
                  applicable organization&apos;s privacy policies for more
                  information about how it may use your Personal Information.
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

            <h2>Your Choices and Responsibilities:</h2>
            <ul>
              <li>
                <p>
                  You may, of course, decline to share certain information with
                  us, in which case we may not be able to provide you with some
                  of the features and functionality of the Site.
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

              <li>
                <p>
                  Please allow sufficient time for your preferences to be
                  processed. Please also note that we may contact you for other
                  purposes (such as responding to your requests, completing a
                  transaction, or other administrative purposes).
                </p>
              </li>
            </ul>

            <h2>Our Commitment to Children’s Privacy:</h2>
            <p>
              <span>
                Protecting the privacy of young children is especially
                important. For that reason, we do not permit children under 13
                years of age to use the Site, we do not knowingly collect or
                maintain information from persons under 13 years of age, and no
                part of the Site is directed to persons under 13 years of age.
                If you are under 13 years of age, then please do not use or
                access the Site at any time or in any manner. If we learn that
                information has been collected through the Site from persons
                under 13 years of age and without verifiable parental consent,
                then we will take the appropriate steps to delete this
                information. If you are a parent or guardian and discover that
                your child under 13 years of age has provided us with
                information, please alert us at&nbsp;
              </span>
              <a href="mailto:useraccounts@streetlives.nyc">
                useraccounts@streetlives.nyc
              </a>
              <span>
                &nbsp; to request that we delete the information from our
                systems.
              </span>
            </p>

            <p>
              Additionally, if you are a California resident under 18 years old,
              you may request that we remove any content or information you have
              publicly posted.
            </p>
            <p>
              <span>Please contact us at&nbsp;</span>
              <a href="mailto:privacy@streetlives.nyc">
                privacy@streetlives.nyc
              </a>
              <span>
                &nbsp;to make this request. Please provide a detailed
                description of the specific content or information you would
                like removed. Please note that our request does not guarantee
                that all content or information you have posted online will be
                removed, and in some cases, the law may not permit or may not
                require removal. &nbsp;
              </span>
            </p>

            <h2>Our Commitment to Data Security:</h2>
            <p>
              We use certain physical, managerial and technical safeguards that
              are designed to protect the integrity and security of your
              information; however, no security measures are perfect or
              impenetrable, so we cannot ensure or warrant the security of any
              information you transmit to us through the Site, and you do so at
              your own risk. We also cannot guarantee that such information may
              not be accessed, disclosed, altered, or destroyed by breach of any
              of our physical, technical, or managerial safeguards. We cannot
              control the actions of other users or other third parties with
              whom you may choose to share your information, and therefore, we
              cannot and do not guarantee that information you post through the
              Site will not be viewed by unauthorized persons. We are not
              responsible for circumvention of any privacy settings or security
              measures contained on the Site. Even after removal, copies of
              information that you have posted may remain viewable in cached and
              archived pages, or if other users have copied or stored such
              information.
            </p>

            <h2>Data Retention:</h2>
            <p>
              We retain Personal Information for as long as necessary to fulfill
              the purposes outlined in this Privacy Policy, including to operate
              the Site, comply with legal obligations, prevent fraud, resolve
              disputes, collect fees, troubleshoot issues, assist with
              investigations, and enforce our Terms or other agreements.
              Retention periods may vary depending on the type of data, our
              operational needs, and applicable legal or policy requirements.
            </p>
            <h2>Your Rights Under Privacy Laws:</h2>
            <p>
              <span>
                Depending on your jurisdiction, you may have certain rights
                under applicable privacy laws, such as the right to access,
                correct, or restrict the use of your Personal Information. To
                exercise your rights, please contact us at&nbsp;
              </span>
              <a href="mailto:privacy@streetlives.nyc">
                privacy@streetlives.nyc
              </a>
              <span>.</span>
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
              of Personal Information.{" "}
            </p>

            <p>
              By using this Site, you acknowledge that your Personal Information
              may be transferred to, stored in, and accessed from the United
              States or other jurisdictions that may not provide the same level
              of data protection as your home country. We take appropriate steps
              to ensure that your data is treated securely and in accordance
              with this Privacy Policy and applicable law.{" "}
            </p>

            <h2>Changes and Updates to this Privacy Policy:</h2>
            <p>
              We reserve the right to make changes to this Privacy Policy at any
              time. We will notify you about significant changes in the way we
              treat your information, including by placing a prominent notice on
              the Site or by sending you an email so that you can choose whether
              to continue using the Site. Material modifications are effective
              thirty (30) calendar days after our initial notification or upon
              your acceptance of the modified Terms. Immaterial modifications
              are effective upon posting of the updated Privacy Policy or Terms
              of Use on the Site. Please revisit this page periodically to stay
              aware of any changes to this Privacy Policy. For the avoidance of
              doubt, disputes arising hereunder will be resolved in accordance
              with the Privacy Policy in effect at the time the dispute arose.
            </p>

            <h2>Our Contact Information:</h2>
            <p>
              <span>
                Please contact us with any questions or comments about this
                Privacy Policy, your personal information, our use and
                disclosure practices, or your consent choices by e-mail at
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
