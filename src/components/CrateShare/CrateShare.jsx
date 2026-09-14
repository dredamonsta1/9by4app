import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./CrateShare.module.css";

export const CRATE_MIN = 3;
// Ten of twenty slots. A crate is a starting point, not a replacement
// identity — handing somebody more than half their list leaves them no room
// to be themselves.
export const CRATE_MAX = 10;

const crateUrl = (slug) => `${window.location.origin}/crate/${slug}`;

/**
 * Your crates: make one, find the links again, fix a name.
 *
 * Creation used to show the link exactly once, which meant a crate URL was
 * unrecoverable the moment you closed the panel — the owner had to query the
 * database to find their own share links. This lists them.
 *
 * Crates are cut from a *subset* of the Top 20, never the whole thing. The #1
 * slot is the most personal thing on the platform, and sharing the list
 * wholesale reads as "be me" rather than "here's a start". Choosing is what
 * makes it a recommendation.
 */
const CrateShare = ({ artists = [] }) => {
  const [open, setOpen] = useState(false);
  const [crates, setCrates] = useState([]);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [picked, setPicked] = useState([]);
  const [saving, setSaving] = useState(false);

  const [renamingSlug, setRenamingSlug] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/crates/mine");
      setCrates(res.data?.crates ?? []);
    } catch {
      // A failed list must not block creating a new one.
      setCrates([]);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

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

  const copy = (slug) => {
    navigator.clipboard
      ?.writeText(crateUrl(slug))
      .then(() => toast.success("Link copied."))
      // The URL is on screen either way, so a blocked clipboard is a
      // nuisance rather than a dead end.
      .catch(() => toast.info("Copy the link below."));
  };

  const create = async () => {
    setSaving(true);
    try {
      const res = await axiosInstance.post("/crates", {
        name: name.trim(),
        artist_ids: picked,
      });
      navigator.clipboard?.writeText(crateUrl(res.data.crate.slug)).catch(() => {});
      toast.success("Crate created — link copied.");
      setName("");
      setPicked([]);
      setCreating(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Couldn't create the crate.");
    } finally {
      setSaving(false);
    }
  };

  const rename = async (slug) => {
    const next = renameValue.trim();
    if (!next) return;
    try {
      await axiosInstance.patch(`/crates/${slug}`, { name: next });
      setCrates((prev) =>
        prev.map((c) => (c.slug === slug ? { ...c, name: next } : c))
      );
      setRenamingSlug(null);
      toast.success("Renamed.");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Couldn't rename that crate.");
    }
  };

  if (artists.length < CRATE_MIN) return null;

  return (
    <section className={styles.wrap}>
      {!open ? (
        <button type="button" className={styles.openBtn} onClick={() => setOpen(true)}>
          Your crates
        </button>
      ) : (
        <div className={styles.panel}>
          <header className={styles.head}>
            <h3 className={styles.title}>Your crates</h3>
            <p className={styles.sub}>
              A crate is {CRATE_MIN}–{CRATE_MAX} artists from your Top 20. Anyone
              with the link can add them in one tap.
            </p>
          </header>

          {crates.length > 0 && (
            <ul className={styles.crateList}>
              {crates.map((c) => (
                <li key={c.slug} className={styles.crateRow}>
                  {renamingSlug === c.slug ? (
                    <form
                      className={styles.renameForm}
                      onSubmit={(e) => {
                        e.preventDefault();
                        rename(c.slug);
                      }}
                    >
                      <input
                        type="text"
                        className={styles.input}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        maxLength={60}
                        aria-label={`Rename ${c.name}`}
                        autoFocus
                      />
                      <button type="submit" className={styles.smallBtn}>
                        Save
                      </button>
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => setRenamingSlug(null)}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className={styles.crateMeta}>
                        <span className={styles.crateName}>{c.name}</span>
                        <span className={styles.crateStats}>
                          {c.artist_count} artists ·{" "}
                          {c.adoptions === 1 ? "1 adoption" : `${c.adoptions} adoptions`}
                        </span>
                        <code className={styles.url}>{crateUrl(c.slug)}</code>
                      </span>
                      <span className={styles.crateActions}>
                        <button
                          type="button"
                          className={styles.smallBtn}
                          onClick={() => copy(c.slug)}
                        >
                          Copy link
                        </button>
                        <button
                          type="button"
                          className={styles.linkBtn}
                          onClick={() => {
                            setRenamingSlug(c.slug);
                            setRenameValue(c.name);
                          }}
                        >
                          Rename
                        </button>
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!creating ? (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => setCreating(true)}
              >
                {crates.length ? "New crate" : "Make your first crate"}
              </button>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          ) : (
            <div className={styles.createBlock}>
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
                  onClick={() => setCreating(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CrateShare;
