import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import { setQueue } from "../../redux/playerSlice";
import styles from "./AlbumSongList.module.css";

// "Songs" disclosure under an album in the artist panel's Music box. Opens
// the album's song list, each with a 30s sample (GET /albums/:id/samples:
// the artist's own uploads, else Apple Music, else Deezer).
//
// Tapping a song queues the WHOLE album into PlayerBar starting at that
// song, so ⏭ walks through the rest. "Play all" is the same from song 1.
// The list scrolls inside the Music box, so opening it never grows the page.

const fmtDuration = (s) =>
  Number.isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "";

const AlbumSongList = ({ album, artist }) => {
  const dispatch = useDispatch();
  const nowPlayingUrl = useSelector((s) => s.player.queue[s.player.currentIndex]?.audio_url);

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [samples, setSamples] = useState(null);

  const load = async () => {
    setStatus("loading");
    try {
      const res = await axiosInstance.get(`/albums/${album.album_id}/samples`);
      setSamples(res.data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    // Fetch once, on first open. A failed load retries on the next open.
    if (next && (status === "idle" || status === "error")) load();
  };

  const tracks = samples?.tracks ?? [];

  const play = (startIndex) =>
    dispatch(
      setQueue({
        tracks: tracks.map((t) => ({
          album_id: album.album_id,
          track_id: t.track_id ?? undefined,
          title: `${t.title} · preview`,
          audio_url: t.preview_url,
          artist_name: artist?.artist_name ?? null,
          album_image_url: album.album_image_url ?? null,
          listen_url: t.listen_url ?? null,
          artist_id: artist?.artist_id ?? null,
          source: samples?.provider ?? null,
        })),
        startIndex,
      }),
    );

  const listId = `album-songs-${album.album_id}`;

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.toggle}
        onClick={toggle}
        aria-expanded={open}
        aria-controls={listId}
      >
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} aria-hidden="true">
          ▸
        </span>
        Songs
      </button>

      {open && (
        <div id={listId} className={styles.panel}>
          {status === "loading" && <p className={styles.note}>Loading songs…</p>}

          {status === "error" && (
            <p className={styles.note}>
              Couldn't load songs.{" "}
              <button type="button" className={styles.retry} onClick={load}>
                Try again
              </button>
            </p>
          )}

          {status === "ready" && tracks.length === 0 && (
            <p className={styles.note}>No samples available for this release yet.</p>
          )}

          {status === "ready" && tracks.length > 0 && (
            <>
              <div className={styles.header}>
                <button type="button" className={styles.playAll} onClick={() => play(0)}>
                  ▶ Play all
                </button>
                {samples.provider === "apple" && samples.album_listen_url && (
                  <a
                    className={styles.listen}
                    href={samples.album_listen_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apple Music ↗
                  </a>
                )}
              </div>
              <ol className={styles.list}>
                {tracks.map((t, i) => {
                  const isPlaying = nowPlayingUrl === t.preview_url;
                  return (
                    <li key={`${t.position}-${t.title}`} className={isPlaying ? styles.rowPlaying : styles.row}>
                      <button
                        type="button"
                        className={styles.song}
                        onClick={() => play(i)}
                        aria-label={`Play preview of ${t.title}`}
                        aria-current={isPlaying ? "true" : undefined}
                      >
                        <span className={styles.num} aria-hidden="true">
                          {isPlaying ? "♪" : t.position}
                        </span>
                        <span className={styles.title}>{t.title}</span>
                        <span className={styles.duration}>{fmtDuration(t.duration_seconds)}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumSongList;
