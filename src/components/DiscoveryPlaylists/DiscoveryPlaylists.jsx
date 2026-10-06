import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setQueue } from "../../redux/playerSlice";
import { useDiscoveryPlaylists } from "../../hooks/useDiscoveryPlaylists";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./DiscoveryPlaylists.module.css";

// "Made for you" on the fan's own profile (Story 27): playlists built from
// their Top 20, with at least three small artists in each. Tapping play
// queues the whole playlist into PlayerBar, so ⏭ walks through it; each
// track carries artist_id + source, so a 10s listen counts as a play.

const toTracks = (playlist) =>
  playlist.tracks.map((t) => ({
    album_id: t.album_id ?? undefined,
    title: `${t.title} · preview`,
    audio_url: t.preview_url,
    artist_name: t.artist_name,
    album_image_url: t.album_image_url ?? t.image_url ?? null,
    listen_url: t.listen_url ?? null,
    artist_id: t.artist_id,
    source: t.source ?? null,
  }));

const PlaylistCard = ({ playlist }) => {
  const dispatch = useDispatch();
  const nowPlaying = useSelector((s) => s.player.queue[s.player.currentIndex]?.audio_url);
  const [open, setOpen] = useState(false);
  const covers = playlist.tracks.map((t) => t.image_url || t.album_image_url).filter(Boolean).slice(0, 4);
  const small = playlist.tracks.filter((t) => t.indie).length;
  const listId = `playlist-tracks-${playlist.playlist_id}`;
  const play = (startIndex) => dispatch(setQueue({ tracks: toTracks(playlist), startIndex }));

  return (
    <li className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.cover} aria-hidden="true">
          {covers.map((src, i) => (
            <img key={i} src={resolveImageUrl(src)} alt="" loading="lazy" />
          ))}
        </div>
        <div className={styles.meta}>
          <h4 className={styles.cardTitle}>{playlist.title}</h4>
          {playlist.blurb && <p className={styles.blurb}>{playlist.blurb}</p>}
          <p className={styles.counts}>
            {playlist.tracks.length} tracks
            {small > 0 && ` · ${small} under the radar`}
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.playBtn} onClick={() => play(0)}>
              ▶ Play
            </button>
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={listId}
            >
              {open ? "Hide tracks" : "Tracks"}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <ol id={listId} className={styles.tracks}>
          {playlist.tracks.map((t, i) => {
            const playing = nowPlaying === t.preview_url;
            return (
              <li key={t.position} className={playing ? styles.trackPlaying : styles.track}>
                <button
                  type="button"
                  className={styles.trackBtn}
                  onClick={() => play(i)}
                  aria-label={`Play ${t.title} by ${t.artist_name}`}
                  aria-current={playing ? "true" : undefined}
                >
                  <span className={styles.num} aria-hidden="true">{playing ? "♪" : i + 1}</span>
                  <span className={styles.trackText}>
                    <span className={styles.trackLine}>
                      <span className={styles.artist}>{t.artist_name}</span>
                      {t.indie && <span className={styles.badge}>Under the radar</span>}
                    </span>
                    <span className={styles.song}>{t.title}</span>
                    {t.reason && <span className={styles.reason}>{t.reason}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </li>
  );
};

const DiscoveryPlaylists = () => {
  const { status, playlists, seedsNeeded, refresh, refreshing, notice } = useDiscoveryPlaylists();

  let body;
  if (status === "loading") {
    body = <p className={styles.note}>Building your playlists… this can take a few seconds.</p>;
  } else if (playlists.length > 0) {
    body = (
      <ul className={styles.list}>
        {playlists.map((p) => (
          <PlaylistCard key={p.playlist_id} playlist={p} />
        ))}
      </ul>
    );
  } else if (status === "needs_seeds") {
    body = (
      <p className={styles.note}>
        Add {seedsNeeded} more {seedsNeeded === 1 ? "artist" : "artists"} to your Top 20 and we'll build playlists
        around them.
      </p>
    );
  } else if (status === "no_playable" || status === "no_candidates") {
    body = <p className={styles.note}>We couldn't find enough playable previews yet — check back tomorrow.</p>;
  } else {
    body = <p className={styles.note}>Couldn't load your playlists right now.</p>;
  }

  return (
    <section className={styles.wrap} aria-labelledby="discovery-playlists-heading">
      <header className={styles.header}>
        <div>
          <h3 id="discovery-playlists-heading" className={styles.title}>
            Made for you
          </h3>
          <p className={styles.subtitle}>
            Built from your Top 20 — with at least three artists you probably haven't heard yet.
          </p>
        </div>
        {playlists.length > 0 && (
          <button type="button" className={styles.refresh} onClick={refresh} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        )}
      </header>
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}
      {body}
    </section>
  );
};

export default DiscoveryPlaylists;
