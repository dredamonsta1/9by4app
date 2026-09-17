import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { logout } from "../../store/authSlice";
import styles from "./DeleteAccount.module.css";

/**
 * Self-service account deletion.
 *
 * App Store review requires this for any app that creates accounts, and an
 * endpoint with no button does not satisfy it — the reviewer looks for the
 * control. It is the customer's right regardless of the rule.
 *
 * Deliberately not one tap. The requirement is that deletion be *available*,
 * not frictionless, and this cannot be undone. Typing the username is the
 * same standard as the crate reissue confirmation, scaled to the stakes.
 *
 * The copy is specific about what survives. Saying "this deletes everything"
 * when posts are parked and purchases are kept would be a lie the user only
 * discovers afterwards.
 */
const DeleteAccount = ({ username }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const matches = confirm.trim() === (username ?? "").trim() && !!username;

  const handleDelete = async () => {
    if (!matches || deleting) return;
    setDeleting(true);
    try {
      await axiosInstance.delete("/users/me");
      // Clear the session before navigating. Leaving a token for an account
      // that no longer resolves puts the app in a state where every request
      // fails with no explanation.
      dispatch(logout());
      localStorage.removeItem("token");
      toast.success("Your account has been deleted.");
      navigate("/");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ?? "Couldn't delete your account. Try again."
      );
      setDeleting(false);
    }
  };

  return (
    <section className={styles.wrap}>
      {!open ? (
        <button
          type="button"
          className={styles.openBtn}
          onClick={() => setOpen(true)}
        >
          Delete account
        </button>
      ) : (
        <div className={styles.panel}>
          <h3 className={styles.title}>Delete your account</h3>

          <p className={styles.body}>This removes, permanently:</p>
          <ul className={styles.list}>
            <li>Your email, username and profile picture</li>
            <li>Your Top 20 and your music personality</li>
          </ul>

          <p className={styles.body}>This stays on stanbox:</p>
          <ul className={styles.list}>
            <li>
              Posts and messages you wrote, shown as a deleted account — so
              replies and conversations stay readable for everyone else
            </li>
            <li>Crates you shared, so links other people hold keep working</li>
            <li>
              Quarterly picks and purchase records, which we keep for sealed
              charts and for refunds
            </li>
          </ul>

          <p className={styles.warning}>
            This cannot be undone. Type <strong>{username}</strong> to confirm.
          </p>

          <input
            type="text"
            className={styles.input}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={username}
            aria-label="Type your username to confirm deletion"
            autoComplete="off"
            disabled={deleting}
          />

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.dangerBtn}
              onClick={handleDelete}
              disabled={!matches || deleting}
            >
              {deleting ? "Deleting…" : "Delete my account"}
            </button>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => {
                setOpen(false);
                setConfirm("");
              }}
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default DeleteAccount;
