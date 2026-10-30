import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./Moderation.module.css";

/**
 * Your blocked accounts, with Unblock. Unblocking doesn't restore follows
 * the block removed; following again is up to you.
 */
const BlockedAccounts = () => {
  const [blocks, setBlocks] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null);
  const [rowError, setRowError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    axiosInstance
      .get("/moderation/blocks")
      .then((res) => setBlocks(Array.isArray(res.data?.blocks) ? res.data.blocks : []))
      .catch(() => setError("Couldn't load your blocked accounts."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unblock = async (user) => {
    setPending(user.user_id);
    setRowError(null);
    try {
      await axiosInstance.delete(`/moderation/block/${user.user_id}`);
      setBlocks((prev) => prev.filter((b) => b.user_id !== user.user_id));
    } catch {
      setRowError(`Couldn't unblock @${user.username}. Try again.`);
    } finally {
      setPending(null);
    }
  };

  if (error)
    return (
      <p className={styles.error} role="alert">
        {error}{" "}
        <button type="button" className={styles.linkBtn} onClick={load}>
          Try again
        </button>
      </p>
    );
  if (blocks === null) return <p className={styles.muted}>Loading…</p>;
  if (blocks.length === 0) return <p className={styles.muted}>You haven't blocked anyone.</p>;

  return (
    <>
      <p className={styles.muted}>
        Unblocking doesn't make you follow them again. They won't be told either way.
      </p>
      {rowError && <p className={styles.error} role="alert">{rowError}</p>}
      <ul className={styles.blockList}>
        {blocks.map((b) => (
          <li key={b.user_id} className={styles.blockRow}>
            <span className={styles.blockName}>@{b.username}</span>
            <button
              type="button"
              className={styles.ghostSmall}
              onClick={() => unblock(b)}
              disabled={pending === b.user_id}
              aria-label={`Unblock @${b.username}`}
            >
              {pending === b.user_id ? "Unblocking…" : "Unblock"}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default BlockedAccounts;
