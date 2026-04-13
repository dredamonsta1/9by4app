// src/components/PlayerBar/PlayerBar.tsx
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { nextTrack, prevTrack, togglePlay, setPlaying, clearPlayer } from "../../redux/playerSlice";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./PlayerBar.module.css";

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const PlayerBar = () => {
  const dispatch = useDispatch();
  const { queue, currentIndex, isPlaying } = useSelector((s: RootState) => s.player);
  const track = queue[currentIndex] ?? null;

  const audioRef  = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking,  setSeeking]  = useState(false);

  // Swap src when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.src = track.audio_url;
    audio.load();
    if (isPlaying) audio.play().catch(() => {});
  }, [track?.post_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTimeUpdate = () => {
    if (!seeking) setCurrent(audioRef.current?.currentTime ?? 0);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current?.duration ?? 0);
  };

  const handleEnded = () => {
    if (currentIndex < queue.length - 1) dispatch(nextTrack());
    else dispatch(setPlaying(false));
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrent(Number(e.target.value));
  };

  const handleSeekCommit = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    if (audioRef.current) audioRef.current.currentTime = current;
    setSeeking(false);
  };

  if (!track) return null;

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className={styles.bar}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Track info */}
      <div className={styles.trackInfo}>
        {track.album_image_url ? (
          <img
            src={resolveImageUrl(track.album_image_url)}
            alt={track.title ?? ""}
            className={styles.thumb}
          />
        ) : (
          <div className={styles.thumbPlaceholder}>♪</div>
        )}
        <div className={styles.meta}>
          <span className={styles.title}>{track.title || "Untitled"}</span>
          <span className={styles.username}>{track.username}</span>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={() => dispatch(prevTrack())}
          disabled={currentIndex === 0}
          aria-label="Previous"
        >
          ⏮
        </button>
        <button
          className={`${styles.btn} ${styles.playBtn}`}
          onClick={() => dispatch(togglePlay())}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button
          className={styles.btn}
          onClick={() => dispatch(nextTrack())}
          disabled={currentIndex >= queue.length - 1}
          aria-label="Next"
        >
          ⏭
        </button>
      </div>

      {/* Seek bar */}
      <div className={styles.seekWrap}>
        <span className={styles.time}>{fmt(current)}</span>
        <input
          type="range"
          className={styles.seek}
          min={0}
          max={duration || 100}
          step={0.1}
          value={current}
          onChange={handleSeekChange}
          onMouseDown={() => setSeeking(true)}
          onMouseUp={handleSeekCommit}
          onTouchStart={() => setSeeking(true)}
          onTouchEnd={handleSeekCommit}
          style={{ "--progress": `${progress}%` } as React.CSSProperties}
        />
        <span className={styles.time}>{fmt(duration)}</span>
      </div>

      {/* Close */}
      <button
        className={styles.closeBtn}
        onClick={() => dispatch(clearPlayer())}
        aria-label="Close player"
      >
        ✕
      </button>
    </div>
  );
};

export default PlayerBar;
