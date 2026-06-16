import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { loadPurchases } from "../../redux/actions/authActions";
import { setQueue } from "../../redux/playerSlice";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./Library.module.css";

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const Library = () => {
  const dispatch = useDispatch();
  const { user, token, purchases } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [downloadingId, setDownloadingId] = useState(null);
  const [playLoadingId, setPlayLoadingId] = useState(null);
  const [showJustPurchased, setShowJustPurchased] = useState(false);

  const justPurchasedAlbumId = useMemo(() => {
    const raw = searchParams.get("purchased");
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isInteger(n) ? n : null;
  }, [searchParams]);

  // Group purchases by artist. Each artist becomes a section with their
  // albums underneath. Artist sections are sorted by the newest purchase
  // from that artist (so an artist you bought from yesterday surfaces
  // above one you bought from last month). Albums within each artist
  // are also DESC by created_at — newest album first.
  const artistGroups = useMemo(() => {
    if (!purchases || purchases.length === 0) return [];
    const byArtist = new Map();
    for (const p of purchases) {
      const key = p.artist_id;
      if (!byArtist.has(key)) {
        byArtist.set(key, {
          artist_id: p.artist_id,
          artist_name: p.artist_name,
          artist_image_url: p.artist_image_url,
          albums: [],
          newestPurchaseTs: 0,
        });
      }
      const group = byArtist.get(key);
      group.albums.push(p);
      const ts = new Date(p.created_at).getTime();
      if (ts > group.newestPurchaseTs) group.newestPurchaseTs = ts;
    }
    const groups = Array.from(byArtist.values());
    // Sort artist sections by newest purchase from that artist DESC.
    groups.sort((a, b) => b.newestPurchaseTs - a.newestPurchaseTs);
    // Within each artist, newest album first.
    for (const g of groups) {
      g.albums.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return groups;
  }, [purchases]);

  // On mount: if we're returning from Stripe success, refetch purchases
  // because the webhook may have just fired. Show the celebration banner.
  // Clear the URL param so a refresh doesn't keep flashing it.
  useEffect(() => {
    if (token && user) {
      dispatch(loadPurchases());
    }
    if (justPurchasedAlbumId != null) {
      setShowJustPurchased(true);
      const next = new URLSearchParams(searchParams);
      next.delete("purchased");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async (purchase) => {
    setDownloadingId(purchase.album_id);
    try {
      const res = await axiosInstance.get(`/albums/${purchase.album_id}/download`);
      const url = res.data?.url;
      if (!url) throw new Error("No download URL returned.");
      // Cloudinary signs with Content-Disposition: attachment, so navigating
      // triggers the save dialog without leaving the SPA.
      window.location.href = url;
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to start download."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  // Build a PlayerBar queue for the album the user clicked Play on, then
  // dispatch setQueue. Two paths:
  //   1. Album has tracks (new system) — list /albums/:id/tracks, parallel-
  //      fetch a stream URL for each track that has audio attached
  //   2. No tracks (back-compat single-file release) — fall back to the
  //      album-level /albums/:id/stream
  const handlePlay = async (purchase) => {
    setPlayLoadingId(purchase.album_id);
    try {
      const trackListRes = await axiosInstance.get(
        `/albums/${purchase.album_id}/tracks`
      );
      const album = trackListRes.data ?? {};
      const playableTracks = (album.tracks ?? []).filter((t) => t.has_audio);

      let queueItems = [];

      if (playableTracks.length > 0) {
        const streams = await Promise.all(
          playableTracks.map((t) =>
            axiosInstance
              .get(`/tracks/${t.track_id}/stream`)
              .then((r) => ({ track: t, stream: r.data }))
              .catch(() => null)
          )
        );
        queueItems = streams
          .filter(Boolean)
          .map(({ track, stream }) => ({
            track_id: track.track_id,
            album_id: purchase.album_id,
            position: track.position,
            title: track.title,
            audio_url: stream.url,
            artist_name: purchase.artist_name,
            album_image_url: purchase.album_image_url,
          }));
      } else {
        // Back-compat: one-file-per-release. Use the album-level stream.
        const streamRes = await axiosInstance.get(
          `/albums/${purchase.album_id}/stream`
        );
        queueItems = [
          {
            album_id: purchase.album_id,
            title: purchase.album_name,
            audio_url: streamRes.data?.url,
            artist_name: purchase.artist_name,
            album_image_url: purchase.album_image_url,
          },
        ].filter((t) => t.audio_url);
      }

      if (queueItems.length === 0) {
        toast.error("No playable audio on this album yet.");
        return;
      }

      dispatch(setQueue({ tracks: queueItems, startIndex: 0 }));
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to start playback."
      );
    } finally {
      setPlayLoadingId(null);
    }
  };

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.gate}>
          <h1>Your library</h1>
          <p>Log in to see the music you've bought.</p>
          <Link to="/login" className={styles.gateBtn}>Log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your library</h1>
        <p className={styles.subtitle}>
          {purchases?.length
            ? `${purchases.length} ${purchases.length === 1 ? "album" : "albums"} you own on stanbox.`
            : "Music you buy on stanbox lives here."}
        </p>
      </header>

      {showJustPurchased && (
        <div className={styles.flash}>
          <span className={styles.flashCheck}>✓</span>
          <div>
            <strong>Purchase complete.</strong>
            <span className={styles.flashSub}>
              {" "}
              {purchases?.some((p) => p.album_id === justPurchasedAlbumId)
                ? "Your album is ready to download."
                : "Stripe just confirmed the payment — give it a moment to land here."}
            </span>
          </div>
        </div>
      )}

      {(!purchases || purchases.length === 0) ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>You haven't bought any music yet.</p>
          <p className={styles.emptySub}>
            Find a verified artist's page and tap Buy on an album to start your library.
          </p>
          <Link to="/" className={styles.gateBtn}>Browse artists</Link>
        </div>
      ) : (
        <div className={styles.groupsWrap}>
          {artistGroups.map((group) => (
            <section key={group.artist_id} className={styles.artistGroup}>
              <Link
                to={`/artist/${group.artist_id}`}
                className={styles.artistHeader}
              >
                {group.artist_image_url ? (
                  <img
                    src={resolveImageUrl(group.artist_image_url)}
                    alt={group.artist_name}
                    className={styles.artistAvatar}
                  />
                ) : (
                  <span className={styles.artistAvatarFallback}>
                    {(group.artist_name?.[0] ?? "?").toUpperCase()}
                  </span>
                )}
                <span className={styles.artistName}>{group.artist_name}</span>
                <span className={styles.artistCount}>
                  {group.albums.length}{" "}
                  {group.albums.length === 1 ? "album" : "albums"}
                </span>
              </Link>

              <ul className={styles.list}>
                {group.albums.map((p) => {
                  const isDownloading = downloadingId === p.album_id;
                  const isPlayLoading = playLoadingId === p.album_id;
                  return (
                    <li key={p.id} className={styles.row}>
                      <img
                        src={resolveImageUrl(
                          p.album_image_url,
                          "https://via.placeholder.com/80?text=♪"
                        )}
                        alt={p.album_name}
                        className={styles.cover}
                      />
                      <div className={styles.meta}>
                        <span className={styles.albumName}>{p.album_name}</span>
                        <span className={styles.albumSub}>
                          {p.year ? <span>{p.year} · </span> : null}
                          Bought {formatDate(p.created_at)}
                          {p.audio_format
                            ? ` · ${p.audio_format.toUpperCase()}`
                            : ""}
                        </span>
                      </div>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.playBtn}
                          onClick={() => handlePlay(p)}
                          disabled={isPlayLoading || isDownloading}
                          aria-label={`Play ${p.album_name}`}
                        >
                          {isPlayLoading ? "…" : "▶"}
                        </button>
                        <button
                          type="button"
                          className={styles.downloadBtn}
                          onClick={() => handleDownload(p)}
                          disabled={isDownloading || isPlayLoading}
                        >
                          {isDownloading ? "Preparing…" : "Download"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;
