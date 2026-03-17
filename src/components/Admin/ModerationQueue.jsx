// src/components/Admin/ModerationQueue.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./ModerationQueue.module.css";

const ModerationQueue = ({ onCountChange }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/moderation-queue");
      setPosts(res.data);
      if (onCountChange) onCountChange(res.data.length);
    } catch (err) {
      console.error("Failed to fetch moderation queue", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (postId, action) => {
    setActionLoading(postId);
    try {
      await axiosInstance.patch(`/admin/moderation-queue/${postId}`, { action });
      setPosts((prev) => prev.filter((p) => p.post_id !== postId));
      if (onCountChange) onCountChange((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(`Failed to ${action} post`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const truncate = (text, max = 200) =>
    text && text.length > max ? text.slice(0, max) + "…" : text;

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <p className={styles.loading}>Loading moderation queue...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.count}>
          {posts.length === 0 ? "No flagged posts" : `${posts.length} flagged post${posts.length !== 1 ? "s" : ""}`}
        </span>
        <button onClick={fetchQueue} className={styles.refreshBtn}>
          Refresh
        </button>
      </div>

      {posts.length === 0 ? (
        <p className={styles.emptyState}>No flagged posts — all clear.</p>
      ) : (
        <div className={styles.postList}>
          {posts.map((post) => (
            <div key={post.post_id} className={styles.postCard}>
              <div className={styles.postMeta}>
                <span className={styles.username}>{post.username}</span>
                <span className={styles.timestamp}>{formatTime(post.created_at)}</span>
              </div>
              <p className={styles.postContent}>{truncate(post.content)}</p>
              {post.moderation_reason && (
                <p className={styles.flagReason}>
                  <span className={styles.flagLabel}>Flag reason:</span> {post.moderation_reason}
                </p>
              )}
              <div className={styles.actions}>
                <button
                  className={styles.approveBtn}
                  disabled={actionLoading === post.post_id}
                  onClick={() => handleAction(post.post_id, "approve")}
                >
                  {actionLoading === post.post_id ? "..." : "Approve"}
                </button>
                <button
                  className={styles.removeBtn}
                  disabled={actionLoading === post.post_id}
                  onClick={() => handleAction(post.post_id, "remove")}
                >
                  {actionLoading === post.post_id ? "..." : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerationQueue;
