"use client";

import Link from "next/link";

export default function InternalCommentGuidelines() {
  return (
    <section className="bg-white pt-28 lg:pt-32 lg:py-20">
      <div className="px-5 max-w-3xl mx-auto">
        <h1 className="text-start font-medium text-2xl lg:text-3xl mb-8">
          Internal guidelines for user-generated content moderation
        </h1>

        <div className="text-base prose prose-a:text-blue prose-th:text-left">
          <h2>What is YourPeer user-generated content (UGC)?</h2>
          <p>
            YourPeer user-generated content includes comments provided by our
            user community about services and locations in our database and
            descriptions of new services and locations provided by our users to
            be added to our database. At this time, comments are received as
            text.
          </p>

          <h2>Who sees YourPeer UGC and when do they see it?</h2>
          <p>
            YourPeer is hosting UGC comments about services provided by certain
            partner social service organizations. These comments are published
            live on the user platform (immediately visible to the public). At
            the time of writing, a YourPeer employee and/or staff of the partner
            social service organization will moderate them manually.
          </p>

          <h2>What is the moderation of YourPeer UGC?</h2>
          <p>
            This is the decision taken by a YourPeer or social service partner
            employee tasked with UGC moderation whether to retain published
            comments or unpublish them—which will likewise leave or remove them
            on the user platform—and whether to notify other parties (either
            other YourPeer staff or external parties, including social services
            and law enforcement) about the comment.
          </p>
          <p>
            The decision is reached by following several steps and applying the
            standards outlined below. The standards will evolve over time as we
            increase our user community and respond to feedback.
          </p>
          <p>
            Comments will be retained for a minimum of 5 years on our database,
            whether they have been retained on the user platform or not.
          </p>

          <h2>When is content moderated on YourPeer?</h2>
          <p>
            Comments will be moderated within 24 hours of them being posted by
            the user or as close to that timeline as possible based on team
            capacity.
          </p>
          <p>
            Moderation after the publication of comments is known as Ex Post
            Reactive Moderation:
          </p>

          <h3>Ex Post Reactive Manual Moderation</h3>
          <p>
            Almost all user-generated content published online at the time of
            this writing is reviewed reactively, through ex-post flagging by
            other users, and reviewed by human content moderators against
            internal guidelines.
          </p>
          <p>
            Flagging—also called reporting—is the mechanism platforms provide
            for users to express concerns about potentially offensive content.
          </p>
          <p>
            The adoption by social media platforms of a flagging system serves
            two main functions:
          </p>
          <ul>
            <li>
              it is a “practical” means of reviewing huge volumes of content,
              and
            </li>
            <li>
              its utilization of users serves to legitimize the system when
              platforms are questioned for censoring or banning content.
            </li>
          </ul>
          <p>Users reporting content would:</p>
          <ul>
            <li>click a button to “Report/Mark as Spam”</li>
            <li>
              <span>describe their report in terms like:</span>
              <ul>
                <li>“Hate Speech”</li>
                <li>“Violence or Harmful Behavior” or</li>
                <li>“I Don’t Like This Post.”</li>
              </ul>
            </li>
          </ul>

          <h2>Why is content moderated on YourPeer?</h2>
          <p>
            To allow YourPeer to remain a platform where community-generated
            information helps people make informed decisions about the services
            they might need and/or helps social service provider organizations
            gain insight into their programs and services.
          </p>

          <h2>Standards for Moderating YourPeer UGC</h2>
          <p>
            <span>
              There are 3 steps to follow for moderation. If any item is not
              understood in the standards listed below
            </span>
            <strong>ASK ANOTHER TEAM MEMBER</strong>
            <span>
              &nbsp;about it rather than moderating without being sure of the
              standard.
            </span>
          </p>

          <h3>Step 1</h3>
          <p>
            Apply a YES/NO question to the comment being moderated, as below. If
            the answer to the question is NO then unpublish the content, and/or
            escalate it to another team member or Admin.
          </p>
          <ul>
            <li>
              Is the majority of the comment able to be understood (i.e. does it
              contain a known word or series of known words or emojis as opposed
              to random characters)?
            </li>
            <li>
              <span>
                If the comment is in a language not spoken by the moderator
                apply
              </span>
              <Link href="https://translate.google.com" target="_blank">
                {" "}
                this translation engine
              </Link>
              <span>&nbsp;before making a decision (link omitted here).</span>
            </li>
          </ul>

          <table border={1} cellPadding={4} cellSpacing={0}>
            <thead>
              <tr>
                <th>
                  <span>STEP 1&nbsp;</span>
                  <br />
                  <span>
                    <span>
                      (If the comment is in a language not spoken by the
                      moderator apply&nbsp;
                    </span>
                    <Link href="https://translate.google.com" target="_blank">
                      {" "}
                      this translation engine
                    </Link>
                    <span>&nbsp;before making a decision)</span>
                  </span>
                </th>
                <th>Is the majority of the content able to be understood?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>YES</td>
                <td>Move to STEP 2</td>
              </tr>
              <tr>
                <td>NO</td>
                <td>Unpublish</td>
              </tr>
            </tbody>
          </table>

          <h3>Step 2</h3>
          <p>
            Apply your interpretation to the comment made by asking this YES/NO
            question below, if the answer is NO, then unpublish the comment.
          </p>
          <ul>
            <li>
              Does the comment contain information relevant to the location it
              is made under?
            </li>
          </ul>
          <p>
            <strong>Exception:</strong>
            <span>
              &nbsp;If reference is made to another location (for example, a
              comparison saying “XXX place is so much better” – where XXX place
              is in the same sector of care) or references another service not
              yet on the location details page, which upon research appears
              useful to the community, the comment is be retained.
            </span>
          </p>

          <table border={1} cellPadding={4} cellSpacing={0}>
            <thead>
              <tr>
                <th>STEP 2</th>
                <th>
                  Does the comment contain information relevant to the location
                  it is made under?
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>YES</td>
                <td>Move to STEP 3</td>
              </tr>
              <tr>
                <td>NO</td>
                <td>Unpublish</td>
              </tr>
            </tbody>
          </table>

          <h3>Step 3</h3>
          <p>
            If the comment contains any of the following, then unpublish or
            unpublish and escalate.
          </p>
          <p>
            <strong>Escalate</strong>
            <span>
              &nbsp;means flagging the comment for the attention of an Admin
              team member (mod@YourPeer.nyc).
            </span>
          </p>
          <ol>
            <li>
              Any person’s full name and/or other clearly identifying
              information e.g. phone number or email
            </li>
            <li>A street address not relevant to the location</li>
            <li>Any offer of services, products or work</li>
            <li>
              An arrangement or solicitation/invitation to meet other users
            </li>
            <li>
              Any words that clearly abuse, insult or threaten any religion,
              race or group of people (see Hate Speech, Protected Categories
              below)
            </li>
            <li>
              <span>
                A threat toward any individual or organization (see Hate Speech,
                below)?
              </span>
              <ul>
                <li>e.g. “I’m gonna punch the caseworker I saw here”</li>
                <li>e.g. “I’m gonna kick the door in at this hospital”</li>
                <li>e.g. “This place should be blown up”</li>
              </ul>
              <span>
                If the threat is explicit and credible (see Credibility
                Assessment, below) then escalate.
              </span>
            </li>
            <li>
              A hyperlink or plain text link to a site which is not clearly
              relevant to the location or content of the comment
            </li>
          </ol>

          <table border={1} cellPadding="4" cellSpacing="0">
            <thead>
              <tr>
                <th>
                  <span>STEP 3</span>
                  <br />
                  <span>Does the comment contain/is the comment:</span>
                </th>
                <th>YES</th>
                <th>NO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Any person’s full name and/or other clearly identifying
                  information e.g. phone number or email
                </td>
                <td>Unpublish</td>
                <td>Moderation complete</td>
              </tr>
              <tr>
                <td>A street address not relevant to the location</td>
                <td>Unpublish</td>
                <td>Moderation complete</td>
              </tr>
              <tr>
                <td>Any offer of services, products or work</td>
                <td>Unpublish</td>
                <td>Moderation complete</td>
              </tr>
              <tr>
                <td>
                  An arrangement or solicitation/invitation to meet other users
                </td>
                <td>Unpublish</td>
                <td>Moderation complete</td>
              </tr>
              <tr>
                <td>
                  Any words that clearly abuse, insult or threaten any religion,
                  race or group of people
                </td>
                <td>Unpublish</td>
                <td>Moderation complete</td>
              </tr>
              <tr>
                <td>A credible threat (see credibility assessment)</td>
                <td>Unpublish &amp; ESCALATE</td>
                <td>Moderation complete</td>
              </tr>
              <tr>
                <td>
                  A hyperlink or plain text link to a site which is not clearly
                  relevant to the location or content of the comment
                </td>
                <td>Unpublish</td>
                <td>Moderation complete</td>
              </tr>
              <tr>
                <td>A link that goes to a site containing a credible threat</td>
                <td>Unpublish &amp; ESCALATE</td>
                <td>Moderation complete</td>
              </tr>
            </tbody>
          </table>

          <h2>Hate Speech</h2>
          <p>
            If comments contain hate speech, please take the following actions,
            even if the comment is unpublished because it is not relevant to the
            location. YourPeer retains the identifying origin (device ID or IP
            address) of comments and will keep a record of those who publish
            hate speech, should they need forwarding for legal or credible
            threat reasons.
          </p>
          <p>
            The threat moderation table below shows what types of visual and
            verbal attacks can and cannot be used against various types of
            people:
          </p>

          <h3>Definitions:</h3>
          <ul>
            <li>
              <strong>Ordinary person</strong>
              <span>&nbsp;– non-public figures who aren’t ‘famous’</span>
            </li>
            <li>
              <strong>Public figure</strong>
              <span>
                &nbsp;– any person featured in any mass medium (internet, news,
                etc.)
              </span>
            </li>
            <li>
              <strong>LEO</strong>
              <span>
                &nbsp;– Any person belonging to a law enforcement agency such as
                the police, drug enforcement agencies, etc. This does not apply
                to military personnel
              </span>
            </li>
            <li>
              <strong>HOS</strong>
              <span>
                &nbsp;– Any person who is currently the head of a ruling
                political entity in a country
              </span>
            </li>
          </ul>

          <h3>Examples of types of attacks:</h3>
          <ul>
            <li>
              <strong>Empty threat</strong>
              <span>
                &nbsp;– e.g. “I&apos;m gonna hurt [named person]” or “I&apos;m
                gonna burn this place down”
              </span>
            </li>
            <li>
              <strong>Credible threat</strong>
              <span>&nbsp;– see Credibility assessment, below.</span>
            </li>
            <li>
              <strong>Referencing negatively</strong>
              <span>
                &nbsp;– e.g. “I hated it, this place is so gay” “They Jew you
                down”
              </span>
            </li>
            <li>
              <strong>Cyberbullying</strong>
              <span>
                <span>
                  &nbsp;– given that we have no user identities or interaction
                  this is currently not possible to differentiate on YourPeer
                  from any other type of insult or hate speech that would be
                  unpublished. Examples of cyberbullying tactics are&nbsp;
                </span>
                <Link
                  target="_blank"
                  href="https://www.ipredator.co/cyberbullying-examples/"
                >
                  here
                </Link>
              </span>
            </li>
            <li>
              <strong>Attacking with hate symbols</strong>
              <span>
                &nbsp;– e.g. swastika emoji. If these attacks are persistent,
                from the same device or IP address, then also Escalate.
              </span>
            </li>
            <li>
              <strong>
                Attacking based on being a sexual assault survivor
              </strong>
              <span>
                &nbsp;– e.g. “Janie says she was raped here when she was 16. I
                think she deserved it…she must have been asking for it.”
              </span>
            </li>
          </ul>

          <h2>Credibility Assessment</h2>
          <p>
            For safety and legal reasons, we consider threats credible if they:
          </p>
          <ol>
            <li>
              Target heads of state or specific law enforcement officers*. For
              example, “I am going to shoot Adams”
            </li>
            <li>
              Contain 3 out of 4 details: time, place, method, specific target
              (not impossible to carry out)
            </li>
            <li>Target people with a history of assassination attempt/s**</li>
            <li>
              Include non-governmental bounties (promising earthly and heavenly
              rewards for a target&apos;s death)
            </li>
          </ol>
          <p>The target needs to be clearly identifiable; examples below –</p>
          <p>
            “I’m going to stab [method] Lisa H. [target] at the frat party
            [place]” (Unpublish &amp; Escalate). Additionally, the act is NOT
            IMPOSSIBLE to carry out.
          </p>
          <p>
            “I’m going to blow up the planet on New Year&apos;s Eve this year.”
            (Unpublish &amp; Do Not Escalate). Clearly not possible to carry out
            the act.
          </p>
          <p>
            *Law Enforcement Officers need to be identified by name. Negative
            Referencing and cyberbullying should still be unpublished.
          </p>
          <p>
            **The expectation from moderators is to research where language and
            context hint at loaded history. We understand that this is an
            operational burden and ambiguous in some cases. We&apos;d still like
            to give it a try to protect more vulnerable targets. We&apos;ll try
            and make sure you&apos;re not penalized for unreasonable
            expectations.
          </p>

          <h3>Threat moderation table:</h3>
          <table border={1} cellPadding="4" cellSpacing="0">
            <thead>
              <tr>
                <th></th>
                <th>Ordinary person</th>
                <th>Public figure</th>
                <th>LEO</th>
                <th>HOS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Empty threat</td>
                <td>use Protected Category standards</td>
                <td>use Protected Category standards</td>
                <td>Unpublish</td>
                <td>Unpublish</td>
              </tr>
              <tr>
                <td>Credible threat</td>
                <td>Unpublish &amp; Escalate</td>
                <td>Unpublish &amp; Escalate</td>
                <td>Unpublish &amp; Escalate</td>
                <td>Unpublish &amp; Escalate</td>
              </tr>
              <tr>
                <td>Referencing negatively</td>
                <td>use Protected Category standards</td>
                <td>use Protected Category standards</td>
                <td>Unpublish</td>
                <td>use Protected Category standards</td>
              </tr>
              <tr>
                <td>Cyberbullying</td>
                <td>use Protected Category standards</td>
                <td>use Protected Category standards</td>
                <td>Unpublish</td>
                <td>use Protected Category standards</td>
              </tr>
              <tr>
                <td>Attacking with hate symbols</td>
                <td>Unpublish</td>
                <td>use Protected Category standards</td>
                <td>Unpublish</td>
                <td>use Protected Category standards</td>
              </tr>
              <tr>
                <td>Attacking based on being a sexual assault victim</td>
                <td>Unpublish &amp; Escalate</td>
                <td>Unpublish &amp; Escalate</td>
                <td>Unpublish &amp; Escalate</td>
                <td>Unpublish &amp; Escalate</td>
              </tr>
            </tbody>
          </table>

          <h3>Protected Categories:</h3>
          <p>
            Users may NOT create content that degrades individuals based on the
            protected categories shared below, whether or not it appears in the
            same comment as relevant information about the location. Unpublish
            all comments containing comments referencing these terms.
          </p>
          <p>
            Note: Comic descriptions are allowed, however, if accompanied by
            slurs, they are still violations.
          </p>

          <table border={1} cellPadding="4" cellSpacing="0">
            <thead>
              <tr>
                <th>Category</th>
                <th>Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Race</td>
                <td>White, Black, Hispanic, Asian</td>
              </tr>
              <tr>
                <td>Ethnicity</td>
                <td>American Indians, Aborigines</td>
              </tr>
              <tr>
                <td>National Origin</td>
                <td>Americans, British, French, Chinese</td>
              </tr>
              <tr>
                <td>Followers of a religion or sect</td>
                <td>Christians, Muslims, Buddhists, Hindu, Wiccans</td>
              </tr>
              <tr>
                <td>Sex</td>
                <td>Male, Female</td>
              </tr>
              <tr>
                <td>Gender Identity</td>
                <td>Heterosexual, Bisexual, Homosexual, Asexual</td>
              </tr>
              <tr>
                <td>Sexual Orientation</td>
                <td>Lesbian, Gay, Bisexual, Queer, Transgender, Intersex</td>
              </tr>
              <tr>
                <td>Disability</td>
                <td>Physical, Sensory, Intellectual, Mental, Developmental</td>
              </tr>
              <tr>
                <td>Serious Disease</td>
                <td>Any life-threatening disease (Obesity not protected)</td>
              </tr>
            </tbody>
          </table>

          <p>
            <span>
              Further Abuse Standards to apply, if a moderation decision is
              unclear, are&nbsp;
            </span>
            <Link
              href="https://docs.google.com/document/d/13LMHMv14ny3Z0TDnmthC1lGIQIk7xsiPEIAv5HFmnYU/edit?tab=t.0#heading=h.sf1zhftnnsxw"
              target="_blank"
            >
              here
            </Link>
            <span>&nbsp;(access on request).</span>
          </p>

          <h2>Sexually explicit language</h2>
          <p>
            It is unlikely that any comment will pass the steps above and still
            contain sexually explicit language, but if moderation of this is
            required, or uncertain, please refer to examples in the relevant
            internal guidance.
          </p>

          <h2>Escalated comments</h2>
          <p>
            Where credible threats are escalated, decisions must be made as to
            whether to notify authorities and/or the staff of the location where
            the threat is made. The criteria for these decisions are TBC. This
            framework was established with legal counsel and co-design partners
            during the soft launch before the public launch.
          </p>
          <p>
            Continual hate speech against one particular named person at a
            location should be communicated to the staff liaison with YourPeer
            at that location, or with another appropriate member of staff at the
            location if no liaison has been established.
          </p>

          <h3>Cries for Help</h3>
          <p>
            If a comment is a cry for help and contains identifiable information
            (and is therefore escalated), a decision must be made as to whether
            to forward the information to a staff member at the location under
            which the comment appeared. The criteria for this decision are TBC.
          </p>

          <p>
            <em>
              <span>YourPeer is a platform by</span>{" "}
              <Link href="https://www.streetlives.nyc/" target="_blank">
                Streetlives, Inc.
              </Link>{" "}
              <span>– a New York City-based nonprofit organization.</span>
            </em>
          </p>
        </div>
      </div>
    </section>
  );
}
