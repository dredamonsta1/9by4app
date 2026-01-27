// src/components/Admin/WaitlistManager.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./WaitlistManager.module.css";

const WaitlistManager = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/waitlist-entries");
      setEntries(res.data);
    } catch (err) {
      console.error("Failed to fetch waitlist", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleApprove = async (email) => {
    try {
      const response = await axiosInstance.patch("/admin/approve-creator", {
        email,
      });

      // Instead of an alert with the code, show a success toast
      toast.success(response.data.message); // If you have a toast library

      // Refresh the list to show the user is now 'approved'
      fetchWaitlist();
    } catch (err) {
      console.error("Approval failed");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a temporary toast here
  };

  if (loading) return <p>Loading prospective creators...</p>;

  return (
    <div className={styles.managerContainer}>
      <div className={styles.header}>
        <h2>Waitlist Management</h2>
        <button onClick={fetchEntries} className={styles.refreshBtn}>
          Refresh
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Invite Code</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.email} className={styles[entry.status]}>
              <td>{entry.full_name}</td>
              <td>{entry.email}</td>
              <td>
                <span
                  className={`${styles.statusBadge} ${styles[entry.status]}`}
                >
                  {entry.status}
                </span>
              </td>
              <td>
                {entry.invite_code ? (
                  <div className={styles.codeWrapper}>
                    <code>{entry.invite_code}</code>
                    <button
                      onClick={() => copyToClipboard(entry.invite_code)}
                      className={styles.copyBtn}
                      title="Copy Code"
                    >
                      📋
                    </button>
                  </div>
                ) : (
                  "—"
                )}
              </td>
              <td>
                {entry.status === "pending" && (
                  <button
                    onClick={() => handleApprove(entry.email)}
                    className={styles.approveBtn}
                  >
                    Approve & Generate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WaitlistManager;
