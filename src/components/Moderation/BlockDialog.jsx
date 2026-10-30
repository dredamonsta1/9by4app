import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useEscape } from "./useEscape";
import styles from "./Moderation.module.css";

/**
 * Confirm, then block. Same copy as iOS. On success the caller decides
 * what disappears (feed posts, or the profile you're standing on).
 */
const BlockDialog = ({ userId, username, onBlocked, onClose }) => {
  const [blocking, setBlocking] = useState(false);
  const [error, setError] = useState(null);
  const who = username ? `@${username}` : "this user";

  useEscape(onClose);

  const block = async () => {
    if (blocking) return;
    setBlocking(true);
    setError(null);
    try {
      await axiosInstance.post(`/moderation/block/${userId}`);
      onBlocked?.(userId);
      onClose();
    } catch {
      setError("Couldn't block this user. Try again.");
      setBlocking(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="block-title"
      >
        <h2 id="block-title" className={styles.title}>Block {who}?</h2>
        <p className={styles.body}>
          You won't see their posts and they won't be able to message you. They aren't told.
        </p>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actionsRow}>
          <button type="button" className={styles.ghost} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.danger} onClick={block} disabled={blocking}>
            {blocking ? "Blocking…" : "Block"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockDialog;
