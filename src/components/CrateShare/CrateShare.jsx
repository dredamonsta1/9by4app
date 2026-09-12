import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./CrateShare.module.css";

export const CRATE_MIN = 3;
// Ten of twenty slots. A crate is a starting point, not a replacement
// identity — handing somebody more than half their list leaves them no room
// to be themselves.
export const CRATE_MAX = 10;

/**
 * Turn part of your Top 20 into a shareable crate.
 *
 * Deliberately a *subset*, not the whole list. The #1 slot on a shrine is the
 * most personal thing on the platform, and sharing the list wholesale reads as
 * "be me" rather than "here's a start". Choosing is what makes it a
 * recommendation.
 *
 * Presentational except for the create call — ProfilePage owns the list.
 */
const CrateShare = ({ artists = [] }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState([]);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);

  const toggle = (artistId) => {
    setPicked((prev) => {
      if (prev.includes(artistId)) return prev.filter((id) => id !== artistId);
      if (prev.length >= CRATE_MAX) {
        toast.info(`A crate holds ${CRATE_MAX} artists — drop one to add another.`);
        return prev;
      }
      return [...prev, artistId];
    });
  };

  const create = async () => {
    setSaving(true);
    try {
      const res = await axiosInstance.post("/crates", {
        name: name.trim(),
        artist_ids: picked,
      });
      const url = `${window.location.origin}/crate/${res.data.crate.slug}`;
      setShareUrl(url);
      // Copying is the point of the feature, so it happens without a second
      // step. The link stays on screen for anyone whose clipboard is blocked.
      navigator.clipboard?.writeText(url).catch(() => {});
      toast.success("Crate created — link copied.");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Couldn't create the crate.");
    } finally {
      setSaving(false);
    }
  };

  if (artists.length < CRATE_MIN) return null;

  return (
    <section className={styles.wrap}>
      {!open ? (
        <button type="button" className={styles.openBtn} onClick={() => setOpen(true)}>
          Share a crate
        </button>
      ) : (
        <div className={styles.panel}>
          <header className={styles.head}>
            <h3 className={styles.title}>Share a crate</h3>
            <p className={styles.sub}>
              Pick {CRATE_MIN}–{CRATE_MAX} artists from your Top 20. Anyone with
              the link can add them in one tap.
            </p>
          </header>

          {shareUrl ? (
            <div className={styles.done}>
              <p className={styles.doneLabel}>Your crate is live:</p>
              <code className={styles.url}>{shareUrl}</code>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => {
                  setShareUrl(null);
                  setPicked([]);
                  setName("");
                }}
              >
                Make another
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                className={styles.input}
                placeholder="Name it — e.g. Southern starters"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                disabled={saving}
              />

              <ul className={styles.list}>
                {artists.map((a) => {
                  const on = picked.includes(a.artist_id);
                  return (
                    <li key={a.artist_id}>
                      <button
                        type="button"
                        className={`${styles.chip} ${on ? styles.chipOn : ""}`}
                        onClick={() => toggle(a.artist_id)}
                        aria-pressed={on}
                        disabled={saving}
                      >
                        {a.artist_name || a.name}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={create}
                  disabled={saving || picked.length < CRATE_MIN || !name.trim()}
                >
                  {saving
                    ? "Creating…"
                    : picked.length < CRATE_MIN
                    ? `Pick ${CRATE_MIN - picked.length} more`
                    : `Create crate (${picked.length})`}
                </button>
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => setOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default CrateShare;
