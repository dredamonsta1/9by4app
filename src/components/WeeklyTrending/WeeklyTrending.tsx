import React, { useState } from "react";
import { useWeeklyTrending } from "../../hooks/useWeeklyTrending";
import type { TrendingArtist, TrendingCreator } from "../../types/api";
import styles from "./WeeklyTrending.module.css";

const PLATFORM_ICONS: Record<string, string> = {
  tiktok: "TK",
  instagram: "IG",
  youtube: "YT",
  twitter: "X",
};

function formatCount(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function RankDelta({ delta }: { delta: number }) {
  if (delta === 0) return <span className={styles.rankSame}>—</span>;
  if (delta > 0)
    return (
      <span className={styles.rankUp}>
        ↑{delta}
      </span>
    );
  return (
    <span className={styles.rankDown}>
      ↓{Math.abs(delta)}
    </span>
  );
}

function MomentumBar({ score }: { score: number }) {
  return (
    <div className={styles.momentumBar} title={`Momentum: ${Math.round(score * 100)}%`}>
      <div className={styles.momentumFill} style={{ width: `${score * 100}%` }} />
    </div>
  );
}

function ArtistCard({ artist }: { artist: TrendingArtist }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardRank}>
        <span className={styles.rankNumber}>#{artist.rank}</span>
        <RankDelta delta={artist.rank_delta} />
      </div>
      <div className={styles.cardAvatar}>
        {artist.image_url ? (
          <img src={artist.image_url} alt={artist.artist_name} />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {artist.artist_name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className={styles.cardInfo}>
        <p className={styles.cardName}>{artist.artist_name}</p>
        {artist.genre && <p className={styles.cardMeta}>{artist.genre}</p>}
        <p className={styles.cardStat}>
          {formatCount(artist.play_count)} plays
          <span className={artist.play_delta >= 0 ? styles.statUp : styles.statDown}>
            {" "}
            {artist.play_delta >= 0 ? "+" : ""}
            {formatCount(artist.play_delta)}
          </span>
        </p>
        <MomentumBar score={artist.momentum_score} />
      </div>
    </div>
  );
}

function CreatorCard({ creator }: { creator: TrendingCreator }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardRank}>
        <span className={styles.rankNumber}>#{creator.rank}</span>
        <RankDelta delta={creator.rank_delta} />
      </div>
      <div className={styles.cardAvatar}>
        {creator.profile_image ? (
          <img src={creator.profile_image} alt={creator.username} />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {creator.username.charAt(0).toUpperCase()}
          </div>
        )}
        <span className={styles.platformBadge}>
          {PLATFORM_ICONS[creator.platform] ?? creator.platform.toUpperCase()}
        </span>
      </div>
      <div className={styles.cardInfo}>
        <p className={styles.cardName}>@{creator.username}</p>
        <p className={styles.cardStat}>
          {formatCount(creator.social_followers)} followers
          <span className={creator.social_delta >= 0 ? styles.statUp : styles.statDown}>
            {" "}
            {creator.social_delta >= 0 ? "+" : ""}
            {formatCount(creator.social_delta)}
          </span>
        </p>
        <MomentumBar score={creator.momentum_score} />
      </div>
    </div>
  );
}

export default function WeeklyTrending() {
  const { data, loading } = useWeeklyTrending();
  const [activeTab, setActiveTab] = useState<"artists" | "creators">("artists");

  if (loading) return <div className={styles.loading}>Loading trending...</div>;
  if (!data) return null;

  const weekLabel = new Date(data.week_of).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Trending This Week</h2>
          <span className={styles.weekBadge}>Week of {weekLabel}</span>
        </div>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "artists" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("artists")}
          >
            Artists
          </button>
          <button
            className={`${styles.tab} ${activeTab === "creators" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("creators")}
          >
            Creators
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {activeTab === "artists"
          ? data.artists.map((a) => <ArtistCard key={a.artist_id} artist={a} />)
          : data.creators.map((c) => <CreatorCard key={c.user_id} creator={c} />)}
      </div>
    </section>
  );
}
