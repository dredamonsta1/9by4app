import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./NewMusicSection.module.css";

const formatReleaseDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

// Lane 1 — Upcoming releases (Spotify/MusicBrainz) with DB albums as fallback
const ArtistReleasesLane = ({ onArtistNavigate, upcomingReleases }) => {
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
      <div className={styles.releasesGrid}>
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
            onClick={() => onArtistNavigate(album.artist_id)}
          >
            {album.artist_name}
          </button>
          <div className={styles.albumMeta}>
            <span>{formatReleaseDate(album.release_date) || album.year}</span>
            {album.certifications && (
              <span className={styles.certBadge}>{album.certifications}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Main component — Upcoming Releases only. From-the-Community lane
// retired (the Feed column already covers that surface).
const NewMusicSection = ({ upcomingReleases = [] }) => {
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Upcoming Releases</h2>
      </div>

      <ArtistReleasesLane
        onArtistNavigate={(id) => navigate(`/artist/${id}`)}
        upcomingReleases={upcomingReleases}
      />
    </section>
  );
};

export default NewMusicSection;
