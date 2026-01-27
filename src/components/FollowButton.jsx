import React, { useState } from "react";

// ADJUST THIS to match where you store your token
const getToken = () => localStorage.getItem("token");

const FollowButton = ({ targetUserId, initialIsFollowing = false }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    const token = getToken();
    if (!token) {
      alert("You must be logged in to follow users.");
      console.log("Follow error: No auth token found.");
      return;
    }

    setLoading(true);

    // Determine Action: If following -> Delete. If not -> Post.
    const method = isFollowing ? "DELETE" : "POST";
    const endpoint = isFollowing ? "unfollow" : "follow";

    try {
      const response = await fetch(
        `http://localhost:3010/api/users/${targetUserId}/${endpoint}`,
        {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        // Toggle state only if API succeeds
        setIsFollowing(!isFollowing);
      } else {
        const errorData = await response.json();
        console.log("Follow error response:", errorData);
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Follow error:", error);
      console.log("Follow error details:", error);
      alert("Something went wrong.");
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
