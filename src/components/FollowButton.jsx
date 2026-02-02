import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const FollowButton = ({ targetUserId, initialIsFollowing = false }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Follow error: No auth token found.");
      return;
    }

    setLoading(true);

    const endpoint = isFollowing ? "unfollow" : "follow";
    const method = isFollowing ? "delete" : "post";

    try {
      await axiosInstance[method](`/users/${targetUserId}/${endpoint}`);
      setIsFollowing(!isFollowing);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      console.error("Follow error:", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      style={{
        padding: "8px 16px",
        backgroundColor: isFollowing ? "#ccc" : "#007bff",
        color: isFollowing ? "black" : "white",
        border: "none",
        borderRadius: "4px",
        cursor: loading ? "not-allowed" : "pointer",
        fontWeight: "bold",
        marginLeft: "10px",
      }}
    >
      {loading ? "..." : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
};

export default FollowButton;
