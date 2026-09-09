// src/components/Admin/WaitlistManager.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./WaitlistManager.module.css";

// Mirrors INVITE_TTL_DAYS on the API. Duplicated rather than fetched
// because this is display only — the server decides what's actually valid,
// and a stale number here shows a wrong countdown, not a wrong outcome.
const INVITE_TTL_DAYS = 30;

/**
 * How long an approved invite has left.
 *
 * approved_at is NULL for everything approved before 2026-09-09, because the
 * route never wrote it. The API treats NULL as never-expiring, so this says
 * so plainly rather than showing a countdown it can't compute.
 */
const inviteState = (entry) => {
  if (entry.status !== "approved") return null;
  if (!entry.approved_at) return { label: "no expiry", stale: true };
  const daysLeft = Math.ceil(
    (new Date(entry.approved_at).getTime() + INVITE_TTL_DAYS * 86400000 - Date.now()) / 86400000
  );
  if (daysLeft <= 0) return { label: "expired", expired: true };
  if (daysLeft === 1) return { label: "1 day left", soon: true };
  return { label: `${daysLeft} days left`, soon: daysLeft <= 7 };
};

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

  const [busyEmail, setBusyEmail] = useState(null);

  // Approve and re-approve are the same call. Re-approving issues a fresh
  // code and resets approved_at, which is the only way to restart the clock
  // on an invite — and the only way to give the pre-expiry approvals (whose
  // approved_at is NULL) an expiry at all.
  const handleApprove = async (email, isReissue = false) => {
    if (
      isReissue &&
      !window.confirm(
        `Send ${email} a new invite code?\n\nTheir current code stops working immediately.`
      )
    ) {
      return;
    }
    setBusyEmail(email);
    try {
      const response = await axiosInstance.patch("/admin/approve-creator", {
        email,
      });
      toast.success(response.data.message);
      fetchEntries();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ?? "Approval failed — the invite was not sent."
      );
    } finally {
      setBusyEmail(null);
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
            <th>Expires</th>
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
                {(() => {
                  const state = inviteState(entry);
                  if (!state) return "—";
                  return (
                    <span
                      className={`${styles.expiry} ${
                        state.expired
                          ? styles.expiryExpired
                          : state.soon
                          ? styles.expirySoon
                          : state.stale
                          ? styles.expiryStale
                          : ""
                      }`}
                    >
                      {state.label}
                    </span>
                  );
                })()}
              </td>
              <td>
                {entry.status === "pending" && (
                  <button
                    onClick={() => handleApprove(entry.email)}
                    className={styles.approveBtn}
                    disabled={busyEmail === entry.email}
                  >
                    {busyEmail === entry.email ? "Sending…" : "Approve & Generate"}
                  </button>
                )}
                {entry.status === "approved" && (
                  <button
                    onClick={() => handleApprove(entry.email, true)}
                    className={styles.reissueBtn}
                    disabled={busyEmail === entry.email}
                    title="Send a new code and restart the 30-day clock"
                  >
                    {busyEmail === entry.email ? "Sending…" : "Reissue"}
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
