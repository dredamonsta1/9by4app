import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import type { ArtistCommunityInfo, CommunityMember, CommunityPost, StanTier } from "../../types/api";
import styles from "./ArtistCommunity.module.css";

const TIER_LABELS: Record<StanTier, string> = {
  "casual":  "Casual",
  "fan":     "Fan",
  "stan":    "Stan",
  "day-one": "Day One",
};

function TierBadge({ tier }: { tier: StanTier }) {
  return (
    <span className={`${styles.tierBadge} ${styles[`tier_${tier.replace("-", "_")}`]}`}>
      {TIER_LABELS[tier]}
    </span>
  );
}

interface ArtistCommunityProps {
  artistId: number;
  onClose: () => void;
}

type Tab = "top-stans" | "feed";

export default function ArtistCommunity({ artistId, onClose }: ArtistCommunityProps) {
  const [info, setInfo] = useState<ArtistCommunityInfo | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [feed, setFeed] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("top-stans");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosInstance.get<ArtistCommunityInfo>(`/communities/artist/${artistId}`),
      axiosInstance.get<CommunityMember[]>(`/communities/artist/${artistId}/members`),
    ])
      .then(([infoRes, membersRes]) => {
        setInfo(infoRes.data);
        setMembers(membersRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [artistId]);

  useEffect(() => {
    if (tab === "feed" && feed.length === 0) {
      axiosInstance
        .get<CommunityPost[]>(`/communities/artist/${artistId}/feed`)
        .then((res) => setFeed(res.data))
        .catch(() => {});
    }
  }, [tab, artistId, feed.length]);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        {loading || !info ? (
          <div className={styles.loading}>Loading community...</div>
        ) : (
          <>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerAvatar}>
                {info.artist.image_url ? (
                  <img src={info.artist.image_url} alt={info.artist.artist_name} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {info.artist.artist_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.headerInfo}>
                <h2 className={styles.artistName}>{info.artist.artist_name}</h2>
                {info.artist.genre && (
                  <p className={styles.artistMeta}>{info.artist.genre}</p>
                )}
                <p className={styles.memberCount}>
                  <span className={styles.memberNum}>{info.member_count}</span>
                  {" "}
                  {info.member_count === 1 ? "member" : "members"}
                </p>
              </div>
            </div>

            {/* Top Stans preview strip */}
            {info.top_stans.length > 0 && (
              <div className={styles.topStansStrip}>
                {info.top_stans.map((s) => (
                  <Link
                    key={s.user_id}
                    to={`/profile/${s.user_id}`}
                    className={styles.topStanChip}
                    onClick={onClose}
                  >
                    <span className={styles.topStanName}>{s.username}</span>
                    <TierBadge tier={s.tier} />
                  </Link>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${tab === "top-stans" ? styles.tabActive : ""}`}
                onClick={() => setTab("top-stans")}
              >
                Leaderboard
              </button>
              <button
                className={`${styles.tab} ${tab === "feed" ? styles.tabActive : ""}`}
                onClick={() => setTab("feed")}
              >
                Community Feed
              </button>
            </div>

            {/* Tab content */}
            <div className={styles.tabContent}>
              {tab === "top-stans" ? (
                <ul className={styles.memberList}>
                  {members.length === 0 ? (
                    <p className={styles.empty}>No stans ranked yet — post in the community to earn points.</p>
                  ) : (
                    members.map((m, i) => (
                      <li key={m.user_id} className={styles.memberItem}>
                        <span className={styles.memberRank}>#{i + 1}</span>
                        <Link to={`/profile/${m.user_id}`} className={styles.memberName} onClick={onClose}>
                          {m.username}
                        </Link>
                        <TierBadge tier={m.tier} />
                        <span className={styles.memberScore}>{m.score} pts</span>
                      </li>
                    ))
                  )}
                </ul>
              ) : (
                <ul className={styles.feedList}>
                  {feed.length === 0 ? (
                    <p className={styles.empty}>No posts tagged to this community yet.</p>
                  ) : (
                    feed.map((p) => (
                      <li key={`${p.post_type}-${p.post_id}`} className={styles.feedItem}>
                        <Link to={`/profile/${p.username}`} className={styles.feedUser} onClick={onClose}>
                          {p.username}
                        </Link>
                        {p.preview && (
                          <p className={styles.feedPreview}>{p.preview}</p>
                        )}
                        <span className={styles.feedType}>{p.post_type}</span>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
