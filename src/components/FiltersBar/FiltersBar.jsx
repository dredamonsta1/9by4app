import React from "react";
import styles from "./FiltersBar.module.css";

const GENRES = [
  "Hip Hop",
  "R&B",
  "Pop",
  "Rock",
  "Country",
  "Latin",
  "Drill",
  "Trap",
  "Reggae",
  "Dancehall",
];
// Every value here returns results. The API matches `region OR state`
// EXACTLY, with no wildcards — deliberately, so "%South%" cannot also catch
// "South Carolina" (see routes/artists.js). That makes the vocabulary
// load-bearing in a way a pill list does not look.
//
// Removed 2026-09-28 because they returned an empty list on tap:
//   "Chicago", "Houston", "Detroit" — cities, and there is no city column.
//     Only one artist in 112k has "Chicago" anywhere, as a substring.
//   "East" — the stored value is "East Coast", and the match is exact.
//
// Counted against production the same day:
//   East Coast 1783 · NY 1231 · South 553 · West Coast 543
//   Midwest 459 · Georgia 115 · UK 80 · LA 12
const REGIONS = [
  "East Coast",
  "West Coast",
  "South",
  "Midwest",
  "NY",
  "Georgia",
  "LA",
  "UK",
];

const FiltersBar = ({ activeFilter, onFilterChange, isLoggedIn, hasListItems }) => {
  const isActive = (type, value = "") =>
    activeFilter.type === type && activeFilter.value === value;

  return (
    <div className={styles.filtersBar}>
      <div className={styles.filterScroll}>
        <button
          className={`${styles.pill} ${isActive("all") ? styles.active : ""}`}
          onClick={() => onFilterChange({ type: "all", value: "" })}
        >
          All
        </button>

        <span className={styles.divider} />

        {GENRES.map((g) => (
          <button
            key={g}
            className={`${styles.pill} ${isActive("genre", g) ? styles.active : ""}`}
            onClick={() => onFilterChange({ type: "genre", value: g })}
          >
            {g}
          </button>
        ))}

        <span className={styles.divider} />

        {REGIONS.map((r) => (
          <button
            key={r}
            className={`${styles.pill} ${isActive("region", r) ? styles.active : ""}`}
            onClick={() => onFilterChange({ type: "region", value: r })}
          >
            {r}
          </button>
        ))}

        {isLoggedIn && hasListItems && (
          <>
            <span className={styles.divider} />
            <button
              className={`${styles.pill} ${styles.myListPill} ${isActive("mylist") ? styles.active : ""}`}
              onClick={() => onFilterChange({ type: "mylist", value: "" })}
            >
              My List
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FiltersBar;
