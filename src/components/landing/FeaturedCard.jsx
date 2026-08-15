import React from "react";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./FeaturedCard.module.css";

const art = (a) =>
  resolveImageUrl(
    a?.image_url,
    `https://via.placeholder.com/600?text=${encodeURIComponent(
      (a?.artist_name || a?.name || "?")[0]
    )}`
  );

/**
 * The featured artist, demoted from protagonist to companion.
 *
 * Under the Story 5 hierarchy the rankings column is the page and this is
 * the detail view for whichever row is selected — so it no longer carries
 * the ▲/▼ flip arrows. Clicking a rank row is the browse mechanism now;
 * two ways to move between artists was one too many, and the arrows only
 * existed because there was no visible list to click.
 *
 * `deckStyle` is the treatment under comparison: the card-deck framing
 * from the Story 6 mockups (rank pill, tighter body, physical card feel)
 * versus the current full-bleed image with an overlaid name.
 */
const FeaturedCard = ({
  artist,
  rank,
  deckStyle = false,
  isLoggedIn,
  added,
  onAdd,
  onOpen,
}) => {
  if (!artist) {
    return <div className={styles.placeholder}>Pick an artist from the rankings.</div>;
  }

  const name = artist.artist_name || artist.name;

  return (
    <article
      className={`${styles.card} ${deckStyle ? styles.deck : styles.classic}`}
    >
      {deckStyle && rank != null && (
        <span className={styles.rankPill}>#{rank}</span>
      )}

      <div className={styles.imageWrap} onClick={() => onOpen?.(artist)}>
        <img src={art(artist)} alt={name} className={styles.image} />
        {!deckStyle && (
          <div className={styles.overlay}>
            <h2 className={styles.overlayName}>{name}</h2>
            {rank != null && <span className={styles.overlayRank}>#{rank}</span>}
          </div>
        )}
      </div>

      <div className={styles.body}>
        {deckStyle && <h2 className={styles.name}>{name}</h2>}
        <div className={styles.meta}>
          <span className={styles.fans}>
            {(artist.count || 0).toLocaleString()} fans
          </span>
          {artist.genre && <span className={styles.chip}>{artist.genre}</span>}
          {artist.region && <span className={styles.chip}>{artist.region}</span>}
        </div>

        <button
          type="button"
          className={`${styles.cta} ${added ? styles.ctaAdded : ""}`}
          onClick={() => onAdd?.(artist)}
          disabled={added}
        >
          {!isLoggedIn
            ? `Sign up to stan ${name}`
            : added
            ? `${name} is in your Top 20`
            : `Add ${name} to your Top 20`}
        </button>
      </div>
    </article>
  );
};

export default FeaturedCard;
