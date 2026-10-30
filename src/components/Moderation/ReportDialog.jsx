import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { FALLBACK_REASONS, orderReasons, reasonLabel } from "./reportReasons";
import { useEscape } from "./useEscape";
import styles from "./Moderation.module.css";

const MAX_DETAIL = 1000;

/**
 * Report a post or a user. Mirrors the iOS ReportSheet: pick a reason, add
 * optional detail, submit. Reporting the same thing twice is still a
 * success; the server says so and the user doesn't need to hear it.
 */
const ReportDialog = ({ targetType, targetId, reportedUserId, preview, onClose }) => {
  const [reasons, setReasons] = useState(null);
  const [reason, setReason] = useState(null);
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEscape(onClose);

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get("/moderation/report/reasons")
      .then((res) => {
        const list = res.data?.reasons;
        if (!cancelled) setReasons(Array.isArray(list) && list.length ? orderReasons(list) : FALLBACK_REASONS);
      })
      .catch(() => {
        if (!cancelled) setReasons(FALLBACK_REASONS);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!reason || submitting) return;
    setSubmitting(true);
    setError(null);
    const trimmed = detail.trim();
    try {
      await axiosInstance.post("/moderation/report", {
        target_type: targetType,
        target_id: targetId,
        reason,
        detail: trimmed || null,
        reported_user_id: reportedUserId ?? null,
      });
      setDone(true);
    } catch {
      setError("Couldn't send that report. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
      >
        {done ? (
          <div className={styles.done}>
            <h2 id="report-title" className={styles.title}>Thanks, we'll take a look</h2>
            <p className={styles.body}>
              If you'd rather not see this person at all, you can block them from the same menu.
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2 id="report-title" className={styles.title}>Report</h2>

            {preview && (
              <div className={styles.preview}>
                <span className={styles.previewLabel}>You're reporting</span>
                <p className={styles.previewText}>{preview}</p>
              </div>
            )}

            <fieldset className={styles.reasons}>
              <legend className={styles.legend}>Why are you reporting this?</legend>
              {reasons === null ? (
                <p className={styles.muted}>Loading…</p>
              ) : (
                reasons.map((r) => (
                  <label key={r} className={r === reason ? styles.reasonOn : styles.reason}>
                    <input
                      type="radio"
                      name="report-reason"
                      value={r}
                      checked={r === reason}
                      onChange={() => setReason(r)}
                    />
                    {reasonLabel(r)}
                  </label>
                ))
              )}
            </fieldset>

            <label className={styles.detailLabel} htmlFor="report-detail">
              Anything else? (optional)
            </label>
            <textarea
              id="report-detail"
              className={styles.detail}
              rows={3}
              maxLength={MAX_DETAIL}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />

            {error && <p className={styles.error} role="alert">{error}</p>}

            <p className={styles.fine}>
              Reports go to the StanBox team for review. We don't tell the other person who reported them.
            </p>

            <div className={styles.actionsRow}>
              <button type="button" className={styles.ghost} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={styles.primary} disabled={!reason || submitting}>
                {submitting ? "Sending…" : "Submit report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportDialog;
