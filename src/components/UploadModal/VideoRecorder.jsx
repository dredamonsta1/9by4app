import React, { useEffect, useRef, useState } from "react";
import { pickRecordingType, recordingErrorMessage } from "../../utils/recordingFormat";
import styles from "./UploadModal.module.css";

// In-browser video recording for feed posts.
//
// The live and preview <video> elements only exist in their own states, so
// the stream and the finished recording are attached after they render
// (effects / state), never while the old state is still on screen — doing
// it inline left both blank in every browser.
export default function VideoRecorder({ timeLimit, onRecorded }) {
  const [recState, setRecState] = useState("idle"); // idle | requesting | recording | preview
  const [countdown, setCountdown] = useState(timeLimit);
  const [recError, setRecError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const liveRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const blobRef = useRef(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      stopStream();
    };
  }, []);

  // Free the previous recording's memory when it's replaced or on unmount.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Reset countdown when timeLimit changes (music video toggle)
  useEffect(() => {
    if (recState === "idle") setCountdown(timeLimit);
  }, [timeLimit, recState]);

  // The live <video> renders only once we're "recording": attach the camera
  // to it then.
  useEffect(() => {
    if (recState === "recording" && liveRef.current && streamRef.current) {
      liveRef.current.srcObject = streamRef.current;
    }
  }, [recState]);

  const startRecording = async () => {
    setRecError(null);
    setRecState("requesting");

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      setRecState("idle");
      setRecError(recordingErrorMessage(err));
      return;
    }
    streamRef.current = stream;

    let recorder;
    try {
      const requested = pickRecordingType();
      recorder = requested ? new MediaRecorder(stream, { mimeType: requested }) : new MediaRecorder(stream);
    } catch (err) {
      stopStream();
      setRecState("idle");
      setRecError(recordingErrorMessage(err));
      return;
    }
    recorderRef.current = recorder;
    chunksRef.current = [];
    // What the browser actually records — Safari may refine the type.
    const type = recorder.mimeType || "video/webm";

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type });
      blobRef.current = blob;
      setPreviewUrl(URL.createObjectURL(blob));
      stopStream();
      setRecState("preview");
    };

    recorder.start(250);
    setRecState("recording");

    let remaining = timeLimit;
    setCountdown(remaining);
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        recorder.stop();
      }
    }, 1000);
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    recorderRef.current?.stop();
  };

  const reRecord = () => {
    blobRef.current = null;
    chunksRef.current = [];
    setPreviewUrl(null);
    setCountdown(timeLimit);
    setRecState("idle");
  };

  const useRecording = () => {
    onRecorded(blobRef.current);
  };

  const progressPct = Math.min(100, ((timeLimit - countdown) / timeLimit) * 100);

  return (
    <div className={styles.recorder}>
      {recError && <p className={styles.errorMsg}>{recError}</p>}

      {recState === "idle" && (
        <button className={styles.recordStartBtn} onClick={startRecording}>
          ● Start Recording
        </button>
      )}

      {recState === "requesting" && <p className={styles.recorderStatus}>Requesting camera access...</p>}

      {recState === "recording" && (
        <div className={styles.recorderLive}>
          <video
            ref={liveRef}
            className={styles.recorderVideo}
            muted
            playsInline
            autoPlay
            data-testid="recorder-live"
          />
          <div className={styles.recorderOverlay}>
            <span className={styles.recorderCountdown}>{countdown}s</span>
            <div className={styles.recorderProgressBar}>
              <div className={styles.recorderProgressFill} style={{ width: `${progressPct}%` }} />
            </div>
            <button className={styles.recordStopBtn} onClick={stopRecording}>
              ■ Stop
            </button>
          </div>
        </div>
      )}

      {recState === "preview" && (
        <div className={styles.recorderPreviewWrap}>
          {/* playsInline: without it iPhone Safari jumps to fullscreen. */}
          <video
            src={previewUrl ?? undefined}
            className={styles.recorderVideo}
            controls
            playsInline
            data-testid="recorder-preview"
          />
          <div className={styles.recorderPreviewActions}>
            <button className={styles.reRecordBtn} onClick={reRecord}>
              Re-record
            </button>
            <button className={styles.useRecordingBtn} onClick={useRecording}>
              Use this ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
