import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./ClaimRequestsQueue.module.css";

const STATUS_FILTERS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const ClaimRequestsQueue = () => {
  const [status, setStatus] = useState("pending");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [flash, setFlash] = useState(null);

  // Per-row reject form state: { [claimId]: { open: bool, reason: string } }
  const [rejectState, setRejectState] = useState({});

  const fetchRequests = useCallback(async (nextStatus) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `/admin/claim-requests?status=${encodeURIComponent(nextStatus)}`
      );
      setRequests(res.data.claim_requests ?? []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load claim requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(status);
  }, [fetchRequests, status]);

  const handleApprove = async (claim) => {
    if (
      !window.confirm(
        `Approve @${claim.requester_username} → ${claim.artist_name}? This links them and rejects sibling pending claims for the same artist.`
      )
    ) {
      return;
    }
    setActionId(claim.id);
    try {
      const res = await axiosInstance.post(
        `/admin/claim-requests/${claim.id}/approve`
      );
      const cascade = res.data?.cascade_rejected_count ?? 0;
      const emailStatus = res.data?.email?.status ?? "?";
      setRequests((prev) => prev.filter((r) => r.id !== claim.id));
      setFlash(
        `Approved @${claim.requester_username} → ${claim.artist_name}` +
          (cascade > 0 ? ` (auto-rejected ${cascade} sibling${cascade === 1 ? "" : "s"})` : "") +
          ` · email: ${emailStatus}`
      );
    } catch (err) {
      setFlash(`Error: ${err.response?.data?.message || "Failed to approve."}`);
    } finally {
      setActionId(null);
    }
  };

  const toggleRejectForm = (claimId) => {
    setRejectState((prev) => ({
      ...prev,
      [claimId]: prev[claimId]?.open
        ? { open: false, reason: "" }
        : { open: true, reason: prev[claimId]?.reason ?? "" },
    }));
  };

  const updateRejectReason = (claimId, reason) => {
    setRejectState((prev) => ({
      ...prev,
      [claimId]: { open: true, reason },
    }));
  };

  const handleReject = async (claim) => {
    const reason = (rejectState[claim.id]?.reason ?? "").trim();
    setActionId(claim.id);
    try {
      const res = await axiosInstance.post(
        `/admin/claim-requests/${claim.id}/reject`,
        { admin_reason: reason || null }
      );
      const emailStatus = res.data?.email?.status ?? "?";
      setRequests((prev) => prev.filter((r) => r.id !== claim.id));
      setRejectState((prev) => {
        const next = { ...prev };
        delete next[claim.id];
        return next;
      });
      setFlash(
        `Rejected @${claim.requester_username} → ${claim.artist_name} · email: ${emailStatus}`
      );
    } catch (err) {
      setFlash(`Error: ${err.response?.data?.message || "Failed to reject."}`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.filterRow}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={status === f.key ? styles.filterBtnActive : styles.filterBtn}
              onClick={() => setStatus(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.refreshBtn}
          onClick={() => fetchRequests(status)}
        >
          Refresh
        </button>
      </div>

      {flash && <p className={styles.flash}>{flash}</p>}
      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : requests.length === 0 ? (
        <p className={styles.muted}>No {status} claim requests.</p>
      ) : (
        <ul className={styles.list}>
          {requests.map((c) => {
            const igUrl = c.proof_instagram_handle
              ? `https://instagram.com/${c.proof_instagram_handle}`
              : null;
            const twUrl = c.proof_twitter_handle
              ? `https://x.com/${c.proof_twitter_handle}`
              : null;
            const isActing = actionId === c.id;
            const rejectOpen = !!rejectState[c.id]?.open;

            return (
              <li key={c.id} className={styles.row}>
                <div className={styles.rowMain}>
                  {c.artist_image_url ? (
                    <img
                      src={c.artist_image_url}
                      alt={c.artist_name}
                      className={styles.avatar}
                    />
                  ) : (
                    <span className={styles.avatarFallback}>
                      {(c.artist_name?.[0] ?? "?").toUpperCase()}
                    </span>
                  )}
                  <div className={styles.pair}>
                    <span className={styles.artistName}>
                      {c.artist_name}
                      {c.artist_is_verified && (
                        <span className={styles.warnBadge}>already linked</span>
                      )}
                    </span>
                    <span className={styles.userLine}>
                      @{c.requester_username} · {c.requester_email} · user #{c.user_id}
                    </span>
                    <span className={styles.submittedAt}>
                      Submitted {formatDate(c.created_at)}
                    </span>
                  </div>
                  {status === "pending" && (
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.approveBtn}
                        onClick={() => handleApprove(c)}
                        disabled={isActing}
                      >
                        {isActing && !rejectOpen ? "Working…" : "Approve"}
                      </button>
                      <button
                        type="button"
                        className={styles.rejectBtn}
                        onClick={() => toggleRejectForm(c.id)}
                        disabled={isActing}
                      >
                        {rejectOpen ? "Cancel" : "Reject"}
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.proof}>
                  {igUrl && (
                    <a
                      href={igUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.proofLink}
                    >
                      IG: @{c.proof_instagram_handle}
                    </a>
                  )}
                  {twUrl && (
                    <a
                      href={twUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.proofLink}
                    >
                      X: @{c.proof_twitter_handle}
                    </a>
                  )}
                </div>

                <p className={styles.note}>{c.note}</p>

                {status !== "pending" && c.admin_reason && (
                  <p className={styles.adminReason}>
                    <strong>Admin reason:</strong> {c.admin_reason}
                  </p>
                )}

                {rejectOpen && (
                  <div className={styles.rejectForm}>
                    <textarea
                      className={styles.rejectTextarea}
                      placeholder="Reason for rejection (optional — sent to the requester via email)"
                      value={rejectState[c.id]?.reason ?? ""}
                      onChange={(e) => updateRejectReason(c.id, e.target.value)}
                      rows={3}
                      disabled={isActing}
                    />
                    <button
                      type="button"
                      className={styles.confirmRejectBtn}
                      onClick={() => handleReject(c)}
                      disabled={isActing}
                    >
                      {isActing ? "Rejecting…" : "Confirm reject"}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ClaimRequestsQueue;
