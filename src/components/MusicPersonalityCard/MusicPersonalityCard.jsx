import React from "react";
import styles from "./MusicPersonalityCard.module.css";

/**
 * The Music Personality, in one place.
 *
 * This used to be two surfaces: a celebratory reveal at the top of the
 * profile fired by onboarding, and a permanent card further down carrying
 * the regenerate button and the public/private toggle. Both rendered the
 * same title and description, so right after the reveal the page said the
 * same thing twice. They're now one card that lives where the reveal was
 * and owns the controls.
 *
 * `celebratory` only changes the styling — it's the just-revealed state,
 * not a different card.
 *
 * Renders nothing below the artist threshold: at that point the onboarding
 * checklist occupies this slot and is already explaining what's missing.
 */
const MusicPersonalityCard = ({
  personality,
  loading = false,
  isPublic = false,
  celebratory = false,
  eligible = true,
  readOnly = false,
  ownerName,
  onAnalyze,
  onVisibilityChange,
}) => {
  // Someone else's profile. The backend only sends the personality fields
  // when the owner has made them public, so having them here *is* the
  // permission check — there's nothing further to gate on. No controls, no
  // private badge, no eligibility question (their artist count isn't ours
  // to reason about).
  if (readOnly) {
    if (!personality) return null;
    return (
      <section className={styles.card}>
        <p className={styles.kicker}>
          {ownerName ? `${ownerName}'s Music Personality` : "Music Personality"}
        </p>
        <h2 className={styles.name}>{personality.title}</h2>
        <p className={`${styles.desc} ${styles.descLast}`}>
          {personality.description}
        </p>
      </section>
    );
  }

  if (!eligible) return null;

  if (loading) {
    return (
      <section className={styles.card} aria-live="polite">
        <p className={styles.kicker}>Your Music Personality</p>
        <h2 className={styles.title}>Reading your taste…</h2>
        <p className={styles.sub}>
          Working out what your Top 20 says about you.
        </p>
      </section>
    );
  }

  // Eligible but nothing generated yet — a skipped onboarding, or an
  // auto-generate that failed. Without this the manual trigger would have
  // disappeared along with the old section.
  if (!personality) {
    return (
      <section className={styles.card}>
        <p className={styles.kicker}>Your Music Personality</p>
        <p className={styles.sub}>
          You've got enough artists. See what your Top 20 says about you.
        </p>
        <button type="button" className={styles.primaryBtn} onClick={onAnalyze}>
          Analyze my taste
        </button>
      </section>
    );
  }

  return (
    <section
      className={`${styles.card} ${celebratory ? styles.celebratory : ""}`}
      aria-live={celebratory ? "polite" : undefined}
    >
      <div className={styles.head}>
        <p className={styles.kicker}>Your Music Personality</p>
        {!isPublic && <span className={styles.privateBadge}>Private</span>}
      </div>

      <h2 className={styles.name}>{personality.title}</h2>
      <p className={styles.desc}>{personality.description}</p>

      <div className={styles.foot}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => onVisibilityChange?.(e.target.checked)}
          />
          Show on my public profile
        </label>
        <button type="button" className={styles.ghostBtn} onClick={onAnalyze}>
          Regenerate
        </button>
      </div>
    </section>
  );
};

export default MusicPersonalityCard;
