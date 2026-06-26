// src/components/PlayerBar/PlayerBar.tsx
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../redux/store";
import { nextTrack, prevTrack, togglePlay, setPlaying, clearPlayer } from "../../redux/playerSlice";
import axiosInstance from "../../utils/axiosInstance";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./PlayerBar.module.css";

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

// Visualizer tuning. fftSize=128 → 64 frequency bins. We render BAR_COUNT
// bars across the canvas, sampling evenly from the bins. Higher BAR_COUNT
// looks denser; higher fftSize gives sharper frequency resolution.
const VIS_BAR_COUNT = 32;
const VIS_FFT_SIZE = 128;

const PlayerBar = () => {
  const dispatch = useDispatch();
  const { queue, currentIndex, isPlaying } = useSelector((s: RootState) => s.player);
  const track = queue[currentIndex] ?? null;

  const audioRef  = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking,  setSeeking]  = useState(false);

  // Timestamped-comment state. `frozenAt` snapshots the playback
  // position at the moment the user opens the input so the comment's
  // timestamp doesn't drift forward while they type. Submitting POSTs
  // to /api/song-comments which writes an auto-post on the feed —
  // replies thread on top of that post.
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSending, setCommentSending] = useState(false);
  const [frozenAt, setFrozenAt] = useState(0);
  // Existing comments on the current track, used to render markers
  // along the seek bar.
  const [markers, setMarkers] = useState<
    Array<{ id: number; timestamp_seconds: number; content: string; username: string }>
  >([]);
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);

  // Any stable id qualifies as a comment anchor. Backend resolves
  // context via track_id -> album_id -> post_id, so preview clips
  // (which only carry album_id) still get a meaningful embed.
  const canComment = !!(track?.post_id || track?.track_id || track?.album_id);

  // Close the input on track change so a comment can't get pinned to
  // the wrong song after a skip.
  useEffect(() => {
    setCommentOpen(false);
    setCommentText("");
  }, [track?.post_id, track?.track_id, track?.album_id]);

  // Pull existing comments for the current track so the seek bar can
  // render markers at their timestamps. Prefer track_id when set (most
  // precise) then album_id (covers previews), then post_id. Album-id
  // also catches per-track comments via the backend's JOIN.
  useEffect(() => {
    let active = true;
    setMarkers([]);
    if (!track) return;
    let url: string | null = null;
    if (track.track_id) url = `/song-comments/track/${track.track_id}`;
    else if (track.album_id) url = `/song-comments/album/${track.album_id}`;
    else if (track.post_id) url = `/song-comments/post/${track.post_id}`;
    if (!url) return;
    axiosInstance
      .get(url)
      .then((res) => {
        if (active) setMarkers(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [track?.post_id, track?.track_id, track?.album_id]);

  // Re-pull markers after the user posts a new comment so their own
  // marker appears without a track switch.
  const refreshMarkers = () => {
    if (!track) return;
    let url: string | null = null;
    if (track.track_id) url = `/song-comments/track/${track.track_id}`;
    else if (track.album_id) url = `/song-comments/album/${track.album_id}`;
    else if (track.post_id) url = `/song-comments/post/${track.post_id}`;
    if (!url) return;
    axiosInstance
      .get(url)
      .then((res) => setMarkers(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  };

  const handleMarkerClick = (timestamp: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timestamp;
      setCurrent(timestamp);
    }
  };

  const openComment = () => {
    if (!canComment) return;
    setFrozenAt(audioRef.current?.currentTime ?? 0);
    setCommentOpen(true);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = commentText.trim();
    if (!content || commentSending || !canComment) return;
    setCommentSending(true);
    try {
      await axiosInstance.post("/song-comments", {
        post_id:           track?.post_id ?? undefined,
        track_id:          track?.track_id ?? undefined,
        album_id:          track?.album_id ?? undefined,
        timestamp_seconds: Math.floor(frozenAt),
        content,
      });
      toast.success(`Comment posted at ${fmt(frozenAt)}.`);
      setCommentText("");
      setCommentOpen(false);
      refreshMarkers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't post comment.");
    } finally {
      setCommentSending(false);
    }
  };

  // --- Web Audio API visualizer wiring ---
  // AudioContext + the chain (source → analyser → destination) are created
  // ONCE per audio element. createMediaElementSource can't be called twice
  // on the same <audio>, so we track which element is currently wired and
  // tear down + rebuild only if the element actually changes (e.g. on
  // close-and-reopen).
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const wiredAudioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Swap src when the active track changes. Depending on `track` (a new
  // object ref each time queue/currentIndex change) covers music posts,
  // album tracks, and album-level back-compat audio uniformly.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.src = track.audio_url;
    audio.load();
    if (isPlaying) audio.play().catch(() => {});
  }, [track]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lazily build the Web Audio graph when audio is about to play. Wraps in
  // try/catch because browsers may throw if the audio source isn't yet CORS
  // tainted-clean (we set crossOrigin="anonymous" + Cloudinary sends
  // Access-Control-Allow-Origin: *, so this should hold for our streams).
  const ensureAudioGraph = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audioCtxRef.current && wiredAudioRef.current === audio) return;

    // Different element than the one we wired previously — tear down first.
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      try { sourceRef.current?.disconnect(); } catch {}
      try { analyserRef.current?.disconnect(); } catch {}
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
      sourceRef.current = null;
      analyserRef.current = null;
    }

    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new Ctx();
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = VIS_FFT_SIZE;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      sourceRef.current = source;
      analyserRef.current = analyser;
      wiredAudioRef.current = audio;
    } catch (err) {
      console.error("PlayerBar visualizer init failed:", err);
    }
  };

  const drawBars = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) {
      rafRef.current = null;
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = null;
      return;
    }

    const buf = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(buf);

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    const barW = width / VIS_BAR_COUNT;
    for (let i = 0; i < VIS_BAR_COUNT; i++) {
      const v = buf[Math.floor((i / VIS_BAR_COUNT) * buf.length)] / 255;
      const barH = Math.max(2, v * height);
      ctx.fillStyle = `hsl(${140 + v * 80}, 70%, ${30 + v * 35}%)`;
      ctx.fillRect(i * barW, height - barH, Math.max(1, barW - 1), barH);
    }
    rafRef.current = requestAnimationFrame(drawBars);
  };

  // Visualizer lifecycle: start the rAF loop when playing, stop on pause.
  useEffect(() => {
    if (!isPlaying || !track) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    ensureAudioGraph();
    // Modern browsers may keep the context suspended until a user gesture
    // resumes it — togglePlay click is a gesture, but the play that follows
    // a track change may not be, so resume defensively.
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(drawBars);
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, track]); // eslint-disable-line react-hooks/exhaustive-deps

  // Component unmount: full cleanup of the audio graph.
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try { sourceRef.current?.disconnect(); } catch {}
      try { analyserRef.current?.disconnect(); } catch {}
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

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
        crossOrigin="anonymous"
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
          <span className={styles.username}>
            {track.artist_name ?? (track.username ? `@${track.username}` : "")}
          </span>
        </div>
      </div>

      {/* Visualizer — frequency bars driven by Web Audio API AnalyserNode */}
      <canvas
        ref={canvasRef}
        width={140}
        height={36}
        className={styles.visualizer}
        aria-hidden="true"
      />

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

      {/* Seek bar. Markers overlay on top of the range track at the
          fractional position of each comment's timestamp. Hover a
          marker to see the comment; click to seek to that moment. */}
      <div className={styles.seekWrap}>
        <span className={styles.time}>{fmt(current)}</span>
        <div className={styles.seekStack}>
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
          {duration > 0 && markers.length > 0 && (
            <div className={styles.markerLayer} aria-hidden={false}>
              {markers.map((m) => {
                const pct = Math.min(
                  100,
                  Math.max(0, (m.timestamp_seconds / duration) * 100),
                );
                const isHovered = hoveredMarker === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`${styles.marker} ${isHovered ? styles.markerActive : ""}`}
                    style={{ left: `${pct}%` }}
                    onClick={() => handleMarkerClick(m.timestamp_seconds)}
                    onMouseEnter={() => setHoveredMarker(m.id)}
                    onMouseLeave={() => setHoveredMarker(null)}
                    onFocus={() => setHoveredMarker(m.id)}
                    onBlur={() => setHoveredMarker(null)}
                    aria-label={`Comment at ${fmt(m.timestamp_seconds)} from ${m.username}`}
                    title={`@${m.username} · ${fmt(m.timestamp_seconds)}`}
                  >
                    {isHovered && (
                      <span className={styles.markerTooltip}>
                        <span className={styles.markerTooltipUser}>
                          @{m.username}
                        </span>
                        <span className={styles.markerTooltipBody}>
                          {m.content}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <span className={styles.time}>{fmt(duration)}</span>
      </div>

      {/* Timestamped comment toggle. Hidden when the active track has
          neither a post_id nor a track_id (nothing to attach to). */}
      {canComment && (
        <button
          type="button"
          className={`${styles.btn} ${styles.commentBtn}`}
          onClick={() => (commentOpen ? setCommentOpen(false) : openComment())}
          aria-label={commentOpen ? "Close comment" : "Comment on this moment"}
          title={
            commentOpen
              ? "Close"
              : `Comment at ${fmt(audioRef.current?.currentTime ?? 0)}`
          }
        >
          💬
        </button>
      )}

      {/* Close */}
      <button
        className={styles.closeBtn}
        onClick={() => dispatch(clearPlayer())}
        aria-label="Close player"
      >
        ✕
      </button>

      {/* Expanded comment row — sits below the rest of the bar. The
          timestamp is frozen at the moment the input opened so it
          doesn't drift while the user types. */}
      {commentOpen && canComment && (
        <form className={styles.commentRow} onSubmit={submitComment}>
          <span className={styles.commentStamp}>@ {fmt(frozenAt)}</span>
          <input
            type="text"
            className={styles.commentInput}
            placeholder="Say something about this part…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            maxLength={1000}
            autoFocus
            disabled={commentSending}
          />
          <button
            type="submit"
            className={styles.commentSubmit}
            disabled={!commentText.trim() || commentSending}
          >
            {commentSending ? "…" : "Post"}
          </button>
        </form>
      )}
    </div>
  );
};

export default PlayerBar;
