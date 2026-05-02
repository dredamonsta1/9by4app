import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./ArtistPreviewPlayer.css";

// Module-level singleton — only one preview plays at a time across all modals
let activeAudio = null;
let activeStop = null;

function stopActivePreview() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  if (activeStop) activeStop();
  activeAudio = null;
  activeStop = null;
}

export default function ArtistPreviewPlayer({ artistId, onPlayStart }) {
  const [status, setStatus] = useState("idle"); // idle | loading | playing | error
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const startAudio = (url) => {
    const audio = new Audio(url);
    audioRef.current = audio;
    activeAudio = audio;
    activeStop = () => {
      setStatus("idle");
      setProgress(0);
    };

    audio.ontimeupdate = () => {
      const duration = audio.duration || 30;
      setProgress((audio.currentTime / duration) * 100);
    };
    audio.onended = () => {
      setStatus("idle");
      setProgress(0);
      activeAudio = null;
      activeStop = null;
    };
    audio.onerror = () => {
      setStatus("error");
      activeAudio = null;
      activeStop = null;
    };

    audio.play().then(() => {
      setStatus("playing");
      onPlayStart?.();
    }).catch(() => setStatus("error"));
  };

  const handlePlay = async () => {
    if (status === "playing") {
      audioRef.current?.pause();
      setStatus("idle");
      setProgress(0);
      activeAudio = null;
      activeStop = null;
      return;
    }

    stopActivePreview();

    if (preview) {
      startAudio(preview.preview_url);
      return;
    }

    setStatus("loading");
    try {
      const res = await axiosInstance.get(`/artists/${artistId}/preview`);
      setPreview(res.data);
      startAudio(res.data.preview_url);
    } catch {
      setStatus("error");
    }
  };

  // Stop and clean up when modal unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.ontimeupdate = null;
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        if (activeAudio === audioRef.current) {
          activeAudio = null;
          activeStop = null;
        }
      }
    };
  }, []);

  if (status === "error") return null;

  const thumbSrc = preview?.album_art_url;
  const trackName = preview?.track_name;
  const albumName = preview?.album_name;

  return (
    <div className="artist-preview-player">
      <button
        className={`app-thumb-wrap ${status === "playing" ? "app-playing" : ""}`}
        onClick={handlePlay}
        aria-label={status === "playing" ? "Pause preview" : "Play preview"}
      >
        {thumbSrc ? (
          <img src={thumbSrc} alt={albumName} className="app-thumb" />
        ) : (
          <div className="app-thumb-placeholder" />
        )}
        <span className="app-play-icon">
          {status === "loading" ? (
            <span className="app-spinner" />
          ) : status === "playing" ? (
            "⏸"
          ) : (
            "▶"
          )}
        </span>
      </button>

      <div className="app-meta">
        <span className="app-track-name">
          {trackName ?? (status === "loading" ? "Loading…" : "Play preview")}
        </span>
        {albumName && (
          <span className="app-album-name">from {albumName}</span>
        )}
        <span className="app-provider-badge">via Deezer</span>
      </div>

      <div className="app-progress-bar">
        <div
          className="app-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
