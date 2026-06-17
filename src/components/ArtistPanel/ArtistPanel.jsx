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
  const [activeTab, setActiveTab] = useState("feed");
  const [feedPosts, setFeedPosts] = useState([]);
  const [showPositionSelector, setShowPositionSelector] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Ensure the global artist list is loaded — rank + prev/next depend on it.
  useEffect(() => {
    if (allArtists.length === 0) dispatch(fetchArtists());
  }, [allArtists.length, dispatch]);

  useEffect(() => {
    if (isLoggedIn) dispatch(fetchProfileList());
  }, [isLoggedIn, dispatch]);

  // When no artistId is in the URL, default to the top-ranked artist.
  // This makes "/" the home view of the highest-ranked artist's surface.
  const targetId = artistId || allArtists[0]?.artist_id;

  useEffect(() => {
    if (!targetId) return; // wait for allArtists to load
    setLoading(true);
    setArtist(null);
    setFeedPosts([]);
    setActiveTab("feed");

    axiosInstance
      .get(`/artists/${targetId}`)
      .then((res) => setArtist(res.data.artist || res.data))
      .catch(() => {
        // Only redirect on hard-fail of an explicit URL — for the "/" default
        // case, the user hasn't asked for anything specific so we stay put.
        if (artistId) navigate("/", { replace: true });
      })
      .finally(() => setLoading(false));

    axiosInstance
      .get(`/music/posts/artist/${targetId}`)
      .then((res) => setFeedPosts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setFeedPosts([]));
  }, [targetId, artistId, navigate]);

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <p>Loading artist…</p>
      </div>
    );
  }
  if (!artist) return null;

  // Rank + neighbors (deck-flip navigation).
  const rankIndex = allArtists.findIndex(
    (a) => a.artist_id === artist.artist_id,
  );
  const rank = rankIndex >= 0 ? rankIndex + 1 : null;
  const prevArtist = rankIndex > 0 ? allArtists[rankIndex - 1] : null;
  const nextArtist =
    rankIndex >= 0 && rankIndex < allArtists.length - 1
      ? allArtists[rankIndex + 1]
      : null;

  // Top 20 state.
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

      <div className={styles.split}>
        {/* LEFT — anchor card */}
        <aside className={styles.anchor}>
          <button
            type="button"
            className={`${styles.flipBtn} ${styles.flipUp}`}
            onClick={() =>
              prevArtist && navigate(`/artist/${prevArtist.artist_id}`)
            }
            disabled={!prevArtist}
            aria-label="Previous ranked artist"
          >
            ▲
          </button>

          <div className={styles.card}>
            <img
              src={resolveImageUrl(
                artist.image_url,
                "https://via.placeholder.com/240?text=?",
              )}
              alt={artist.artist_name || "Artist"}
              className={styles.cardImage}
            />
            <div className={styles.cardBody}>
              <h1 className={styles.cardName}>
                {artist.artist_name || "N/A"}
              </h1>
              {artist.genre && (
                <p className={styles.cardGenre}>{artist.genre}</p>
              )}
              {rank && (
                <span className={styles.rankBadge}>#{rank} on the list</span>
              )}
              <p className={styles.cloutLine}>
                {(artist.count || 0).toLocaleString()} fans claim them
              </p>
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
          </div>

          <button
            type="button"
            className={`${styles.flipBtn} ${styles.flipDown}`}
            onClick={() =>
              nextArtist && navigate(`/artist/${nextArtist.artist_id}`)
            }
            disabled={!nextArtist}
            aria-label="Next ranked artist"
          >
            ▼
          </button>
        </aside>

        {/* RIGHT — dynamic content */}
        <section className={styles.dynamic}>
          <div className={styles.tabBar}>
            <button
              type="button"
              className={`${styles.tab} ${
                activeTab === "feed" ? styles.tabActive : ""
              }`}
              onClick={() => setActiveTab("feed")}
            >
              Feed
            </button>
            <button
              type="button"
              className={`${styles.tab} ${
                activeTab === "music" ? styles.tabActive : ""
              }`}
              onClick={() => setActiveTab("music")}
            >
              Music
            </button>
            <button
              type="button"
              className={`${styles.tab} ${
                activeTab === "events" ? styles.tabActive : ""
              }`}
              onClick={() => setActiveTab("events")}
            >
              Events
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === "feed" && (
              feedPosts.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No posts about {artist.artist_name} yet.</p>
                </div>
              ) : (
                <ul className={styles.feedList}>
                  {feedPosts.map((post, idx) => (
                    <li key={post.post_id || idx} className={styles.feedRow}>
                      {post.audio_url && (
                        <button
                          type="button"
                          className={styles.feedPlayBtn}
                          onClick={() =>
                            dispatch(
                              setQueue({
                                tracks: feedPosts
                                  .filter((p) => p.audio_url)
                                  .map((p) => ({
                                    post_id: p.post_id,
                                    title: p.title,
                                    audio_url: p.audio_url,
                                    username: p.username,
                                    artist_name: artist.artist_name,
                                    album_image_url: artist.image_url,
                                  })),
                                startIndex: feedPosts
                                  .filter((p) => p.audio_url)
                                  .findIndex(
                                    (p) => p.post_id === post.post_id,
                                  ),
                              }),
                            )
                          }
                          aria-label={`Play ${post.title || "post"}`}
                        >
                          ▶
                        </button>
                      )}
                      <div className={styles.feedMeta}>
                        <span className={styles.feedTitle}>
                          {post.title || "Untitled"}
                        </span>
                        <span className={styles.feedSub}>
                          {post.username ? `@${post.username}` : ""}
                          {post.username && post.created_at ? " · " : ""}
                          {formatRelativeTime(post.created_at)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            )}

            {activeTab === "music" && (
              <>
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
                  <div className={styles.albumGrid}>
                    {albums.map((album) => (
                      <div key={album.album_id} className={styles.albumCard}>
                        <img
                          src={resolveImageUrl(
                            album.album_image_url,
                            "https://via.placeholder.com/120?text=Album",
                          )}
                          alt={album.album_name}
                          className={styles.albumImage}
                        />
                        <span className={styles.albumName}>
                          {album.album_name}
                        </span>
                        {album.year && (
                          <span className={styles.albumYear}>{album.year}</span>
                        )}
                        <div className={styles.albumActions}>
                          {artist.is_verified ? (
                            <StanboxPreviewButton
                              album={album}
                              artist={artist}
                            />
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
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "events" && (
              <div className={styles.emptyState}>
                <p>No upcoming tour dates yet.</p>
                {user?.artist_id === artist.artist_id && (
                  <Link to="/events" className={styles.eventsCreateLink}>
                    Add a tour date →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Persistent CTA — Top 20 */}
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
              <span className={styles.claimPending}>
                Claim pending review
              </span>
            )}
          </div>
        </section>
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
