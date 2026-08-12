import React from "react";
import styles from "./OnboardingChecklist.module.css";

export const ONBOARDING_TARGET = 3;
export const ONBOARDING_DISMISSED_KEY = "stanbox_onboarding_dismissed";

// Copy is per-remaining-step rather than generic, so the last one reads as
// nearly done instead of as one more item on a list.
const promptFor = (remaining) => {
  if (remaining >= 3) {
    return "Pick three artists to unlock your Music Personality and see what fans like you are listening to.";
  }
  if (remaining === 2) {
    return "Two more to unlock your Music Personality and see what fans like you are listening to.";
  }
  return "One more to unlock your Music Personality and see what fans like you are listening to.";
};

/**
 * First-run progress toward a usable stanbox.
 *
 * The activation loop already existed before this — the Music Personality
 * button has always been gated on three artists — but the only signal was a
 * disabled button several sections down the page. This makes the goal and
 * the distance to it visible on arrival.
 *
 * Three display states: progress, analyzing, and the reveal. The parent
 * owns when to mount this at all (own profile, under target, not dismissed)
 * and owns the personality data; this component owns presentation.
 */
const OnboardingChecklist = ({
  count = 0,
  target = ONBOARDING_TARGET,
  onAddArtist,
  onDismiss,
  analyzing = false,
  reveal = null,
}) => {
  const picked = Math.min(count, target);
  const remaining = Math.max(target - count, 0);

  if (reveal) {
    return (
      <section className={`${styles.card} ${styles.revealCard}`} aria-live="polite">
        <p className={styles.revealKicker}>Your Music Personality</p>
        <h2 className={styles.revealTitle}>{reveal.title}</h2>
        <p className={styles.revealDesc}>{reveal.description}</p>
        <p className={styles.revealFoot}>
          Built from your Top 20. Regenerate it any time below.
        </p>
      </section>
    );
  }

  if (analyzing) {
    return (
      <section className={styles.card} aria-live="polite">
        <p className={styles.kicker}>Three artists in</p>
        <h2 className={styles.title}>Reading your taste…</h2>
        <p className={styles.prompt}>
          Working out what your Top 20 says about you.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-labelledby="onboarding-title">
      <div className={styles.head}>
        <h2 id="onboarding-title" className={styles.title}>
          Build your stanbox
        </h2>
        <button type="button" className={styles.skip} onClick={onDismiss}>
          Skip
        </button>
      </div>

      {/* Three dots rather than a percentage — three steps reads as
          achievable in a way that "67%" doesn't. */}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={picked}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label={`${picked} of ${target} artists picked`}
      >
        {Array.from({ length: target }, (_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i < picked ? styles.dotOn : ""}`}
          />
        ))}
      </div>

      <p className={styles.count}>
        {picked} of {target} artists picked
      </p>

      <div className={styles.foot}>
        <p className={styles.prompt}>{promptFor(remaining)}</p>
        <button type="button" className={styles.addBtn} onClick={onAddArtist}>
          Add artist
        </button>
      </div>
    </section>
  );
};

export default OnboardingChecklist;
