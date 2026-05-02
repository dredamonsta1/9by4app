import { useState, useRef, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./AlbumPreviewButton.css";

// Singleton — only one album preview plays at a time across the whole app
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

export default function AlbumPreviewButton({ artistId, albumName }) {
  const [status, setStatus] = useState("idle"); // idle | loading | playing | error
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

    audio.play()
      .then(() => setStatus("playing"))
      .catch(() => setStatus("error"));
  };

  const handleClick = async (e) => {
    e.stopPropagation();

    if (status === "playing") {
      audioRef.current?.pause();
      setStatus("idle");
      setProgress(0);
      activeAudio = null;
      activeStop = null;
      return;
    }

    stopActivePreview();
    setStatus("loading");

    try {
      const res = await axiosInstance.get(
        `/artists/${artistId}/preview`,
        { params: { album: albumName } }
      );
      startAudio(res.data.preview_url);
    } catch {
      setStatus("error");
    }
  };

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

  return (
    <div className="apb-wrap">
      <button
        className={`apb-btn ${status === "playing" ? "apb-playing" : ""}`}
        onClick={handleClick}
        aria-label={status === "playing" ? "Stop preview" : "Preview album"}
        title={status === "playing" ? "Stop preview" : "Preview album"}
      >
        {status === "loading" ? (
          <span className="apb-spinner" />
        ) : status === "playing" ? (
          "⏸"
        ) : (
          "♪"
        )}
      </button>
      {status === "playing" && (
        <div className="apb-progress">
          <div className="apb-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
