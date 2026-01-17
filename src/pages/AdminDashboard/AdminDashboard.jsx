// src/components/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";
import styles from "./AdminDashboard.module.css";
import WaitlistManager from "../../components/Admin/WaitlistManager.jsx";

const AdminDashboard = () => {
  const [apiStatus, setApiStatus] = useState({ music: "checking..." });

  const [stats, setStats] = useState({
    total_users: 0,
    pending_waitlist: 0,
    total_posts: 0,
  });
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    try {
      await axiosInstance.get("/music/upcoming");
      setApiStatus({ music: "Healthy" });
    } catch (e) {
      setApiStatus({ music: "Down" });
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Stats fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    checkHealth();
  }, []);
  if (loading)
    return <div className={styles.loader}>Accessing Control Room...</div>;

  return (
    <>
      <div className={styles.container}>
        <section className={styles.healthCheck}>
          <h2>API Health</h2>
          <div
            className={
              apiStatus.music === "Healthy" ? styles.green : styles.red
            }
          >
            Spotify/MB Aggregator: {apiStatus.music}
          </div>
        </section>

        <section className={styles.waitlistSection}>
          <h2>Recent Waitlist Signups</h2>
          {/* Map your waitlist data here with an 'Approve' button */}
          <WaitlistManager />
        </section>
      </div>

      <div className={styles.adminContainer}>
        <header className={styles.header}>
          <h1>Vedioz Control Room</h1>
          <p>Platform health and user management.</p>
        </header>

        <div className={styles.statGrid}>
          <div className={styles.statCard}>
            <h3>Total Creators</h3>
            <p className={styles.statNumber}>{stats.total_users}</p>
          </div>

          <Link
            to="/admin/waitlist"
            className={`${styles.statCard} ${styles.interactiveCard}`}
          >
            <h3>Pending Waitlist</h3>
            <p className={styles.statNumber} style={{ color: "#00e676" }}>
              {stats.pending_waitlist}
            </p>
            <span className={styles.actionHint}>Review Invites →</span>
          </Link>

          <div className={styles.statCard}>
            <h3>Content Pieces</h3>
            <p className={styles.statNumber}>{stats.total_posts}</p>
          </div>
        </div>

        <section className={styles.quickActions}>
          <h2>Management Tools</h2>
          <div className={styles.toolGrid}>
            <Link to="/admin/waitlist" className={styles.toolBtn}>
              Manage Waitlist
            </Link>
            <button className={styles.toolBtn} disabled>
              User Audit (Coming Soon)
            </button>
            <button className={styles.toolBtn} disabled>
              Global Settings
            </button>
          </div>
        </section>
      </div>
      {/* New Code */}
      <div className={styles.adminContainer}>
        <header className={styles.header}>
          <h1>Vedioz Control Room</h1>
          <p>Platform health and user management.</p>
        </header>

        <div className={styles.statGrid}>
          <div className={styles.statCard}>
            <h3>Total Creators</h3>
            <p className={styles.statNumber}>{stats.total_users}</p>
          </div>

          <Link
            to="/admin/waitlist"
            className={`${styles.statCard} ${styles.interactiveCard}`}
          >
            <h3>Pending Waitlist</h3>
            <p className={styles.statNumber} style={{ color: "#00e676" }}>
              {stats.pending_waitlist}
            </p>
            <span className={styles.actionHint}>Review Invites →</span>
          </Link>

          <div className={styles.statCard}>
            <h3>Content Pieces</h3>
            <p className={styles.statNumber}>{stats.total_posts}</p>
          </div>
        </div>

        <section className={styles.quickActions}>
          <h2>Management Tools</h2>
          <div className={styles.toolGrid}>
            <Link to="/admin/waitlist" className={styles.toolBtn}>
              Manage Waitlist
            </Link>
            <button className={styles.toolBtn} disabled>
              User Audit (Coming Soon)
            </button>
            <button className={styles.toolBtn} disabled>
              Global Settings
            </button>
          </div>
        </section>
      </div>
    </>
  );
};
export default AdminDashboard;
