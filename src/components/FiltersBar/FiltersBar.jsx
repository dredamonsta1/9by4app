import React from "react";
import styles from "./FiltersBar.module.css";

const GENRES = ["Hip Hop", "R&B", "Pop", "Rock", "Latin", "Drill", "Trap"];
const REGIONS = ["NY", "Georgia", "LA", "Chicago", "Houston", "Detroit", "South", "East", "UK"];

const FiltersBar = ({ activeFilter, onFilterChange, isLoggedIn }) => {
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

        {isLoggedIn ? (
          <>
            <span className={styles.divider} />
            <button
              className={`${styles.pill} ${styles.myListPill} ${isActive("mylist") ? styles.active : ""}`}
              onClick={() => onFilterChange({ type: "mylist", value: "" })}
            >
              My List
            </button>
          </>
        ) : (
          <>
            <span className={styles.divider} />
            <button
              className={`${styles.pill} ${styles.myListPill} ${styles.disabled}`}
              title="Sign up to see your list ranked"
              disabled
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
