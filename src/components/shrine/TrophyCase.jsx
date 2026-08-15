import React from "react";
import { artFor, tenureLabel, TIER_LABELS, COMMUNITY_SLOTS } from "./shrineData";
import styles from "./TrophyCase.module.css";

/**
 * Direction 5 — Trophy case.
 *
 * Twenty slots, filled and unfilled both visible. The first five sit in a
 * separate "inner circle" band because those are the ones that count
 * toward community membership — the only direction that states the rule
 * structurally rather than with a colour hint.
 *
 * Strength: carries tier and tenure most naturally, and the empty slots
 * turn an incomplete list into an invitation.
 * Weakness: game-like. Whether that reads as fun or cheapens the
 * "precious" intent is exactly the judgement call to make here.
 */
const TrophyCase = ({ entries }) => {
  const inner = entries.slice(0, COMMUNITY_SLOTS);
  const outer = entries.slice(COMMUNITY_SLOTS);

  const Slot = ({ e, big }) =>
    e.empty ? (
      <div className={`${styles.slot} ${styles.locked} ${big ? styles.big : ""}`}>
        <span className={styles.lockNum}>{e.position}</span>
      </div>
    ) : (
      <div
        className={`${styles.slot} ${big ? styles.big : ""} ${
          e.position === 1 ? styles.first : ""
        }`}
        title={`#${e.position} ${e.artist_name}`}
      >
        <span className={styles.num}>{e.position}</span>
        <img src={artFor(e)} alt="" className={styles.art} />
        <span className={styles.name}>{e.artist_name}</span>
        <span className={styles.meta}>
          {e.tier ? TIER_LABELS[e.tier] : ""}
          {e.tier && e.days_as_member != null ? " · " : ""}
          {tenureLabel(e.days_as_member) ?? ""}
        </span>
      </div>
    );

  return (
    <div className={styles.case}>
      <div className={styles.band}>
        <p className={styles.bandLabel}>
          Inner circle
          <span className={styles.bandNote}>
            these five count toward artist communities
          </span>
        </p>
        <div className={styles.innerGrid}>
          {inner.map((e) => (
            <Slot key={e.artist_id ?? `empty-${e.position}`} e={e} big />
          ))}
        </div>
      </div>

      <div className={styles.band}>
        <p className={styles.bandLabel}>The rest of the twenty</p>
        <div className={styles.outerGrid}>
          {outer.map((e) => (
            <Slot key={e.artist_id ?? `empty-${e.position}`} e={e} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrophyCase;
