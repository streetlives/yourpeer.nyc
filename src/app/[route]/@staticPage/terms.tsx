// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import { TermsOfUseRussianTranslation } from "@/components/translations/terms";
import {
  LOCATION_ROUTE,
  PRIVACY_POLICY_ROUTE,
} from "../../../components/common";
import { useContext } from "react";
import {
  getTargetLanguage,
  LanguageTranslationContext,
  LanguageTranslationContextType,
} from "@/components/language-translation-context";

export function Terms() {
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
              <span>Last Updated&nbsp;</span>
              <time dateTime="2023-08-15">July 1, 2025</time>
              <span>.</span>
            </p>
            <h4>
              THESE TERMS STATE THAT ANY DISPUTES BETWEEN YOU AND STREETLIVES
              MUST BE RESOLVED IN ARBITRATION OR SMALL CLAIMS COURT.
            </h4>
            <p>
              <span>These Terms of Use, together with Streetlives Inc. (</span>
              <strong>&quot;Streetlives,&quot;</strong>{" "}
              <strong>&quot;we&quot;</strong>
              <span>&nbsp;or&nbsp;</span>
              <strong>&quot;us&quot;</strong>
              <span>
                <span>
                  ) Privacy Policy and Streetlives Guidelines for comment
                  moderation, set forth the terms and conditions (
                </span>
                <strong>&quot;Terms&quot;</strong>
                <span>
                  <span>
                    ) that apply to your access and use of the Streetlives
                    website, located at&nbsp;
                  </span>
                  <a href="https://yourpeer.nyc">https://yourpeer.nyc</a>
                  <span>&nbsp;,&nbsp;</span>
                  <a href="https://streetlives.nyc">https://streetlives.nyc</a>
                  <span>
                    &nbsp; and any other Streetlives website, mobile
                    application, online portal, electronic form, survey or other
                    channel that we manage or operate (together, the&nbsp;
                  </span>
                </span>
                <strong>&quot;Site&quot;</strong>
                <span>
                  ). &quot;Streetlives&quot; includes Streetlives and its
                  officers, directors, employees, consultants, affiliates,
                  subsidiaries, and agents. Streetlives provides technology
                  tools and public-facing content to help users better
                  understand, navigate, and share information about social
                  services. Streetlives is not a government agency or direct
                  service provider, and it does not guarantee the availability,
                  accuracy, or outcomes of any third-party services referenced
                  on the Site.
                </span>
              </span>
            </p>

            <p>
              By using or accessing the site, you agree to these Terms, as
              updated from time to time in accordance with Section 14 below. You
              should not use this Site if you disagree with these Terms. Because
              Streetlives provides a wide range of services, we may at times ask
              you to review and accept supplemental terms that apply to your
              interaction with a specific product or service.
            </p>

            <ol>
              <li>
                <p>
                  <strong>Account Security.</strong>
                  <span>
                    &nbsp;To use the Site, you must (i) be at least thirteen
                    (13) years of age; and (ii) be able to form a legally
                    binding contract with us; and (iii) have not previously been
                    suspended or removed from the Site; and (iv) register for
                    and use the Site in compliance with any and all applicable
                    laws and regulations.
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>Account Registration.</strong>
                  <span>
                    <span>
                      &nbsp;To access some features of the Site, you may be
                      required to register for an account. When you register for
                      an account, we may ask you to give us certain identifying
                      information about yourself, including but not limited to
                      your email address and other contact information, and to
                      create a username and password (
                    </span>
                    <strong>&quot;Registration Information&quot;</strong>
                    <span>
                      <span>
                        ). When registering for and maintaining an account, you
                        agree to provide true, accurate, current, and complete
                        information about yourself. You also agree not to
                        impersonate anyone, misrepresent any affiliation with
                        anyone else, use false information, or otherwise conceal
                        your identity from Streetlives for any purpose. You are
                        solely responsible for maintaining the confidentiality
                        and security of your password and other Registration
                        Information. For your protection and the protection of
                        other users, we ask you not to share your Registration
                        Information with anyone else. If you do share this
                        information with anyone, we will consider their
                        activities to have been authorized by you. If you have
                        reason to believe that your account is no longer secure,
                        you must immediately notify us at&nbsp;
                      </span>
                      <a href="mailto:useraccounts@streetlives.nyc">
                        useraccounts@streetlives.nyc
                      </a>
                      <span>&nbsp;.</span>
                    </span>
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>Specific Requirements for Certain Services.</strong>{" "}
                  <span>
                    Your use of the Site constitutes your acknowledgment and
                    acceptance of the following specific requirements and terms
                    of use for certain of Streetlives&apos; services.
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>Notice Regarding Geographic Restrictions.</strong>{" "}
                  <span>
                    <span>
                      Streetlives is based in the United States (the&nbsp;
                    </span>
                    <strong>&quot;U.S.&quot;</strong>
                    <span>
                      ) and the Site is intended for use only by individuals
                      located in the U.S. Access to the Site may not be legal in
                      some jurisdictions. If you access the Site from outside
                      the U.S., you do so at your own risk and are responsible
                      for compliance with local laws.
                    </span>
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>Prohibited Conduct.</strong>
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
                      Infringe, misappropriate, or otherwise violate any patent,
                      trademark, trade secret, copyright, or other intellectual
                      property or other rights of any other person;
                    </p>
                  </li>
                  <li>
                    <p>
                      Delete, alter, or remove copyright, trademark, or
                      proprietary rights notices;
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
                      Interfere with the operation or any user&apos;s enjoyment
                      of the Site, including by uploading or otherwise
                      disseminating viruses, adware, spyware, worms, or other
                      malicious code, making unsolicited offers or
                      advertisements to other users, or attempting to collect
                      personal information about users or third parties without
                      their consent;
                    </p>
                  </li>
                  <li>
                    <p>
                      Access, monitor, or copy any content or information of the
                      Site using any robot, spider, scraper, or other automated
                      means or any manual process for any purpose without
                      Streetlives&apos; express written permission;
                    </p>
                  </li>

                  <li>
                    <p>
                      Perform any fraudulent activity, including impersonating
                      any person or entity, claiming false affiliations,
                      accessing the accounts of other users without permission,
                      or falsifying your identity or any information about you,
                      including age or date of birth; or{" "}
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
                    &nbsp;The Site may contain links to third-party websites and
                    services. Streetlives provides such links as a convenience,
                    and does not control or endorse these websites and services.
                    You acknowledge and agree that Streetlives has not reviewed
                    the content, advertising, Services or other materials that
                    appear on such third-party websites or services, and is not
                    responsible for the legality, accuracy, or appropriateness
                    of any such content Streetlives shall not be responsible or
                    liable, directly or indirectly, for any damage or loss
                    caused or alleged to be caused by or in connection with the
                    use of any such third-party websites or services.
                  </span>
                </p>
              </li>

              <li>
                <p>
                  <strong>Artificial Intelligence.</strong>
                  <span>
                    &nbsp;Some features of the Site may use artificial
                    intelligence or machine learning (&quot;AI&quot;), including
                    tools that generate suggestions or responses. These tools
                    rely on third-party technologies and are provided &quot;as
                    is&quot; without warranties of any kind, including with
                    respect to completeness, accuracy, or appropriateness. By
                    using our Site, you expressly acknowledge and agree that any
                    information or knowledge you gain as a result of using any
                    AI-generated content on this Site is used at solely at your
                    own risk. You should not rely solely on AI-generated content
                    when making important decisions, especially regarding access
                    to critical services.
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>Intellectual Property.</strong>
                  <span>
                    <span>
                      &nbsp;As between you and Streetlives, all materials
                      contained on the Site (collectively, the&nbsp;
                    </span>
                    <strong>&quot;Content&quot;</strong>
                    <span>
                      ) are the sole and exclusive property of Streetlives. The
                      Site and the Content are owned exclusively by Streetlives,
                      its licensors, or other providers of such material and are
                      protected by United States and intellectual property and
                      proprietary rights laws. No ownership interest is
                      transferred to you by virtue of making the Content
                      available on the Site, granting you a license to use the
                      Site, or your entering into these Terms. Subject to your
                      compliance with these Terms, we hereby grant you a
                      limited, non-exclusive, non-transferrable,
                      non-sublicensable license to access and use the Site and
                      Content solely for your own personal and noncommercial
                      purposes.
                    </span>{" "}
                    <br />
                    <br />
                    <span>
                      In addition, all trademarks, service marks, logos, trade
                      names, and any other proprietary designations of
                      Streetlives are trademarks of Streetlives, and you may not
                      use them without our express written consent. All other
                      trademarks not owned by Streetlives are the property of
                      their respective owners.
                    </span>
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>User Contributions.</strong>
                  <span>
                    <span>
                      <span>
                        &nbsp;You may provide materials (collectively,&nbsp;
                      </span>
                      <strong>&quot;User Contributions&quot;</strong>
                      <span>
                        ) to public areas of the Site or directly to other users
                        of the Site or to third parties that integrate with or
                        link to the Site. You are solely responsible for your
                        User Contributions and transmit such User Contributions
                        at your own risk. We assume no liability for them, or
                        for any third-party policies that may apply to your User
                        Contributions in the event you elect to share your User
                        Contributions with any third party.
                      </span>
                    </span>
                  </span>
                </p>
                <p>By submitting a User Contribution, you:</p>
                <ul>
                  <li>
                    Grant us a worldwide, royalty-free, transferrable,
                    sublicensable, non-exclusive, perpetual, irrevocable license
                    under all of your intellectual property rights to make, use,
                    copy, modify, adapt, create derivative works of, publicly
                    perform or display, import, broadcast, transmit, distribute,
                    license, publish, translate, offer to sell and sell copies
                    of such User Contribution (and derivative works thereof) in
                    any form or medium (whether now known or later developed),
                    without credit or compensation to you, for any purpose;
                  </li>
                  <li>
                    To the extent applicable, unconditionally and irrevocably
                    waive (or, to the extent that a waiver is not permissible
                    under applicable law, undertake not to assert) all moral
                    rights in such User Contribution to which you may now or at
                    any future time be entitled under applicable law;
                  </li>
                  <li>
                    Acknowledge and agree that we assume no liability for such
                    User Contribution;
                  </li>
                  <li>
                    Acknowledge and agree that we may keep such User
                    Contribution indefinitely, and disclose it for any purpose;
                    and
                  </li>
                  <li>
                    Represent and warrant that (1) you have all right, power,
                    and authority necessary to grant rights to such User
                    Contribution and (2) such User Contribution does not
                    infringe, misappropriate, or violate the intellectual
                    property rights of Streetlives or any third party, or
                    otherwise violate these Terms or applicable law.
                  </li>
                </ul>
              </li>

              <li>
                <p>
                  <strong>Feedback.</strong>
                  <span>
                    <span>
                      &nbsp;You may provide us, or one of our partners, ideas,
                      suggestions, remarks, data, or other feedback regarding
                      the Site, Content, or any of our other offerings
                      (collectively,&nbsp;
                    </span>
                    <strong>&quot;Feedback&quot;</strong>
                    <span>).</span>
                  </span>
                </p>
                <p>By submitting Feedback, you:</p>
                <ul>
                  <li>
                    Acknowledge and agree that we (1) are under no
                    confidentiality or fiduciary obligation with respect to such
                    Feedback and (2) may keep such Feedback indefinitely, and
                    use, reproduce, distribute, disclose, and otherwise exploit
                    it for any purpose;
                  </li>
                  <li>
                    Acknowledge and agree that you are not entitled to any
                    compensation with respect to such Feedback; and
                  </li>
                  <li>
                    Represent and warrant that such Feedback does not infringe,
                    misappropriate, or violate the intellectual property rights
                    of Streetlives or any third Party, or otherwise violate
                    these Terms or applicable law.
                  </li>
                </ul>
              </li>

              <li>
                <p>
                  <strong>Copyright Infringement — DMCA Notice.</strong>
                  <span>
                    <span>
                      &nbsp;The Digital Millennium Copyright Act of 1998
                      (the&nbsp;
                    </span>
                    <strong>&quot;DMCA&quot;</strong>
                    <span>
                      ) provides recourse for copyright owners who believe that
                      material appearing on the Internet infringes their rights
                      under United States copyright law.
                    </span>
                  </span>
                </p>
                <p>
                  If you are a copyright owner and you believe, in good faith,
                  that any Content or our Site infringes a copyright that you
                  own, you or your agent may send us a notice requesting that we
                  remove the material or otherwise block access to it.
                </p>
                <p>
                  This notice must include: (a) physical or electronic signature
                  of a person authorized to act on behalf of the copyright
                  owner; (b) description of the work you claim has been
                  infringed and the description and location of the alleged
                  infringement the Site; (c) your contact information including
                  address, telephone number and email address; (d) a written
                  statement that you have a good faith belief the accused usage
                  is infringing; and (e) a statement by you under penalty of
                  perjury that the information in the notice is accurate and
                  that you are duly authorized to act on behalf of the copyright
                  owner. To submit such a notice, please contact us at:
                </p>
                <p>
                  <span>Copyright Officer</span>
                  <br />
                  <span>Streetlives, Inc.</span>
                  <br />
                  <span>251 Little Falls Drive</span>
                  <br />
                  <span>Wilmington, DE 19808</span>
                  <br />
                  <br />
                  <span>1 800 927 9801</span>
                  <br />
                  <br />
                  <span>copyright@streetlives.nyc</span>
                  <br />
                  <br />
                  <span>
                    If you believe in good faith that a notice of copyright
                    infringement has been wrongly filed against you, the DMCA
                    permits you to send us a counter-notice. Notices and
                    counter-notices must meet the then-current statutory
                    requirements imposed by the DMCA.
                  </span>
                  <br />
                  <br />

                  <span>Copyright Officer</span>
                  <br />
                  <span>Streetlives, Inc.</span>
                  <br />
                  <span>251 Little Falls Drive</span>
                  <br />
                  <span>Wilmington, DE 19808</span>
                  <br />
                  <br />
                  <span>1 800 927 9801</span>
                  <br />
                  <br />
                  <span>copyright@streetlives.nyc</span>
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
                    (including attorneys&apos; and accounting fees and costs),
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
                  <strong>Termination. </strong>
                  <span>
                    <span>
                      &nbsp;If you violate these Terms, your permission to use
                      the Site will automatically terminate. In addition,
                      Streetlives, in its sole discretion, may suspend or
                      terminate your user account and/or suspend or terminate
                      some or all of your access to the Site at any time, with
                      or without notice to you. You may terminate your account
                      at any time by contacting Streetlives at &nbsp;
                    </span>
                    <a href="mailto:useraccounts@streetlives.nyc">
                      useraccounts@streetlives.nyc
                    </a>
                    <span>
                      . After your account is terminated, information and
                      Content previously provided by you will no longer be
                      accessible through your account, but Streetlives may
                      continue to store such information and Content, and it may
                      also be stored by third parties to whom it has been
                      transferred through your use of the Site.
                    </span>
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
                    While users are responsible for reviewing updates, we will
                    make reasonable efforts to notify you of any material
                    changes to the Terms, including, but not limited to, by
                    posting a notice to our website or by sending an email to
                    any address you may have provided to us. Your continued use
                    of the Site following notice will be deemed acceptance of
                    any modifications to the Terms.
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>Disclaimers of Warranties. </strong>
                  <span>
                    &nbsp;The Site is provided &quot;as is&quot; and on an
                    &quot;as available&quot; basis, without warranty or
                    condition of any kind, either express or implied. Although
                    Streetlives seeks to maintain safe, secure, accurate, and
                    well-functioning services, we cannot guarantee the
                    continuous operation of or access to our Site, and there may
                    at times be inadvertent technical or factual errors or
                    inaccuracies. Streetlives specifically (but without
                    limitation) disclaims (i) any implied warranties of
                    merchantability, fitness for a particular purpose, quiet
                    enjoyment, or non-infringement; and (ii) any warranties
                    arising out of course-of-dealing, usage, or trade. You
                    assume all risk for any/all damages that may result from
                    your use of or access to the Site. Streetlives does not
                    guarantee the accuracy of, and disclaims all liability for,
                    any errors or other inaccuracies in the information,
                    content, recommendations, and materials made available
                    through the Site. .
                  </span>
                </p>
              </li>

              <li>
                <p>
                  <strong>Reliance on Information Posted.</strong>
                  <span>
                    &nbsp;The Site may include descriptions and images of
                    locations, goods, and services (collectively,
                    &quot;Services&quot;), as well as references and links to
                    Services. The existence of such a description or image does
                    not constitute our endorsement of the Services. We make no
                    representations as to the completeness, accuracy,
                    reliability, validity, or timeliness of such descriptions or
                    images (including any features contained therein). The
                    availability of any Service is subject to change at any time
                    and without notice. It is your responsibility to abide by
                    all applicable local, state, federal, and foreign laws
                    regarding the use of any Services.
                  </span>{" "}
                  <br /> <br />
                  <span>
                    Streetlives does not guarantee the accuracy, completeness,
                    or usefulness of any information provided through the Site.
                    Any reliance you place on such information is strictly at
                    your own risk. We disclaim all liability and responsibility
                    arising from any reliance placed on such materials by you or
                    any other visitor to the Site, or by anyone who may be
                    informed of any of its contents.
                  </span>{" "}
                  <br />
                  <br />
                  <span>
                    The Site includes content provided by third parties,
                    including materials provided by other users. Information may
                    be outdated, incomplete, or reflect only personal
                    experiences. Streetlives does not verify all third-party
                    information. All statements and/or opinions expressed in
                    these materials, and all articles and responses to questions
                    and other content, other than the content provided by
                    Streetlives, are solely the opinions and the responsibility
                    of the person or entity providing those materials.
                  </span>{" "}
                  <br /> <br />
                  <span>
                    These materials do not necessarily reflect the opinion of
                    Streetlives. We are not responsible, or liable to you or any
                    third party, for the content or accuracy of any materials
                    provided by any third parties.
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
                    limitations may not apply to you. Any cause of action or
                    claim you may have arising out of or relating to these Terms
                    or the Site must be commenced within one (1) year after the
                    cause of action accrues; otherwise, such cause of action or
                    claim is permanently barred.
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <strong>
                    <span>Governing Law.</span>
                  </strong>
                  <span>
                    &nbsp;These Terms are governed by the laws of the State of
                    New York, without regard to conflict of law principles.
                    Subject to Section 19, which provides that disputes are to
                    be resolved through binding arbitration or small claims
                    court, to the extent that any lawsuit or court proceeding is
                    permitted hereunder, you and Streetlives agree to submit to
                    the exclusive personal jurisdiction of the state courts and
                    federal courts located within New York County, NY for the
                    purpose of litigating all such disputes.
                  </span>
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
                    courts of general jurisdiction (&quot;Agreement to
                    Arbitrate&quot;). Arbitration is more informal than a
                    lawsuit in court. Arbitration uses a neutral arbitrator
                    instead of a judge or jury, allows for more limited
                    discovery than in court, and is subject to very limited
                    review by courts. Arbitrators can award the same damages and
                    relief that a court can award. Any arbitration or litigation
                    under these Terms will take place on an individual basis;
                    class arbitrations and class actions are not permitted. You
                    acknowledge and agree that the arbitrator may award relief
                    (including monetary, injunctive, and declaratory relief)
                    only in favor of the individual party seeking relief and
                    only to the extent necessary to provide relief necessitated
                    by that individual party&apos;s claim(s). Any relief awarded
                    cannot affect other users.
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
                    discontinuance of any of the Site.
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
                        <span>&nbsp;These Terms, together with the&nbsp;</span>
                        <a href={PRIVACY_POLICY_ROUTE}>Privacy Policy</a>
                        <span>
                          &nbsp;, constitute the entire and exclusive
                          understanding and agreement between you and
                          Streetlives regarding your use of and access to the
                          Site, and except as expressly permitted above, may
                          only be amended by a written agreement signed by
                          authorized representatives of the parties.&nbsp;
                        </span>
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
                        shall be given effect to the greatest extent possible,
                        and the remaining parts will remain in full force and
                        effect.
                      </span>
                    </p>
                  </li>
                </ol>
              </li>
              <li>
                <p>
                  <strong>Notice.</strong>
                  <span>
                    &nbsp;We may provide all notices, including pursuant to
                    legal process, by any lawful method. You agree to provide us
                    with current, accurate contact information and to check for
                    notices posted via the Site.
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
              <span>
                Other than any notices described in Section 11 (which must be
                provided as described in Section 11), and any privacy-related
                inquiries (which must be provided as described in the &quot:Our
                contact information&quot; section of the Privacy Policy) all
                notices to us must be sent to the following address:&nbsp;
              </span>
              <a href="mailto:rights@streetlives.nyc">rights@streetlives.nyc</a>
              <span>&nbsp;.</span>
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
