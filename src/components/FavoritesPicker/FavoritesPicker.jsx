// Two-part picker for the per-artist favorites feature:
//  - FavoriteAlbumStar: small star button on each album row in the
//    Music section. Toggles album favorite (POST → add, DELETE →
//    silent remove).
//  - AlbumSongPicker: expanding free-text input that appears below
//    favorited albums. Lets the user pick up to 3 songs per album.
//
// State (myFavorites) lives on the parent ArtistPanel; helpers here
// just dispatch + bubble onChange so the parent can refetch.
//
// Backend: /api/favorites/artist/:id/albums (+/songs) for adds,
// /api/favorites/artist/:id/albums/:albumId for removes,
// /api/favorites/songs/:songId for song removes.
//
// Auto-post on add is handled server-side — no extra frontend work
// needed for the feed embed.
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./FavoritesPicker.module.css";

const MAX_ALBUMS = 5;
const MAX_SONGS_PER_ALBUM = 3;

export const FavoriteAlbumStar = ({
  artistId,
  album,
  isFavorited,
  albumCount,
  onChange,
  disabled,
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      if (isFavorited) {
        await axiosInstance.delete(
          `/favorites/artist/${artistId}/albums/${album.album_id}`,
        );
        onChange?.();
      } else {
        if (albumCount >= MAX_ALBUMS) {
          toast.info(`Max ${MAX_ALBUMS} favorite albums per artist.`);
          setLoading(false);
          return;
        }
        await axiosInstance.post(`/favorites/artist/${artistId}/albums`, {
          album_id: album.album_id,
        });
        onChange?.();
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't update favorites.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.star} ${isFavorited ? styles.starOn : ""}`}
      onClick={handleClick}
      disabled={loading || disabled}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
      aria-label={isFavorited ? "Remove favorite" : "Add favorite"}
    >
      {isFavorited ? "★" : "☆"}
    </button>
  );
};

export const AlbumSongPicker = ({ artistId, album, songs, onChange }) => {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Canonical tracklist from MB-backfilled `tracks` table. Empty array
  // is normal for ~12% of albums; the input then acts as plain text.
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    let active = true;
    axiosInstance
      .get(`/tracks/album/${album.album_id}`)
      .then((res) => {
        if (active) setTracks(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (active) setTracks([]);
      });
    return () => {
      active = false;
    };
  }, [album.album_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = draft.trim();
    if (!title || submitting) return;
    if (songs.length >= MAX_SONGS_PER_ALBUM) {
      toast.info(`Max ${MAX_SONGS_PER_ALBUM} songs per album.`);
      return;
    }
    // Case-insensitive exact match against the canonical tracklist —
    // sends track_id when the user picked from the suggestions, omits
    // it for free-text. Backend accepts either.
    const matched = tracks.find(
      (t) => t.title.toLowerCase() === title.toLowerCase(),
    );
    setSubmitting(true);
    try {
      await axiosInstance.post(`/favorites/artist/${artistId}/songs`, {
        album_id: album.album_id,
        song_title: matched ? matched.title : title,
        track_id: matched ? matched.track_id : undefined,
      });
      setDraft("");
      onChange?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't add song.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (songId) => {
    try {
      await axiosInstance.delete(`/favorites/songs/${songId}`);
      onChange?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't remove song.");
    }
  };

  return (
    <div className={styles.songPicker}>
      {songs.length > 0 && (
        <ul className={styles.songList}>
          {songs.map((s) => (
            <li key={s.id} className={styles.songItem}>
              <span className={styles.songTitle}>{s.song_title}</span>
              <button
                type="button"
                className={styles.songRemove}
                onClick={() => handleRemove(s.id)}
                title="Remove song"
                aria-label="Remove song"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {songs.length < MAX_SONGS_PER_ALBUM && (
        <form onSubmit={handleSubmit} className={styles.songForm}>
          <input
            className={styles.songInput}
            type="text"
            list={tracks.length > 0 ? `tracks-${album.album_id}` : undefined}
            placeholder={
              tracks.length > 0 ? "Pick a song…" : "Pick a song…"
            }
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={255}
            disabled={submitting}
            autoComplete="off"
          />
          {tracks.length > 0 && (
            <datalist id={`tracks-${album.album_id}`}>
              {tracks.map((t) => (
                <option key={t.track_id} value={t.title} />
              ))}
            </datalist>
          )}
          <button
            type="submit"
            className={styles.songAdd}
            disabled={!draft.trim() || submitting}
          >
            {submitting ? "…" : "Add"}
          </button>
        </form>
      )}
    </div>
  );
};
