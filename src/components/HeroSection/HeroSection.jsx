import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./HeroSection.module.css";

const HeroSection = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axiosInstance.get("/artists/stats")
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  const formatLastUpdated = (ts) => {
    if (!ts) return null;
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff} min ago`;
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <header className={styles.hero}>
      <div className={styles.wordmark}>Vedioz</div>
      <p className={styles.tagline}>The list is decided by the people.</p>
      {stats && (
        <div className={styles.statRow}>
          <span>{stats.artist_count.toLocaleString()} artists</span>
          <span className={styles.dot}>·</span>
          <span>{stats.fan_count.toLocaleString()} fans voting</span>
          {stats.last_updated && (
            <>
              <span className={styles.dot}>·</span>
              <span>Updated {formatLastUpdated(stats.last_updated)}</span>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default HeroSection;
