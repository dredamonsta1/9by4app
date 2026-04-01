import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import type { StanRank, StanTier } from "../../types/api";
import styles from "./StanCard.module.css";

const TIER_LABELS: Record<StanTier, string> = {
  "casual":   "Casual",
  "fan":      "Fan",
  "stan":     "Stan",
  "day-one":  "Day One",
};

const TIER_ORDER: StanTier[] = ["casual", "fan", "stan", "day-one"];

function TierBadge({ tier }: { tier: StanTier }) {
  return (
    <span className={`${styles.tierBadge} ${styles[`tier_${tier.replace("-", "_")}`]}`}>
      {TIER_LABELS[tier]}
    </span>
  );
}

interface StanCardProps {
  userId: number;
  /** If true renders a compact inline strip; default is full card */
  compact?: boolean;
}

export default function StanCard({ userId, compact = false }: StanCardProps) {
  const [ranks, setRanks] = useState<StanRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get<StanRank[]>(`/communities/user/${userId}/stan-card`)
      .then((res) => setRanks(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className={styles.loading}>Loading stan card...</div>;
  if (ranks.length === 0) return null;

  if (compact) {
    return (
      <div className={styles.compactStrip}>
        {ranks.map((r) => (
          <span key={r.artist_id} className={styles.compactChip}>
            {r.artist_name}
            <TierBadge tier={r.tier} />
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h4 className={styles.cardTitle}>Stan Card</h4>
      <div className={styles.slots}>
        {ranks.map((r, i) => (
          <div key={r.artist_id} className={styles.slot}>
            <div className={styles.slotRank}>#{i + 1}</div>
            <div className={styles.slotAvatar}>
              {r.image_url ? (
                <img src={r.image_url} alt={r.artist_name} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {r.artist_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className={styles.slotInfo}>
              <p className={styles.artistName}>{r.artist_name}</p>
              {r.genre && <p className={styles.genre}>{r.genre}</p>}
              <TierBadge tier={r.tier} />
              <p className={styles.tenure}>
                {r.days_as_member === 0
                  ? "Joined today"
                  : `${r.days_as_member}d member`}
              </p>
            </div>
            <div className={styles.scoreBar}>
              <div
                className={styles.scoreFill}
                style={{
                  height: `${Math.min(100, (TIER_ORDER.indexOf(r.tier) + 1) * 25)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
