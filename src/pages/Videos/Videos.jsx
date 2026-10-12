import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useVideos } from "../../hooks/useVideos";
import UploadModal from "../../components/UploadModal/UploadModal";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./Videos.module.css";

// The video section (Story 31). Videos posted to the feed also live here.
// All / Following tabs, an All / Music videos filter. Never autoplays — the
// audio player owns the bottom bar (decided 2026-09-13).

const formatDate = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const VideoCard = ({ video }) => (
  <li className={styles.card}>
    <video
      className={styles.player}
      src={video.playback_url || video.video_url}
      poster={video.thumbnail_url || undefined}
      controls
      preload="metadata"
      playsInline
    />
    <div className={styles.meta}>
      <div className={styles.titleRow}>
        <h3 className={styles.title}>{video.title || video.caption || "Untitled video"}</h3>
        {video.is_music_video && <span className={styles.chip}>Music video</span>}
      </div>
      <p className={styles.byline}>
        <Link to={`/profile/${video.user_id}`} className={styles.user}>
          {video.profile_image && <img src={resolveImageUrl(video.profile_image)} alt="" className={styles.avatar} />}@
          {video.username || "user"}
        </Link>
        <span aria-hidden="true"> · </span>
        <time dateTime={video.created_at}>{formatDate(video.created_at)}</time>
      </p>
      {video.title && video.caption && <p className={styles.caption}>{video.caption}</p>}
    </div>
  </li>
);

export default function Videos() {
  const isLoggedIn = useSelector((s) => s.auth.isLoggedIn);
  const [tab, setTab] = useState("all");
  const [type, setType] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const showFollowingSignIn = tab === "following" && !isLoggedIn;
  const { videos, status, hasMore, loadMore, loadingMore } = useVideos({
    tab,
    type,
    enabled: !showFollowingSignIn,
    refreshKey,
  });

  const emptyText =
    tab === "following"
      ? "No videos from people you follow yet."
      : type === "music"
        ? "No music videos yet."
        : "No videos yet.";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.heading}>Videos</h1>
          <p className={styles.sub}>Everything posted to the feed, in one place.</p>
        </div>
        {isLoggedIn && (
          <button type="button" className={styles.uploadBtn} onClick={() => setUploadOpen(true)}>
            + Post a video
          </button>
        )}
      </header>

      <div className={styles.controls}>
        <div className={styles.tabs} role="tablist" aria-label="Whose videos">
          {[
            ["all", "All"],
            ["following", "Following"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              className={tab === value ? styles.tabActive : styles.tab}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.pills} role="group" aria-label="Filter videos">
          {[
            ["all", "All videos"],
            ["music", "Music videos"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={type === value}
              className={type === value ? styles.pillActive : styles.pill}
              onClick={() => setType(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {showFollowingSignIn || status === "signin" ? (
        <p className={styles.note}>
          <Link to="/login">Log in</Link> to see videos from people you follow.
        </p>
      ) : status === "loading" ? (
        <p className={styles.note}>Loading videos…</p>
      ) : status === "error" ? (
        <p className={styles.note}>Couldn't load videos right now.</p>
      ) : videos.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.note}>{emptyText}</p>
          {isLoggedIn ? (
            <button type="button" className={styles.uploadBtn} onClick={() => setUploadOpen(true)}>
              Post the first one
            </button>
          ) : (
            <p className={styles.note}>
              <Link to="/signup">Join StanBox</Link> to post one.
            </p>
          )}
        </div>
      ) : (
        <>
          <ul className={styles.grid}>
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </ul>
          {hasMore && (
            <button type="button" className={styles.more} onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </>
      )}

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onPostCreated={() => setRefreshKey((k) => k + 1)}
      />
    </main>
  );
}
