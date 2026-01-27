// src/components/ImageFeed/ImageFeed.jsx
import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";
import styles from "./ImageFeed.module.css";

// Skeleton Component for loading state
const ImageSkeleton = () => (
  <div className={styles.skeletonWrapper}>
    <div className={styles.skeletonHeader}></div>
    <div className={styles.skeletonImage}></div>
    <div className={styles.skeletonText}></div>
  </div>
);

// Image Post Creator Component
function ImagePostCreator({ onPostCreated }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image to upload.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);

    try {
      await axiosInstance.post("/image-posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Reset form
      setFile(null);
      setCaption("");
      setPreview(null);
      // Refresh the feed
      if (onPostCreated) onPostCreated();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className={styles.imagePostCreator}>
      <h3 className={styles.creatorTitle}>Share an Image</h3>
      <form onSubmit={handleSubmit}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        {preview ? (
          <div className={styles.previewContainer}>
            <img src={preview} alt="Preview" className={styles.previewImage} />
            <button
              type="button"
              onClick={clearPreview}
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
          className={styles.captionInput}
          placeholder="Add a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows="2"
        />

        <button
          type="submit"
          className={styles.uploadButton}
          disabled={!file || uploading}
        >
          {uploading ? "Uploading..." : "Post Image"}
        </button>
      </form>
    </div>
  );
}

function ImageFeed() {
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const [imagePosts, setImagePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImagePosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/image-posts");
      const fetchedPosts = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setImagePosts(fetchedPosts);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load feed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImagePosts();
  }, [fetchImagePosts]);

  if (error) return <div className={styles.errorContainer}>{error}</div>;

  return (
    <div className={styles.imageFeedContainer}>
      <div className={styles.mainContent}>
        <div className={styles.headerSection}>
          <h1>Image Feed</h1>
        </div>

        <ImagePostCreator onPostCreated={fetchImagePosts} />

        <div className={styles.feedList}>
          {loading ? (
            [1, 2, 3].map((n) => <ImageSkeleton key={n} />)
          ) : imagePosts.length === 0 ? (
            <p className={styles.emptyState}>
              No images yet. Be the first to post!
            </p>
          ) : (
            imagePosts.map((post) => (
              <ImagePostItem
                key={post.post_id || post.id || Math.random()}
                post={post}
                currentUserId={currentUserId}
                onDelete={fetchImagePosts}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Image Post Item Component
function ImagePostItem({ post, currentUserId, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  if (!post) return null;

  const API_BASE =
    import.meta.env.VITE_API_URL || "https://ninebyfourapi.herokuapp.com";

  // Resolve full image URL
  const fullImageUrl = post.image_url
    ? post.image_url.startsWith("http")
      ? post.image_url
      : `${API_BASE}${post.image_url}`
    : "https://via.placeholder.com/300?text=No+Image";

  const isOwner = currentUserId === post.user_id;

  const handleDelete = async () => {
    if (!window.confirm("Delete this image post?")) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/image-posts/${post.post_id}`);
      if (onDelete) onDelete();
    } catch (err) {
      console.error("Failed to delete post:", err);
      // alert("Failed to delete post.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.imagePostItem}>
      <div className={styles.postHeader}>
        <span className={styles.username}>
          {post.username || `User ${post.user_id}`}
        </span>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={styles.deleteButton}
          >
            {deleting ? "..." : "Delete"}
          </button>
        )}
      </div>

      <div className={styles.imageWrapper}>
        <img
          src={fullImageUrl}
          alt={post.caption || "Image post"}
          className={styles.postImage}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://via.placeholder.com/300?text=Image+Not+Found";
          }}
        />
      </div>

      {post.caption && <p className={styles.caption}>{post.caption}</p>}
    </div>
  );
}

export default ImageFeed;
