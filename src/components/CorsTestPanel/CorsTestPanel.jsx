import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./CorsTestPanel.module.css";

// PR 1 of the audio player work — diagnostic prototype that proves the
// Cloudinary CORS + Web Audio API + AnalyserNode chain works end-to-end
// against a real purchased album. If this shows live bars, the whole
// player/visualizer plan is unblocked. If it shows a SecurityError,
// regroup before doing the bigger refactor work.
//
// Lives on the Library page behind a "Show debug" toggle so it's not
// in the way during normal use.

const BAR_COUNT = 48;
const FFT_SIZE = 128; // -> 64 frequency bins; we render BAR_COUNT of them

const CorsTestPanel = () => {
  const purchases = useSelector((state) => state.auth.purchases);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | fetching | playing | error
  const [statusMsg, setStatusMsg] = useState("");
  const [streamUrl, setStreamUrl] = useState(null);

  const audioElRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.disconnect(); } catch {}
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const drawBars = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const buf = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(buf);

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    const barW = width / BAR_COUNT;
    for (let i = 0; i < BAR_COUNT; i++) {
      const v = buf[Math.floor((i / BAR_COUNT) * buf.length)] / 255;
      const barH = v * height;
      ctx.fillStyle = `hsl(${140 + v * 80}, 70%, ${30 + v * 30}%)`;
      ctx.fillRect(i * barW, height - barH, barW - 1, barH);
    }
    rafRef.current = requestAnimationFrame(drawBars);
  };

  const startTest = async () => {
    if (!selectedAlbumId) {
      setStatusMsg("Pick an album first.");
      return;
    }
    setPhase("fetching");
    setStatusMsg("Fetching stream URL…");
    setStreamUrl(null);

    try {
      const res = await axiosInstance.get(`/albums/${selectedAlbumId}/stream`);
      const url = res.data?.url;
      if (!url) throw new Error("No stream URL in response.");
      setStreamUrl(url);
      setStatusMsg("Got URL. Setting up Web Audio API…");

      // Tear down any prior session.
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.disconnect(); } catch {}
        sourceNodeRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        await audioCtxRef.current.close().catch(() => {});
      }

      const audio = new Audio();
      audio.crossOrigin = "anonymous"; // critical — without this, AnalyserNode throws SecurityError
      audio.src = url;
      audio.preload = "auto";
      audioElRef.current = audio;

      // The AudioContext must be created from a user gesture in modern
      // browsers, so this runs inside the button click handler.
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      sourceNodeRef.current = source;
      analyserRef.current = analyser;

      audio.addEventListener("playing", () => {
        setPhase("playing");
        setStatusMsg("Playing — bars below show live FFT data");
      });
      audio.addEventListener("error", () => {
        setPhase("error");
        setStatusMsg(
          `<audio> error: code=${audio.error?.code ?? "?"} (${audio.error?.message ?? "no message"})`
        );
      });

      await audio.play();
      rafRef.current = requestAnimationFrame(drawBars);
    } catch (err) {
      setPhase("error");
      // SecurityError is the specific failure mode for CORS-tainted media.
      const isSecurity = err?.name === "SecurityError";
      setStatusMsg(
        isSecurity
          ? `SecurityError — Cloudinary did NOT send Access-Control-Allow-Origin. Visualizer is blocked until we fix the asset config.`
          : err?.response?.data?.message ||
            err?.message ||
            "Unknown error starting the test."
      );
    }
  };

  const stopTest = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.src = "";
    }
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.disconnect(); } catch {}
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }
    audioElRef.current = null;
    sourceNodeRef.current = null;
    analyserRef.current = null;
    audioCtxRef.current = null;
    setPhase("idle");
    setStatusMsg("Stopped.");
  };

  if (!purchases || purchases.length === 0) {
    return (
      <div className={styles.panel}>
        <p className={styles.muted}>
          No purchases — buy an album first to test the streaming path.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Web Audio API · CORS prototype</h3>
        <span className={styles.help}>
          Validates that Cloudinary's stream URL works with AnalyserNode.
        </span>
      </div>

      <div className={styles.controls}>
        <label className={styles.label}>
          Album to test
          <select
            className={styles.select}
            value={selectedAlbumId ?? ""}
            onChange={(e) =>
              setSelectedAlbumId(
                e.target.value === "" ? null : parseInt(e.target.value, 10)
              )
            }
          >
            <option value="">— Pick one —</option>
            {purchases.map((p) => (
              <option key={p.id} value={p.album_id}>
                {p.album_name} · {p.artist_name}
              </option>
            ))}
          </select>
        </label>

        {phase === "playing" ? (
          <button type="button" className={styles.stopBtn} onClick={stopTest}>
            Stop
          </button>
        ) : (
          <button
            type="button"
            className={styles.startBtn}
            onClick={startTest}
            disabled={phase === "fetching" || !selectedAlbumId}
          >
            {phase === "fetching" ? "Starting…" : "Start test"}
          </button>
        )}
      </div>

      {statusMsg && (
        <p
          className={
            phase === "error" ? styles.statusError : styles.statusInfo
          }
        >
          {statusMsg}
        </p>
      )}

      <canvas
        ref={canvasRef}
        width={480}
        height={120}
        className={styles.canvas}
      />

      {streamUrl && phase !== "error" && (
        <details className={styles.details}>
          <summary>Stream URL</summary>
          <code className={styles.url}>{streamUrl}</code>
        </details>
      )}
    </div>
  );
};

export default CorsTestPanel;
