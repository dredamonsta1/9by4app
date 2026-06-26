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
import EventCreator from "../EventCreator/EventCreator";
import {
  FavoriteAlbumStar,
  AlbumSongPicker,
} from "../FavoritesPicker/FavoritesPicker";
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

const formatMSS = (sec) => {
  if (typeof sec !== "number" || !isFinite(sec) || sec < 0) return "0:00";
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
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

      {/* Favorite-album embed: rendered when the auto-poster
          attached an album to this post. Clickable card opens the
          artist panel — the conversation lives in the comments. */}
      {post.favorite_album_id && (
        <Link
          to={
            post.favorite_album_artist_id
              ? `/artist/${post.favorite_album_artist_id}`
              : "#"
          }
          className={styles.favoriteEmbed}
        >
          <img
            src={resolveImageUrl(
              post.favorite_album_image_url,
              "https://via.placeholder.com/96?text=Album",
            )}
            alt={post.favorite_album_name || "Album"}
            className={styles.favoriteEmbedThumb}
          />
          <div className={styles.favoriteEmbedMeta}>
            {post.favorite_song_title && (
              <span className={styles.favoriteEmbedSong}>
                ♪ {post.favorite_song_title}
              </span>
            )}
            <span className={styles.favoriteEmbedAlbum}>
              {post.favorite_album_name || "Album"}
            </span>
            {post.favorite_album_year && (
              <span className={styles.favoriteEmbedYear}>
                {post.favorite_album_year}
              </span>
            )}
          </div>
        </Link>
      )}

      {/* Timestamped song-comment embed: rendered when the
          PlayerBar auto-poster attached one. Card shows the album
          cover + a timestamp pill + the comment content. Clickable
          back to the artist panel; replies use the post's own
          comments thread (toggle below). */}
      {post.song_comment_id && (
        <Link
          to={
            post.song_comment_artist_id
              ? `/artist/${post.song_comment_artist_id}`
              : "#"
          }
          className={styles.songCommentEmbed}
        >
          <img
            src={resolveImageUrl(
              post.song_comment_album_image_url,
              "https://via.placeholder.com/96?text=Album",
            )}
            alt={post.song_comment_album_name || "Album"}
            className={styles.songCommentThumb}
          />
          <div className={styles.songCommentMeta}>
            <div className={styles.songCommentHeader}>
              <span className={styles.songCommentStamp}>
                ♪ {formatMSS(post.song_comment_timestamp)}
              </span>
              {post.song_comment_track_title && (
                <span className={styles.songCommentTrack}>
                  {post.song_comment_track_title}
                </span>
              )}
            </div>
            <p className={styles.songCommentContent}>
              {post.song_comment_content}
            </p>
            <span className={styles.songCommentAlbumLine}>
              {post.song_comment_album_name}
              {post.song_comment_artist_name
                ? ` · ${post.song_comment_artist_name}`
                : ""}
            </span>
          </div>
        </Link>
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
  const [featuredVideoId, setFeaturedVideoId] = useState(null);
  const [loadingRecording, setLoadingRecording] = useState(null);
  const [awards, setAwards] = useState([]);
  const [stanRank, setStanRank] = useState(null);
  const [artistMusicPosts, setArtistMusicPosts] = useState([]);
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [artistEvents, setArtistEvents] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalFeed, setGlobalFeed] = useState([]);
  const [artistNews, setArtistNews] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [showPositionSelector, setShowPositionSelector] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState({ type: "all", value: "" });
  const [upcomingReleases, setUpcomingReleases] = useState([]);
  // Per-artist favorites — current user's picks (max 5 albums / 3 songs
  // per album). Reset on artist switch + refetched in the same effect
  // that loads the rest of the panel data.
  const [myFavorites, setMyFavorites] = useState({ albums: [], songs: [] });
  // Community aggregate — "Top albums on stanbox" for the active
  // artist. Rendered below the Feed box. Backend returns rows with
  // pick_count + picker_user_ids[]. Anonymous-readable.
  const [topAlbums, setTopAlbums] = useState([]);

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
    setAwards([]);
    setStanRank(null);
    setArtistMusicPosts([]);
    setRelatedArtists([]);
    setFeaturedVideoId(null);
    setArtistEvents([]);
    setVerifications([]);
    setMyFavorites({ albums: [], songs: [] });
    setTopAlbums([]);

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

    // Tour dates / events posted by the verified-artist owner. Backend
    // filters via users.artist_id join (events table has no direct
    // artist_id column).
    axiosInstance
      .get(`/events?artist_id=${targetId}`)
      .then((res) => setArtistEvents(Array.isArray(res.data) ? res.data : []))
      .catch(() => setArtistEvents([]));

    // Awards (Grammys, BETs, etc.) — credibility signal in the hero meta.
    axiosInstance
      .get(`/awards/${targetId}`)
      .then((res) => setAwards(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAwards([]));

    // User-uploaded music posts ABOUT or BY this specific artist.
    // Distinct from the global Feed; surfaces fan/artist tracks tied
    // to the active panel.
    axiosInstance
      .get(`/music/posts/artist/${targetId}`)
      .then((res) =>
        setArtistMusicPosts(Array.isArray(res.data) ? res.data : []),
      )
      .catch(() => setArtistMusicPosts([]));

    // My Stan Rank — only meaningful when logged in. Returns null if
    // the user has no rank yet for this artist (effect handles that).
    if (isLoggedIn) {
      axiosInstance
        .get(`/communities/artist/${targetId}/my-rank`)
        .then((res) => setStanRank(res.data || null))
        .catch(() => setStanRank(null));
    }

    // "Fans of X also love Y" — co-list overlap from user_profile_artists.
    // Sparse at low scale; the empty-state guard in the render hides
    // the section entirely when there's nothing to show.
    axiosInstance
      .get(`/artists/${targetId}/related?limit=8`)
      .then((res) => setRelatedArtists(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRelatedArtists([]));

    // Fact-checker verdict counts rolled up at the artist level.
    // Returns [{ verdict, count }] — dormant for most artists right
    // now (factchecker has 7 verdicts total in prod, none tagged to
    // artist communities yet).
    axiosInstance
      .get(`/artists/${targetId}/verifications`)
      .then((res) => setVerifications(Array.isArray(res.data) ? res.data : []))
      .catch(() => setVerifications([]));

    // My favorites for this artist (5 albums × 3 songs cap). Anonymous
    // users get an empty object; the endpoint is auth-gated.
    if (isLoggedIn) {
      axiosInstance
        .get(`/favorites/artist/${targetId}/me`)
        .then((res) =>
          setMyFavorites({
            albums: Array.isArray(res.data?.albums) ? res.data.albums : [],
            songs: Array.isArray(res.data?.songs) ? res.data.songs : [],
          }),
        )
        .catch(() => setMyFavorites({ albums: [], songs: [] }));
    }

    // Community aggregate of favorite picks across all stans. Public
    // endpoint — no auth gate. Updates as users add/remove picks.
    axiosInstance
      .get(`/favorites/artist/${targetId}/top-albums?limit=10`)
      .then((res) => setTopAlbums(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTopAlbums([]));

    // Featured YouTube video for the blurred/muted hero background.
    // Backend lazy-fetches from YouTube search on cache miss; a 204
    // response means "no usable video for this artist," handled by
    // the empty-string guard in the render.
    axiosInstance
      .get(`/artists/${targetId}/featured-video`)
      .then((res) => setFeaturedVideoId(res.data?.video_id || null))
      .catch(() => setFeaturedVideoId(null));
  }, [targetId, artistId, navigate, isLoggedIn]);

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

  // Re-pull favorites after add/remove. Cheap (rows are small) and
  // avoids needing optimistic state in two places. Also refreshes the
  // community aggregate since the user's pick changes the totals.
  const refreshFavorites = () => {
    if (!isLoggedIn) return;
    axiosInstance
      .get(`/favorites/artist/${artist.artist_id}/me`)
      .then((res) =>
        setMyFavorites({
          albums: Array.isArray(res.data?.albums) ? res.data.albums : [],
          songs: Array.isArray(res.data?.songs) ? res.data.songs : [],
        }),
      )
      .catch(() => {});
    axiosInstance
      .get(`/favorites/artist/${artist.artist_id}/top-albums?limit=10`)
      .then((res) => setTopAlbums(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  };

  const favoritedAlbumIds = new Set(
    myFavorites.albums.map((a) => a.album_id),
  );
  const songsByAlbum = myFavorites.songs.reduce((acc, s) => {
    (acc[s.album_id] ||= []).push(s);
    return acc;
  }, {});

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
      {/* Muted blurred YouTube background, fixed to the viewport so it
          covers the entire ArtistPanel layout (not just the hero).
          Boxes + filter rail have solid backgrounds so the video shows
          through the negative space between them. key={featuredVideoId}
          forces a clean tear-down + re-mount when the artist switches.
          pointer-events:none + z-index:-1 so it never steals clicks
          or focus. */}
      {featuredVideoId && (
        <div className={styles.bgVideoLayer} aria-hidden="true">
          <iframe
            key={featuredVideoId}
            className={styles.bgVideoFrame}
            src={
              `https://www.youtube.com/embed/${featuredVideoId}` +
              `?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1` +
              `&playsinline=1&disablekb=1&iv_load_policy=3` +
              `&playlist=${featuredVideoId}`
            }
            title="Artist background video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            tabIndex={-1}
          />
        </div>
      )}

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

        {/* Owner-only artist tools — sits below the filters. New event
            forms post via the EventCreator's own /events submit; the
            onEventCreated callback refetches per-artist events so the
            new tour date pops into the News & Events box. */}
        {isOwner && (
          <>
            <header className={styles.railHeader}>Artist Tools</header>
            <EventCreator
              compact
              onEventCreated={() => {
                axiosInstance
                  .get(`/events?artist_id=${targetId}`)
                  .then((res) =>
                    setArtistEvents(Array.isArray(res.data) ? res.data : []),
                  )
                  .catch(() => {});
              }}
            />
          </>
        )}
      </aside>

      <div className={styles.panel}>
        {isOwner && (
          <div className={styles.topBar}>
            <Link to="/artist-settings" className={styles.editWorldLink}>
              Edit your world
            </Link>
          </div>
        )}

        {/* TrendingShelf hoisted from the bottom row so the FOMO
            signal (who's getting added) sits in the user's eye-line
            from the moment they land. Self-renders nothing when
            there's no trending data. */}
        <div className={styles.trendingTop}>
          <TrendingShelf
            onArtistClick={(a) => navigate(`/artist/${a.artist_id}`)}
          />
        </div>

        <div className={styles.threeCol}>
          {/* ---- LEFT: Feed (Rankings stays in bottom row;
                Trending hoisted to top strip) ---- */}
          <aside className={styles.feedCol}>
            <div className={styles.box}>
              <header className={styles.boxHeader}>
                <span>Feed</span>
                <Link
                  to="/rooms"
                  className={styles.feedHeaderIcon}
                  title="Live rooms"
                  aria-label="Live rooms"
                >
                  🎙
                </Link>
              </header>

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
                      currentUserId={user?.id ?? user?.user_id}
                      onPlayMusic={playFeedPost}
                      onDelete={handlePostDeleted}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Community aggregate of favorite picks for this artist.
              Hidden until at least one stan has picked something. */}
          {topAlbums.length > 0 && (
            <div className={styles.box}>
              <header className={styles.boxHeader}>
                <span>Top Albums on stanbox</span>
              </header>
              <div className={styles.boxScroll}>
                <ol className={styles.topAlbumsList}>
                  {topAlbums.map((album, idx) => (
                    <li key={album.album_id} className={styles.topAlbumRow}>
                      <span className={styles.topAlbumRank}>#{idx + 1}</span>
                      <img
                        src={resolveImageUrl(
                          album.album_image_url,
                          "https://via.placeholder.com/80?text=Album",
                        )}
                        alt={album.album_name}
                        className={styles.topAlbumThumb}
                      />
                      <div className={styles.topAlbumMeta}>
                        <span className={styles.topAlbumName}>
                          {album.album_name}
                        </span>
                        {album.year && (
                          <span className={styles.topAlbumYear}>
                            {album.year}
                          </span>
                        )}
                        <span className={styles.topAlbumTally}>
                          Picked by {album.pick_count}{" "}
                          {album.pick_count === 1 ? "stan" : "stans"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
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

          {/* Group <-> member relationships from the group_members
              table. The artist GET payload embeds both arrays — empty
              for most artists, so the strips render conditionally. */}
          {Array.isArray(artist.members) && artist.members.length > 0 && (
            <div className={styles.memberStrip}>
              <span className={styles.memberStripLabel}>Members</span>
              <ul className={styles.memberAvatarRow}>
                {artist.members.slice(0, 8).map((m) => (
                  <li key={m.artist_id}>
                    <button
                      type="button"
                      className={styles.memberAvatarBtn}
                      onClick={() => navigate(`/artist/${m.artist_id}`)}
                      title={m.artist_name}
                      aria-label={m.artist_name}
                    >
                      <img
                        src={resolveImageUrl(
                          m.image_url,
                          "https://via.placeholder.com/40?text=?",
                        )}
                        alt=""
                        className={styles.memberAvatar}
                      />
                    </button>
                  </li>
                ))}
                {artist.members.length > 8 && (
                  <li className={styles.memberAvatarMore}>
                    +{artist.members.length - 8}
                  </li>
                )}
              </ul>
            </div>
          )}

          {Array.isArray(artist.groups) && artist.groups.length > 0 && (
            <div className={styles.memberStrip}>
              <span className={styles.memberStripLabel}>Member of</span>
              <ul className={styles.memberAvatarRow}>
                {artist.groups.slice(0, 8).map((g) => (
                  <li key={g.artist_id}>
                    <button
                      type="button"
                      className={styles.memberAvatarBtn}
                      onClick={() => navigate(`/artist/${g.artist_id}`)}
                      title={g.artist_name}
                      aria-label={g.artist_name}
                    >
                      <img
                        src={resolveImageUrl(
                          g.image_url,
                          "https://via.placeholder.com/40?text=?",
                        )}
                        alt=""
                        className={styles.memberAvatar}
                      />
                    </button>
                  </li>
                ))}
                {artist.groups.length > 8 && (
                  <li className={styles.memberAvatarMore}>
                    +{artist.groups.length - 8}
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className={styles.cardMeta}>
            <span className={styles.cloutLine}>
              {(artist.count || 0).toLocaleString()} fans claim them
            </span>

            {/* My Stan Rank — only when the user has actually been
                ranked for this artist's community. */}
            {stanRank && stanRank.tier && (
              <span className={styles.stanRankBadge}>
                Your tier: <strong>{stanRank.tier}</strong>
                {typeof stanRank.score === "number" &&
                  ` · ${stanRank.score} pts`}
              </span>
            )}

            {/* Fact-checker verdict counts rolled up at the artist
                level. Hidden when both counts are zero. */}
            {(() => {
              const v = verifications.find((x) => x.verdict === "verified")?.count || 0;
              const d = verifications.find((x) => x.verdict === "disputed")?.count || 0;
              if (v === 0 && d === 0) return null;
              return (
                <div className={styles.verdictRow}>
                  {v > 0 && (
                    <span className={styles.verifiedBadge}>
                      ✓ Verified ({v})
                    </span>
                  )}
                  {d > 0 && (
                    <span className={styles.disputedBadge}>
                      ⚠ Disputed ({d})
                    </span>
                  )}
                </div>
              );
            })()}

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

            {/* Awards — compact trophy row. Up to 6 visible inline; the
                rest collapse into a "+N more" pill. */}
            {awards.length > 0 && (
              <div className={styles.awardsRow}>
                {awards.slice(0, 6).map((a) => (
                  <span
                    key={a.award_id}
                    className={styles.awardChip}
                    title={[a.award_name, a.category, a.year]
                      .filter(Boolean)
                      .join(" · ")}
                  >
                    🏆 {a.year || ""}
                  </span>
                ))}
                {awards.length > 6 && (
                  <span className={styles.awardMore}>
                    +{awards.length - 6} more
                  </span>
                )}
              </div>
            )}

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
            <header className={styles.boxHeader}>
              <span>Music</span>
              {isLoggedIn && albums.length > 0 && (
                <span className={styles.favoritesCount}>
                  {myFavorites.albums.length}/5 picks
                </span>
              )}
            </header>
            <div className={styles.boxScroll}>
              {albums.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No albums yet.</p>
                </div>
              ) : (
                <ul className={styles.musicList}>
                  {albums.map((album) => {
                    const isFav = favoritedAlbumIds.has(album.album_id);
                    const songs = songsByAlbum[album.album_id] || [];
                    return (
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
                            {isLoggedIn && (
                              <FavoriteAlbumStar
                                artistId={artist.artist_id}
                                album={album}
                                isFavorited={isFav}
                                albumCount={myFavorites.albums.length}
                                onChange={refreshFavorites}
                              />
                            )}
                          </div>
                          {isLoggedIn && isFav && (
                            <AlbumSongPicker
                              artistId={artist.artist_id}
                              album={album}
                              songs={songs}
                              onChange={refreshFavorites}
                            />
                          )}
                        </div>
                      </li>
                    );
                  })}
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

          {/* Per-artist user music posts. Hidden when empty. Each row
              streams via PlayerBar (audio_url path) or pops out to the
              streaming platform (stream_url path). */}
          {artistMusicPosts.length > 0 && (
            <div className={styles.box}>
              <header className={styles.boxHeader}>Fan Music</header>
              <div className={styles.boxScroll}>
                <ul className={styles.musicList}>
                  {artistMusicPosts.map((post) => {
                    const hasAudio = !!post.audio_url;
                    return (
                      <li key={post.post_id} className={styles.musicRow}>
                        <button
                          type="button"
                          className={styles.musicPlayBtn}
                          disabled={!hasAudio && !post.stream_url}
                          onClick={() => {
                            if (hasAudio) {
                              dispatch(
                                setQueue({
                                  tracks: [
                                    {
                                      post_id: post.post_id,
                                      title: post.title || "Untitled",
                                      audio_url: post.audio_url,
                                      artist_name: artist.artist_name,
                                      album_image_url: artist.image_url,
                                    },
                                  ],
                                  startIndex: 0,
                                }),
                              );
                            } else if (post.stream_url) {
                              window.open(
                                post.stream_url,
                                "_blank",
                                "noopener,noreferrer",
                              );
                            }
                          }}
                          aria-label={`Play ${post.title || "post"}`}
                        >
                          {hasAudio ? "▶" : "↗"}
                        </button>
                        <div className={styles.musicInfo}>
                          <span className={styles.musicName}>
                            {post.title || "Untitled"}
                          </span>
                          <span className={styles.musicYear}>
                            @{post.username || "user"}
                            {post.platform ? ` · ${post.platform}` : ""}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {/* Related Artists — "Fans of X also love Y" co-list chips.
              Hidden when empty (sparse signal at current Top-20 scale). */}
          {relatedArtists.length > 0 && (
            <div className={styles.box}>
              <header className={styles.boxHeader}>Fans Also Love</header>
              <div className={styles.boxScroll}>
                <ul className={styles.relatedList}>
                  {relatedArtists.map((rel) => (
                    <li key={rel.artist_id} className={styles.relatedRow}>
                      <button
                        type="button"
                        className={styles.relatedBtn}
                        onClick={() => navigate(`/artist/${rel.artist_id}`)}
                      >
                        <img
                          src={resolveImageUrl(
                            rel.image_url,
                            "https://via.placeholder.com/40?text=?",
                          )}
                          alt=""
                          className={styles.relatedAvatar}
                        />
                        <div className={styles.relatedMeta}>
                          <span className={styles.relatedName}>
                            {rel.artist_name}
                          </span>
                          {rel.genre && (
                            <span className={styles.relatedGenre}>
                              {rel.genre}
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
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
                {artistEvents.length === 0 ? (
                  <p className={styles.emptyStateInline}>
                    No upcoming tour dates yet.
                  </p>
                ) : (
                  <ul className={styles.eventsList}>
                    {artistEvents.map((ev) => {
                      const when = ev.event_date
                        ? new Date(ev.event_date).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )
                        : "TBA";
                      return (
                        <li key={ev.event_id} className={styles.eventRow}>
                          <span className={styles.eventDate}>{when}</span>
                          <div className={styles.eventMeta}>
                            <span className={styles.eventTitle}>
                              {ev.title}
                            </span>
                            {(ev.venue || ev.city) && (
                              <span className={styles.eventVenue}>
                                {[ev.venue, ev.city].filter(Boolean).join(" · ")}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
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

      {/* Bottom row: Upcoming Releases on the left, Rankings on the
          right. Trending moved to a top-of-panel strip so it's
          always in view. From-the-Community lane retired — feed
          already covers that surface. */}
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
