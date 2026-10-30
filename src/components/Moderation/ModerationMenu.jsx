import React, { useCallback, useEffect, useRef, useState } from "react";
import ReportDialog from "./ReportDialog";
import BlockDialog from "./BlockDialog";
import { useEscape } from "./useEscape";
import styles from "./Moderation.module.css";

/**
 * The "⋯" menu on someone else's post or profile: Report, and Block.
 *
 * `reportTarget` is what gets reported ({ type, id, preview }); the block
 * always applies to the person (`userId`, `username`).
 */
const ModerationMenu = ({ reportLabel, reportTarget, userId, username, onBlocked, className }) => {
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState(null);
  const wrapRef = useRef(null);

  const closeMenu = useCallback(() => setOpen(false), []);
  const closeDialog = useCallback(() => setDialog(null), []);

  useEscape(closeMenu);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const choose = (which) => {
    setOpen(false);
    setDialog(which);
  };

  const who = username ? `@${username}` : "this user";

  return (
    <div className={`${styles.menuWrap} ${className ?? ""}`} ref={wrapRef}>
      <button
        type="button"
        className={styles.menuBtn}
        aria-label={`More options for ${who}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        ⋯
      </button>
      {open && (
        <ul className={styles.menu} role="menu">
          <li role="none">
            <button type="button" role="menuitem" className={styles.menuItem} onClick={() => choose("report")}>
              {reportLabel}
            </button>
          </li>
          <li role="none">
            <button type="button" role="menuitem" className={styles.menuItemDanger} onClick={() => choose("block")}>
              Block {who}
            </button>
          </li>
        </ul>
      )}
      {dialog === "report" && (
        <ReportDialog
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          reportedUserId={userId}
          preview={reportTarget.preview}
          onClose={closeDialog}
        />
      )}
      {dialog === "block" && (
        <BlockDialog userId={userId} username={username} onBlocked={onBlocked} onClose={closeDialog} />
      )}
    </div>
  );
};

export default ModerationMenu;
