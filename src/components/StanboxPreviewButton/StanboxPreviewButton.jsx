import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { setQueue } from "../../redux/playerSlice";
import styles from "./StanboxPreviewButton.module.css";

// Per-album preview button for verified-artist albums on the artist modal.
// Clicking fetches /api/albums/:id/preview (public, no auth) and queues the
// 30-second clip into PlayerBar. Distinct from the legacy AlbumPreviewButton
// which serves Deezer-cached previews for the broader catalog — this one is
// strictly for stanbox-uploaded audio.
const StanboxPreviewButton = ({ album, artist }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // Try stanbox-uploaded audio first; if the artist hasn't uploaded a
  // preview for this release (404), fall back to the Deezer cache so
  // older catalog entries still play even without a self-serve upload.
  const queueStanbox = (data) =>
    dispatch(
      setQueue({
        tracks: [
          {
            album_id: album.album_id,
            track_id: data.source_track_id ?? undefined,
            title: data.album_name ? `${data.album_name} · preview` : "Preview",
            audio_url: data.url,
            artist_name: artist?.artist_name ?? null,
            album_image_url:
              data.album_image_url ?? album.album_image_url ?? null,
          },
        ],
        startIndex: 0,
      }),
    );

  const queueDeezer = (data) =>
    dispatch(
      setQueue({
        tracks: [
          {
            album_id: album.album_id,
            title: data.track_name
              ? `${data.track_name} · preview`
              : `${album.album_name} · preview`,
            audio_url: data.preview_url,
            artist_name: artist?.artist_name ?? null,
            album_image_url:
              data.album_art_url ?? album.album_image_url ?? null,
          },
        ],
        startIndex: 0,
      }),
    );

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/albums/${album.album_id}/preview`);
      const data = res.data ?? {};
      if (!data.url) throw new Error("No preview URL returned.");
      queueStanbox(data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404 && artist?.artist_id && album?.album_name) {
        // Stanbox upload missing — try Deezer for this album.
        try {
          const fallback = await axiosInstance.get(
            `/artists/${artist.artist_id}/preview`,
            { params: { album: album.album_name } },
          );
          if (fallback.data?.preview_url) {
            queueDeezer(fallback.data);
            return;
          }
        } catch {
          // Deezer also has nothing — fall through to the 404 toast.
        }
        toast.info("No preview is available for this release yet.");
      } else {
        toast.error(
          err?.response?.data?.message || "Couldn't start the preview.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={handleClick}
      disabled={loading}
      aria-label={`Preview ${album.album_name}`}
    >
      {loading ? "…" : "▶ Preview"}
    </button>
  );
};

export default StanboxPreviewButton;
