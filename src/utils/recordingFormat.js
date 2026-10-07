// Formats for in-browser video recording.
//
// Chrome and Firefox record WebM; Safari (every browser on iPhone) records
// MP4 and throws if asked for WebM. Ask for the first one the browser can
// actually do, best first.
export const RECORDING_TYPES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4;codecs=avc1,mp4a",
  "video/mp4",
];

/** The best supported type, or "" to let the browser pick its default. */
export function pickRecordingType(isTypeSupported = globalThis.MediaRecorder?.isTypeSupported?.bind(globalThis.MediaRecorder)) {
  if (typeof isTypeSupported !== "function") return "";
  return RECORDING_TYPES.find((t) => {
    try {
      return isTypeSupported(t);
    } catch {
      return false;
    }
  }) ?? "";
}

/**
 * The type to upload a recording as: the bare MIME type, codecs dropped.
 *
 * Recorders report types like "video/webm;codecs=vp9,opus". In a multipart
 * upload that unquoted comma makes the header invalid; the server's parser
 * falls back to text/plain and the video filter rejects the file ("Video
 * files only"). The backend doesn't need the codecs — Cloudinary detects
 * them — so send "video/webm" / "video/mp4".
 */
export function uploadType(type) {
  const base = String(type ?? "").split(";")[0].trim().toLowerCase();
  return base.startsWith("video/") ? base : "video/webm";
}

/** "recording.mp4" / "recording.webm" — the backend checks the extension too. */
export function recordingFileName(type) {
  return /mp4/i.test(type ?? "") ? "recording.mp4" : "recording.webm";
}

/**
 * A message that says what actually went wrong. Every failure used to read
 * "Camera access denied", including Safari refusing the WebM format.
 */
export function recordingErrorMessage(err) {
  switch (err?.name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Camera access denied. Please allow camera and microphone access.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No camera or microphone found.";
    case "NotReadableError":
      return "Your camera or microphone is being used by another app.";
    default:
      return "This browser can't record video here. Try uploading a video file instead.";
  }
}
