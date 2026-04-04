import React, { useState, useRef, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useLiveCompose } from "../../hooks/useLiveCompose";
import styles from "./UploadModal.module.css";

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
  video: "MP4, WEBM, MOV",
  music: "MP3, WAV, FLAC, M4A",
};

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
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
  const [videoUrl, setVideoUrl] = useState("");

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
      setIsDragging(false); setVideoInputMode("file"); setVideoUrl("");
      setMusicInputMode("file"); setMusicStreamUrl("");
      setTitle(""); setDescription(""); setContentType("");
      setLoading(false); setError(null); setSuccess(false);
    }
  }, [isOpen]);

  const handleCategorySelect = (cat) => { setCategory(cat); setStep(2); };

  const handleFileSelect = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
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
    if (category === "video") return videoInputMode === "file" ? !!file : videoUrl.trim().length > 0;
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
        if (videoInputMode === "file") {
          const fd = new FormData();
          fd.append("video", file);
          if (description.trim()) fd.append("caption", description.trim());
          if (title.trim())       fd.append("title", title.trim());
          if (contentType)        fd.append("content_type", contentType);
          await axiosInstance.post("/feed/video", fd, { headers: { "Content-Type": "multipart/form-data" } });
        } else {
          await axiosInstance.post("/feed/video-url", {
            videoUrl: videoUrl.trim(),
            caption:      description.trim() || undefined,
            title:        title.trim() || undefined,
            content_type: contentType || undefined,
          });
        }

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

  const ytId = videoUrl ? extractYouTubeId(videoUrl) : null;
  const dropZoneIcon = { photo: "⬜", video: "▶", music: "♪" }[category];

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
                  <button className={`${styles.subToggle} ${videoInputMode === "file" ? styles.subToggleActive : ""}`} onClick={() => { setVideoInputMode("file"); clearFile(); setVideoUrl(""); }}>Upload File</button>
                  <button className={`${styles.subToggle} ${videoInputMode === "url"  ? styles.subToggleActive : ""}`} onClick={() => { setVideoInputMode("url");  clearFile(); }}>Paste URL</button>
                </div>
                {videoInputMode === "file" ? (
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
                ) : (
                  <>
                    <input type="text" className={styles.urlInput} placeholder="Paste YouTube or video URL..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} autoFocus />
                    {ytId && (
                      <div className={styles.ytPreview}>
                        <iframe src={`https://www.youtube.com/embed/${ytId}`} title="YouTube preview" allowFullScreen />
                      </div>
                    )}
                  </>
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

// Shared drop zone used by photo / video / music
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
