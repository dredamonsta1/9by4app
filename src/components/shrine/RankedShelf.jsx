import React from "react";
import { artFor, tenureLabel, COMMUNITY_SLOTS } from "./shrineData";
import styles from "./RankedShelf.module.css";

/**
 * Direction 4 — Ranked shelf.
 *
 * Records stood on a shelf, each as a disc with a chartreuse centre label
 * carrying the rank. Deliberately speaks the brand mark's language (vinyl
 * + chartreuse label), so it's the most on-brand of the six.
 *
 * Strength: distinctly stanbox rather than a generic grid, and the rank
 * lives where a record label actually sits.
 * Weakness: circular crops are unkind to artist photography, and the shelf
 * furniture eats space that could show art.
 */
const RankedShelf = ({ entries }) => {
  const rows = [entries.slice(0, 10), entries.slice(10, 20)];

  return (
    <div className={styles.unit}>
      {rows.map((row, r) => (
        <div key={r} className={styles.shelfRow}>
          <div className={styles.records}>
            {row.map((e) =>
              e.empty ? (
                <div key={`empty-${e.position}`} className={styles.gap}>
                  <span className={styles.gapNum}>{e.position}</span>
                </div>
              ) : (
                <div
                  key={e.artist_id}
                  className={`${styles.record} ${
                    e.position <= COMMUNITY_SLOTS ? styles.core : ""
                  }`}
                  title={`#${e.position} ${e.artist_name}`}
                >
                  <div
                    className={styles.disc}
                    style={{ backgroundImage: `url(${artFor(e)})` }}
                  >
                    <span
                      className={`${styles.label} ${
                        e.position === 1 ? styles.labelFirst : ""
                      }`}
                    >
                      {e.position}
                    </span>
                  </div>
                  <span className={styles.name}>{e.artist_name}</span>
                  <span className={styles.tenure}>
                    {tenureLabel(e.days_as_member) ?? " "}
                  </span>
                </div>
              )
            )}
          </div>
          <div className={styles.plank} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
};

export default RankedShelf;
