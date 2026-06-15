import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import {
  loadCloudinaryWidgetScript,
  STANBOX_WIDGET_PALETTE,
} from "../../utils/cloudinaryUploadWidget";
import styles from "./TrackList.module.css";

// Per-album track editor. Mounts inside YourMusic when an artist clicks
// "Manage tracks" on an album row. Adds, renames, reorders, and removes
// tracks; each track can have its own audio file uploaded via the same
// Cloudinary upload widget pattern (now namespaced per-track via the
// track_id param on the audio-signature endpoint).

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

const TrackList = ({ album }) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forms, setForms] = useState({}); // trackId -> { title, position, audio_*, dirty }
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [reorderingId, setReorderingId] = useState(null);
  const widgetRef = useRef(null);

  // Add-new-track form (separate from per-row edit state).
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCloudinaryWidgetScript().catch(() => {});
  }, []);

  const seedForms = useCallback((rows) => {
    const next = {};
    for (const t of rows) {
      next[t.track_id] = {
        title: t.title,
        position: t.position,
        audio_cloudinary_public_id: t.audio_cloudinary_public_id ?? "",
        audio_format: t.audio_format ?? "mp3",
        dirty: false,
      };
    }
    setForms(next);
  }, []);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `/artists/me/albums/${album.album_id}/tracks`
      );
      const rows = res.data?.tracks ?? [];
      setTracks(rows);
      seedForms(rows);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tracks.");
    } finally {
      setLoading(false);
    }
  }, [album.album_id, seedForms]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const updateForm = (trackId, patch) => {
    setForms((prev) => ({
      ...prev,
      [trackId]: { ...prev[trackId], ...patch, dirty: true },
    }));
  };

  // --- Create a new track ---
  const handleCreate = async (e) => {
    e?.preventDefault?.();
    const title = newTitle.trim();
    if (!title) {
      toast.error("Track title is required.");
      return;
    }
    setCreating(true);
    try {
      const res = await axiosInstance.post(
        `/artists/me/albums/${album.album_id}/tracks`,
        { title }
      );
      const created = res.data?.track;
      if (created) {
        setTracks((prev) => [...prev, created]);
        setForms((prev) => ({
          ...prev,
          [created.track_id]: {
            title: created.title,
            position: created.position,
            audio_cloudinary_public_id: "",
            audio_format: "mp3",
            dirty: false,
          },
        }));
      }
      setNewTitle("");
      toast.success(`Added "${title}".`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create track."
      );
    } finally {
      setCreating(false);
    }
  };

  // --- Save a per-row edit (PATCH) ---
  const handleSave = async (track) => {
    const form = forms[track.track_id];
    if (!form) return;
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setSavingId(track.track_id);
    try {
      const payload = {
        title: form.title.trim(),
        audio_cloudinary_public_id:
          form.audio_cloudinary_public_id?.trim() || null,
        audio_format: form.audio_format || "mp3",
      };
      const res = await axiosInstance.patch(
        `/artists/me/tracks/${track.track_id}`,
        payload
      );
      const updated = res.data?.track;
      if (updated) {
        setTracks((prev) =>
          prev.map((t) => (t.track_id === updated.track_id ? updated : t))
        );
        setForms((prev) => ({
          ...prev,
          [updated.track_id]: {
            title: updated.title,
            position: updated.position,
            audio_cloudinary_public_id: updated.audio_cloudinary_public_id ?? "",
            audio_format: updated.audio_format ?? "mp3",
            dirty: false,
          },
        }));
        toast.success(`Saved "${updated.title}".`);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to save."
      );
    } finally {
      setSavingId(null);
    }
  };

  // --- Reorder (up/down arrows) — swaps positions with the neighbour via
  // PATCH /me/tracks/:id { position }. Requires careful sequencing so we
  // don't hit the (album_id, position) unique constraint mid-swap.
  const handleMove = async (track, direction) => {
    const idx = tracks.findIndex((t) => t.track_id === track.track_id);
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= tracks.length) return;
    const neighbour = tracks[targetIdx];

    setReorderingId(track.track_id);
    try {
      // Park the neighbour at a temp position outside the active range
      // (max + 1000) so the swap doesn't collide.
      const maxPos = tracks.reduce((m, t) => Math.max(m, t.position), 0);
      const parkPos = maxPos + 1000;

      await axiosInstance.patch(`/artists/me/tracks/${neighbour.track_id}`, {
        position: parkPos,
      });
      await axiosInstance.patch(`/artists/me/tracks/${track.track_id}`, {
        position: neighbour.position,
      });
      const finalRes = await axiosInstance.patch(
        `/artists/me/tracks/${neighbour.track_id}`,
        { position: track.position }
      );
      // Local reorder.
      const movedTrack = { ...track, position: neighbour.position };
      const movedNeighbour = {
        ...neighbour,
        position: finalRes.data?.track?.position ?? track.position,
      };
      const next = [...tracks];
      next[idx] = movedNeighbour;
      next[targetIdx] = movedTrack;
      next.sort((a, b) => a.position - b.position);
      setTracks(next);
      seedForms(next);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to reorder."
      );
      // Fallback to a server-truth refresh.
      fetchTracks();
    } finally {
      setReorderingId(null);
    }
  };

  // --- Delete ---
  const handleDelete = async (track) => {
    if (!window.confirm(`Delete "${track.title}"?`)) return;
    setDeletingId(track.track_id);
    try {
      await axiosInstance.delete(`/artists/me/tracks/${track.track_id}`);
      setTracks((prev) => prev.filter((t) => t.track_id !== track.track_id));
      setForms((prev) => {
        const next = { ...prev };
        delete next[track.track_id];
        return next;
      });
      toast.success(`Deleted "${track.title}".`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // --- Upload audio for one track via Cloudinary widget, scoped to
  // audio/<artist>/<album>/<track>/ via the track_id param on the
  // signature endpoint. ---
  const openWidget = async (track) => {
    setUploadingId(track.track_id);
    try {
      await loadCloudinaryWidgetScript();
      const sigRes = await axiosInstance.post(
        "/artists/me/cloudinary/audio-signature",
        { album_id: album.album_id, track_id: track.track_id }
      );
      const sig = sigRes.data;

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
          uploadPreset: sig.upload_preset,
          folder: sig.folder,
          sources: ["local"],
          multiple: false,
          maxFileSize: MAX_FILE_SIZE_BYTES,
          clientAllowedFormats: ["mp3", "wav", "flac"],
          showSkipCropButton: false,
          showUploadMoreButton: false,
          styles: { palette: STANBOX_WIDGET_PALETTE },
        },
        (err, result) => {
          if (err) {
            setUploadingId(null);
            if (result?.statusText !== "User closed widget") {
              console.error("Cloudinary upload error:", err, result);
              toast.error("Upload failed. Please try again.");
            }
            return;
          }
          if (result?.event === "success") {
            const info = result.info;
            updateForm(track.track_id, {
              audio_cloudinary_public_id: info.public_id,
              audio_format: (info.format || "mp3").toLowerCase(),
            });
            toast.success(
              `"${track.title}" audio uploaded. Save to publish.`
            );
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
      console.error("openWidget error:", err);
      toast.error(
        err.response?.data?.message || "Failed to start upload."
      );
      setUploadingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <span className={styles.headingText}>Tracks</span>
        <span className={styles.headingCount}>
          {tracks.length === 0
            ? "none yet"
            : `${tracks.length} ${tracks.length === 1 ? "track" : "tracks"}`}
        </span>
      </div>

      {loading ? (
        <p className={styles.muted}>Loading tracks…</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : tracks.length === 0 ? (
        <p className={styles.muted}>
          No tracks yet. Add the first one below.
        </p>
      ) : (
        <ul className={styles.list}>
          {tracks.map((t, idx) => {
            const form = forms[t.track_id] ?? {};
            const isSaving = savingId === t.track_id;
            const isUploading = uploadingId === t.track_id;
            const isDeleting = deletingId === t.track_id;
            const isReordering = reorderingId === t.track_id;
            const hasAudio = !!form.audio_cloudinary_public_id;
            const disabled = isSaving || isDeleting || isReordering || isUploading;

            return (
              <li key={t.track_id} className={styles.row}>
                <div className={styles.positionBlock}>
                  <span className={styles.positionNum}>{t.position}</span>
                  <div className={styles.posArrows}>
                    <button
                      type="button"
                      className={styles.arrowBtn}
                      onClick={() => handleMove(t, "up")}
                      disabled={disabled || idx === 0}
                      title="Move up"
                    >
                      ▴
                    </button>
                    <button
                      type="button"
                      className={styles.arrowBtn}
                      onClick={() => handleMove(t, "down")}
                      disabled={disabled || idx === tracks.length - 1}
                      title="Move down"
                    >
                      ▾
                    </button>
                  </div>
                </div>

                <div className={styles.titleBlock}>
                  <input
                    type="text"
                    className={styles.input}
                    value={form.title ?? ""}
                    onChange={(e) =>
                      updateForm(t.track_id, { title: e.target.value })
                    }
                    placeholder="Track title"
                    maxLength={255}
                    disabled={disabled}
                  />
                  {hasAudio && (
                    <span className={styles.audioSummary}>
                      Audio: {form.audio_format?.toUpperCase()} ·{" "}
                      <code>{form.audio_cloudinary_public_id}</code>
                    </span>
                  )}
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.uploadBtn}
                    onClick={() => openWidget(t)}
                    disabled={disabled}
                  >
                    {isUploading
                      ? "Opening…"
                      : hasAudio
                      ? "Replace audio"
                      : "Upload audio"}
                  </button>
                  <button
                    type="button"
                    className={styles.saveBtn}
                    onClick={() => handleSave(t)}
                    disabled={disabled || !form.dirty}
                  >
                    {isSaving ? "Saving…" : form.dirty ? "Save" : "Saved"}
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(t)}
                    disabled={disabled}
                    title="Delete track"
                  >
                    ×
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form className={styles.addForm} onSubmit={handleCreate}>
        <input
          type="text"
          className={styles.addInput}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New track title"
          maxLength={255}
          disabled={creating}
        />
        <button
          type="submit"
          className={styles.addBtn}
          disabled={creating || !newTitle.trim()}
        >
          {creating ? "Adding…" : "Add track"}
        </button>
      </form>
    </div>
  );
};

export default TrackList;
