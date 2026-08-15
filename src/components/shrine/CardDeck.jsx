import React, { useState } from "react";
import { artFor, tenureLabel, TIER_LABELS, COMMUNITY_SLOTS } from "./shrineData";
import styles from "./CardDeck.module.css";

/**
 * Direction 3 — Card deck.
 *
 * A physical stack, #1 face-up. Click to deal the top card to the back and
 * reveal the next. The active card is large enough to carry art, tier and
 * tenure properly.
 *
 * Strength: the single most "collectible" feel, and the active card has
 * room for real detail.
 * Weakness: only one artist is legible at a time — it's a browsing toy
 * more than an at-a-glance shrine. Judge this one by interacting with it.
 */
const CardDeck = ({ entries }) => {
  const filled = entries.filter((e) => !e.empty);
  const [top, setTop] = useState(0);

  if (filled.length === 0) {
    return <p className={styles.empty}>No cards in the deck yet.</p>;
  }

  const advance = () => setTop((t) => (t + 1) % filled.length);
  const order = filled.map((_, i) => (top + i) % filled.length);

  return (
    <div className={styles.table}>
      <div className={styles.deck} onClick={advance} role="presentation">
        {order
          .slice(0, 6)
          .reverse()
          .map((idx, depthFromBack) => {
            const e = filled[idx];
            const depth = Math.min(5, order.slice(0, 6).length - 1) - depthFromBack;
            const isTop = depth === 0;
            return (
              <article
                key={e.artist_id}
                className={`${styles.card} ${isTop ? styles.top : ""} ${
                  e.position <= COMMUNITY_SLOTS ? styles.core : ""
                }`}
                style={{ "--d": depth }}
                aria-hidden={!isTop}
              >
                <span className={styles.rank}>#{e.position}</span>
                <img src={artFor(e)} alt="" className={styles.art} />
                <div className={styles.body}>
                  <h4 className={styles.name}>{e.artist_name}</h4>
                  <div className={styles.stats}>
                    {e.tier && (
                      <span className={styles.tier}>{TIER_LABELS[e.tier]}</span>
                    )}
                    {e.days_as_member != null && (
                      <span className={styles.tenure}>
                        {tenureLabel(e.days_as_member)}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
      </div>
      <p className={styles.hint}>
        Click the deck — {top + 1} of {filled.length}
      </p>
    </div>
  );
};

export default CardDeck;
