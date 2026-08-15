import React, { useEffect, useState } from "react";
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
 *
 * Paged rather than scrolled, five at a time. The point of putting
 * rankings first is the feedback loop with the filter pills — click
 * "Hip Hop", watch the list change — and that reads just as well at five
 * rows as at twenty-five, while keeping the section a fixed height so
 * nothing below it shifts. `resetKey` (the active filter) snaps back to
 * page one, so a filter change is always visible at the top of the list
 * rather than somewhere on page four.
 */
const PAGE_SIZE = 5;

const RankCardList = ({
  artists = [],
  selectedId,
  onSelect,
  onAdd,
  inList,
  resetKey,
}) => {
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [resetKey]);

  const pageCount = Math.max(1, Math.ceil(artists.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const shown = artists.slice(start, start + PAGE_SIZE);

  if (artists.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <ol className={styles.list}>
    {shown.map((a, i) => {
      const rank = start + i + 1;
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

      {pageCount > 1 && (
        <nav className={styles.pager} aria-label="Rankings pages">
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            aria-label="Previous ranks"
          >
            ‹
          </button>
          <span className={styles.pageLabel}>
            {start + 1}–{Math.min(start + PAGE_SIZE, artists.length)} of{" "}
            {artists.length}
          </span>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            aria-label="Next ranks"
          >
            ›
          </button>
        </nav>
      )}
    </div>
  );
};

export default RankCardList;
