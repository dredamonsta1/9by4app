import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./YourMusic.module.css";

// Pillar B self-serve: artists set price + upload audio for their own albums
// without the admin in the loop. Renders inside ArtistSettings for verified
// artists; replaces the admin-paste-public_id flow on the artist side.

const CLOUDINARY_WIDGET_SRC = "https://upload-widget.cloudinary.com/global/all.js";
const PRICE_FLOOR_CENTS = 999;
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

const dollarsToCents = (str) => {
  const n = parseFloat(str);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
};

const centsToDollars = (cents) =>
  cents == null ? "" : (cents / 100).toFixed(2);

// Idempotent script loader for the Cloudinary upload widget. Multiple
// invocations resolve to the same Promise (no duplicate <script> tags).
let widgetScriptPromise = null;
function loadCloudinaryWidgetScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.cloudinary?.createUploadWidget) return Promise.resolve();
  if (widgetScriptPromise) return widgetScriptPromise;

  widgetScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CLOUDINARY_WIDGET_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      widgetScriptPromise = null;
      reject(new Error("Failed to load Cloudinary upload widget."));
    };
    document.body.appendChild(script);
  });
  return widgetScriptPromise;
}

const YourMusic = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Per-album working form state keyed by album_id: { price_dollars,
  // download_enabled, audio_cloudinary_public_id, audio_format, dirty }
  const [forms, setForms] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const widgetRef = useRef(null);

  // Preload the Cloudinary widget script in the background once the component
  // mounts. Fire-and-forget — the upload click waits for it explicitly too.
  useEffect(() => {
    loadCloudinaryWidgetScript().catch(() => {});
  }, []);

  const seedFormsFromAlbums = useCallback((rows) => {
    const next = {};
    for (const a of rows) {
      next[a.album_id] = {
        price_dollars: centsToDollars(a.price_cents),
        download_enabled: !!a.download_enabled,
        audio_cloudinary_public_id: a.audio_cloudinary_public_id ?? "",
        audio_format: a.audio_format ?? "mp3",
        dirty: false,
      };
    }
    setForms(next);
  }, []);

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/artists/me/albums");
      const rows = res.data?.albums ?? [];
      setAlbums(rows);
      seedFormsFromAlbums(rows);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your albums.");
    } finally {
      setLoading(false);
    }
  }, [seedFormsFromAlbums]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const updateForm = (albumId, patch) => {
    setForms((prev) => ({
      ...prev,
      [albumId]: { ...prev[albumId], ...patch, dirty: true },
    }));
  };

  const openCloudinaryWidget = async (album) => {
    setUploadingId(album.album_id);
    try {
      await loadCloudinaryWidgetScript();
      const sigRes = await axiosInstance.post(
        "/artists/me/cloudinary/audio-signature",
        { album_id: album.album_id }
      );
      const sig = sigRes.data;

      // Close any previously opened widget before re-creating.
      if (widgetRef.current) {
        try { widgetRef.current.destroy(); } catch {}
        widgetRef.current = null;
      }

      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: sig.cloud_name,
          apiKey: sig.api_key,
          uploadSignature: sig.signature,
          uploadSignatureTimestamp: sig.timestamp,
          folder: sig.folder,
          resourceType: sig.resource_type, // 'video' covers audio in Cloudinary
          type: sig.type,                   // 'authenticated'
          sources: ["local"],
          multiple: false,
          maxFileSize: MAX_FILE_SIZE_BYTES,
          clientAllowedFormats: ["mp3", "wav", "flac"],
          showSkipCropButton: false,
          showUploadMoreButton: false,
          styles: {
            palette: {
              window: "#1a1a1a",
              sourceBg: "#222",
              windowBorder: "#444",
              tabIcon: "#fff",
              menuIcons: "#bbb",
              textDark: "#fff",
              textLight: "#bbb",
              link: "#4ade80",
              action: "#4ade80",
              inactiveTabIcon: "#888",
              error: "#ff7a7a",
              inProgress: "#4ade80",
              complete: "#4ade80",
            },
          },
        },
        (err, result) => {
          if (err) {
            // Cloudinary surfaces validation failures (signature, format, size)
            // via this callback before opening the file picker, so the widget
            // does the user-facing error UX for us. Reset our spinner only.
            setUploadingId(null);
            if (result?.statusText !== "User closed widget") {
              console.error("Cloudinary upload error:", err, result);
              toast.error("Upload failed. Please try again.");
            }
            return;
          }
          if (result?.event === "success") {
            const info = result.info;
            // info.format is something like 'mp3' / 'wav' / 'flac'.
            updateForm(album.album_id, {
              audio_cloudinary_public_id: info.public_id,
              audio_format: (info.format || "mp3").toLowerCase(),
            });
            toast.success(`"${album.album_name}" audio uploaded. Save to publish.`);
            setUploadingId(null);
          }
          if (result?.event === "abort" || result?.event === "close") {
            setUploadingId(null);
          }
        }
      );
      widgetRef.current = widget;
      widget.open();
    } catch (err) {
      console.error("openCloudinaryWidget error:", err);
      toast.error(
        err.response?.data?.message || "Failed to start upload."
      );
      setUploadingId(null);
    }
  };

  const handleSave = async (album) => {
    const form = forms[album.album_id];
    if (!form) return;

    // Client-side price validation. Server enforces the same; this is just
    // for a faster error surface.
    const priceCents =
      form.price_dollars === "" ? null : dollarsToCents(form.price_dollars);
    if (priceCents != null && (!Number.isInteger(priceCents) || priceCents < PRICE_FLOOR_CENTS)) {
      toast.error(`Price must be at least $${(PRICE_FLOOR_CENTS / 100).toFixed(2)} or blank.`);
      return;
    }

    const payload = {
      price_cents: priceCents,
      download_enabled: form.download_enabled,
      audio_cloudinary_public_id: form.audio_cloudinary_public_id?.trim() || null,
      audio_format: form.audio_format || "mp3",
    };

    setSavingId(album.album_id);
    try {
      const res = await axiosInstance.patch(
        `/artists/me/albums/${album.album_id}/commerce`,
        payload
      );
      const updated = res.data?.album;
      setAlbums((prev) =>
        prev.map((a) => (a.album_id === updated.album_id ? { ...a, ...updated } : a))
      );
      setForms((prev) => ({
        ...prev,
        [album.album_id]: {
          price_dollars: centsToDollars(updated.price_cents),
          download_enabled: !!updated.download_enabled,
          audio_cloudinary_public_id: updated.audio_cloudinary_public_id ?? "",
          audio_format: updated.audio_format ?? "mp3",
          dirty: false,
        },
      }));
      toast.success(`"${updated.album_name}" saved.`);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save."
      );
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Your music</h2>
        <p className={styles.muted}>Loading your albums…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Your music</h2>
        <p className={styles.error}>{error}</p>
        <button type="button" className={styles.linkBtn} onClick={fetchAlbums}>
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Your music</h2>
      <p className={styles.help}>
        Set a price, upload your audio, and flip <strong>Downloads enabled</strong>{" "}
        to put an album on sale. Fans see the Buy button on your artist page.
      </p>

      {albums.length === 0 ? (
        <p className={styles.muted}>No albums in your catalog yet.</p>
      ) : (
        <ul className={styles.list}>
          {albums.map((a) => {
            const form = forms[a.album_id] ?? {};
            const isUploading = uploadingId === a.album_id;
            const isSaving = savingId === a.album_id;
            const hasAudio = !!form.audio_cloudinary_public_id;
            const onSale = !!(a.price_cents && a.download_enabled && a.audio_cloudinary_public_id);

            return (
              <li key={a.album_id} className={styles.row}>
                <img
                  src={resolveImageUrl(a.album_image_url, "https://via.placeholder.com/64?text=♪")}
                  alt={a.album_name}
                  className={styles.cover}
                />
                <div className={styles.rowMain}>
                  <div className={styles.rowHeader}>
                    <span className={styles.albumName}>{a.album_name}</span>
                    <span className={styles.year}>{a.year ?? "—"}</span>
                    {onSale && <span className={styles.badgeOnSale}>On sale</span>}
                    {!onSale && hasAudio && (
                      <span className={styles.badgeDraft}>Audio uploaded</span>
                    )}
                  </div>

                  <div className={styles.rowControls}>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Price (USD)</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        className={styles.input}
                        placeholder="9.99"
                        value={form.price_dollars ?? ""}
                        onChange={(e) =>
                          updateForm(a.album_id, { price_dollars: e.target.value })
                        }
                      />
                    </label>

                    <button
                      type="button"
                      className={styles.uploadBtn}
                      onClick={() => openCloudinaryWidget(a)}
                      disabled={isUploading}
                    >
                      {isUploading
                        ? "Opening…"
                        : hasAudio
                        ? "Replace audio"
                        : "Upload audio"}
                    </button>

                    <label className={styles.toggleRow}>
                      <input
                        type="checkbox"
                        checked={!!form.download_enabled}
                        onChange={(e) =>
                          updateForm(a.album_id, { download_enabled: e.target.checked })
                        }
                      />
                      <span>Downloads enabled</span>
                    </label>

                    <button
                      type="button"
                      className={styles.saveBtn}
                      onClick={() => handleSave(a)}
                      disabled={isSaving || !form.dirty}
                    >
                      {isSaving ? "Saving…" : form.dirty ? "Save" : "Saved"}
                    </button>
                  </div>

                  {hasAudio && (
                    <span className={styles.audioSummary}>
                      Audio: {form.audio_format?.toUpperCase()} ·{" "}
                      <code>{form.audio_cloudinary_public_id}</code>
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default YourMusic;
