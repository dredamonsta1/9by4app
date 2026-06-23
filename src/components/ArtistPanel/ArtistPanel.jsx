import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import { resolveImageUrl } from "../../utils/imageUrl";
import {
  addArtistToProfileList,
  reorderProfileList,
  fetchProfileList,
} from "../../redux/actions/profileListActions";
import { fetchArtists } from "../../redux/actions/artistActions";
import { setQueue } from "../../redux/playerSlice";
import AlbumPreviewButton from "../AlbumPreviewButton/AlbumPreviewButton";
import StanboxPreviewButton from "../StanboxPreviewButton/StanboxPreviewButton";
import AlbumBuyButton from "../AlbumBuyButton/AlbumBuyButton";
import ClaimArtistModal from "../ClaimArtistModal/ClaimArtistModal";
import FiltersBar from "../FiltersBar/FiltersBar";
import RankView from "../RankView/RankView";
import NewMusicSection from "../NewMusicSection/NewMusicSection";
import StickyCtaBar from "../StickyCtaBar/StickyCtaBar";
import TrendingShelf from "../TrendingShelf/TrendingShelf";
import UploadModal from "../UploadModal/UploadModal";
import styles from "./ArtistPanel.module.css";

const formatRelativeTime = (iso) => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.floor((Date.now() - then) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ordinal = (n) => {
  const s = ["TH", "ST", "ND", "RD"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

// A single feed post — handles its own comment expand/collapse state,
// comment list, submit, delete. Also renders Verified / Disputed
// verdict badges from the fact-checker agent and the source link for
// agent posts. Ports the feature set the old standalone Feed.jsx had
// (which got orphaned when the Feed surface moved into ArtistPanel).
const AGENT_BADGE = {
  music: "Music",
  sports: "Sports",
  entertainment: "Entertainment",
  news: "News",
};

const FeedPost = ({ post, currentUserId, onPlayMusic, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const postId = post.id || post.post_id;
  const postType = post.post_type || "text";
  const isAgent = post.is_agent_post;
  const isMusic = postType === "music" && post.audio_url;
  const isImage = postType === "image" && post.image_url;
  const badgeLabel = isAgent && (AGENT_BADGE[post.category] || "News");
  const verifiedCount = post.verified_count || 0;
  const disputedCount = post.disputed_count || 0;
  const isOwner = currentUserId && currentUserId === post.user_id;

  const handleDelete = async () => {
    if (deleting) return;
    if (!window.confirm("Delete this post?")) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/feed/${postType}/${postId}`);
      onDelete?.(post);
    } catch {
      window.alert("Failed to delete post.");
      setDeleting(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await axiosInstance.get(
        `/feed/comments/${postType}/${postId}`,
      );
      const list = Array.isArray(res.data) ? res.data : [];
      setComments(list);
      setCommentCount(list.length);
    } catch {
      // Leave the panel empty on failure.
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) fetchComments();
    setShowComments((prev) => !prev);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      const res = await axiosInstance.post(
        `/feed/comments/${postType}/${postId}`,
        { content: text },
      );
      if (res.data) setComments((prev) => [...prev, res.data]);
      setCommentCount((prev) => prev + 1);
      setCommentText("");
    } catch {
      // Keep the textarea content for retry.
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/feed/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId));
      setCommentCount((prev) => Math.max(0, prev - 1));
    } catch {
      // No-op; comment stays visible on failure.
    }
  };

  return (
    <li className={styles.feedRow}>
      <div className={styles.feedHead}>
        {isAgent ? (
          <span className={styles.feedBadge}>{badgeLabel}</span>
        ) : (
          <span className={styles.feedUser}>@{post.username || "user"}</span>
        )}
        <span className={styles.feedTime}>
          {formatRelativeTime(post.created_at)}
        </span>
        {isOwner && !isAgent && (
          <button
            type="button"
            className={styles.feedDelete}
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete post"
            title="Delete this post"
          >
            {deleting ? "…" : "🗑"}
          </button>
        )}
      </div>

      {isMusic && (
        <div className={styles.feedMusicRow}>
          <button
            type="button"
            className={styles.feedPlayBtn}
            onClick={() => onPlayMusic(post)}
            aria-label={`Play ${post.music_title || "post"}`}
          >
            ▶
          </button>
          <span className={styles.feedMusicTitle}>
            {post.music_title || post.title || "Untitled"}
          </span>
        </div>
      )}

      {isImage && (
        <img
          src={resolveImageUrl(post.image_url)}
          alt=""
          className={styles.feedImage}
        />
      )}

      {(post.content || post.caption) && (
        <p className={styles.feedBody}>{post.content || post.caption}</p>
      )}

      {isAgent && post.source_url && (
        <a
          href={post.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.feedSource}
        >
          Read source ↗
        </a>
      )}

      {/* Verdict badges from the fact-checker agent. */}
      {(verifiedCount > 0 || disputedCount > 0) && (
        <div className={styles.verdictRow}>
          {verifiedCount > 0 && (
            <span className={styles.verifiedBadge}>
              ✓ Verified ({verifiedCount})
            </span>
          )}
          {disputedCount > 0 && (
            <span className={styles.disputedBadge}>
              ⚠ Disputed ({disputedCount})
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        className={styles.commentToggle}
        onClick={handleToggleComments}
      >
        💬 {commentCount > 0 ? commentCount : ""}{" "}
        {commentCount === 1 ? "Comment" : "Comments"}
      </button>

      {showComments && (
        <div className={styles.commentsSection}>
          {commentsLoading ? (
            <p className={styles.commentsHint}>Loading…</p>
          ) : comments.length === 0 ? (
            <p className={styles.commentsHint}>No comments yet.</p>
          ) : (
            <ul className={styles.commentsList}>
              {comments.map((c) => (
                <li key={c.comment_id} className={styles.commentItem}>
                  <div className={styles.commentHead}>
                    <Link
                      to={`/profile/${c.user_id}`}
                      className={styles.commentUser}
                    >
                      @{c.username}
                    </Link>
                    <span className={styles.commentTime}>
                      {formatRelativeTime(c.created_at)}
                    </span>
                    {c.user_id === currentUserId && (
                      <button
                        type="button"
                        className={styles.commentDelete}
                        onClick={() => handleDeleteComment(c.comment_id)}
                        aria-label="Delete comment"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <p className={styles.commentBody}>{c.content}</p>
                </li>
              ))}
            </ul>
          )}

          {currentUserId && (
            <form
              className={styles.commentForm}
              onSubmit={handleSubmitComment}
            >
              <input
                type="text"
                className={styles.commentInput}
                placeholder="Write a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={500}
                disabled={submitting}
              />
              <button
                type="submit"
                className={styles.commentSubmit}
                disabled={!commentText.trim() || submitting}
              >
                {submitting ? "…" : "Post"}
              </button>
            </form>
          )}
        </div>
      )}
    </li>
  );
};

const PositionSelector = ({ profileList, onSelect, onClose }) => {
  const slots = Array.from({ length: 20 }, (_, i) => i + 1);
  const occupiedMap = {};
  profileList.forEach((a) => {
    if (a.position) occupiedMap[a.position] = a.artist_name;
  });

  return (
    <div className={styles.posOverlay} onClick={onClose}>
      <div className={styles.posSelector} onClick={(e) => e.stopPropagation()}>
        <div className={styles.posHeader}>
          <span>Choose a position</span>
          <button className={styles.posClose} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.posGrid}>
          {slots.map((n) => {
            const who = occupiedMap[n];
            return (
              <button
                key={n}
                className={`${styles.posSlot} ${
                  who ? styles.posSlotOccupied : styles.posSlotEmpty
                }`}
                disabled={!!who}
                onClick={() => !who && onSelect(n)}
                title={who || `Add at #${n}`}
              >
                <span className={styles.posSlotNum}>{n}</span>
                {who && <span className={styles.posSlotName}>{who}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ArtistPanel = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const claimRequests = useSelector((state) => state.auth.claimRequests);
  const profileList = useSelector((state) => state.profileList.list);
  const allArtists = useSelector((state) => state.artists.artists);

  const [liveRecordings, setLiveRecordings] = useState([]);
  const [loadingRecording, setLoadingRecording] = useState(null);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalFeed, setGlobalFeed] = useState([]);
  const [artistNews, setArtistNews] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [showPositionSelector, setShowPositionSelector] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState({ type: "all", value: "" });
  const [upcomingReleases, setUpcomingReleases] = useState([]);

  // Upcoming releases for the bottom New Music section. Fetched once
  // per session — doesn't change with the active artist.
  useEffect(() => {
    axiosInstance
      .get("/music/upcoming")
      .then((res) =>
        setUpcomingReleases(Array.isArray(res.data) ? res.data : []),
      )
      .catch(() => setUpcomingReleases([]));
  }, []);

  // Ensure the global artist list is loaded — rank + prev/next depend on it.
  useEffect(() => {
    if (allArtists.length === 0) dispatch(fetchArtists());
  }, [allArtists.length, dispatch]);

  useEffect(() => {
    if (isLoggedIn) dispatch(fetchProfileList());
  }, [isLoggedIn, dispatch]);

  // Global feed is decoupled from the active artist — it's the social /
  // news layer of the platform that stays put as you flip artists. Only
  // refetch on login state change.
  useEffect(() => {
    if (!isLoggedIn) {
      setGlobalFeed([]);
      return;
    }
    axiosInstance
      .get("/feed")
      .then((res) => setGlobalFeed(Array.isArray(res.data) ? res.data : []))
      .catch(() => setGlobalFeed([]));
  }, [isLoggedIn]);

  // When no artistId is in the URL, default to the top-ranked artist.
  const targetId = artistId || allArtists[0]?.artist_id;

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    setArtist(null);
    setArtistNews([]);
    setLiveRecordings([]);

    axiosInstance
      .get(`/artists/${targetId}`)
      .then((res) => setArtist(res.data.artist || res.data))
      .catch(() => {
        if (artistId) navigate("/", { replace: true });
      })
      .finally(() => setLoading(false));

    axiosInstance
      .get(`/communities/artist/${targetId}/feed`)
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setArtistNews(rows.filter((p) => p.username === "9by4News"));
      })
      .catch(() => setArtistNews([]));

    // Internet Archive live-recordings (bootleg concerts). 200+ rows in
    // prod across 118 artists — older acts like Nirvana, Tracy Chapman.
    axiosInstance
      .get(`/live-recordings?artist_id=${targetId}&limit=50`)
      .then((res) => setLiveRecordings(res.data?.recordings || []))
      .catch(() => setLiveRecordings([]));
  }, [targetId, artistId, navigate]);

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <p>Loading artist…</p>
      </div>
    );
  }
  if (!artist) return null;

  const rankIndex = allArtists.findIndex(
    (a) => a.artist_id === artist.artist_id,
  );
  const rank = rankIndex >= 0 ? rankIndex + 1 : null;
  const prevArtist = rankIndex > 0 ? allArtists[rankIndex - 1] : null;
  const nextArtist =
    rankIndex >= 0 && rankIndex < allArtists.length - 1
      ? allArtists[rankIndex + 1]
      : null;

  const inList = profileList.some((a) => a.artist_id === artist.artist_id);
  const myEntry = profileList.find((a) => a.artist_id === artist.artist_id);
  const listFull = profileList.length >= 20;

  const handlePositionSelect = async (pos) => {
    setShowPositionSelector(false);
    await dispatch(addArtistToProfileList(artist));
    const currentIds = profileList
      .map((a) => a.artist_id)
      .filter((id) => id !== artist.artist_id);
    currentIds.splice(pos - 1, 0, artist.artist_id);
    dispatch(reorderProfileList(currentIds));
  };

  const handleChangePosition = (pos) => {
    setShowPositionSelector(false);
    const newOrder = profileList
      .map((a) => a.artist_id)
      .filter((id) => id !== artist.artist_id);
    newOrder.splice(pos - 1, 0, artist.artist_id);
    dispatch(reorderProfileList(newOrder));
  };

  const playableFeed = globalFeed.filter(
    (p) => p.post_type === "music" && p.audio_url,
  );
  const playFeedPost = (post) => {
    const startIndex = playableFeed.findIndex(
      (p) => p.post_id === post.post_id || p.id === post.id,
    );
    if (startIndex < 0) return;
    dispatch(
      setQueue({
        tracks: playableFeed.map((p) => ({
          post_id: p.post_id || p.id,
          title: p.music_title || p.title,
          audio_url: p.audio_url,
          username: p.username,
          artist_name: p.username,
          album_image_url: p.image_url || artist.image_url,
        })),
        startIndex,
      }),
    );
  };

  // After UploadModal posts text/photo/video/music, refresh the global
  // feed so the new post appears at the top.
  const handlePostCreated = async () => {
    setUploadOpen(false);
    try {
      const res = await axiosInstance.get("/feed");
      setGlobalFeed(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Leave the feed as-is on refetch failure.
    }
  };

  // When a FeedPost deletes itself, drop it from the in-memory list
  // immediately (no refetch needed).
  const handlePostDeleted = (post) => {
    const id = post.id || post.post_id;
    setGlobalFeed((prev) =>
      prev.filter((p) => (p.id || p.post_id) !== id),
    );
  };

  // FiltersBar choice → RankView's data (and hero on filter change).
  // "my list" scopes to the user's Top 20; genre / region apply substring
  // filters against the relevant columns; "all" passes through.
  const profileListIds = new Set(profileList.map((a) => a.artist_id));
  const applyFilter = (artists, filter) => {
    if (filter.type === "mylist") {
      return artists.filter((a) => profileListIds.has(a.artist_id));
    }
    if (filter.type === "genre") {
      const v = filter.value.toLowerCase();
      return artists.filter(
        (a) => a.genre && a.genre.toLowerCase().includes(v),
      );
    }
    if (filter.type === "region") {
      const v = filter.value.toLowerCase();
      return artists.filter(
        (a) =>
          (a.region && a.region.toLowerCase() === v) ||
          (a.state && a.state.toLowerCase() === v),
      );
    }
    return artists;
  };
  const filteredArtists = applyFilter(allArtists, activeFilter);

  // Changing a filter pulls the hero card to the top of the filtered list.
  // If the filter empties the list (or "all" snaps back to the full ranking),
  // we still update activeFilter so the Rankings panel reflects the pick.
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    const next = applyFilter(allArtists, filter);
    if (next.length > 0 && next[0].artist_id !== artist.artist_id) {
      navigate(`/artist/${next[0].artist_id}`);
    }
  };

  const albums = artist.albums || [];
  const canClaim =
    isLoggedIn &&
    user &&
    !user.artist_id &&
    !artist.is_verified &&
    !claimRequests?.some(
      (c) => c.status === "pending" && c.artist_id === artist.artist_id,
    );
  const claimPending = claimRequests?.some(
    (c) => c.status === "pending" && c.artist_id === artist.artist_id,
  );
  const isOwner = user?.artist_id === artist.artist_id;

  return (
    <div className={styles.page}>
      {/* Far-left rail: filter pills. Vertical sidebar, sticky on
          desktop so it stays in view as the user scrolls. */}
      <aside className={styles.filterRail}>
        <header className={styles.railHeader}>Filters</header>
        <FiltersBar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          isLoggedIn={isLoggedIn}
          hasListItems={profileList.length > 0}
        />
      </aside>

      <div className={styles.panel}>
        {isOwner && (
          <div className={styles.topBar}>
            <Link to="/artist-settings" className={styles.editWorldLink}>
              Edit your world
            </Link>
          </div>
        )}

        <div className={styles.threeCol}>
          {/* ---- LEFT: Feed only (Trending + Rankings moved to the
                bottom row, to the right of Upcoming Releases) ---- */}
          <aside className={styles.feedCol}>
            <div className={styles.box}>
              <header className={styles.boxHeader}>Feed</header>

            {isLoggedIn && (
              <button
                type="button"
                className={styles.composerTrigger}
                onClick={() => setUploadOpen(true)}
              >
                Post something…
              </button>
            )}

            <div className={styles.boxScroll}>
              {!isLoggedIn ? (
                <div className={styles.emptyState}>
                  <p>Log in to see the feed.</p>
                </div>
              ) : globalFeed.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No posts in the feed yet.</p>
                </div>
              ) : (
                <ul className={styles.feedList}>
                  {globalFeed.map((post, idx) => (
                    <FeedPost
                      key={post.id || post.post_id || idx}
                      post={post}
                      currentUserId={user?.id}
                      onPlayMusic={playFeedPost}
                      onDelete={handlePostDeleted}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>

        {/* ---- CENTER: Card hero ---- */}
        <section className={styles.hero}>
          <div className={styles.deck}>
            <div className={`${styles.deckLayer} ${styles.deckLayer3}`} />
            <div className={`${styles.deckLayer} ${styles.deckLayer2}`} />
            <div className={`${styles.deckLayer} ${styles.deckLayer1}`} />

            <button
              type="button"
              className={`${styles.flipBtn} ${styles.flipLeft}`}
              onClick={() =>
                prevArtist && navigate(`/artist/${prevArtist.artist_id}`)
              }
              disabled={!prevArtist}
              aria-label="Previous ranked artist"
            >
              ⌃
            </button>

            <article className={styles.card}>
              <img
                src={resolveImageUrl(
                  artist.image_url,
                  "https://via.placeholder.com/360?text=?",
                )}
                alt={artist.artist_name || "Artist"}
                className={styles.cardImage}
              />
              <div className={styles.cardOverlay}>
                <h1 className={styles.cardName}>
                  {artist.artist_name || "N/A"}
                </h1>
                {artist.genre && (
                  <p className={styles.cardGenre}>{artist.genre}</p>
                )}
              </div>
            </article>

            <button
              type="button"
              className={`${styles.flipBtn} ${styles.flipRight}`}
              onClick={() =>
                nextArtist && navigate(`/artist/${nextArtist.artist_id}`)
              }
              disabled={!nextArtist}
              aria-label="Next ranked artist"
            >
              ⌄
            </button>
          </div>

          {rank && <div className={styles.rankBig}>{ordinal(rank)}</div>}

          <div className={styles.cardMeta}>
            <span className={styles.cloutLine}>
              {(artist.count || 0).toLocaleString()} fans claim them
            </span>
            <div className={styles.tagRow}>
              {artist.state && (
                <span className={styles.tag}>{artist.state}</span>
              )}
              {artist.region && (
                <span className={styles.tag}>{artist.region}</span>
              )}
              {artist.label && (
                <span className={styles.tag}>{artist.label}</span>
              )}
            </div>
            {artist.spotify_url && (
              <a
                href={artist.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.spotifyBtn}
              >
                Listen on Spotify
              </a>
            )}
          </div>
        </section>

        {/* ---- RIGHT: Music (top, compact 2x2) + News/Events (below) ---- */}
        <aside className={styles.rightCol}>
          <div className={styles.box}>
            <header className={styles.boxHeader}>Music</header>
            <div className={styles.boxScroll}>
              {albums.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No albums yet.</p>
                </div>
              ) : (
                <ul className={styles.musicList}>
                  {albums.map((album) => (
                    <li key={album.album_id} className={styles.musicRow}>
                      <img
                        src={resolveImageUrl(
                          album.album_image_url,
                          "https://via.placeholder.com/80?text=Album",
                        )}
                        alt={album.album_name}
                        className={styles.musicThumb}
                      />
                      <div className={styles.musicInfo}>
                        <span className={styles.musicName}>
                          {album.album_name}
                        </span>
                        {album.year && (
                          <span className={styles.musicYear}>{album.year}</span>
                        )}
                        <div className={styles.musicActions}>
                          {artist.is_verified ? (
                            <StanboxPreviewButton album={album} artist={artist} />
                          ) : (
                            <AlbumPreviewButton
                              artistId={artist.artist_id}
                              albumName={album.album_name}
                            />
                          )}
                          <AlbumBuyButton album={album} artist={artist} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Internet Archive bootleg concerts. Renders only when the
              artist has at least one recording — most catalog artists
              don't (200/96k coverage). Each card plays the full
              concert through PlayerBar via setQueue. */}
          {liveRecordings.length > 0 && (
            <div className={styles.box}>
              <header className={styles.boxHeader}>Live Recordings</header>
              <div className={styles.boxScroll}>
                <ul className={styles.recordingsList}>
                  {liveRecordings.map((rec) => {
                    const date = rec.recorded_date
                      ? new Date(rec.recorded_date).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" },
                        )
                      : "Unknown date";
                    const isLoading = loadingRecording === rec.recording_id;
                    return (
                      <li
                        key={rec.recording_id}
                        className={styles.recordingRow}
                      >
                        <button
                          type="button"
                          className={styles.recordingPlayBtn}
                          disabled={isLoading}
                          onClick={async () => {
                            setLoadingRecording(rec.recording_id);
                            try {
                              const res = await axiosInstance.get(
                                `/live-recordings/${rec.recording_id}/tracks`,
                              );
                              const { tracks, artist_name } = res.data || {};
                              if (!tracks || tracks.length === 0) return;
                              dispatch(
                                setQueue({
                                  tracks: tracks.map((t, i) => ({
                                    post_id: rec.recording_id * 1000 + i,
                                    title: t.title,
                                    audio_url: t.stream_url,
                                    artist_name:
                                      artist_name || artist.artist_name,
                                    album_image_url: artist.image_url,
                                  })),
                                  startIndex: 0,
                                }),
                              );
                            } catch {
                              // No-op; the button just resets.
                            } finally {
                              setLoadingRecording(null);
                            }
                          }}
                          aria-label={`Play ${rec.venue || "live recording"}`}
                        >
                          {isLoading ? "…" : "▶"}
                        </button>
                        <div className={styles.recordingMeta}>
                          <span className={styles.recordingVenue}>
                            🎙 {rec.venue || "Live recording"}
                          </span>
                          <span className={styles.recordingDate}>{date}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          <div className={styles.box}>
            <header className={styles.boxHeader}>News / Events</header>
            <div className={styles.boxScroll}>
              {artistNews.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No news about {artist.artist_name} yet.</p>
                </div>
              ) : (
                <ul className={styles.newsList}>
                  {artistNews.map((post, idx) => (
                    <li key={post.post_id || idx} className={styles.newsRow}>
                      <span className={styles.newsBadge}>News</span>
                      <span className={styles.newsTitle}>
                        {post.preview || "—"}
                      </span>
                      <span className={styles.newsTime}>
                        {formatRelativeTime(post.tagged_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className={styles.eventsBlock}>
                <span className={styles.eventsSubHead}>Upcoming events</span>
                <p className={styles.emptyStateInline}>
                  No upcoming tour dates yet.
                </p>
                {isOwner && (
                  <Link to="/events" className={styles.eventsCreateLink}>
                    Add a tour date →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom row: Upcoming Releases on the left, with Rankings
          stacked above Trending on the right. From-the-Community
          lane retired — feed already covers that surface. */}
      <div className={styles.bottomRow}>
        <NewMusicSection
          isLoggedIn={isLoggedIn}
          upcomingReleases={upcomingReleases}
        />

        <aside className={styles.bottomRight}>
          <div className={styles.box}>
            <header className={styles.boxHeader}>Rankings</header>
            <div className={styles.boxScroll}>
              <RankView
                artists={filteredArtists}
                isLoggedIn={isLoggedIn}
              />
            </div>
          </div>

          <div className={styles.box}>
            <header className={styles.boxHeader}>Trending</header>
            <div className={styles.boxScroll}>
              <TrendingShelf
                onArtistClick={(a) => navigate(`/artist/${a.artist_id}`)}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Persistent CTA — Top 20 + claim */}
      <div className={styles.ctaBar}>
        {!isLoggedIn ? (
          <Link to="/signup" className={styles.ctaPrimary}>
            Sign up to build your Top 20
          </Link>
        ) : inList ? (
          <div className={styles.ctaInList}>
            <span className={styles.ctaInListLabel}>
              In your Top 20
              {myEntry?.position ? ` — Your #${myEntry.position}` : ""}
            </span>
            <button
              type="button"
              className={styles.ctaSecondary}
              onClick={() => setShowPositionSelector(true)}
            >
              Change position
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.ctaPrimary}
            disabled={listFull}
            onClick={() => !listFull && setShowPositionSelector(true)}
          >
            {listFull ? "Your list is full" : "Add to your Top 20"}
          </button>
        )}

        {canClaim && (
          <button
            type="button"
            className={styles.claimBtn}
            onClick={() => setShowClaimModal(true)}
          >
            Is this you? Claim this profile
          </button>
        )}
        {claimPending && (
          <span className={styles.claimPending}>Claim pending review</span>
        )}
      </div>

        {showPositionSelector && (
          <PositionSelector
            profileList={profileList}
            onSelect={inList ? handleChangePosition : handlePositionSelect}
            onClose={() => setShowPositionSelector(false)}
          />
        )}

        {showClaimModal && (
          <ClaimArtistModal
            artist={artist}
            onClose={() => setShowClaimModal(false)}
          />
        )}

        {/* Multi-type post composer — text/photo/video/music in one
            modal. Reuses the existing UploadModal that the legacy
            /feed page wired up; orphaned when Feed moved into
            ArtistPanel. */}
        <UploadModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onPostCreated={handlePostCreated}
        />
      </div>

      {/* Above the Footer (the Footer itself is rendered by App.jsx
          after each page). Logged-out users see the upsell. */}
      {!isLoggedIn && <StickyCtaBar />}
    </div>
  );
};

export default ArtistPanel;
