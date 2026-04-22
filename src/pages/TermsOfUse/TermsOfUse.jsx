import React from "react";
import styles from "./TermsOfUse.module.css";

const LAST_UPDATED = "April 7, 2026";

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
    title: "9. Creator Subscriptions and Payments",
    body: `Certain features of the Platform require a paid Creator subscription. All fees are stated at the time of purchase and are non-refundable except where required by law. We use third-party payment processors and do not store your payment information. By subscribing, you authorize recurring charges at the applicable rate until you cancel.\n\nWe reserve the right to change pricing with reasonable advance notice. Continued use of a paid feature after a price change constitutes acceptance of the new price.`,
  },
  {
    title: "10. Termination",
    body: `You may stop using the Platform at any time. We may suspend or terminate your access at any time, with or without notice, for conduct that we determine violates these Terms or is harmful to other users, the Platform, or third parties. Upon termination, your right to use the Platform ceases immediately. Sections that by their nature should survive termination will do so, including Sections 4, 8, 11, 12, and 13.`,
  },
  {
    title: "11. Disclaimers",
    body: `THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.`,
  },
  {
    title: "12. Limitation of Liability",
    body: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CRATES.FYI AND ITS OFFICERS, EMPLOYEES, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.`,
  },
  {
    title: "13. Governing Law",
    body: `These Terms are governed by the laws of the United States, without regard to conflict of law principles. Any disputes arising under these Terms shall be resolved through binding arbitration on an individual basis. You waive any right to participate in a class action lawsuit or class-wide arbitration against stanbox.`,
  },
  {
    title: "14. Changes to These Terms",
    body: `We may update these Terms from time to time. When we do, we will revise the "Last Updated" date at the top of this page. If changes are material, we will notify you via the Platform or by email. Continued use of the Platform after changes take effect constitutes your acceptance of the revised Terms.`,
  },
  {
    title: "15. Contact",
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
