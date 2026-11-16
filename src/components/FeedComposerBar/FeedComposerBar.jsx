import React, { useState } from "react";
import { Link } from "react-router-dom";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./FeedComposerBar.module.css";

/**
 * The top of the feed, for the signed-in fan: their own photo beside a
 * "What's on your mind?" prompt, so the feed reads as theirs. The prompt
 * opens the existing composer (UploadModal); the photo goes to their
 * profile. Without a photo, or if it fails to load, it shows their initial.
 */
const FeedComposerBar = ({ user, onCompose }) => {
  const [imageFailed, setImageFailed] = useState(false);
  if (!user) return null;

  const photo = !imageFailed && resolveImageUrl(user.profile_image, null);
  const initial = (user.username || "?").trim().charAt(0).toUpperCase();

  return (
    <div className={styles.bar}>
      <Link to="/profile" className={styles.avatarLink} aria-label="Your profile">
        {photo ? (
          <img
            src={photo}
            alt=""
            className={styles.avatar}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className={styles.initial} aria-hidden="true">
            {initial}
          </span>
        )}
      </Link>
      <button type="button" className={styles.prompt} onClick={onCompose}>
        What&rsquo;s on your mind?
      </button>
    </div>
  );
};

export default FeedComposerBar;
