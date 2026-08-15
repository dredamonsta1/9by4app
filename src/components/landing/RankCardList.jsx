import React from "react";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./RankCardList.module.css";

const art = (a) =>
  resolveImageUrl(
    a?.image_url,
    `https://via.placeholder.com/160?text=${encodeURIComponent(
      (a?.artist_name || a?.name || "?")[0]
    )}`
  );

/**
 * Rankings as art-forward cards rather than a text table.
 *
 * Borrows the card-deck framing from the Story 6 mockups: rounded, dark,
 * chartreuse rank pill, art carrying the row. Matches the locked Story 5
 * decision that RankView goes "artist-image-forward, not the current
 * text-heavy table".
 *
 * Whole row is clickable per the auth-wall rule — browsing is free, and
 * only the add button commits.
 */
const RankCardList = ({ artists = [], selectedId, onSelect, onAdd, inList }) => (
  <ol className={styles.list}>
    {artists.map((a, i) => {
      const rank = i + 1;
      const added = inList?.has(a.artist_id);
      return (
        <li key={a.artist_id}>
          <div
            className={`${styles.card} ${
              a.artist_id === selectedId ? styles.active : ""
            }`}
            onClick={() => onSelect?.(a)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(a);
              }
            }}
          >
            <span className={`${styles.rank} ${rank === 1 ? styles.first : ""}`}>
              {rank}
            </span>
            <img src={art(a)} alt="" className={styles.art} />
            <div className={styles.body}>
              <span className={styles.name}>{a.artist_name || a.name}</span>
              <span className={styles.meta}>
                {(a.count || 0).toLocaleString()} fans
                {a.genre ? ` · ${a.genre}` : ""}
              </span>
            </div>
            <button
              type="button"
              className={`${styles.add} ${added ? styles.addedBtn : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onAdd?.(a);
              }}
              disabled={added}
              aria-label={added ? "Already in your Top 20" : `Add ${a.artist_name}`}
            >
              {added ? "✓" : "+"}
            </button>
          </div>
        </li>
      );
    })}
  </ol>
);

export default RankCardList;
