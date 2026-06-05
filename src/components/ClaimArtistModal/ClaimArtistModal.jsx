// src/components/ClaimArtistModal/ClaimArtistModal.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { addClaimRequest } from "../../store/authSlice";
import styles from "./ClaimArtistModal.module.css";

const normalizeHandle = (raw) => {
  if (typeof raw !== "string") return "";
  return raw.trim().replace(/^@+/, "").toLowerCase();
};

const ClaimArtistModal = ({ artist, onClose }) => {
  const dispatch = useDispatch();
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const ig = normalizeHandle(instagram);
  const tw = normalizeHandle(twitter);
  const canSubmit = (ig || tw) && note.trim().length > 0 && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await axiosInstance.post(`/artists/${artist.artist_id}/claim`, {
        proof_instagram_handle: ig || null,
        proof_twitter_handle: tw || null,
        note: note.trim(),
      });
      const claim = res.data?.claim_request;
      if (claim) {
        dispatch(
          addClaimRequest({
            id: claim.id,
            artist_id: claim.artist_id,
            status: claim.status,
            admin_reason: null,
            created_at: claim.created_at,
            reviewed_at: null,
            artist_name: artist.artist_name,
            artist_image_url: artist.image_url ?? null,
          })
        );
      }
      toast.success("Claim submitted — we'll email you when it's reviewed.");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit claim.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="claim-modal-title">
        <div className={styles.header}>
          <h2 id="claim-modal-title" className={styles.title}>
            Claim {artist.artist_name}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <p className={styles.intro}>
          We'll review your claim and email you when it's approved or if we need more info.
          Add at least one social handle so we can verify it's really you.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="claim-ig">
              Instagram handle <span className={styles.opt}>(one required)</span>
            </label>
            <input
              id="claim-ig"
              type="text"
              autoComplete="off"
              className={styles.input}
              placeholder="@yourhandle"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="claim-tw">
              Twitter / X handle <span className={styles.opt}>(one required)</span>
            </label>
            <input
              id="claim-tw"
              type="text"
              autoComplete="off"
              className={styles.input}
              placeholder="@yourhandle"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="claim-note">
              Anything we should know? <span className={styles.req}>*</span>
            </label>
            <textarea
              id="claim-note"
              className={styles.textarea}
              placeholder="A quick note proving you're this artist — a recent post, your website, anything that helps us verify."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              disabled={submitting}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={!canSubmit}
            >
              {submitting ? "Submitting…" : "Submit claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimArtistModal;
