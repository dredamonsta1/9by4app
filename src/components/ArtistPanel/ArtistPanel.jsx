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
  // refetch on login state change (different feed for logged-in vs out).
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
  // This makes "/" the home view of the highest-ranked artist's surface.
  const targetId = artistId || allArtists[0]?.artist_id;

  useEffect(() => {
    if (!targetId) return; // wait for allArtists to load
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

    // News & Events news pane — community posts tagged to this artist,
    // filtered to the 9by4News journalism bot. The backend currently
    // returns the full community feed (no agent flag), so we filter
    // client-side by username. A backend PR will follow that adds an
    // explicit ?agent=news filter and exposes provenance URLs.
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
      // Prepend the newly created post so the user sees it immediately.
      // The backend returns the post row; if it doesn't, refetch the feed.
      if (res.data && (res.data.post_id || res.data.id)) {
        setGlobalFeed((prev) => [res.data, ...prev]);
      } else {
        const refetched = await axiosInstance.get("/feed");
        setGlobalFeed(Array.isArray(refetched.data) ? refetched.data : []);
      }
      setComposerText("");
    } catch {
      // Leave the textarea content so the user can retry.
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

  const hasWorldLinks =
    artist.website_url ||
    artist.merch_url ||
    artist.newsletter_url ||
    artist.spotify_url ||
    artist.apple_music_url;

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

  return (
    <div className={styles.panel}>
      {user?.artist_id === artist.artist_id && (
        <div className={styles.topBar}>
          <Link to="/artist-settings" className={styles.editWorldLink}>
            Edit your world
          </Link>
        </div>
      )}

      {/* Three-column hero: Feed (left) | centered card (middle) |
          Music (right). Each side column is a vertical scroll list
          adjacent to the card, not a tab and not a row below. */}
      <div className={styles.threeCol}>
        {/* LEFT — Feed (global, decoupled from active artist) */}
        <aside className={styles.sideCol}>
          <h2 className={styles.sectionTitle}>Feed</h2>

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
                const isMusic = post.post_type === "music" && post.audio_url;
                const isImage = post.post_type === "image" && post.image_url;
                const badgeLabel =
                  isAgent && (AGENT_BADGE[post.category] || "News");

                return (
                  <li key={postKey} className={styles.feedRow}>
                    <div className={styles.feedHead}>
                      {isAgent ? (
                        <span className={styles.feedBadge}>{badgeLabel}</span>
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
        </aside>

        {/* CENTER — Card hero (deck depth + side arrows + meta) */}
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

          <div className={styles.cardMeta}>
            {rank && (
              <span className={styles.rankBadge}>#{rank} on the list</span>
            )}
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

        {/* RIGHT — Music (vertical) */}
        <aside className={styles.sideCol}>
          <h2 className={styles.sectionTitle}>Music</h2>
          {hasWorldLinks && (
            <div className={styles.worldLinks}>
              {artist.website_url && (
                <a
                  href={artist.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.worldLink}
                >
                  Website
                </a>
              )}
              {artist.merch_url && (
                <a
                  href={artist.merch_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.worldLink} ${styles.worldLinkMerch}`}
                >
                  Shop
                </a>
              )}
              {artist.newsletter_url && (
                <a
                  href={artist.newsletter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.worldLink}
                >
                  Newsletter
                </a>
              )}
              {artist.apple_music_url && (
                <a
                  href={artist.apple_music_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.worldLink} ${styles.worldLinkApple}`}
                >
                  Apple Music
                </a>
              )}
            </div>
          )}

          {albums.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No albums catalogued for this artist yet.</p>
            </div>
          ) : (
            <ul className={styles.albumList}>
              {albums.map((album) => (
                <li key={album.album_id} className={styles.albumRow}>
                  <img
                    src={resolveImageUrl(
                      album.album_image_url,
                      "https://via.placeholder.com/80?text=Album",
                    )}
                    alt={album.album_name}
                    className={styles.albumThumb}
                  />
                  <div className={styles.albumInfo}>
                    <span className={styles.albumName}>{album.album_name}</span>
                    {album.year && (
                      <span className={styles.albumYear}>{album.year}</span>
                    )}
                    <div className={styles.albumActions}>
                      {artist.is_verified ? (
                        <StanboxPreviewButton album={album} artist={artist} />
                      ) : (
                        <AlbumPreviewButton album={album} artist={artist} />
                      )}
                      {album.spotify_url && (
                        <a
                          href={album.spotify_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.albumSpotify}
                        >
                          Spotify
                        </a>
                      )}
                      <AlbumBuyButton album={album} artist={artist} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {/* News & Events — artist-scoped journalism + tour dates. The news
          half waits on the agent-poster backend PR that tags artist-
          relevant articles to community_posts; until then it's empty for
          most artists. */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>News &amp; Events</h2>

        <div className={styles.subSection}>
          <h3 className={styles.subHeading}>News</h3>
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
        </div>

        <div className={styles.subSection}>
          <h3 className={styles.subHeading}>Events</h3>
          <div className={styles.emptyState}>
            <p>No upcoming tour dates yet.</p>
            {user?.artist_id === artist.artist_id && (
              <Link to="/events" className={styles.eventsCreateLink}>
                Add a tour date →
              </Link>
            )}
          </div>
        </div>
      </section>

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
