// // src/pages/AdminDashboard/AdminDashboard.jsx
// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../utils/axiosInstance";
// import styles from "./AdminDashboard.module.css";

// const AdminDashboard = () => {
//   const [stats, setStats] = useState({ users: 0, posts: 0, waitlist: 0 });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchAdminData = async () => {
//       try {
//         // You'll need to create these endpoints on your backend
//         const [u, p, w] = await Promise.all([
//           axiosInstance.get("/admin/count-users"),
//           axiosInstance.get("/admin/count-posts"),
//           axiosInstance.get("/waitlist"),
//         ]);
//         setStats({
//           users: u.data.count,
//           posts: p.data.count,
//           waitlist: w.data.length,
//         });
//       } catch (err) {
//         console.error("Admin fetch failed", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAdminData();
//   }, []);

//   return (
//     <div className={styles.container}>
//       <h1>System Oversight</h1>
//       <div className={styles.statsGrid}>
//         <div className={styles.statCard}>
//           <h3>Total Creators</h3>
//           <p>{stats.users}</p>
//         </div>
//         <div className={styles.statCard}>
//           <h3>Pending Waitlist</h3>
//           <p>{stats.waitlist}</p>
//         </div>
//         <div className={styles.statCard}>
//           <h3>Total Posts</h3>
//           <p>{stats.posts}</p>
//         </div>
//       </div>

//       <section className={styles.actionSection}>
//         <h2>Waitlist Management</h2>
//         {/* We would render your WaitlistAdmin component here */}
//       </section>
//     </div>
//   );
// };

// export default AdminDashboard;

// ***************************************************************
// OLD CODE FOR REFERENCE ONLY - DO NOT DELETE
// ***************************************************************

// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../utils/axiosInstance";
// import styles from "./AdminDashboard.module.css";

// const AdminDashboard = () => {
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const getStats = async () => {
//       try {
//         const res = await axiosInstance.get("/admin/stats");
//         setStats(res.data);
//       } catch (e) {
//         console.error("Stats fetch failed");
//       } finally {
//         setLoading(false);
//       }
//     };
//     getStats();
//   }, []);

//   if (loading)
//     return <div className={styles.loader}>Accessing secure data...</div>;

//   return (
//     <div className={styles.adminWrapper}>
//       <header className={styles.header}>
//         <h1>9by4 Control Center</h1>
//         <span className={styles.statusBadge}>System Operational</span>
//       </header>

//       <div className={styles.grid}>
//         <div className={styles.card}>
//           <h3>Active Creators</h3>
//           <p className={styles.bigNum}>{stats?.users || 0}</p>
//         </div>
//         <div className={styles.card}>
//           <h3>Waitlist Entry</h3>
//           <p className={styles.bigNum}>{stats?.waitlist || 0}</p>
//           <button onClick={() => (window.location.href = "/admin/waitlist")}>
//             Review
//           </button>
//         </div>
//         <div className={styles.card}>
//           <h3>Total Content</h3>
//           <p className={styles.bigNum}>{stats?.posts || 0}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

// // ***************************************************************
// // OLD CODE FOR REFERENCE ONLY - DO NOT DELETE
// // ***************************************************************

// src/components/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./AdminDashboard.module.css";

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
      </section>
    </div>
  );
};
export default AdminDashboard;
