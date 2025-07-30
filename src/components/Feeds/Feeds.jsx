import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstance"; // Corrected path to axiosInstance
import styles from "./Feeds.module.css";

// Feeds Component
function Feeds() {
  // IMPORTANT: For `currentUserId` to accurately display "(You)",
  // your backend needs an endpoint (e.g., GET /api/me) that returns the authenticated user's ID.
  // Otherwise, `currentUserId` will remain 'anonymous-client-id' (or whatever default you set).
  const [currentUserId, setCurrentUserId] = useState("anonymous-client-id");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch posts from the backend
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/posts");
      // Safely access the posts array.
      // Confirm your backend's actual response structure by checking your browser's network tab.
      // If it's { data: [...] }, use response.data.data.
      // If it's directly [...], use response.data.
      // If it's { posts: [...] }, use response.data.posts.
      const fetchedPosts = Array.isArray(response.data)
        ? response.data
        : response.data.data || response.data.posts || []; // Added response.data.posts as another common pattern

      setPosts(fetchedPosts);
      console.log("Fetched and set posts:", fetchedPosts); // Log the actual posts array
    } catch (err) {
      console.error("Error fetching posts:", err.response?.data || err.message);
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch posts when the component mounts
  useEffect(() => {
    fetchPosts();
    // Optional: Fetch the actual current user ID from backend if available
    // Example (requires a backend endpoint like /api/me that returns { userId: '...' }):
    // const fetchCurrentUserId = async () => {
    //   try {
    //     const res = await axiosInstance.get('/me'); // Assuming /api/me if base URL is /api
    //     setCurrentUserId(res.data.userId);
    //   } catch (err) {
    //     console.error("Could not fetch current user ID:", err);
    //     // Handle case where user ID can't be fetched (e.g., not logged in, token invalid)
    //   }
    // };
    // fetchCurrentUserId();
  }, [fetchPosts]);

  // Function to add a new post
  const addPost = useCallback(
    async (postContent) => {
      try {
        await axiosInstance.post("/posts", { content: postContent });
        console.log("Post added successfully!");
        fetchPosts(); // Re-fetch all posts to show the new one
      } catch (e) {
        console.error("Error adding post: ", e.response?.data || e.message);
        alert("Failed to add post. Please try again.");
      }
    },
    [fetchPosts]
  );

  // Function to add a new comment
  const addComment = useCallback(
    async (postId, commentText) => {
      try {
        await axiosInstance.post("/comments", {
          postId: postId,
          comment: commentText,
          userId: currentUserId,
        });
        console.log("Comment added successfully!");
        // Note: The PostItem component will re-fetch its comments after a short delay
        // to show the newly added comment.
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
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Feeds
        </h1>
        {currentUserId && (
          <p className="text-sm text-gray-600 text-center mb-4">
            Your Client ID:{" "}
            <span className="font-mono bg-gray-200 p-1 rounded text-xs">
              {currentUserId}
            </span>
          </p>
        )}
        <PostCreator onAddPost={addPost} />
      </div>

      <div className="w-full max-w-2xl">
        {loading ? (
          <p className="text-center text-gray-600">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-600">
            No posts yet. Be the first to post!
          </p>
        ) : (
          <div className="space-y-6">
            {/* The .map() call is now safe because 'posts' is guaranteed to be an array */}
            {posts.map((post) => {
              console.log("Rendering post:", post); // Log each post being mapped
              return (
                <PostItem
                  // Ensure post.id exists. If backend uses a different primary key, adjust here (e.g., post.post_id, post._id)
                  key={post.id || post._id || Math.random()} // Fallback key for uniqueness
                  post={post}
                  currentUserId={currentUserId}
                  onAddComment={addComment}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sub-components (remain the same as before) ---

// PostCreator Component
function PostCreator({ onAddPost }) {
  const [postText, setPostText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!postText.trim()) {
      alert("Please enter some text to post.");
      return;
    }
    onAddPost(postText);
    setPostText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 p-4 rounded-lg shadow-inner mb-6"
    >
      <textarea
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 resize-y"
        rows="3"
        placeholder="What's on your mind?"
        value={postText}
        onChange={(e) => setPostText(e.target.value)}
      ></textarea>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
        >
          Post
        </button>
      </div>
    </form>
  );
}

// PostItem Component
function PostItem({ post, currentUserId, onAddComment }) {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  // Function to format timestamp (assuming timestamp is a string or number now)
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return timestamp;
    }
    return date.toLocaleString();
  };

  // Fetch comments for this post
  const fetchComments = useCallback(async () => {
    if (!showComments) return;

    setCommentsLoading(true);
    setCommentsError(null);
    try {
      // Corrected: Use post.id or post._id for postId in the URL
      const postIdToFetch = post.id || post._id; // Use 'id' or '_id' as primary key
      if (!postIdToFetch) {
        console.warn("Attempted to fetch comments for a post with no ID.");
        setCommentsError("Cannot fetch comments: Post ID is missing.");
        setCommentsLoading(false);
        return;
      }

      const response = await axiosInstance.get(
        `/comments?postId=${postIdToFetch}`
      );
      // Corrected: Safely access comments array from response
      const fetchedComments = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      setComments(fetchedComments);
    } catch (err) {
      console.error(
        "Error fetching comments for post",
        post.id,
        ":",
        err.response?.data || err.message
      );
      setCommentsError("Failed to load comments.");
    } finally {
      setCommentsLoading(false);
    }
  }, [post.id, post._id, showComments]); // Added post._id to dependencies

  // Re-fetch comments when showComments is toggled
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
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

      {post.content && (
        <p className="text-gray-800 text-lg mb-4 leading-relaxed">
          {post.content}
        </p>
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
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
          <CommentCreator
            postId={post.id || post._id} // Pass the correct postId to CommentCreator
            onAddComment={(postId, commentText) => {
              onAddComment(postId, commentText); // Call parent's addComment
              setTimeout(fetchComments, 500); // Re-fetch comments after a short delay for backend processing
            }}
          />
        </div>
      )}
    </div>
  );
}

// CommentCreator Component
function CommentCreator({ postId, onAddComment }) {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      alert("Please enter a comment.");
      return;
    }
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
      ></textarea>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition duration-150 ease-in-out text-sm"
        >
          Comment
        </button>
      </div>
    </form>
  );
}

// CommentItem Component
function CommentItem({ comment, currentUserId }) {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return timestamp;
    }
    return date.toLocaleString();
  };

  return (
    <div className="bg-gray-100 p-3 rounded-md border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-600">
          <span className="font-mono bg-gray-200 p-1 rounded text-xs">
            {comment.userId}
          </span>
          {comment.userId === currentUserId && (
            <span className="ml-1 text-blue-500">(You)</span>
          )}
        </p>
        <p className="text-gray-700 text-sm">{comment.comment}</p>
      </div>
      <p className="text-xs text-gray-500">
        {formatTimestamp(comment.timestamp)}
      </p>
    </div>
  );
}

export default Feeds;
