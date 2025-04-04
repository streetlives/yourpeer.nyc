// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import { TermsOfUseRussianTranslation } from "@/components/translations/terms";
import { LOCATION_ROUTE } from "../../../components/common";
import { useContext } from "react";
import {
  getTargetLanguage,
  LanguageTranslationContext,
  LanguageTranslationContextType,
} from "@/components/language-translation-context";

export function Statem() {
  const governingLawInternalLinkId = "governing_law_footnote";
  const { gTranslateCookie } = useContext(
    LanguageTranslationContext,
  ) as LanguageTranslationContextType;

  const targetLanguage = gTranslateCookie
    ? getTargetLanguage(gTranslateCookie)
    : null;

  return targetLanguage === "ru" ? (
    <TermsOfUseRussianTranslation />
  ) : (
    <>
      <section className="bg-white pt-28 lg:pt-32 lg:py-20">
        <div className="px-5 max-w-3xl mx-auto">
          <h1 className="text-center font-medium text-2xl lg:text-4xl mb-8">
            Terms of Use
          </h1>
          <div className="text-base prose prose-a:text-blue">
            <p>
              <span>
                These Terms of Use, together with Streetlives Inc.
                (“Streetlives”)
              </span>{" "}
              <a href="/privacy-policy">Privacy Policy</a>
              <span>
                , set forth the terms and conditions (“Terms”) that apply to
                your access and use of the Streetlives website, located at
              </span>{" "}
              <a href="https://yourpeer.nyc">https://yourpeer.nyc</a>
              <span>
                &nbsp;(together, the “Site”). “Streetlives” includes Streetlives
                and its officers, directors, employees, consultants, affiliates,
                subsidiaries, and agents. Streetlives Services may include but
                are not limited to providing information in order to improve
                access to social services in an effort to reduce homelessness.
              </span>
            </p>

            <p>
              <span>
                By using or accessing the site you agree to these Terms, as
                updated from time to time in accordance with Section 8 below.
                Because Streetlives provides a wide range of services, we may at
                times ask you to review and accept supplemental terms that apply
                to your interaction with a specific product or service.
              </span>
              <strong>
                These Terms state that any disputes between you and Streetlives
                must be resolved in arbitration or small claims court.
              </strong>
            </p>

            <ol>
              <li>
                <p>
                  <strong>Account Security.</strong>
                  <span>
                    &nbsp;To use the Site, you must (i) be at least eighteen
                    (18) years of age; and (ii) have not previously been
                    suspended or removed from the Services.
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>Specific Requirements for Certain Services.</strong>{" "}
                  <span>
                    Your use of the Services constitutes your acknowledgment and
                    acceptance of the following specific requirements and terms
                    of use for certain of Streetlives services.
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>Prohibited Conduct.</strong>
                  <span>&nbsp;You agree not to:</span>
                </p>
                <ol type="A">
                  <li>
                    <p>
                      Use the Site for any illegal purpose, or in violation of
                      any local, state, national, or international law;
                    </p>
                  </li>
                  <li>
                    <p>
                      Violate or encourage others to violate the rights of third
                      parties, including intellectual property rights;
                    </p>
                  </li>
                  <li>
                    <p>
                      Post, upload, or distribute any content that is unlawful,
                      defamatory, libelous, inaccurate, or that a reasonable
                      person could deem to be objectionable, profane, indecent,
                      pornographic, harassing, threatening, hateful, or
                      otherwise inappropriate;
                    </p>
                  </li>
                  <li>
                    <p>
                      Interfere in any way with security-related features of the
                      Site;
                    </p>
                  </li>
                  <li>
                    <p>
                      Interfere with the operation or any user’s enjoyment of
                      the Site, including by uploading or otherwise
                      disseminating viruses, adware, spyware, worms, or other
                      malicious code, making unsolicited offers or
                      advertisements to other users, or attempting to collect
                      personal information about users or third parties without
                      their consent;
                    </p>
                  </li>
                  <li>
                    <p>
                      Access, monitor or copy any content or information of the
                      Site using any robot, spider, scraper, or other automated
                      means or any manual process for any purpose without
                      Streetlives’ express written permission;
                    </p>
                  </li>
                  <li>
                    <p>
                      Perform any fraudulent activity, including impersonating
                      any person or entity, claiming false affiliations,
                      accessing the accounts of other users without permission,
                      or falsifying your identity or any information about you,
                      including age or date of birth; or
                    </p>
                  </li>
                  <li>
                    <p>Sell or otherwise transfer the access granted herein.</p>
                  </li>
                </ol>
              </li>
              <li>
                <p>
                  <strong>Third Party Content.</strong>
                  <span>
                    &nbsp;The Site may contain links to third party websites and
                    services. Streetlives provides such links as a
                    convenience,and does not control or endorse these websites
                    and services. You acknowledge and agree that Streetlives has
                    not reviewed the content, advertising, products, services,
                    or other materials that appear on such third party websites
                    or services, and is not responsible for the legality,
                    accuracy, or appropriateness of any such content Streetlives
                    shall not be responsible or liable, directly or indirectly,
                    for any damage or loss caused or alleged to be caused by or
                    in connection with the use of any such third party websites
                    or services.
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>Intellectual Property.</strong>
                  <span>
                    &nbsp;You acknowledge and agree that you relinquish all
                    ownership rights in any ideas or suggestions that you submit
                    to Streetlives through this Site. This Site is protected by
                    applicable copyright and other intellectual property laws,
                    and no materials from the Site may be copied, reproduced,
                    republished, uploaded, posted, transmitted, or distributed
                    in any way without our express permission. All trademarks
                    and service marks on the Site belong to Streetlives except
                    third-party trademarks or service marks, which are the
                    property of their respective owners.
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>Indemnification.</strong>
                  <span>
                    &nbsp;You agree that you will be personally responsible for
                    your use of the Site, and you agree to defend, indemnify,
                    and hold harmless Streetlives from and against any and all
                    claims, liabilities, damages, losses, and expenses
                    (including attorneys’ and accounting fees and costs),
                    arising out of or in any way connected with (i) your access
                    to, use of, or alleged use of the Site; (ii) your violation
                    of the Terms or any applicable law or regulation; (iii) your
                    violation of any third party right, including without
                    limitation any intellectual property right, publicity,
                    confidentiality, property, or privacy right; or (iv) any
                    disputes or issues between you and any third party.
                    Streetlives reserves the right, at our own expense, to
                    assume the exclusive defense and control of any matter
                    otherwise subject to indemnification by you, and in such
                    case, you agree to cooperate with our defense of such claim.
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>Modification of the Terms.</strong>
                  <span>
                    &nbsp;Streetlives reserves the right at any time to modify
                    these Terms and to impose new or additional terms or
                    conditions on your use of the Site. Such modifications and
                    additional terms and conditions will be effective
                    immediately upon notice and incorporated into these Terms.
                    We will make reasonable efforts to notify you of any
                    material changes to the Terms, including, but not limited
                    to, by posting a notice to our website or by sending an
                    email to any address you may have provided to us. Your
                    continued use of the Services following notice will be
                    deemed acceptance of any modifications to the Terms.
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>Disclaimers of Warranties. </strong>
                  <span>
                    &nbsp;The Site provided “as is” and on an “as available”
                    basis, without warranty or condition of any kind, either
                    express or implied. Although Streetlives seeks to maintain
                    safe, secure, accurate, and well-functioning services, we
                    cannot guarantee the continuous operation of or access to
                    our Site, and there may at times be inadvertent technical or
                    factual errors or inaccuracies. Streetlives specifically
                    (but without limitation) disclaims (i) any implied
                    warranties of merchantability, fitness for a particular
                    purpose, quiet enjoyment, or non-infringement; and (ii) any
                    warranties arising out of course-of-dealing, usage, or
                    trade. You assume all risk for any/all damages that may
                    result from your use of or access to the Site. Streetlives
                    does not guarantee the accuracy of, and disclaims all
                    liability for, any errors or other inaccuracies in the
                    information, content, recommendations, and materials made
                    available through the Site.
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>Limitation of Liability. </strong>
                  <span>
                    &nbsp;In no event will Streetlives be liable to you for any
                    incidental, special, consequential, direct, indirect, or
                    punitive damages, whether based on warranty, contract, tort
                    (including negligence), statute, or any other legal theory,
                    whether or not Streetlives has been informed of the
                    possibility of such damage. Some jurisdictions do not allow
                    the disclaimer of warranties or limitation of liability in
                    certain circumstances. Accordingly, some of the above
                    limitations may not apply to you.
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>
                    <span>Governing Law</span>
                    <span>.</span>{" "}
                    <sup>
                      <a href={`#${governingLawInternalLinkId}`}>1</a>
                    </sup>
                  </strong>
                  <span>
                    &nbsp;These Terms are governed by the laws of the State of
                    New York, without regard to conflict of law principles.
                    Subject to Section 11, which provides that disputes are to
                    be resolved through binding arbitration or small claims
                    court, to the extent that any lawsuit or court proceeding is
                    permitted hereunder, you and Streetlives agree to submit to
                    the exclusive personal jurisdiction of the state courts and
                    federal courts located within New York County, NY for the
                    purpose of litigating all such disputes.
                  </span>
                </p>
                <p>
                  <small>
                    <a id={governingLawInternalLinkId}></a>
                    <span>
                      1. Implications of choice of law should be discussed with
                      the client—it is important to explain why choosing their
                      home state may be most beneficial.
                    </span>
                  </small>
                </p>
              </li>
              <li>
                <p>
                  <strong>Dispute Resolution by Binding Arbitration. </strong>{" "}
                  <span>
                    In the interest of resolving disputes between you and
                    Streetlives in the most expedient and cost-effective manner,
                    you and Streetlives agree to resolve disputes through
                    binding arbitration or small claims court instead of in
                    courts of general jurisdiction (“Agreement to Arbitrate”).
                    Arbitration is more informal than a lawsuit in court.
                    Arbitration uses a neutral arbitrator instead of a judge or
                    jury, allows for more limited discovery than in court, and
                    is subject to very limited review by courts. Arbitrators can
                    award the same damages and relief that a court can award.
                    Any arbitration or litigation under these Terms will take
                    place on an individual basis; class arbitrations and class
                    actions are not permitted. You acknowledge and agree that
                    the arbitrator may award relief (including monetary,
                    injunctive, and declaratory relief) only in favor of the
                    individual party seeking relief and only to the extent
                    necessary to provide relief necessitated by that individual
                    party’s claim(s). Any relief awarded cannot affect other
                    users.&nbsp;
                  </span>
                  <br />
                </p>
              </li>
              <li>
                <p>
                  <strong>Modification of the Site. </strong>
                  <span>
                    &nbsp;Streetlives reserves the right to modify or
                    discontinue, temporarily or permanently, some or all of the
                    Site at any time without any notice or further obligation to
                    you. You agree that Streetlives will not be liable to you or
                    to any third party for any modification, suspension, or
                    discontinuance of any of the Site.&nbsp;
                  </span>
                  <br />
                </p>
              </li>
              <li>
                <p>
                  <strong>General. </strong>
                  <br />
                </p>
                <ol type="A">
                  <li>
                    <p>
                      <span className="underline">Entire Agreement.</span>
                      <span>
                        &nbsp;These Terms, together with the Privacy Policy,
                        constitute the entire and exclusive understanding and
                        agreement between you and Streetlives regarding your use
                        of and access to the Site, and except as expressly
                        permitted above may only be amended by a written
                        agreement signed by authorized representatives of the
                        parties.
                      </span>
                    </p>
                  </li>
                  <li>
                    <p>
                      <span className="underline">No Waiver. </span>
                      <span>
                        &nbsp;The failure to require performance of any
                        provision shall not affect our right to require
                        performance at any time thereafter, nor shall a waiver
                        of any breach or default of the Terms constitute a
                        waiver of any subsequent breach or default or a waiver
                        of the provision itself.
                      </span>
                    </p>
                  </li>
                  <li>
                    <p>
                      <span className="underline">Paragraph Headers. </span>
                      <span>
                        &nbsp;Use of paragraph headers in the Terms is for
                        convenience only and shall not have any impact on the
                        interpretation of particular provisions.
                      </span>
                    </p>
                  </li>
                  <li>
                    <p>
                      <span className="underline">Severability. </span>
                      <span>
                        &nbsp;In the event that any part of the Terms is held to
                        be invalid or unenforceable, the unenforceable part
                        shall be given effect to the greatest extent possible
                        and the remaining parts will remain in full force and
                        effect.
                      </span>
                    </p>
                  </li>
                  <li>
                    <p>
                      <span className="underline">
                        {" "}
                        Comments and Concerns.{" "}
                      </span>{" "}
                      <span>
                        All notices of feedback, comments, requests for
                        technical support, and other communications relating to
                        the Website should be directed to
                      </span>{" "}
                      <a href="mailto:rights@streetlives.nyc">
                        rights@streetlives.nyc
                      </a>
                    </p>
                  </li>
                </ol>
              </li>
              <li>
                <p>
                  <strong>Notice to California Residents.</strong>
                  <span>
                    &nbsp;Under California Civil Code Section 1789.3, you may
                    contact the Complaint Assistance Unit of the Division of
                    Consumer Services of the California Department of Consumer
                    Affairs in writing at 1625 N. Market Blvd., Suite S-202,
                    Sacramento, California 95834, or by telephone at
                  </span>{" "}
                  <a href="tel:+1-800-952-5210">(800) 952-5210</a>{" "}
                  <span>
                    in order to resolve a complaint regarding the service or to
                    receive further information regarding use of the service.
                  </span>
                </p>
              </li>
            </ol>

            <p>
              <span>Last updated:&nbsp;</span>
              <time dateTime="2024-08-06">August 6, 2024</time>
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-neutral-50">
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
              find here. We’re building YourPeer so it&apos;s easier for you to
              find the right service.
            </p>
            <div>
              <a href={`/${LOCATION_ROUTE}`} className="primary-button">
                {" "}
                Explore services{" "}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
