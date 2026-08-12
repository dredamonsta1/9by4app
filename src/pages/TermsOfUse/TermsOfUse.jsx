import React from "react";
import styles from "./TermsOfUse.module.css";

const LAST_UPDATED = "August 11, 2026";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using stanbox ("the Platform", "we", "us", or "our"), you agree to be bound by these Terms of Use ("Terms"). If you do not agree to these Terms, do not access or use the Platform. These Terms constitute a legally binding agreement between you and stanbox.`,
  },
  {
    title: "2. Eligibility",
    body: `You must be at least 13 years of age to use the Platform. By using stanbox, you represent and warrant that you meet this requirement. Access to the Platform is currently invite-only. Creating an account requires a valid invite code. Sharing, selling, or transferring invite codes is prohibited and may result in account termination.`,
  },
  {
    title: "3. User Accounts",
    body: `You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or remain inactive for extended periods.`,
  },
  {
    title: "4. User-Generated Content",
    body: `You retain ownership of content you post on stanbox ("User Content"), including text posts, images, and music. By posting User Content, you grant stanbox a non-exclusive, worldwide, royalty-free license to display, distribute, and promote that content on and through the Platform.\n\nYou represent and warrant that: (a) you own or have the necessary rights to post your User Content; (b) your User Content does not infringe any third-party intellectual property, privacy, or publicity rights; and (c) your User Content complies with these Terms.`,
  },
  {
    title: "5. AI-Powered Content Moderation",
    body: `stanbox uses automated AI systems to detect potentially false, misleading, or harmful content ("Misinformation Detection"). Content flagged by these systems may be labeled, restricted, or removed. AI moderation is supplementary and not infallible — flagged content is subject to human review.\n\nYou acknowledge that automated moderation decisions may occasionally be incorrect. You may appeal a moderation action by contacting us. We reserve the right to make final decisions on all content disputes.`,
  },
  {
    title: "6. Prohibited Conduct",
    body: `You agree not to:\n\n• Post content that is defamatory, obscene, hateful, or harassing\n• Impersonate any person, artist, or entity\n• Upload content that infringes copyrights, trademarks, or other intellectual property rights\n• Spread intentionally false or misleading information about artists or music\n• Attempt to circumvent or manipulate the Platform's ranking or recommendation systems\n• Use the Platform to distribute spam, malware, or unauthorized advertising\n• Scrape, harvest, or systematically collect data from the Platform without written permission\n• Attempt to gain unauthorized access to any part of the Platform or its systems`,
  },
  {
    title: "7. Artist Profiles and Music Data",
    body: `Artist profile data on stanbox — including names, discographies, certifications, and biographical information — is aggregated from public sources for informational purposes. We do not claim ownership of this data and make no guarantees as to its accuracy or completeness.\n\nIf you are an artist or represent an artist and believe information is incorrect or wish to claim a profile, please contact us.`,
  },
  {
    title: "8. Intellectual Property",
    body: `The stanbox name, logo, design, and platform software are the exclusive property of stanbox and are protected by applicable intellectual property laws. Nothing in these Terms grants you any right to use stanbox's trademarks, logos, or proprietary content without our prior written consent.\n\nIf you believe content on the Platform infringes your copyright, please submit a notice to us with sufficient detail to identify the allegedly infringing material and your contact information.`,
  },
  {
    title: "9. Buying Music and Payments",
    body: `stanbox does not sell subscriptions and does not bill you on a recurring basis. Every payment on the Platform is a one-time purchase of a specific release from a specific artist. Creating an account, browsing, ranking artists, and posting are free.\n\nArtists set their own prices. The price is shown before you pay, and that is the amount you are charged. Payments are processed by our payment provider, Stripe — we never receive or store your card details.\n\nOn each sale, stanbox retains a 10% platform fee and the remaining 90% goes to the artist. Payouts are made to the artist through Stripe, and artists are responsible for any taxes arising from their sales.\n\nWhen a purchase completes, the release stays available for download in your library. We will make reasonable efforts to keep it available, but we cannot guarantee indefinite access — an artist may remove a release, or an artist's account may close. We recommend downloading and keeping your own copy of anything you buy.\n\nAll sales are final. We do not offer refunds except where required by law. If a purchase fails, is charged twice, or a file will not download, contact us and we will put it right.\n\nWe may change the platform fee or introduce new paid features with reasonable advance notice. Any change applies only to purchases made after it takes effect and never to purchases you have already completed.`,
  },
  {
    title: "10. Purchases and Artist Data Sharing",
    body: `When you buy music from an artist on stanbox, we share your email address and the details of that purchase — the release you bought, the amount paid, and the date — with the artist who sold it. This allows artists to contact you directly about their work, as they would with a direct sale from any independent store.\n\nYour email address is shared only when a purchase completes. Browsing an artist's page, adding an artist to your Top 20, playing a preview, or following activity on the Platform does not share your email address with any artist.\n\nThis sharing cannot be undone after a sale. Once an artist has received your email address through a completed purchase, that disclosure is permanent, and later changes — including removing the artist from your Top 20 or deleting the purchase from your library view — do not retract it. Artists are responsible for honoring your requests to stop contacting you.\n\nYou can see which artists have received your email address at any time on your library page.`,
  },
  {
    title: "11. Termination",
    body: `You may stop using the Platform at any time. We may suspend or terminate your access at any time, with or without notice, for conduct that we determine violates these Terms or is harmful to other users, the Platform, or third parties. Upon termination, your right to use the Platform ceases immediately. Sections that by their nature should survive termination will do so, including Sections 4, 8, 9, 10, 12, 13, and 14.`,
  },
  {
    title: "12. Disclaimers",
    body: `THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.`,
  },
  {
    title: "13. Limitation of Liability",
    body: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, STANBOX AND ITS OFFICERS, EMPLOYEES, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.`,
  },
  {
    title: "14. Governing Law",
    body: `These Terms are governed by the laws of the United States, without regard to conflict of law principles. Any disputes arising under these Terms shall be resolved through binding arbitration on an individual basis. You waive any right to participate in a class action lawsuit or class-wide arbitration against stanbox.`,
  },
  {
    title: "15. Changes to These Terms",
    body: `We may update these Terms from time to time. When we do, we will revise the "Last Updated" date at the top of this page. If changes are material, we will notify you via the Platform or by email. Continued use of the Platform after changes take effect constitutes your acceptance of the revised Terms.`,
  },
  {
    title: "16. Contact",
    body: `If you have questions about these Terms or wish to report a violation, please contact us through the Platform or reach out to the stanbox team directly.`,
  },
];

const TermsOfUse = () => (
  <div className={styles.page}>
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Terms of Use</h1>
        <p className={styles.meta}>Last updated: {LAST_UPDATED}</p>
        <p className={styles.intro}>
          Welcome to stanbox — a social platform for hip-hop artists and fans.
          Please read these Terms carefully before using the Platform.
        </p>
      </header>

      <div className={styles.sections}>
        {sections.map((section) => (
          <section key={section.title} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            {section.body.split("\n\n").map((paragraph, i) => (
              <p key={i} className={styles.body}>
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  </div>
);

export default TermsOfUse;
