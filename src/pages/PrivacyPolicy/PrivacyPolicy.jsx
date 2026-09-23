import React from "react";
import styles from "./PrivacyPolicy.module.css";

const LAST_UPDATED = "September 22, 2026";

// This page is a required App Store Connect field, and Apple rejects
// submissions where the policy disagrees with the app's privacy manifest.
// Every claim below was checked against the code rather than a template:
// the six data categories match NineByFour/PrivacyInfo.xcprivacy, and the
// third parties named are the ones actually configured on the backend
// (Stripe, Cloudinary, Resend, Google Gemini, ipapi.co, LiveKit).
//
// If you add a processor or start collecting a new field, this page and the
// manifest both have to change, or the next submission is rejected for the
// mismatch.

const sections = [
  {
    title: "1. Who We Are",
    body: `stanbox ("the Platform", "we", "us", or "our") is a music platform where fans rank the artists they care about and artists sell their work directly. This Privacy Policy explains what we collect, why, who we share it with, and what you can do about it.\n\nIt applies to the stanbox website and the stanbox iOS app. If you do not agree with this policy, do not use the Platform.`,
  },
  {
    title: "2. What We Collect",
    body: `Account information. Your email address and username. We use passwordless sign-in, so we send a six-digit code to your email instead of storing a password. Sign-in codes are deleted once used or expired.\n\nProfile information. Anything you choose to add: a profile picture, and links to your Instagram, TikTok, YouTube, or X accounts. All of this is optional and you can remove it at any time.\n\nContent you create. Posts, comments, direct messages, crates, your Top 20, your quarterly picks, and — if you are an artist — the music, artwork, and release information you upload.\n\nPurchase records. What you bought, the amount, and the date. We never receive or store your card number; payments are handled entirely by Stripe.\n\nApproximate location. Country and region only. This is derived on our servers from the network address your request arrives from when you sign in, or from the billing address you type during checkout. We do not ask for device location permission, and the app does not use location services. We do not store your network address — it is used to look up a country and then discarded.\n\nWe do not collect: precise location, contacts, health data, browsing activity on other sites, or advertising identifiers.`,
  },
  {
    title: "3. Why We Collect It",
    body: `To run your account — signing you in, showing you your library, and letting you post, message, and rank.\n\nTo complete purchases and to give artists the sales records they are owed.\n\nTo moderate content, so the Platform stays usable.\n\nTo understand, in aggregate, which countries and regions an artist's audience is in. This is the only thing we use for analytics, and artists see it only as counts by region — never as individual users.`,
  },
  {
    title: "4. We Do Not Track You",
    body: `stanbox contains no advertising networks, no third-party analytics SDKs, and no tracking pixels. We do not build advertising profiles, we do not track you across other apps or websites, and we do not sell or rent your personal information to anyone. We have never done so and have no plans to.\n\nOur iOS app's privacy manifest declares tracking as disabled and lists no tracking domains.`,
  },
  {
    title: "5. Automated Content Moderation",
    body: `Content posted to the Platform may be analysed automatically to detect misinformation and content that breaks our rules. This analysis is performed by Google's Gemini API, which means the text of a post you submit may be sent to Google for processing.\n\nThis applies to content you publish, not to your direct messages. Automated moderation is not infallible and its decisions are subject to human review — see our Terms of Use for how to appeal one.`,
  },
  {
    title: "6. Who We Share Data With",
    body: `We share data only with the service providers needed to run the Platform, and only the data each one needs:\n\n• Stripe — payment processing. Receives your payment details directly; we never see your card number.\n• Cloudinary — image and audio hosting. Stores the files you upload.\n• Resend — transactional email, such as sign-in codes and invite emails. Receives your email address.\n• Google (Gemini API) — automated content moderation, as described above.\n• ipapi.co — resolves a network address to a country and region at sign-in. Receives the address; we do not retain it.\n• LiveKit — real-time audio rooms, where that feature is used.\n\nArtists. When you buy music, we share your email address and that purchase's details with the artist who sold it, so they can contact you as any independent seller would. This happens only on a completed purchase — browsing, ranking, following, or playing a preview never shares your email. This disclosure cannot be undone once made. You can see which artists have received your email address on your library page. Section 10 of our Terms of Use covers this in full.\n\nLegal. We may disclose information if required by law, or to protect the rights, safety, or property of stanbox, our users, or the public.`,
  },
  {
    title: "7. What Is Public",
    body: `Your username, profile picture, Top 20, crates, quarterly picks, posts, and comments are visible to others, including people who are not signed in. Browsing stanbox does not require an account, so assume anything you post can be seen publicly.\n\nYour email address, sign-in codes, and direct messages are not public. Your approximate location is never shown as yours — only as part of an aggregate regional count.`,
  },
  {
    title: "8. Deleting Your Account",
    body: `You can delete your account at any time from your profile on the web, or from Settings in the iOS app. No email to us is required, and there is no waiting period.\n\nWhat is permanently removed: your email address, username, profile picture, social links, your Top 20, and your music personality.\n\nWhat remains on the Platform: posts, comments, and messages you wrote, shown as coming from a deleted account, so that conversations and replies stay readable for the people you were talking to. Crates you shared stay live so links other people hold keep working. Quarterly picks and purchase records are kept, because charts are sealed historical records and purchase records are needed for refunds and for artists' accounting.\n\nWe are telling you this plainly because "delete my account" does not mean every trace is erased, and you should know that before you do it. Deletion cannot be undone.`,
  },
  {
    title: "9. Keeping Data",
    body: `We keep your account information for as long as your account exists. Sign-in codes are deleted as soon as they are used or expire. Purchase records are kept after account deletion, as described above, for refunds and for artists' financial records.\n\nBecause account deletion anonymises your account rather than removing the record entirely, content you posted may remain indefinitely, attributed to a deleted account.`,
  },
  {
    title: "10. Your Rights",
    body: `Depending on where you live, you may have the right to access the personal information we hold about you, correct it, delete it, or obtain a copy of it.\n\nYou can exercise most of these directly: your profile page lets you view and correct your information, and account deletion is self-service. For anything else — including a copy of your data — contact us through the Platform and we will respond within a reasonable period.\n\nIf you are in the European Economic Area or the United Kingdom, our lawful basis for processing is performance of our contract with you (running your account and completing purchases) and our legitimate interest in keeping the Platform safe and functioning.`,
  },
  {
    title: "11. Security",
    body: `Sign-in uses one-time codes sent to your email rather than passwords, so there is no password of yours for us to lose. Traffic between your device and our servers is encrypted in transit. On iOS, your sign-in token is stored in the device Keychain. Payment details never touch our servers.\n\nNo system is perfectly secure, and we cannot guarantee absolute security. If we become aware of a breach affecting your personal information, we will notify you as required by law.`,
  },
  {
    title: "12. Children",
    body: `stanbox is not intended for children under 13, and you must be at least 13 to create an account. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has given us personal information, contact us and we will delete it.`,
  },
  {
    title: "13. International Users",
    body: `stanbox is operated from the United States, and our service providers may process data in the United States and elsewhere. If you use the Platform from outside the United States, you understand that your information will be transferred to and processed in the United States, where data protection laws may differ from those in your country.`,
  },
  {
    title: "14. Changes to This Policy",
    body: `We may update this Privacy Policy. When we do, we will revise the "Last Updated" date above. If a change materially affects how we handle your information, we will notify you through the Platform or by email before it takes effect.`,
  },
  {
    title: "15. Contact",
    body: `If you have questions about this policy, want a copy of your data, or want to raise a privacy concern, contact us through the Platform or reach the stanbox team directly.`,
  },
];

const PrivacyPolicy = () => (
  <div className={styles.page}>
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.meta}>Last updated: {LAST_UPDATED}</p>
        <p className={styles.intro}>
          What stanbox collects, why, and who sees it. We do not track you, we
          do not sell your data, and we do not run ads.
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

export default PrivacyPolicy;
