import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styles from "./ImageFeed.module.css";

// Main Component for Image Feed
function ImageFeed() {
  // IMPORTANT: For `currentUserId` to accurately display "(You)",
  // your backend needs an endpoint (e.g., GET /api/me) that returns the authenticated user's ID.
  // const [currentUserId, setCurrentUserId] = useState("anonymous-client-id");
  const currentUserId = useSelector((state) => state.auth.user?.user_id);
  const [imagePosts, setImagePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to fetch image posts from the backend
  const fetchImagePosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // NOTE: This assumes you have a GET /api/image-posts endpoint
      const response = await axiosInstance.get("/image-posts");
      const fetchedPosts = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      setImagePosts(fetchedPosts);
    } catch (err) {
      console.error(
        "Error fetching image posts:",
        err.response?.data || err.message
      );
      setError("Failed to load image posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch posts when the component mounts
  useEffect(() => {
    fetchImagePosts();
    // You can also fetch the current user's ID here, similar to Feeds.jsx
  }, [fetchImagePosts]);

  // Function to add a new image post
  const addImagePost = useCallback(async (formData) => {
    try {
      const response = await axiosInstance.post("/image-posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Get the new post object directly from the API response
      const newPost = response.data;

      // Add this new post to the top of your component's state
      setImagePosts((currentPosts) => [newPost, ...currentPosts]);
    } catch (e) {
      console.error("Error adding image post: ", e.response?.data || e.message);
      alert("Failed to add image post. Please try again.");
    }
  }, []); // The dependency array is now empty

  // Function to add a new comment (reused from Feeds.jsx)
  const addComment = useCallback(
    async (postId, commentText) => {
      try {
        await axiosInstance.post("/comments", {
          postId: postId,
          comment: commentText,
          userId: currentUserId,
        });
        console.log("Comment added successfully!");
        // The ImagePostItem component will re-fetch its comments to show the new one.
      } catch (e) {
        console.error("Error adding comment: ", e.response?.data || e.message);
        alert("Failed to add comment. Please try again.");
      }
    },
    [currentUserId]
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-inter">
      <div className="navbar">
        <button className="home-button" onClick={() => navigate("/")}>
          Go to Home
        </button>
        <button
          className="dashboard-button"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </button>
        <button className="profile-button" onClick={() => navigate("/profile")}>
          View Profile
        </button>
        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>
        <button
          className="image-feed-button"
          onClick={() => navigate("/images")}
        >
          View Image Feed
        </button>
      </div>
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Image Feed
        </h1>
        <ImagePostCreator onAddImagePost={addImagePost} />
      </div>

      <div className="w-full max-w-2xl">
        {loading ? (
          <p className="text-center text-gray-600">Loading images...</p>
        ) : imagePosts.length === 0 ? (
          <p className="text-center text-gray-600">
            No images yet. Be the first to post!
          </p>
        ) : (
          <div className="space-y-6">
            {imagePosts.map((post) => (
              <ImagePostItem
                key={post.id || post._id}
                post={post}
                currentUserId={currentUserId}
                onAddComment={addComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

// Component to create a new image post
function ImagePostCreator({ onAddImagePost }) {
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select an image to post.");
      return;
    }
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("caption", caption);

    onAddImagePost(formData);
    setCaption("");
    setSelectedFile(null);
    setPreview(null);
    e.target.reset(); // Reset the file input
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 p-4 rounded-lg shadow-inner mb-6"
    >
      <textarea
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 resize-y"
        rows="2"
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-3"
      />
      {preview && (
        <div className="mb-3">
          <img
            src={preview}
            alt="Preview"
            className="max-h-60 w-auto rounded-lg mx-auto"
          />
        </div>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
        >
          Post Image
        </button>
      </div>
    </form>
  );
}

// Component to display a single image post and its comments
function ImagePostItem({ post, currentUserId, onAddComment }) {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown time";
    return new Date(timestamp).toLocaleString();
  };

  const fetchComments = useCallback(async () => {
    if (!showComments) return;
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const postIdToFetch = post.id || post._id;
      const response = await axiosInstance.get(
        `/comments?postId=${postIdToFetch}`
      );
      const fetchedComments = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      setComments(fetchedComments);
    } catch (err) {
      setCommentsError("Failed to load comments.");
    } finally {
      setCommentsLoading(false);
    }
  }, [post.id, post._id, showComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <div className={styles.imageFeedItemContainer}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-700">
          Posted by:{" "}
          <span className="font-mono bg-gray-100 p-1 rounded text-xs">
            {post.user_id}
          </span>
          {post.user_id === currentUserId && (
            <span className="ml-2 text-blue-500">(You)</span>
          )}
        </p>
        <p className="text-xs text-gray-500">
          {formatTimestamp(post.timestamp)}
        </p>
      </div>
      {post.image_url && (
        <div className="mb-4 bg-gray-200 rounded-lg">
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}${post.image_url}`}
            alt={post.caption || "Image post"}
            className="max-h-96 w-auto rounded-lg mx-auto"
          />
          {/* <img
            src={post.image_url}
            alt={post.caption || "Image post"}
            className="max-h-96 w-auto rounded-lg mx-auto"
          /> */}
        </div>
      )}
      {post.caption && (
        <p className="text-gray-800 text-lg mb-4">{post.caption}</p>
      )}
      <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          {showComments
            ? `Hide Comments (${comments.length})`
            : `View Comments (${comments.length})`}
        </button>
      </div>
      {showComments && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Comments</h4>
          {commentsError ? (
            <p className="text-red-500 text-center text-sm">{commentsError}</p>
          ) : commentsLoading ? (
            <p className="text-center text-gray-500">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">
              No comments yet.
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id || comment._id}
                  comment={comment}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
          <CommentCreator
            postId={post.id || post._id}
            onAddComment={(postId, commentText) => {
              onAddComment(postId, commentText);
              setTimeout(fetchComments, 500); // Re-fetch after a delay
            }}
          />
        </div>
      )}
    </div>
  );
}

// Component to create a new comment (reused from Feeds.jsx)
function CommentCreator({ postId, onAddComment }) {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(postId, commentText);
    setCommentText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 bg-gray-50 p-3 rounded-lg shadow-inner"
    >
      <textarea
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 text-sm resize-y"
        rows="2"
        placeholder="Add a comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 text-sm"
        >
          Comment
        </button>
      </div>
    </form>
  );
}

// Component to display a single comment (reused from Feeds.jsx)
function CommentItem({ comment, currentUserId }) {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown time";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-gray-100 p-3 rounded-md border border-gray-200">
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm text-gray-800 break-words pr-4">
          {comment.comment}
        </p>
        <p className="text-xs text-gray-500 flex-shrink-0">
          {formatTimestamp(comment.timestamp)}
        </p>
      </div>
      <p className="text-xs font-semibold text-gray-600">
        By:{" "}
        <span className="font-mono bg-gray-200 p-1 rounded text-xs">
          {comment.userId}
        </span>
        {comment.userId === currentUserId && (
          <span className="ml-1 text-blue-500">(You)</span>
        )}
      </p>
    </div>
  );
}

export default ImageFeed;
