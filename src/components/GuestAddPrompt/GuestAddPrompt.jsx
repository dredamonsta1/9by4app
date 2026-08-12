import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { setPendingStan } from "../../utils/pendingStan";
import styles from "./GuestAddPrompt.module.css";

/**
 * Modal shown when a guest tries to commit an action that requires an
 * account (e.g. tapping the featured artist card to add to their Top 20).
 * Aligns with the auth-wall placement rule: guests get discovery for
 * free, but the "commit" moment funnels them into signup.
 *
 * Taking the signup path also parks the artist they were reaching for, so
 * the account they create starts with that pick already in the Top 20
 * rather than discarding the intent that got them here.
 */
const GuestAddPrompt = ({ artist, artistName, onClose }) => {
  const displayName = artist?.artist_name ?? artistName;

  const handleSignupClick = () => {
    setPendingStan(artist);
    onClose();
  };

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
          Sign up to stan {displayName || "this artist"}
        </h2>
        <p className={styles.body}>
          {displayName
            ? `Join the waitlist and ${displayName} is your first pick — then vote to shape the culture.`
            : "Join the waitlist to add artists to your Top 20 and vote to shape the culture."}
        </p>
        <div className={styles.actions}>
          <Link
            to="/signup"
            className={styles.primary}
            onClick={handleSignupClick}
          >
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
