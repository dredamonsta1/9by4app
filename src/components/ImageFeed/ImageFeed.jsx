// src/components/ImageFeed/ImageFeed.jsx
import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";
import styles from "./ImageFeed.module.css";

// 1. Skeleton Component (Defensive UI)
const ImageSkeleton = () => (
  <div className={styles.skeletonWrapper}>
    <div className={styles.skeletonHeader}></div>
    <div className={styles.skeletonImage}></div>
    <div className={styles.skeletonText}></div>
  </div>
);

function ImageFeed() {
  const currentUserId = useSelector((state) => state.auth.user?.user_id);
  const [imagePosts, setImagePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImagePosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/image-posts");
      // DEFENSIVE: Fallback to empty array if data is missing
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

  // Handle errors gracefully instead of crashing
  if (error) return <div className={styles.errorContainer}>{error}</div>;

  return (
    <div className={styles.imageFeedContainer}>
      {/* NOTE: NavBar is removed from here because we put it in App.jsx.
         If you see TWO navbars, delete the one in App.jsx.
      */}
      <div className={styles.mainContent}>
        <div className={styles.headerSection}>
          <h1>Image Feed</h1>
          {/* We'll re-integrate ImagePostCreator once the screen is blue/white again */}
        </div>

        <div className={styles.feedList}>
          {loading ? (
            // Show 3 skeletons while loading
            [1, 2, 3].map((n) => <ImageSkeleton key={n} />)
          ) : imagePosts.length === 0 ? (
            <p className="text-center">No images yet. Be the first to post!</p>
          ) : (
            imagePosts.map((post) => (
              <ImagePostItem
                key={post.id || post._id || Math.random()}
                post={post}
                currentUserId={currentUserId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 2. Minimalist Post Item to prevent crashes
// This goes inside the ImagePostItem sub-component
function ImagePostItem({ post, currentUserId }) {
  if (!post) return null;

  // 1. Define the base URL (matches your Axios config)
  const API_URL =
    import.meta.env.VITE_API_URL || "https://ninebyfourapi.herokuapp.com/api";

  // 2. Resolve the image URL safely
  // We check if the image_url exists first to prevent crashes
  const fullImageUrl = post.image_url
    ? post.image_url.startsWith("http")
      ? post.image_url
      : `${API_URL}${post.image_url}`
    : "https://via.placeholder.com/300?text=No+Image";

  return (
    <div className={styles.imageFeedItemContainer}>
      <p className="text-sm font-bold">Post by: {post.user_id || "Unknown"}</p>

      {/* 3. The Defensive Image Tag */}
      <div className={styles.imageWrapper}>
        <img
          src={fullImageUrl}
          alt={post.caption || "Creator Post"}
          className="w-full h-auto rounded shadow-sm"
          // Fallback if the resolved URL returns a 404
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loops
            e.target.src =
              "https://via.placeholder.com/300?text=Image+Not+Found";
          }}
        />
      </div>

      <p className="mt-2 text-gray-700">{post.caption}</p>
    </div>
  );
}

export default ImageFeed;
