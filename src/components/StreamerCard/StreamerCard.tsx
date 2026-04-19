// src/components/StreamerCard/StreamerCard.tsx
import React from "react";
import styles from "./StreamerCard.module.css";
import { resolveImageUrl } from "../../utils/imageUrl";
import type { Streamer } from "../../types/api";

const PLATFORM_LABELS: Record<string, string> = {
  twitch:  "Twitch",
  youtube: "YouTube",
  kick:    "Kick",
  tiktok:  "TikTok",
  cratesfyi: "crates.fyi",
};

const PLATFORM_COLORS: Record<string, string> = {
  twitch:  "#9146ff",
  youtube: "#ff0000",
  kick:    "#53fc18",
  tiktok:  "#010101",
  cratesfyi: "var(--color-accent)",
};

interface Props {
  streamer: Streamer;
  onVote?: (id: number) => void;
  onAddToList?: (id: number) => void;
  onRemoveFromList?: (id: number) => void;
  inMyList?: boolean;
  hasVoted?: boolean;
  rank?: number;
}

const StreamerCard = ({
  streamer,
  onVote,
  onAddToList,
  onRemoveFromList,
  inMyList = false,
  hasVoted = false,
  rank,
}: Props) => {
  const image = resolveImageUrl(
    streamer.image_url,
    `https://via.placeholder.com/120?text=${encodeURIComponent(streamer.name[0] ?? "?")}`
  );

  const platformColor = PLATFORM_COLORS[streamer.platform] ?? "var(--color-accent)";
  const platformLabel = PLATFORM_LABELS[streamer.platform] ?? streamer.platform;

  return (
    <div className={styles.card}>
      {/* Rank badge */}
      {rank !== undefined && (
        <div className={styles.rankBadge}>#{rank}</div>
      )}

      {/* Live indicator */}
      {streamer.is_live && (
        <div className={styles.liveBadge}>
          <span className={styles.liveDot} />
          LIVE
        </div>
      )}

      {/* Avatar */}
      <div className={styles.avatarWrap}>
        <img className={styles.avatar} src={image} alt={streamer.name} />
        <span
          className={styles.platformBadge}
          style={{ background: platformColor, color: streamer.platform === "kick" ? "#000" : "#fff" }}
        >
          {platformLabel}
        </span>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.name}>{streamer.name}</h3>
        {streamer.category && (
          <span className={styles.category}>{streamer.category}</span>
        )}
        {streamer.bio && (
          <p className={styles.bio}>{streamer.bio}</p>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.voteCount}>{streamer.count} votes</span>

        <div className={styles.actions}>
          <button
            className={`${styles.voteBtn} ${hasVoted ? styles.votedBtn : ""}`}
            onClick={() => onVote?.(streamer.streamer_id)}
            disabled={hasVoted}
            title={hasVoted ? "Already voted" : "Vote"}
          >
            {hasVoted ? "Voted" : "Vote"}
          </button>

          <button
            className={`${styles.listBtn} ${inMyList ? styles.inListBtn : ""}`}
            onClick={() =>
              inMyList
                ? onRemoveFromList?.(streamer.streamer_id)
                : onAddToList?.(streamer.streamer_id)
            }
            title={inMyList ? "Remove from My List" : "Add to My List"}
          >
            {inMyList ? "- My List" : "+ My List"}
          </button>

          <a
            className={styles.watchBtn}
            href={streamer.stream_url}
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

export default StreamerCard;
