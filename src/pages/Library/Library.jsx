import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { loadPurchases } from "../../redux/actions/authActions";
import { resolveImageUrl } from "../../utils/imageUrl";
import CorsTestPanel from "../../components/CorsTestPanel/CorsTestPanel";
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
  const [showJustPurchased, setShowJustPurchased] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const justPurchasedAlbumId = useMemo(() => {
    const raw = searchParams.get("purchased");
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isInteger(n) ? n : null;
  }, [searchParams]);

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
        <ul className={styles.list}>
          {purchases.map((p) => {
            const isDownloading = downloadingId === p.album_id;
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
                  <Link to={`/artist/${p.artist_id}`} className={styles.artistLink}>
                    {p.artist_name}
                    {p.year ? <span className={styles.muted}> · {p.year}</span> : null}
                  </Link>
                  <span className={styles.purchasedAt}>
                    Bought {formatDate(p.created_at)}
                    {p.audio_format ? ` · ${p.audio_format.toUpperCase()}` : ""}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.downloadBtn}
                  onClick={() => handleDownload(p)}
                  disabled={isDownloading}
                >
                  {isDownloading ? "Preparing…" : "Download"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setShowDebug((s) => !s)}
        style={{
          marginTop: "2rem",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "#888",
          borderRadius: "999px",
          padding: "0.35rem 0.85rem",
          fontSize: "0.78rem",
          cursor: "pointer",
          alignSelf: "flex-start",
        }}
      >
        {showDebug ? "Hide" : "Show"} Web Audio debug
      </button>
      {showDebug && <CorsTestPanel />}
    </div>
  );
};

export default Library;
