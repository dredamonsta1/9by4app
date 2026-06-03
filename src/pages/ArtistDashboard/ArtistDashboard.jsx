import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./ArtistDashboard.module.css";

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const tierFor = (position) => {
  if (position == null) return "unranked";
  if (position <= 5) return "top5";
  if (position <= 10) return "top10";
  return "top20";
};

const ArtistDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const artistId = user?.artist_id ?? null;

  const [stans, setStans] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!artistId) return;
    setLoading(true);
    setError(null);
    axiosInstance
      .get(`/artists/${artistId}/stans`)
      .then((res) => {
        setStans(res.data.stans ?? []);
        setCount(res.data.count ?? 0);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load your stans.");
      })
      .finally(() => setLoading(false));
  }, [artistId]);

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.gate}>
          <h1>Artist Dashboard</h1>
          <p>Log in to see your stans.</p>
          <Link to="/login" className={styles.gateBtn}>Log in</Link>
        </div>
      </div>
    );
  }

  if (!artistId) {
    return (
      <div className={styles.page}>
        <div className={styles.gate}>
          <h1>Artist Dashboard</h1>
          <p>This dashboard is for verified artists on stanbox.</p>
          <p className={styles.gateSub}>
            If you're an artist in the catalog and want to claim your page,
            reach out and an admin can link your account.
          </p>
        </div>
      </div>
    );
  }

  const tierCounts = stans.reduce(
    (acc, s) => {
      acc[tierFor(s.position)] = (acc[tierFor(s.position)] ?? 0) + 1;
      return acc;
    },
    { top5: 0, top10: 0, top20: 0, unranked: 0 }
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your Stans</h1>
        <p className={styles.subtitle}>
          People who have you in their Top 20 on stanbox.
        </p>
        <Link to="/artist-settings" className={styles.editWorldLink}>
          Edit your world →
        </Link>
      </header>

      <section className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{count}</span>
          <span className={styles.statLabel}>Total stans</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{tierCounts.top5}</span>
          <span className={styles.statLabel}>Ranked top 5</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{tierCounts.top5 + tierCounts.top10}</span>
          <span className={styles.statLabel}>Ranked top 10</span>
        </div>
      </section>

      <section className={styles.listSection}>
        <h2 className={styles.listTitle}>Stan list</h2>

        {loading && <p className={styles.muted}>Loading your stans…</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && stans.length === 0 && (
          <p className={styles.muted}>
            No one has you in their Top 20 yet. That changes once fans start
            ranking you.
          </p>
        )}

        {!loading && !error && stans.length > 0 && (
          <ul className={styles.list}>
            {stans.map((s) => (
              <li key={s.user_id} className={styles.row}>
                <span className={`${styles.rank} ${styles[tierFor(s.position)]}`}>
                  {s.position ?? "—"}
                </span>
                <Link to={`/profile/${s.user_id}`} className={styles.userLink}>
                  {s.profile_image ? (
                    <img
                      src={s.profile_image}
                      alt={s.username}
                      className={styles.avatar}
                    />
                  ) : (
                    <span className={styles.avatarFallback}>
                      {(s.username?.[0] ?? "?").toUpperCase()}
                    </span>
                  )}
                  <span className={styles.username}>@{s.username}</span>
                </Link>
                <span className={styles.added}>Added {formatDate(s.added_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ArtistDashboard;
