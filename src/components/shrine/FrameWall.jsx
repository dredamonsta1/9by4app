import React from "react";
import { artFor, tenureLabel, COMMUNITY_SLOTS } from "./shrineData";
import styles from "./FrameWall.module.css";

/**
 * Direction 2 — Wall of frames.
 *
 * Museum hang. Each artist framed as a portrait with an engraved plaque:
 * rank, name, tenure. The first five hang in heavier frames, which is how
 * the community rule expresses itself without a label explaining it.
 *
 * Strength: the most "precious" of the six, and artwork is the hero.
 * Weakness: 20 frames is a lot of vertical space, and it's the least
 * playful — closer to reverent than fun.
 */
const FrameWall = ({ entries }) => (
  <div className={styles.wall}>
    {entries.map((e) =>
      e.empty ? (
        <div key={`empty-${e.position}`} className={styles.vacant}>
          <span className={styles.vacantNum}>{e.position}</span>
        </div>
      ) : (
        <figure
          key={e.artist_id}
          className={`${styles.frame} ${
            e.position <= COMMUNITY_SLOTS ? styles.heavy : ""
          } ${e.position === 1 ? styles.first : ""}`}
        >
          <div className={styles.matte}>
            <img src={artFor(e)} alt={e.artist_name} className={styles.art} />
          </div>
          <figcaption className={styles.plaque}>
            <span className={styles.rank}>{e.position}</span>
            <span className={styles.name}>{e.artist_name}</span>
            {e.days_as_member != null && (
              <span className={styles.tenure}>
                {tenureLabel(e.days_as_member)}
              </span>
            )}
          </figcaption>
        </figure>
      )
    )}
  </div>
);

export default FrameWall;
