import React from "react";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./Top20Shrine.module.css";

export const COMMUNITY_SLOTS = 5;

const TIER_LABELS = {
  casual: "Casual",
  fan: "Fan",
  stan: "Stan",
  "day-one": "Day One",
};

const artFor = (a) =>
  resolveImageUrl(
    a?.image_url,
    `https://via.placeholder.com/120?text=${encodeURIComponent(
      (a?.artist_name || a?.name || "?")[0]
    )}`
  );

/** "3 yrs" / "7 mo" / "12 days" — tenure has to read at a glance. */
export const tenureLabel = (days) => {
  if (days == null) return null;
  if (days >= 365) {
    const y = Math.floor(days / 365);
    return `${y} yr${y > 1 ? "s" : ""}`;
  }
  if (days >= 30) {
    const m = Math.floor(days / 30);
    return `${m} mo`;
  }
  return `${days} day${days === 1 ? "" : "s"}`;
};

/**
 * The Top 20 as an identity artifact rather than a browse rail.
 *
 * Replaces the horizontal card rail. The #1 slot gets real estate instead
 * of just a colour, and tier and tenure are first-class columns rather
 * than living in a separate card below — which is why this retires the old
 * StanCard rather than sitting next to it.
 *
 * Presentational: ProfilePage owns list state, drag state and the handlers.
 * Everything the rail could do still works here — reorder by drag, remove,
 * open the community modal — because losing those would make a prettier
 * surface a worse one.
 */
const Top20Shrine = ({
  entries = [],
  editable = false,
  editMode = false,
  onSelect,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  emptyMessage,
}) => {
  if (entries.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  const [hero, ...rest] = entries;
  const draggable = editable && editMode;

  const rowProps = (entry, index) => ({
    draggable,
    onDragStart: draggable ? () => onDragStart?.(index) : undefined,
    onDragOver: draggable ? (e) => onDragOver?.(e, index) : undefined,
    onDragEnd: draggable ? onDragEnd : undefined,
    onClick: !editMode ? () => onSelect?.(entry.artist_id) : undefined,
    title: entry.artist_name || entry.name,
  });

  const RemoveBtn = ({ entry }) =>
    editable && editMode ? (
      <button
        type="button"
        className={styles.remove}
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.(entry.artist_id);
        }}
        title="Remove from list"
        aria-label={`Remove ${entry.artist_name || entry.name}`}
      >
        ×
      </button>
    ) : null;

  return (
    <div className={`${styles.shrine} ${editMode ? styles.editing : ""}`}>
      {/* Slot 1 — the whole point of a shrine is that the top of it means
          something. Given room, not just a chartreuse number. */}
      <div className={styles.hero} {...rowProps(hero, 0)}>
        <span className={styles.heroRank}>1</span>
        <img src={artFor(hero)} alt="" className={styles.heroArt} />
        <div className={styles.heroBody}>
          <h3 className={styles.heroName}>
            {hero.artist_name || hero.name}
          </h3>
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
        <RemoveBtn entry={hero} />
      </div>

      {rest.length > 0 && (
        <ul className={styles.list}>
          {rest.map((entry, i) => {
            const position = entry.position ?? i + 2;
            return (
              <li
                key={entry.artist_id}
                className={`${styles.row} ${
                  position <= COMMUNITY_SLOTS ? styles.core : ""
                }`}
                {...rowProps(entry, i + 1)}
              >
                <span className={styles.rank}>{position}</span>
                <img src={artFor(entry)} alt="" className={styles.thumb} />
                <span className={styles.name}>
                  {entry.artist_name || entry.name}
                </span>
                {entry.tier && (
                  <span className={styles.tierSm}>{TIER_LABELS[entry.tier]}</span>
                )}
                <span className={styles.tenure}>
                  {tenureLabel(entry.days_as_member) ?? ""}
                </span>
                <RemoveBtn entry={entry} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Top20Shrine;
