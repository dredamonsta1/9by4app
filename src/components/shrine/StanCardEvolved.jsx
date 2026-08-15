import React from "react";
import { artFor, tenureLabel, TIER_LABELS, COMMUNITY_SLOTS } from "./shrineData";
import styles from "./StanCardEvolved.module.css";

/**
 * Direction 6 — Stan card, evolved.
 *
 * The existing StanCard treatment taken seriously as the shrine: a ranked
 * roster where tier and tenure are first-class columns rather than
 * afterthoughts, with the top slot given real weight.
 *
 * Strength: densest and most legible — the only direction where you can
 * read all twenty and their tenure without scrolling far. It's also the
 * least new code if it wins.
 * Weakness: it's a list. Precious is doing a lot of work through type and
 * spacing rather than through metaphor.
 */
const StanCardEvolved = ({ entries }) => {
  const filled = entries.filter((e) => !e.empty);
  if (filled.length === 0) {
    return <p className={styles.empty}>Nothing ranked yet.</p>;
  }

  const [hero, ...rest] = filled;

  return (
    <div className={styles.card}>
      <div className={styles.hero}>
        <span className={styles.heroRank}>1</span>
        <img src={artFor(hero)} alt="" className={styles.heroArt} />
        <div className={styles.heroBody}>
          <h4 className={styles.heroName}>{hero.artist_name}</h4>
          <div className={styles.heroMeta}>
            {hero.tier && (
              <span className={styles.tier}>{TIER_LABELS[hero.tier]}</span>
            )}
            {hero.days_as_member != null && (
              <span className={styles.since}>
                {tenureLabel(hero.days_as_member)} in your top 20
              </span>
            )}
          </div>
        </div>
      </div>

      <ul className={styles.list}>
        {rest.map((e) => (
          <li
            key={e.artist_id}
            className={`${styles.row} ${
              e.position <= COMMUNITY_SLOTS ? styles.core : ""
            }`}
          >
            <span className={styles.rank}>{e.position}</span>
            <img src={artFor(e)} alt="" className={styles.thumb} />
            <span className={styles.name}>{e.artist_name}</span>
            {e.tier && <span className={styles.tierSm}>{TIER_LABELS[e.tier]}</span>}
            <span className={styles.tenure}>
              {tenureLabel(e.days_as_member) ?? ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StanCardEvolved;
