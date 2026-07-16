import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./GuestAddPrompt.module.css";

/**
 * Modal shown when a guest tries to commit an action that requires an
 * account (e.g. tapping the featured artist card to add to their Top 20).
 * Aligns with the auth-wall placement rule: guests get discovery for
 * free, but the "commit" moment funnels them into signup.
 */
const GuestAddPrompt = ({ artistName, onClose }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-add-title"
      >
        <h2 id="guest-add-title" className={styles.title}>
          Sign up to stan {artistName || "this artist"}
        </h2>
        <p className={styles.body}>
          Join the waitlist to add artists to your Top 20 and vote to shape
          the culture.
        </p>
        <div className={styles.actions}>
          <Link to="/signup" className={styles.primary} onClick={onClose}>
            Join the Waitlist
          </Link>
          <button
            type="button"
            className={styles.ghost}
            onClick={onClose}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestAddPrompt;
