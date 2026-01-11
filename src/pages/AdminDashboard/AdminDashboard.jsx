// src/components/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./AdminDashboard.module.css";
import WaitlistManager from "../../components/Admin/WaitlistManager.jsx";

const AdminDashboard = () => {
  const [apiStatus, setApiStatus] = useState({ music: "checking..." });

  const checkHealth = async () => {
    try {
      await axiosInstance.get("/music/upcoming");
      setApiStatus({ music: "Healthy" });
    } catch (e) {
      setApiStatus({ music: "Down" });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className={styles.container}>
      <section className={styles.healthCheck}>
        <h2>API Health</h2>
        <div
          className={apiStatus.music === "Healthy" ? styles.green : styles.red}
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
  );
};
export default AdminDashboard;
