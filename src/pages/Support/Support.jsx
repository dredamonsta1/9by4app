import React from "react";
import { Link } from "react-router-dom";
import styles from "./Support.module.css";
import { ONBOARDING_TARGET } from "../../components/OnboardingChecklist/OnboardingChecklist";
import { CRATE_MIN, CRATE_MAX } from "../../components/CrateShare/CrateShare";
import { MAX_PICKS } from "../../components/QuarterlyPicks/QuarterlyPicks";

// The App Store Connect Support URL points here, and Apple expects it to
// lead to real help and a way to reach us — the landing page has neither.
//
// Every step below was written against the code, web and iOS, not from
// memory. The limits are imported from the components that enforce them so
// the guide can't drift from the product. When the profile changes — a
// section added, moved, or made web-only — this page has to change with it.
//
// Where the two apps differ, say so. The iOS app shows crates and quarterly
// picks but can't make them.

export const SUPPORT_EMAIL = "support@onstanbox.com";

// Two weeks after a quarter ends — GRACE_PERIOD_DAYS in the backend's
// src/utils/quarters.ts.
const PICKS_GRACE_DAYS = 14;

const sections = [
  {
    id: "signing-in",
    title: "Signing in",
    blocks: [
      {
        p: "StanBox has no passwords. You sign in with a code sent to your email.",
      },
      {
        steps: [
          "Enter your email and tap Send code.",
          "Open the email from StanBox and copy the 6-digit code.",
          "Enter the code. You're signed in.",
        ],
      },
      {
        p: `No code? Check your spam or promotions folder. A code works for 5 minutes, so if it has expired, ask for a new one. You can request up to 5 codes every 15 minutes; after that, wait a few minutes before trying again.`,
      },
    ],
  },
  {
    id: "profile",
    title: "Your profile at a glance",
    blocks: [
      {
        p: "Your profile is your music identity on StanBox: the artists you rank, the albums you pick, and what you post. Anyone can see it, including people who aren't signed in.",
      },
      {
        platforms: {
          web: "Open Profile from the menu. Edit Profile changes your photo. Share copies a link to your profile. Tap Followers or Following to see who's there.",
          ios: "Open the Profile tab. Tap your photo to change it. Your followers and following counts are at the top.",
        },
      },
    ],
  },
  {
    id: "top-20",
    title: "Your Top 20",
    blocks: [
      {
        p: "The heart of your profile: the 20 artists you stan, in order. Your Top 20 is what feeds the artist rankings across StanBox, so the order matters.",
      },
      {
        platforms: {
          web: "Click + Add and search for an artist. To reorder, click Edit, drag artists into place, and click Done. In edit mode, the × on an artist removes them.",
          ios: "Under My List, search for an artist and tap to add them. Remove an artist from the list. Reordering is on the web for now.",
        },
      },
      {
        p: "Click an artist in your Top 20 to open their community: posts tagged to that artist, and the fans who stan them hardest.",
      },
      {
        p: "Can't find an artist? On the web, open Create Artist at the bottom of your profile to add them, with their albums. StanBox is for human artists only, so please don't add AI-generated acts.",
      },
    ],
  },
  {
    id: "music-personality",
    title: "Music Personality",
    blocks: [
      {
        p: `Add ${ONBOARDING_TARGET} artists to your Top 20 and your Music Personality unlocks: a short read on what kind of listener you are, based on the artists you rank.`,
      },
      {
        steps: [
          "Tap Analyze my taste.",
          "Changed your Top 20 a lot? Tap Regenerate for a fresh read.",
          "It's private until you switch on Show on my public profile.",
        ],
      },
      {
        p: `At ${ONBOARDING_TARGET} artists you'll also see "Fans of your Top 20 also love": artists other fans stan alongside yours. Only you see those suggestions.`,
      },
    ],
  },
  {
    id: "crates",
    title: "Crates",
    blocks: [
      {
        p: `A crate is a shareable bundle of ${CRATE_MIN} to ${CRATE_MAX} artists from your Top 20. Think of it as a mixtape of who you're listening to. Anyone with the link can open it and adopt it.`,
      },
      {
        platforms: {
          web: `Under your Top 20, pick ${CRATE_MIN} to ${CRATE_MAX} artists, give the crate a name, and click Create crate. The link is copied straight away. Your crates are listed underneath, with how many times each has been adopted.`,
          ios: "Your crates show on your profile with a share button. Making a new crate is on the web for now.",
        },
      },
    ],
  },
  {
    id: "quarterly-picks",
    title: "Quarterly Picks",
    blocks: [
      {
        p: `Every quarter, choose the ${MAX_PICKS} albums that defined it for you, ranked. Only albums released that quarter are eligible — singles and EPs aren't.`,
      },
      {
        platforms: {
          web: `Click Make your picks, add up to ${MAX_PICKS} albums from the list, use the arrows to put them in order, then click Save picks.`,
          ios: "Your picks show on your profile. Making picks is on the web for now.",
        },
      },
      {
        p: `You can change your picks until ${PICKS_GRACE_DAYS} days after the quarter ends. After that they're sealed for good. That's what makes them a record of the moment.`,
      },
    ],
  },
  {
    id: "playlists",
    title: "Made for you",
    blocks: [
      {
        p: "On the web, your profile builds discovery playlists from your Top 20, using artists who sound like the ones you rank. Every playlist includes smaller artists you won't find on a chart, marked Under the radar. Tap a track to hear a preview.",
      },
      {
        p: "If your playlists are empty, StanBox hasn't found enough playable previews for your artists yet. Check back the next day.",
      },
    ],
  },
  {
    id: "activity-community",
    title: "Posts, people and messages",
    blocks: [
      {
        p: "Activity on your profile lists everything you've posted to the feed. To post, use the + button in the feed.",
      },
      {
        p: "Community on your web profile lets you search for people, and suggests people with similar taste. Follow someone to see their posts in your feed, or send them a message. The Beef & Alliance Map below it shows which artists share fans, worked out from everyone's Top 20.",
      },
      {
        p: "Your messages open from your profile on the web, and from the Messages tab in the app.",
      },
    ],
  },
  {
    id: "safety",
    title: "Reporting and blocking",
    blocks: [
      {
        p: "On the web and in the iOS app, open the ⋯ menu on any post or profile to report it or block the person. Reports go to the StanBox team, and the other person isn't told who reported them. Blocking someone hides their posts from you and stops them messaging you. They aren't told you blocked them.",
      },
      {
        p: "To unblock someone, go to your Profile → Blocked accounts. Unblocking doesn't make you follow them again.",
      },
      {
        p: `If something needs more than a report, email ${SUPPORT_EMAIL} with a link to the post or profile.`,
      },
    ],
  },
  {
    id: "delete-account",
    title: "Deleting your account",
    blocks: [
      {
        platforms: {
          web: "At the bottom of your profile, click Delete account and type your username to confirm.",
          ios: "Go to Profile → Delete account and type your username to confirm.",
        },
      },
      {
        p: "It happens immediately and can't be undone. Your email, username, profile picture, Top 20 and Music Personality are removed. Posts, comments and messages you wrote stay, shown as coming from a deleted account, so conversations still make sense. Crates you shared keep working for the people who have the link. The Privacy Policy explains exactly what's kept and why.",
      },
    ],
  },
];

