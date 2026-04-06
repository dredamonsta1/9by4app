import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./StickyCtaBar.module.css";

const SESSION_KEY = "9by4_cta_dismissed";

const StickyCtaBar = () => {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1"
  );

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className={styles.bar}>
      <p className={styles.copy}>
        Where do they rank on your list? Build your Top 20.
      </p>
      <Link to="/signup" className={styles.cta}>
        Join 9by4
      </Link>
      <button className={styles.close} onClick={handleDismiss} aria-label="Dismiss">
        &times;
      </button>
    </div>
  );
};

export default StickyCtaBar;
