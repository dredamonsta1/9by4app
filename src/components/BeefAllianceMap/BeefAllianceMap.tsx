import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import type { ArtistRelationship, RelationshipType } from "../../types/api";
import styles from "./BeefAllianceMap.module.css";

const TYPE_CONFIG: Record<RelationshipType, { label: string; emoji: string }> = {
  alliance: { label: "Alliance",  emoji: "🤝" },
  rival:    { label: "Rival",     emoji: "🔥" },
  neutral:  { label: "Connected", emoji: "↔" },
};

type Filter = "all" | RelationshipType;

interface BeefAllianceMapProps {
  /** If set, only show relationships involving this artist */
  focusArtistId?: number;
}

export default function BeefAllianceMap({ focusArtistId }: BeefAllianceMapProps) {
  const [relationships, setRelationships] = useState<ArtistRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    axiosInstance
      .get<ArtistRelationship[]>("/communities/relationships")
      .then((res) => setRelationships(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = relationships.filter((r) => {
    const matchesFocus = focusArtistId
      ? r.artist_id_a === focusArtistId || r.artist_id_b === focusArtistId
      : true;
    const matchesFilter = filter === "all" || r.relationship_type === filter;
    return matchesFocus && matchesFilter;
  });

  const alliances = visible.filter((r) => r.relationship_type === "alliance").length;
  const rivals    = visible.filter((r) => r.relationship_type === "rival").length;

  if (loading) return <div className={styles.loading}>Building alliance map...</div>;
  if (relationships.length === 0) return null;

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h4 className={styles.title}>Beef &amp; Alliance Map</h4>
        <div className={styles.stats}>
          <span className={styles.statAlliance}>{alliances} alliance{alliances !== 1 ? "s" : ""}</span>
          <span className={styles.statRival}>{rivals} rival{rivals !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className={styles.filters}>
        {(["all", "alliance", "rival", "neutral"] as Filter[]).map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : TYPE_CONFIG[f as RelationshipType].label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty}>No relationships in this filter.</p>
      ) : (
        <ul className={styles.list}>
          {visible.map((r) => {
            const cfg = TYPE_CONFIG[r.relationship_type];
            return (
              <li
                key={`${r.artist_id_a}-${r.artist_id_b}`}
                className={`${styles.item} ${styles[`item_${r.relationship_type}`]}`}
              >
                <span className={styles.emoji}>{cfg.emoji}</span>
                <span className={styles.artistA}>{r.artist_name_a}</span>
                <span className={styles.connector}>
                  <span className={styles.connectorLine} />
                  <span className={styles.overlapCount}>{r.overlap_count}</span>
                  <span className={styles.connectorLine} />
                </span>
                <span className={styles.artistB}>{r.artist_name_b}</span>
                <span className={`${styles.typePill} ${styles[`pill_${r.relationship_type}`]}`}>
                  {cfg.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
