// src/components/Feed/Feed.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";
import styles from "./Feed.module.css";
import { batchPrepare, evict } from "../../services/textMeasurement";
import { useLiveCompose } from "../../hooks/useLiveCompose";
import { useShrinkWrap } from "../../hooks/useShrinkWrap";

// Skeleton for loading state
const PostSkeleton = () => (
  <div className={styles.skeletonWrapper}>
    <div className={styles.skeletonHeader}></div>
    <div className={styles.skeletonContent}></div>
  </div>
);

// Helper: extract YouTube video ID from URL
function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

// Post Creator Component with toggle for text/image/video/music
function PostCreator({ onPostCreated }) {
  const [postType, setPostType] = useState("text"); // 'text', 'image', 'video', or 'music'
  const [content, setContent] = useState("");
  const { lineCount, isOverLimit, containerRef: composeRef } = useLiveCompose(content, { maxLines: 20 });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Video-specific state
  const [videoInputMode, setVideoInputMode] = useState("file"); // 'file' or 'url'
  const [videoUrl, setVideoUrl] = useState("");

  // Music-specific state
  const [musicInputMode, setMusicInputMode] = useState("file"); // 'file' or 'link'
  const [musicStreamUrl, setMusicStreamUrl] = useState("");
  const [musicTitle, setMusicTitle] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (postType === "text") {
        if (!content.trim()) {
          setError("Please enter some content.");
          setLoading(false);
          return;
        }
        await axiosInstance.post("/feed/text", { content: content.trim() });
        setContent("");
      } else if (postType === "image") {
        if (!file) {
          setError("Please select an image.");
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append("image", file);
        formData.append("caption", caption);
        await axiosInstance.post("/feed/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setFile(null);
        setPreview(null);
        setCaption("");
      } else if (postType === "video") {
        if (videoInputMode === "file") {
          if (!file) {
            setError("Please select a video file.");
            setLoading(false);
            return;
          }
          const formData = new FormData();
          formData.append("video", file);
          formData.append("caption", caption);
          await axiosInstance.post("/feed/video", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          setFile(null);
          setPreview(null);
        } else {
          if (!videoUrl.trim()) {
            setError("Please enter a video URL.");
            setLoading(false);
            return;
          }
          await axiosInstance.post("/feed/video-url", {
            videoUrl: videoUrl.trim(),
            caption,
          });
          setVideoUrl("");
        }
        setCaption("");
      } else if (postType === "music") {
        if (musicInputMode === "file") {
          if (!file) {
            setError("Please select an audio file.");
            setLoading(false);
            return;
          }
          const formData = new FormData();
          formData.append("audio", file);
          if (musicTitle.trim()) formData.append("title", musicTitle.trim());
          formData.append("caption", caption);
          await axiosInstance.post("/feed/music", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          setFile(null);
          setPreview(null);
        } else {
          if (!musicStreamUrl.trim()) {
            setError("Please enter a stream URL.");
            setLoading(false);
            return;
          }
          await axiosInstance.post("/feed/music", {
            streamUrl: musicStreamUrl.trim(),
            title: musicTitle.trim() || undefined,
            caption,
          });
          setMusicStreamUrl("");
        }
        setMusicTitle("");
        setCaption("");
      }
      if (onPostCreated) onPostCreated();
    } catch (err) {
      console.error("Post error:", err);
      setError(err.response?.data?.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  const youtubePreviewId = videoUrl ? extractYouTubeId(videoUrl) : null;

  const isSubmitDisabled = () => {
    if (loading) return true;
    if (postType === "text") return !content.trim();
    if (postType === "image") return !file;
    if (postType === "video") {
      return videoInputMode === "file" ? !file : !videoUrl.trim();
    }
    if (postType === "music") {
      return musicInputMode === "file" ? !file : !musicStreamUrl.trim();
    }
    return true;
  };

  return (
    <div className={styles.postCreator}>
      <div className={styles.typeToggle}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${postType === "text" ? styles.active : ""}`}
          onClick={() => { setPostType("text"); clearFile(); setVideoUrl(""); }}
        >
          Text
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${postType === "image" ? styles.active : ""}`}
          onClick={() => { setPostType("image"); clearFile(); setVideoUrl(""); }}
        >
          Image
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${postType === "video" ? styles.active : ""}`}
          onClick={() => { setPostType("video"); clearFile(); setVideoUrl(""); }}
        >
          Video
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${postType === "music" ? styles.active : ""}`}
          onClick={() => { setPostType("music"); clearFile(); setMusicStreamUrl(""); setMusicTitle(""); }}
        >
          Music
        </button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {postType === "text" && (
          <>
            <textarea
              ref={composeRef}
              className={`${styles.textInput} ${isOverLimit ? styles.textInputOverLimit : ""}`}
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="3"
            />
            {content.length > 0 && (
              <span className={`${styles.lineCount} ${isOverLimit ? styles.lineCountOver : ""}`}>
                {lineCount} {lineCount === 1 ? "line" : "lines"}{isOverLimit ? " — too long" : ""}
              </span>
            )}
          </>
        )}

        {postType === "image" && (
          <>
            {preview ? (
              <div className={styles.previewContainer}>
                <img src={preview} alt="Preview" className={styles.previewImage} />
                <button
                  type="button"
                  onClick={clearFile}
                  className={styles.clearButton}
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className={styles.fileInputLabel}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                <span className={styles.fileInputText}>Click to select image</span>
              </label>
            )}
            <textarea
              className={styles.textInput}
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="2"
            />
          </>
        )}

        {postType === "video" && (
          <>
            <div className={styles.videoInputToggle}>
              <button
                type="button"
                className={`${styles.subToggleBtn} ${videoInputMode === "file" ? styles.active : ""}`}
                onClick={() => { setVideoInputMode("file"); setVideoUrl(""); }}
              >
                Upload File
              </button>
              <button
                type="button"
                className={`${styles.subToggleBtn} ${videoInputMode === "url" ? styles.active : ""}`}
                onClick={() => { setVideoInputMode("url"); clearFile(); }}
              >
                Paste URL
              </button>
            </div>

            {videoInputMode === "file" ? (
              <>
                {preview ? (
                  <div className={styles.previewContainer}>
                    <video src={preview} className={styles.previewVideo} controls />
                    <button
                      type="button"
                      onClick={clearFile}
                      className={styles.clearButton}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className={styles.fileInputLabel}>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                      onChange={handleFileChange}
                      className={styles.fileInput}
                    />
                    <span className={styles.fileInputText}>Click to select video</span>
                  </label>
                )}
              </>
            ) : (
              <>
                <input
                  type="text"
                  className={styles.urlInput}
                  placeholder="Paste YouTube or video URL..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                {youtubePreviewId && (
                  <div className={styles.youtubePreview}>
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubePreviewId}`}
                      title="YouTube preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </>
            )}

            <textarea
              className={styles.textInput}
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="2"
            />
          </>
        )}

        {postType === "music" && (
          <>
            <div className={styles.videoInputToggle}>
              <button
                type="button"
                className={`${styles.subToggleBtn} ${musicInputMode === "file" ? styles.active : ""}`}
                onClick={() => { setMusicInputMode("file"); setMusicStreamUrl(""); }}
              >
                Upload File
              </button>
              <button
                type="button"
                className={`${styles.subToggleBtn} ${musicInputMode === "link" ? styles.active : ""}`}
                onClick={() => { setMusicInputMode("link"); clearFile(); }}
              >
                Paste Link
              </button>
            </div>

            <input
              type="text"
              className={styles.urlInput}
              placeholder="Track title (optional)"
              value={musicTitle}
              onChange={(e) => setMusicTitle(e.target.value)}
            />

            {musicInputMode === "file" ? (
              <>
                {preview ? (
                  <div className={styles.previewContainer}>
                    <audio controls src={preview} className={styles.audioPreview} />
                    <button type="button" onClick={clearFile} className={styles.clearButton}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className={styles.fileInputLabel}>
                    <input
                      type="file"
                      accept="audio/mpeg,audio/wav,audio/flac,audio/x-m4a,audio/ogg"
                      onChange={handleFileChange}
                      className={styles.fileInput}
                    />
                    <span className={styles.fileInputText}>Click to select audio file</span>
                  </label>
                )}
              </>
            ) : (
              <input
                type="text"
                className={styles.urlInput}
                placeholder="Paste Spotify, SoundCloud, or Apple Music link..."
                value={musicStreamUrl}
                onChange={(e) => setMusicStreamUrl(e.target.value)}
              />
            )}

            <textarea
              className={styles.textInput}
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="2"
            />
          </>
        )}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitDisabled()}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
}

// Comment bubble with shrink-wrap width
function CommentBubble({ comment: c, currentUserId, onDelete, formatTime }) {
  const { optimalWidth, containerRef } = useShrinkWrap(c.content, 4);
  return (
    <li
      ref={containerRef}
      className={styles.commentItem}
      style={optimalWidth ? { maxWidth: optimalWidth } : undefined}
    >
      <div className={styles.commentHeader}>
        <Link to={`/profile/${c.user_id}`} className={styles.commentUsername}>
          {c.username}
        </Link>
        <span className={styles.commentTime}>{formatTime(c.created_at)}</span>
        {c.user_id === currentUserId && (
          <button
            className={styles.deleteCommentBtn}
            onClick={() => onDelete(c.comment_id)}
          >
            ×
          </button>
        )}
      </div>
      <p className={styles.commentContent}>{c.content}</p>
    </li>
  );
}

// Individual Post Item
function PostItem({ post, currentUserId, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const res = await axiosInstance.get(`/feed/comments/${post.post_type}/${post.id}`);
      setComments(res.data);
      setCommentCount(res.data.length);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  }, [post.post_type, post.id]);

  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) fetchComments();
    setShowComments((prev) => !prev);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await axiosInstance.post(
        `/feed/comments/${post.post_type}/${post.id}`,
        { content: commentText.trim() }
      );
      setComments((prev) => [...prev, res.data]);
      setCommentCount((prev) => prev + 1);
      setCommentText("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/feed/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId));
      setCommentCount((prev) => prev - 1);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  if (!post) return null;

  const API_BASE =
    import.meta.env.VITE_API_URL || "https://ninebyfourapi.herokuapp.com";

  const isOwner = currentUserId === post.user_id;
  const isAgentPost = post.is_agent_post;
  const isImage = post.post_type === "image";
  const isVideo = post.post_type === "video";
  const isMusic = post.post_type === "music";

  const fullImageUrl = post.image_url
    ? post.image_url.startsWith("http")
      ? post.image_url
      : `${API_BASE}${post.image_url}`
    : null;

  const fullVideoUrl =
    post.video_url && post.video_type === "upload"
      ? post.video_url.startsWith("http")
        ? post.video_url
        : `${API_BASE}${post.video_url}`
      : post.video_url;

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/feed/${post.post_type}/${post.id}`);
      evict(`text-${post.id}`);
      if (onDelete) onDelete();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete post.");
    } finally {
      setDeleting(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`${styles.postItem} ${isAgentPost ? styles.agentPostItem : ""}`}>
      <div className={styles.postHeader}>
        <div className={styles.userInfo}>
          {isAgentPost ? (
            <span className={styles.agentLabel}>9by4 News</span>
          ) : (
            <Link to={`/profile/${post.user_id}`} className={styles.username}>{post.username || `User ${post.user_id}`}</Link>
          )}
          <span className={styles.timestamp}>{formatTime(post.created_at)}</span>
        </div>
        <div className={styles.postActions}>
          {isAgentPost ? (
            <span className={styles.agentBadge}>News</span>
          ) : (
            <span className={styles.postTypeBadge}>
              {isVideo ? "Video" : isImage ? "Image" : isMusic ? "Music" : "Text"}
            </span>
          )}
          {isOwner && !isAgentPost && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={styles.deleteBtn}
            >
              {deleting ? "..." : "Delete"}
            </button>
          )}
        </div>
      </div>

      {isVideo ? (
        <>
          <div className={styles.videoWrapper}>
            <div className={styles.postVideo}>
              {post.video_type === "youtube" ? (
                <iframe
                  src={`https://www.youtube.com/embed/${fullVideoUrl}`}
                  title={post.caption || "Video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video controls>
                  <source src={fullVideoUrl} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
          {post.caption && <p className={styles.caption}>{post.caption}</p>}
        </>
      ) : isImage ? (
        <>
          <div className={styles.imageWrapper}>
            <img
              src={fullImageUrl}
              alt={post.caption || "Post image"}
              className={styles.postImage}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23333' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='16' text-anchor='middle' x='200' y='150'%3EImage not found%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
          {post.caption && <p className={styles.caption}>{post.caption}</p>}
        </>
      ) : isMusic ? (
        <div className={styles.musicContent}>
          {post.music_title && <p className={styles.musicTitle}>{post.music_title}</p>}
          {post.audio_url ? (
            <audio controls className={styles.audioPlayer}>
              <source src={post.audio_url} />
              Your browser does not support the audio element.
            </audio>
          ) : post.stream_url ? (
            <div className={styles.streamLink}>
              {post.platform && post.platform !== "other" && (
                <span className={styles.platformChip}>{post.platform}</span>
              )}
              <a href={post.stream_url} target="_blank" rel="noopener noreferrer" className={styles.streamAnchor}>
                Listen on {post.platform ? post.platform.charAt(0).toUpperCase() + post.platform.slice(1) : "Platform"} →
              </a>
            </div>
          ) : null}
          {post.caption && <p className={styles.caption}>{post.caption}</p>}
        </div>
      ) : (
        <p className={styles.textContent}>{post.content}</p>
      )}

      <div className={styles.postFooter}>
        <button className={styles.commentToggleBtn} onClick={handleToggleComments}>
          💬 {commentCount > 0 ? commentCount : ""} {commentCount === 1 ? "Comment" : "Comments"}
        </button>
        {/* Verdict badges from fact-checker agents */}
        {(post.verified_count > 0 || post.disputed_count > 0) && (
          <div className={styles.verdictBadges}>
            {post.verified_count > 0 && (
              <span className={styles.verifiedBadge}>✓ Verified ({post.verified_count})</span>
            )}
            {post.disputed_count > 0 && (
              <span className={styles.disputedBadge}>⚠ Disputed ({post.disputed_count})</span>
            )}
          </div>
        )}
        {isAgentPost && post.source_url && (
          <a
            href={post.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceLink}
          >
            Read more →
          </a>
        )}
        {/* Provenance URLs — grounded sources for agent posts */}
        {isAgentPost && post.provenance_urls && post.provenance_urls.length > 0 && (
          <div className={styles.provenanceSection}>
            <span className={styles.provenanceLabel}>Sources:</span>
            {post.provenance_urls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.provenanceLink}
              >
                [{i + 1}]
              </a>
            ))}
          </div>
        )}
      </div>

      {showComments && (
        <div className={styles.commentsSection}>
          {commentsLoading ? (
            <p className={styles.commentsLoading}>Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className={styles.noComments}>No comments yet. Be the first!</p>
          ) : (
            <ul className={styles.commentsList}>
              {comments.map((c) => (
                <CommentBubble
                  key={c.comment_id}
                  comment={c}
                  currentUserId={currentUserId}
                  onDelete={handleDeleteComment}
                  formatTime={formatTime}
                />
              ))}
            </ul>
          )}

          <form className={styles.commentForm} onSubmit={handleSubmitComment}>
            <input
              className={styles.commentInput}
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={500}
            />
            <button
              type="submit"
              className={styles.commentSubmitBtn}
              disabled={submitting || !commentText.trim()}
            >
              {submitting ? "..." : "Post"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// Main Feed Component
function Feed() {
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/feed");
      const fetchedPosts = Array.isArray(response.data)
        ? response.data
        : response.data?.posts || [];
      // Pre-measure all text post heights before render — no DOM reads needed
      batchPrepare(
        fetchedPosts
          .filter((p) => p.post_type === "text" && p.content)
          .map((p) => ({ id: `text-${p.id}`, text: p.content }))
      );
      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load feed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.feedContainer}>
      <div className={styles.feedContent}>
        <h1 className={styles.feedTitle}>Feed</h1>

        <PostCreator onPostCreated={fetchPosts} />

        <div className={styles.postsList}>
          {loading ? (
            [1, 2, 3].map((n) => <PostSkeleton key={n} />)
          ) : posts.length === 0 ? (
            <p className={styles.emptyState}>
              No posts yet. Be the first to share something!
            </p>
          ) : (
            posts.map((post) => (
              <PostItem
                key={`${post.post_type}-${post.id}`}
                post={post}
                currentUserId={currentUserId}
                onDelete={fetchPosts}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Feed;
