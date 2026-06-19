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
import styles from "./ArtistPanel.module.css";

const MUSIC_PREVIEW_COUNT = 4;

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

  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalFeed, setGlobalFeed] = useState([]);
  const [artistNews, setArtistNews] = useState([]);
  const [composerText, setComposerText] = useState("");
  const [posting, setPosting] = useState(false);
  const [showPositionSelector, setShowPositionSelector] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

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

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const text = composerText.trim();
    if (!text || posting) return;
    setPosting(true);
    try {
      const res = await axiosInstance.post("/feed/text", { content: text });
      if (res.data && (res.data.post_id || res.data.id)) {
        setGlobalFeed((prev) => [res.data, ...prev]);
      } else {
        const refetched = await axiosInstance.get("/feed");
        setGlobalFeed(Array.isArray(refetched.data) ? refetched.data : []);
      }
      setComposerText("");
    } catch {
      // Keep textarea content so the user can retry.
    } finally {
      setPosting(false);
    }
  };

  const AGENT_BADGE = {
    music: "Music",
    sports: "Sports",
    entertainment: "Entertainment",
    news: "News",
  };

  const albums = artist.albums || [];
  const previewedAlbums = albums.slice(0, MUSIC_PREVIEW_COUNT);
  const hiddenAlbumCount = Math.max(0, albums.length - MUSIC_PREVIEW_COUNT);
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
    <div className={styles.panel}>
      {isOwner && (
        <div className={styles.topBar}>
          <Link to="/artist-settings" className={styles.editWorldLink}>
            Edit your world
          </Link>
        </div>
      )}

      <div className={styles.threeCol}>
        {/* ---- LEFT: Feed (bounded container) ---- */}
        <aside className={styles.feedCol}>
          <div className={styles.box}>
            <header className={styles.boxHeader}>Feed</header>

            {isLoggedIn && (
              <form className={styles.composer} onSubmit={handlePostSubmit}>
                <textarea
                  className={styles.composerInput}
                  placeholder="Post something…"
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  rows={2}
                  maxLength={500}
                  disabled={posting}
                />
                <button
                  type="submit"
                  className={styles.composerBtn}
                  disabled={!composerText.trim() || posting}
                >
                  {posting ? "Posting…" : "Post"}
                </button>
              </form>
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
                  {globalFeed.map((post, idx) => {
                    const postKey = post.id || post.post_id || idx;
                    const isAgent = post.is_agent_post;
                    const isMusic =
                      post.post_type === "music" && post.audio_url;
                    const isImage =
                      post.post_type === "image" && post.image_url;
                    const badgeLabel =
                      isAgent && (AGENT_BADGE[post.category] || "News");

                    return (
                      <li key={postKey} className={styles.feedRow}>
                        <div className={styles.feedHead}>
                          {isAgent ? (
                            <span className={styles.feedBadge}>
                              {badgeLabel}
                            </span>
                          ) : (
                            <span className={styles.feedUser}>
                              @{post.username || "user"}
                            </span>
                          )}
                          <span className={styles.feedTime}>
                            {formatRelativeTime(post.created_at)}
                          </span>
                        </div>

                        {isMusic && (
                          <div className={styles.feedMusicRow}>
                            <button
                              type="button"
                              className={styles.feedPlayBtn}
                              onClick={() => playFeedPost(post)}
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
                          <p className={styles.feedBody}>
                            {post.content || post.caption}
                          </p>
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
                      </li>
                    );
                  })}
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
            <div className={styles.boxBody}>
              {albums.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No albums yet.</p>
                </div>
              ) : (
                <>
                  <div className={styles.musicGrid}>
                    {previewedAlbums.map((album) => (
                      <div
                        key={album.album_id}
                        className={styles.musicTile}
                        title={album.album_name}
                      >
                        <img
                          src={resolveImageUrl(
                            album.album_image_url,
                            "https://via.placeholder.com/120?text=Album",
                          )}
                          alt={album.album_name}
                          className={styles.musicTileImage}
                        />
                      </div>
                    ))}
                  </div>
                  {hiddenAlbumCount > 0 && (
                    <span className={styles.musicMore}>
                      +{hiddenAlbumCount} more album
                      {hiddenAlbumCount === 1 ? "" : "s"}
                    </span>
                  )}
                  {/* Per-album actions land here for the first preview album
                      so Preview / Spotify / Buy stays one click away even
                      with the compact grid. */}
                  {previewedAlbums[0] && (
                    <div className={styles.musicQuickRow}>
                      <span className={styles.musicQuickName}>
                        {previewedAlbums[0].album_name}
                      </span>
                      <div className={styles.musicQuickActions}>
                        {artist.is_verified ? (
                          <StanboxPreviewButton
                            album={previewedAlbums[0]}
                            artist={artist}
                          />
                        ) : (
                          <AlbumPreviewButton
                            album={previewedAlbums[0]}
                            artist={artist}
                          />
                        )}
                        <AlbumBuyButton
                          album={previewedAlbums[0]}
                          artist={artist}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

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
    </div>
  );
};

export default ArtistPanel;
