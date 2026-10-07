import React, { useState, useRef, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useLiveCompose } from "../../hooks/useLiveCompose";
import styles from "./UploadModal.module.css";
import VideoRecorder from "./VideoRecorder";
import { recordingFileName, uploadType } from "../../utils/recordingFormat";

const VIDEO_TYPES = ["Podcast", "Music Video", "Tutorial", "Other"];
const MUSIC_TYPES = ["Single", "Audio Podcast", "EP", "Mixtape", "Album", "Other"];

const CATEGORIES = [
  { id: "text",  label: "Text",  icon: "T" },
  { id: "photo", label: "Photo", icon: "⬜" },
  { id: "video", label: "Video", icon: "▶" },
  { id: "music", label: "Music", icon: "♪" },
];

const ACCEPT = {
  photo: "image/jpeg,image/png,image/gif,image/webp",
  video: "video/mp4,video/webm,video/quicktime,video/x-msvideo",
  music: "audio/mpeg,audio/wav,audio/flac,audio/x-m4a,audio/ogg",
};

const HINT = {
  photo: "JPG, PNG, GIF, WEBP",
  video: "MP4, WEBM, MOV · max 50MB",
  music: "MP3, WAV, FLAC, M4A",
};

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const RECORD_LIMIT_DEFAULT = 60;       // seconds for regular video
const RECORD_LIMIT_MUSIC_VIDEO = 100;  // seconds for music video

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadModal({ isOpen, onClose, onPostCreated }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);

  // Text
  const [content, setContent] = useState("");
  const { lineCount, isOverLimit, containerRef: composeRef } = useLiveCompose(content, { maxLines: 20 });

  // File upload
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Video
  const [videoInputMode, setVideoInputMode] = useState("file");
  const [isMusicVideoRecord, setIsMusicVideoRecord] = useState(false);

  // Music
  const [musicInputMode, setMusicInputMode] = useState("file");
  const [musicStreamUrl, setMusicStreamUrl] = useState("");

  // Metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep(1); setCategory(null); setContent(""); setFile(null); setPreview(null);
      setIsDragging(false); setVideoInputMode("file");
      setIsMusicVideoRecord(false);
      setMusicInputMode("file"); setMusicStreamUrl("");
      setTitle(""); setDescription(""); setContentType("");
      setLoading(false); setError(null); setSuccess(false);
    }
  }, [isOpen]);

  const handleCategorySelect = (cat) => { setCategory(cat); setStep(2); };

  const handleFileSelect = (f) => {
    if ((category === "video") && f.size > MAX_FILE_SIZE_BYTES) {
      setError(`File too large. Maximum size is 50MB.`);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  };

  const handleRecorded = (blob) => {
    // Bare MIME type (codec parameters break the multipart upload), and a
    // name matching it: Safari records MP4, and the backend checks the
    // extension as well as the type.
    const type = uploadType(blob.type);
    const f = new File([blob], recordingFileName(type), { type });
    if (f.size > MAX_FILE_SIZE_BYTES) {
      setError("Recording exceeds 50MB. Please try a shorter recording.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (isMusicVideoRecord) setContentType("Music Video");
    setError(null);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const canProceed = () => {
    if (category === "text")  return content.trim().length > 0 && !isOverLimit;
    if (category === "photo") return !!file;
    // Upload or record only. Pasting a URL was how YouTube got in.
    if (category === "video") return !!file;
    if (category === "music") return musicInputMode === "file" ? !!file : musicStreamUrl.trim().length > 0;
    return false;
  };

  const handleBack = () => {
    setError(null);
    if (step === 2) { setCategory(null); setStep(1); }
    else setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (category === "text") {
        await axiosInstance.post("/feed/text", { content: content.trim() });

      } else if (category === "photo") {
        const fd = new FormData();
        fd.append("image", file);
        if (description.trim()) fd.append("caption", description.trim());
        await axiosInstance.post("/feed/image", fd, { headers: { "Content-Type": "multipart/form-data" } });

      } else if (category === "video") {
        const fd = new FormData();
        fd.append("video", file);
        if (description.trim()) fd.append("caption", description.trim());
        if (title.trim())       fd.append("title", title.trim());
        if (contentType)        fd.append("content_type", contentType);
        await axiosInstance.post("/feed/video", fd, { headers: { "Content-Type": "multipart/form-data" } });

      } else if (category === "music") {
        if (musicInputMode === "file") {
          const fd = new FormData();
          fd.append("audio", file);
          if (title.trim())       fd.append("title", title.trim());
          if (description.trim()) fd.append("caption", description.trim());
          if (contentType)        fd.append("content_type", contentType);
          await axiosInstance.post("/feed/music", fd, { headers: { "Content-Type": "multipart/form-data" } });
        } else {
          await axiosInstance.post("/feed/music", {
            streamUrl:    musicStreamUrl.trim(),
            title:        title.trim() || undefined,
            caption:      description.trim() || undefined,
            content_type: contentType || undefined,
          });
        }
      }

      setSuccess(true);
      if (onPostCreated) onPostCreated();
      setTimeout(() => onClose(), 1400);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const dropZoneIcon = { photo: "⬜", video: "▶", music: "♪" }[category];
  const recordTimeLimit = isMusicVideoRecord ? RECORD_LIMIT_MUSIC_VIDEO : RECORD_LIMIT_DEFAULT;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">

        {/* Header */}
        <div className={styles.header}>
          <button
            className={styles.backBtn}
            onClick={handleBack}
            style={{ visibility: step > 1 && !success ? "visible" : "hidden" }}
            aria-label="Back"
          >
            ← Back
          </button>
          <div className={styles.dots}>
            {[1, 2, 3].map((s) => (
              <span key={s} className={`${styles.dot} ${step >= s ? styles.dotActive : ""}`} />
            ))}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* ── Success ── */}
        {success && (
          <div className={styles.successState}>
            <span className={styles.successIcon}>✓</span>
            <p className={styles.successText}>Posted!</p>
          </div>
        )}

        {/* ── Step 1: Category picker ── */}
        {!success && step === 1 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>What are you sharing?</h2>
            <div className={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <button key={cat.id} className={styles.categoryTile} onClick={() => handleCategorySelect(cat.id)}>
                  <span className={styles.categoryIcon}>{cat.icon}</span>
                  <span className={styles.categoryLabel}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Upload ── */}
        {!success && step === 2 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>
              {{ text: "Write your post", photo: "Add a photo", video: "Add a video", music: "Add music" }[category]}
            </h2>

            {/* TEXT */}
            {category === "text" && (
              <>
                <textarea
                  ref={composeRef}
                  className={`${styles.textarea} ${isOverLimit ? styles.textareaOverLimit : ""}`}
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  autoFocus
                />
                {content.length > 0 && (
                  <span className={`${styles.lineCount} ${isOverLimit ? styles.lineCountOver : ""}`}>
                    {lineCount} {lineCount === 1 ? "line" : "lines"}{isOverLimit ? " — too long" : ""}
                  </span>
                )}
              </>
            )}

            {/* PHOTO */}
            {category === "photo" && (
              preview ? (
                <div className={styles.previewContainer}>
                  <img src={preview} alt="Preview" className={styles.previewImage} />
                  <button type="button" onClick={clearFile} className={styles.clearBtn}>Remove</button>
                </div>
              ) : (
                <DropZone
                  icon={dropZoneIcon}
                  hint={HINT.photo}
                  isDragging={isDragging}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  fileInputRef={fileInputRef}
                  accept={ACCEPT.photo}
                  onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                />
              )
            )}

            {/* VIDEO */}
            {category === "video" && (
              <>
                <div className={styles.subToggleRow}>
                  <button className={`${styles.subToggle} ${videoInputMode === "file"   ? styles.subToggleActive : ""}`} onClick={() => { setVideoInputMode("file");   clearFile(); }}>Upload File</button>
                  <button className={`${styles.subToggle} ${videoInputMode === "record" ? styles.subToggleActive : ""}`} onClick={() => { setVideoInputMode("record"); clearFile(); }}>Record</button>
                </div>

                {videoInputMode === "file" && (
                  preview ? (
                    <div className={styles.previewContainer}>
                      <video src={preview} className={styles.previewVideo} controls />
                      <button type="button" onClick={clearFile} className={styles.clearBtn}>Remove</button>
                    </div>
                  ) : (
                    <DropZone
                      icon={dropZoneIcon}
                      hint={HINT.video}
                      isDragging={isDragging}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      fileInputRef={fileInputRef}
                      accept={ACCEPT.video}
                      onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                    />
                  )
                )}

                {videoInputMode === "record" && (
                  preview ? (
                    <div className={styles.previewContainer}>
                      <video src={preview} className={styles.previewVideo} controls />
                      <button type="button" onClick={clearFile} className={styles.clearBtn}>Re-record</button>
                    </div>
                  ) : (
                    <>
                      <label className={styles.musicVideoToggle}>
                        <input
                          type="checkbox"
                          checked={isMusicVideoRecord}
                          onChange={(e) => setIsMusicVideoRecord(e.target.checked)}
                        />
                        Music video <span className={styles.timeLimitNote}>({isMusicVideoRecord ? "100s" : "60s"} limit)</span>
                      </label>
                      <VideoRecorder
                        timeLimit={recordTimeLimit}
                        onRecorded={handleRecorded}
                      />
                    </>
                  )
                )}

              </>
            )}

            {/* MUSIC */}
            {category === "music" && (
              <>
                <div className={styles.subToggleRow}>
                  <button className={`${styles.subToggle} ${musicInputMode === "file" ? styles.subToggleActive : ""}`} onClick={() => { setMusicInputMode("file"); clearFile(); setMusicStreamUrl(""); }}>Upload File</button>
                  <button className={`${styles.subToggle} ${musicInputMode === "link" ? styles.subToggleActive : ""}`} onClick={() => { setMusicInputMode("link"); clearFile(); }}>Paste Link</button>
                </div>
                {musicInputMode === "file" ? (
                  preview ? (
                    <div className={styles.previewContainer}>
                      <audio controls src={preview} className={styles.audioPreview} />
                      <button type="button" onClick={clearFile} className={styles.clearBtn}>Remove</button>
                    </div>
                  ) : (
                    <DropZone
                      icon={dropZoneIcon}
                      hint={HINT.music}
                      isDragging={isDragging}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      fileInputRef={fileInputRef}
                      accept={ACCEPT.music}
                      onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                    />
                  )
                ) : (
                  <input type="text" className={styles.urlInput} placeholder="Paste Spotify, SoundCloud, or Apple Music link..." value={musicStreamUrl} onChange={(e) => setMusicStreamUrl(e.target.value)} autoFocus />
                )}
              </>
            )}

            {error && <p className={styles.errorMsg}>{error}</p>}

            <div className={styles.stepActions}>
              {category === "text" ? (
                <button className={styles.postBtn} onClick={handleSubmit} disabled={!canProceed() || loading}>
                  {loading ? "Posting..." : "Post"}
                </button>
              ) : (
                <button className={styles.nextBtn} onClick={() => setStep(3)} disabled={!canProceed()}>
                  Next →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: Metadata ── */}
        {!success && step === 3 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Add details</h2>

            {/* File pill */}
            {file && (
              <div className={styles.filePill}>
                <span className={styles.filePillName}>{file.name}</span>
                <span className={styles.filePillSize}>{formatBytes(file.size)}</span>
              </div>
            )}

            {/* Photo thumbnail */}
            {category === "photo" && preview && (
              <img src={preview} alt="Preview" className={styles.metaThumb} />
            )}

            {/* Title — video + music only */}
            {(category === "video" || category === "music") && (
              <div className={styles.metaField}>
                <label className={styles.metaLabel}>Title <span className={styles.optional}>· optional</span></label>
                <input type="text" className={styles.metaInput} placeholder="Add a title..." value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
              </div>
            )}

            {/* Caption / Description */}
            <div className={styles.metaField}>
              <label className={styles.metaLabel}>
                {category === "photo" ? "Caption" : "Description"}{" "}
                <span className={styles.optional}>· optional</span>
              </label>
              <textarea
                className={styles.metaTextarea}
                placeholder={category === "photo" ? "Add a caption..." : "Add a description..."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Content type tags — video + music */}
            {(category === "video" || category === "music") && (
              <div className={styles.metaField}>
                <label className={styles.metaLabel}>Type <span className={styles.optional}>· optional</span></label>
                <div className={styles.tagRow}>
                  {(category === "video" ? VIDEO_TYPES : MUSIC_TYPES).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`${styles.tag} ${contentType === tag ? styles.tagSelected : ""}`}
                      onClick={() => setContentType(contentType === tag ? "" : tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className={styles.errorMsg}>{error}</p>}

            <div className={styles.stepActions}>
              <button className={styles.postBtn} onClick={handleSubmit} disabled={loading}>
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DropZone ───────────────────────────────────────────────────────────────
function DropZone({ icon, hint, isDragging, onDragOver, onDragLeave, onDrop, onClick, fileInputRef, accept, onChange }) {
  return (
    <div
      className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <span className={styles.dropZoneIcon}>{icon}</span>
      <p className={styles.dropZoneText}>
        Drag & drop or <span className={styles.dropZoneLink}>browse</span>
      </p>
      <p className={styles.dropZoneHint}>{hint}</p>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        className={styles.hiddenInput}
      />
    </div>
  );
}
