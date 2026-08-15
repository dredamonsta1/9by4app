import React from "react";
import { artFor, tenureLabel, COMMUNITY_SLOTS } from "./shrineData";
import styles from "./VinylStack.module.css";

/**
 * Direction 1 — Stack of vinyl.
 *
 * Records leaning in a crate, seen side-on. Rank reads top-to-bottom by
 * depth in the stack; #1 is the sleeve at the front. Tenure sits on the
 * spine like a pressing year.
 *
 * Strength: instantly reads as a record collection, and 20 items fit in
 * very little vertical space.
 * Weakness: artwork is mostly hidden — this is a shrine to the *list*,
 * not to the artists' faces.
 */
const VinylStack = ({ entries }) => {
  const filled = entries.filter((e) => !e.empty);

  return (
    <div className={styles.crate}>
      <div className={styles.stack}>
        {filled.map((e, i) => (
          <div
            key={e.artist_id}
            className={`${styles.sleeve} ${
              i < COMMUNITY_SLOTS ? styles.core : ""
            }`}
            style={{ "--i": i }}
            title={`#${e.position} ${e.artist_name}`}
          >
            <span className={styles.rank}>{e.position}</span>
            <span className={styles.name}>{e.artist_name}</span>
            <span className={styles.meta}>
              {tenureLabel(e.days_as_member) ?? ""}
            </span>
            <span
              className={styles.disc}
              style={{ backgroundImage: `url(${artFor(e)})` }}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
      {filled.length === 0 && (
        <p className={styles.empty}>No artists in the crate yet.</p>
      )}
    </div>
  );
};

export default VinylStack;
