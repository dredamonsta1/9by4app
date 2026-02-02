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

// Post Creator Component with toggle for text/image
function PostCreator({ onPostCreated }) {
  const [postType, setPostType] = useState("text"); // 'text' or 'image'
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const clearImage = () => {
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
      } else {
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
      }
      if (onPostCreated) onPostCreated();
    } catch (err) {
      console.error("Post error:", err);
      setError(err.response?.data?.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.postCreator}>
      <div className={styles.typeToggle}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${postType === "text" ? styles.active : ""}`}
          onClick={() => setPostType("text")}
        >
          Text
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${postType === "image" ? styles.active : ""}`}
          onClick={() => setPostType("image")}
        >
          Image
        </button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {postType === "text" ? (
          <textarea
            className={styles.textInput}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="3"
          />
        ) : (
          <>
            {preview ? (
              <div className={styles.previewContainer}>
                <img src={preview} alt="Preview" className={styles.previewImage} />
                <button
                  type="button"
                  onClick={clearImage}
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

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading || (postType === "text" ? !content.trim() : !file)}
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

  const fullImageUrl = post.image_url
    ? post.image_url.startsWith("http")
      ? post.image_url
      : `${API_BASE}${post.image_url}`
    : null;

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
            {isImage ? "Image" : "Text"}
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

      {isImage ? (
        <>
          <div className={styles.imageWrapper}>
            <img
              src={fullImageUrl}
              alt={post.caption || "Post image"}
              className={styles.postImage}
              onError={(e) => {
                e.target.onerror = null;
                // Use inline SVG data URI as fallback (no external requests)
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
