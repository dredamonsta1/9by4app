// src/components/ContentCreatorCard/ContentCreatorCard.tsx
//
// Renamed from StreamerCard as part of the broader "Content Creators"
// positioning. The `Streamer` API type stays as-is since it's the
// backend contract — this component just aliases it as `creator` for
// surface text.
import React from "react";
import styles from "./ContentCreatorCard.module.css";
import { resolveImageUrl } from "../../utils/imageUrl";
import type { Streamer } from "../../types/api";

const PLATFORM_LABELS: Record<string, string> = {
  twitch:  "Twitch",
  youtube: "YouTube",
  kick:    "Kick",
  tiktok:  "TikTok",
  cratesfyi: "stanbox",
};

const PLATFORM_COLORS: Record<string, string> = {
  twitch:  "#9146ff",
  youtube: "#ff0000",
  kick:    "#53fc18",
  tiktok:  "#010101",
  cratesfyi: "var(--color-accent)",
};

interface Props {
  creator: Streamer;
  onVote?: (id: number) => void;
  onAddToList?: (id: number) => void;
  onRemoveFromList?: (id: number) => void;
  inMyList?: boolean;
  hasVoted?: boolean;
  rank?: number;
}

const ContentCreatorCard = ({
  creator,
  onVote,
  onAddToList,
  onRemoveFromList,
  inMyList = false,
  hasVoted = false,
  rank,
}: Props) => {
  const image = resolveImageUrl(
    creator.image_url,
    `https://via.placeholder.com/120?text=${encodeURIComponent(creator.name[0] ?? "?")}`
  );

  const platformColor = PLATFORM_COLORS[creator.platform] ?? "var(--color-accent)";
  const platformLabel = PLATFORM_LABELS[creator.platform] ?? creator.platform;

  return (
    <div className={styles.card}>
      {/* Rank badge */}
      {rank !== undefined && (
        <div className={styles.rankBadge}>#{rank}</div>
      )}

      {/* Live indicator */}
      {creator.is_live && (
        <div className={styles.liveBadge}>
          <span className={styles.liveDot} />
          LIVE
        </div>
      )}

      {/* Avatar */}
      <div className={styles.avatarWrap}>
        <img className={styles.avatar} src={image} alt={creator.name} />
        <span
          className={styles.platformBadge}
          style={{ background: platformColor, color: creator.platform === "kick" ? "#000" : "#fff" }}
        >
          {platformLabel}
        </span>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.name}>{creator.name}</h3>
        {creator.category && (
          <span className={styles.category}>{creator.category}</span>
        )}
        {creator.bio && (
          <p className={styles.bio}>{creator.bio}</p>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.voteCount}>{creator.count} votes</span>

        <div className={styles.actions}>
          <button
            className={`${styles.voteBtn} ${hasVoted ? styles.votedBtn : ""}`}
            onClick={() => onVote?.(creator.streamer_id)}
            disabled={hasVoted}
            title={hasVoted ? "Already voted" : "Vote"}
          >
            {hasVoted ? "Voted" : "Vote"}
          </button>

          <button
            className={`${styles.listBtn} ${inMyList ? styles.inListBtn : ""}`}
            onClick={() =>
              inMyList
                ? onRemoveFromList?.(creator.streamer_id)
                : onAddToList?.(creator.streamer_id)
            }
            title={inMyList ? "Remove from My List" : "Add to My List"}
          >
            {inMyList ? "- My List" : "+ My List"}
          </button>

          <a
            className={styles.watchBtn}
            href={creator.stream_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContentCreatorCard;