const Platforms = ({ web, ios }) => (
  <div className={styles.platforms}>
    <div className={styles.platform}>
      <span className={styles.platformLabel}>On the web</span>
      <p className={styles.body}>{web}</p>
    </div>
    <div className={styles.platform}>
      <span className={styles.platformLabel}>In the iOS app</span>
      <p className={styles.body}>{ios}</p>
    </div>
  </div>
);

const Block = ({ block }) => {
  if (block.steps) {
    return (
      <ol className={styles.steps}>
        {block.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    );
  }
  if (block.platforms) return <Platforms {...block.platforms} />;
  return <p className={styles.body}>{block.p}</p>;
};

const Support = () => (
  <div className={styles.page}>
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Support</h1>
        <p className={styles.intro}>
          How to use your StanBox profile, on the web and in the iOS app. If
          something isn't covered here or isn't working, write to us.
        </p>
        <div className={styles.contact}>
          <span className={styles.contactLabel}>Contact us</span>
          <a className={styles.contactLink} href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          <span className={styles.contactNote}>
            Tell us what you were doing, and whether you were on the web or the
            iOS app.
          </span>
        </div>
      </header>

      <nav className={styles.toc} aria-label="On this page">
        <span className={styles.tocLabel}>On this page</span>
        <ul>
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>{s.title}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.sections}>
        {sections.map((section) => (
          <section key={section.id} id={section.id} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </section>
        ))}
      </div>

      <footer className={styles.footer}>
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms of Use</Link>
      </footer>
    </div>
  </div>
);

export default Support;
