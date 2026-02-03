// src/components/Feed/Feed.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";
import styles from "./Feed.module.css";

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

// Post Creator Component with toggle for text/image/video
function PostCreator({ onPostCreated }) {
  const [postType, setPostType] = useState("text"); // 'text', 'image', or 'video'
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Video-specific state
  const [videoInputMode, setVideoInputMode] = useState("file"); // 'file' or 'url'
  const [videoUrl, setVideoUrl] = useState("");

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
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {postType === "text" && (
          <textarea
            className={styles.textInput}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="3"
          />
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

// Individual Post Item
function PostItem({ post, currentUserId, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  if (!post) return null;

  const API_BASE =
    import.meta.env.VITE_API_URL || "https://ninebyfourapi.herokuapp.com";

  const isOwner = currentUserId === post.user_id;
  const isImage = post.post_type === "image";
  const isVideo = post.post_type === "video";

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
    <div className={styles.postItem}>
      <div className={styles.postHeader}>
        <div className={styles.userInfo}>
          <Link to={`/profile/${post.user_id}`} className={styles.username}>{post.username || `User ${post.user_id}`}</Link>
          <span className={styles.timestamp}>{formatTime(post.created_at)}</span>
        </div>
        <div className={styles.postActions}>
          <span className={styles.postTypeBadge}>
            {isVideo ? "Video" : isImage ? "Image" : "Text"}
          </span>
          {isOwner && (
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
      ) : (
        <p className={styles.textContent}>{post.content}</p>
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
