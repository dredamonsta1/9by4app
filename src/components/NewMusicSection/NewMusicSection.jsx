import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { resolveImageUrl } from "../../utils/imageUrl";
import { ArtistModal } from "../RapperList";
import styles from "./NewMusicSection.module.css";

const timeAgo = (ts) => {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Lane 1 — Upcoming releases (Spotify/MusicBrainz) with DB albums as fallback
const ArtistReleasesLane = ({ onArtistClick, upcomingReleases }) => {
  const [albums, setAlbums] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    axiosInstance.get("/artists/albums/new")
      .then((res) => setAlbums(res.data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Prefer upcoming releases (Spotify/MusicBrainz); fall back to DB albums
  const showUpcoming = upcomingReleases && upcomingReleases.length > 0;
  const showDbAlbums = loaded && albums.length > 0;

  if (!showUpcoming && loaded && albums.length === 0) {
    return <p className={styles.empty}>No new releases. Check back soon.</p>;
  }

  if (showUpcoming) {
    return (
      <div className={styles.laneScroll}>
        {upcomingReleases.map((release) => (
          <div key={release.id} className={styles.albumCard}>
            {release.imageUrl ? (
              <img
                src={release.imageUrl}
                alt={release.title}
                className={styles.albumImg}
              />
            ) : (
              <div className={styles.albumImgPlaceholder}>
                {(release.title || "").split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
            )}
            <span className={styles.newBadge}>{release.source}</span>
            <span className={styles.albumName}>{release.title}</span>
            <span className={styles.albumArtistStatic}>{release.artist}</span>
            <div className={styles.albumMeta}>
              <span>{release.date}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.laneScroll}>
      {albums.map((album, i) => (
        <div key={album.album_id} className={styles.albumCard}>
          {album.album_image_url ? (
            <img
              src={resolveImageUrl(album.album_image_url)}
              alt={album.album_name}
              className={styles.albumImg}
            />
          ) : (
            <div className={styles.albumImgPlaceholder}>
              {(album.album_name || "").split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
          )}
          {i < 10 && <span className={styles.newBadge}>New</span>}
          <span className={styles.albumName}>{album.album_name}</span>
          <button
            className={styles.albumArtist}
            onClick={() => onArtistClick({ artist_id: album.artist_id, artist_name: album.artist_name, image_url: album.artist_image_url })}
          >
            {album.artist_name}
          </button>
          <div className={styles.albumMeta}>
            <span>{album.year}</span>
            {album.certifications && (
              <span className={styles.certBadge}>{album.certifications}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Lane 2 — User music posts
const MusicPostsLane = ({ isLoggedIn }) => {
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    axiosInstance.get("/music/posts/feed")
      .then((res) => setPosts(res.data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (loaded && posts.length === 0) {
    return (
      <p className={styles.empty}>
        {isLoggedIn
          ? "Follow artists and fans to see their music here."
          : "No music posts yet."}
      </p>
    );
  }

  return (
    <div className={styles.postsLane}>
      {posts.map((post) => (
        <div key={post.post_id} className={styles.musicPost}>
          <div className={styles.postHeader}>
            <Link to={`/profile/${post.user_id}`} className={styles.postUser}>
              {post.profile_image && (
                <img
                  src={resolveImageUrl(post.profile_image)}
                  alt={post.username}
                  className={styles.postAvatar}
                />
              )}
              <span className={styles.postUsername}>{post.username}</span>
            </Link>
            <span className={styles.postTime}>{timeAgo(post.created_at)}</span>
          </div>

          {post.title && <p className={styles.postTitle}>{post.title}</p>}

          {post.audio_url && (
            <audio controls className={styles.audioPlayer} preload="none">
              <source src={post.audio_url} />
            </audio>
          )}

          {post.stream_url && !post.audio_url && (
            <a href={post.stream_url} target="_blank" rel="noopener noreferrer" className={styles.streamLink}>
              {post.platform ? `Listen on ${post.platform}` : "Stream"}
            </a>
          )}

          {post.platform && (
            <span className={styles.platformBadge}>{post.platform}</span>
          )}

          {post.caption && (
            <p className={`${styles.postCaption} ${expanded[post.post_id] ? styles.expanded : ""}`}>
              {post.caption}
            </p>
          )}
          {post.caption && post.caption.length > 100 && (
            <button
              className={styles.expandBtn}
              onClick={() => setExpanded((e) => ({ ...e, [post.post_id]: !e[post.post_id] }))}
            >
              {expanded[post.post_id] ? "Less" : "More"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// Main component
const NewMusicSection = ({ isLoggedIn, upcomingReleases = [] }) => {
  const [modalArtist, setModalArtist] = useState(null);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>New Music</h2>
      </div>

      <div className={styles.lanes}>
        <div className={styles.lane}>
          <div className={styles.laneHeader}>
            <span className={styles.laneLabel}>Upcoming releases</span>
          </div>
          <ArtistReleasesLane onArtistClick={setModalArtist} upcomingReleases={upcomingReleases} />
        </div>

        <div className={styles.lane}>
          <div className={styles.laneHeader}>
            <span className={styles.laneLabel}>From the community</span>
          </div>
          <MusicPostsLane isLoggedIn={isLoggedIn} />
        </div>
      </div>

      {modalArtist && (
        <ArtistModal artist={modalArtist} onClose={() => setModalArtist(null)} />
      )}
    </section>
  );
};

export default NewMusicSection;
