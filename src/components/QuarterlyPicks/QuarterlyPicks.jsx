import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { resolveImageUrl } from "../../utils/imageUrl";
import {
  useQuarterlyPicks,
  useQuarterlyBallot,
  useQuarterList,
  saveQuarterlyPicks,
  quarterLabel,
  quarterMonths,
  lockLabel,
} from "../../hooks/useQuarterlyPicks";
import styles from "./QuarterlyPicks.module.css";

const MAX_PICKS = 5;

const artFor = (album) =>
  resolveImageUrl(
    album?.album_image_url,
    `https://via.placeholder.com/96?text=${encodeURIComponent(
      (album?.album_name || "?")[0]
    )}`
  );

/**
 * Five ranked releases per calendar quarter, on the profile beneath the
 * Top 20 shrine.
 *
 * Sits there because it's the same kind of artifact — a ranked list that
 * says who you are — and reuses a grammar users already know. The
 * difference is the clock: a Top 20 is permanent, so there's never an
 * occasion to revisit it, while a quarter has a deadline and then seals.
 *
 * No buy button, by decision (2026-08-25): the ballot is a taste artifact
 * first. Commerce can be layered on once the mechanic proves it gets used;
 * unwinding a storefront that nobody wanted is harder.
 */
const QuarterlyPicks = ({ userId = null, editable = false, displayName = "This user" }) => {
  const isOwn = userId == null;

  const { quarters, reload: reloadQuarters } = useQuarterList({ userId });
  const [selected, setSelected] = useState(null); // null = the open ballot
  const {
    data,
    loading,
    error,
    reload: reloadPicks,
  } = useQuarterlyPicks({
    userId,
    year: selected?.year ?? null,
    quarter: selected?.quarter ?? null,
  });

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([]);
  const [saving, setSaving] = useState(false);

  const locked = data?.locked ?? false;
  const canEdit = editable && isOwn && !locked;

  const { ballot, loading: ballotLoading, error: ballotError } = useQuarterlyBallot({
    year: data?.year ?? null,
    quarter: data?.quarter ?? null,
    enabled: editing,
  });

  // Seed the draft from saved picks whenever the picker opens or the
  // underlying quarter changes beneath it.
  useEffect(() => {
    if (editing) setDraft((data?.picks ?? []).map((p) => p.album_id));
  }, [editing, data]);

  const draftAlbums = useMemo(() => {
    const byId = new Map();
    for (const a of ballot?.albums ?? []) byId.set(a.album_id, a);
    // Fall back to the saved pick's own row so an already-picked album still
    // renders while the ballot is still in flight.
    for (const p of data?.picks ?? []) if (!byId.has(p.album_id)) byId.set(p.album_id, p);
    return draft.map((id) => byId.get(id)).filter(Boolean);
  }, [draft, ballot, data]);

  const toggle = (albumId) => {
    setDraft((prev) => {
      if (prev.includes(albumId)) return prev.filter((id) => id !== albumId);
      if (prev.length >= MAX_PICKS) {
        toast.info(`You get ${MAX_PICKS} picks — drop one to add another.`);
        return prev;
      }
      return [...prev, albumId];
    });
  };

  const move = (index, delta) => {
    setDraft((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveQuarterlyPicks({
        year: data.year,
        quarter: data.quarter,
        albumIds: draft,
      });
      toast.success("Picks saved.");
      setEditing(false);
      reloadPicks();
      reloadQuarters();
    } catch (err) {
      // Includes the 409 a quarter locking mid-edit produces — rare, but the
      // user needs to know their edit didn't land rather than assume it did.
      toast.error(err?.response?.data?.message ?? "Couldn't save your picks.");
    } finally {
      setSaving(false);
    }
  };

  const picks = data?.picks ?? [];
  const heading = data ? quarterLabel(data.year, data.quarter) : "Quarterly Picks";
  const lockText = lockLabel(data?.locks_at, locked);

  return (
    <section className={styles.wrap} aria-labelledby="quarterly-picks-heading">
      <header className={styles.header}>
        <div>
          <h3 id="quarterly-picks-heading" className={styles.title}>
            Quarterly Picks
          </h3>
          <p className={styles.subtitle}>
            {isOwn
              ? "Your five best releases, one quarter at a time."
              : `${displayName}'s five best releases, by quarter.`}
          </p>
        </div>
        {canEdit && !editing && (
          <button type="button" className={styles.editBtn} onClick={() => setEditing(true)}>
            {picks.length ? "Edit picks" : "Make your picks"}
          </button>
        )}
      </header>

      {quarters.length > 0 && (
        <nav className={styles.quarterNav} aria-label="Choose a quarter">
          <button
            type="button"
            className={`${styles.quarterChip} ${selected == null ? styles.quarterChipOn : ""}`}
            onClick={() => {
              setSelected(null);
              setEditing(false);
            }}
          >
            Current
          </button>
          {quarters.map((q) => (
            <button
              key={`${q.year}-${q.quarter}`}
              type="button"
              className={`${styles.quarterChip} ${
                selected?.year === q.year && selected?.quarter === q.quarter
                  ? styles.quarterChipOn
                  : ""
              }`}
              onClick={() => {
                setSelected({ year: q.year, quarter: q.quarter });
                setEditing(false);
              }}
            >
              {quarterLabel(q.year, q.quarter)}
              {q.locked && <span className={styles.lockDot} aria-hidden="true" />}
            </button>
          ))}
        </nav>
      )}

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.cardTitle}>{heading}</span>
          {data && <span className={styles.cardMonths}>{quarterMonths(data.year, data.quarter)}</span>}
          {lockText && (
            <span className={`${styles.lockPill} ${locked ? styles.lockPillClosed : ""}`}>
              {lockText}
            </span>
          )}
        </div>

        {loading && <p className={styles.muted}>Loading picks…</p>}
        {error && !loading && <p className={styles.error}>{error}</p>}

        {!loading && !error && !editing && picks.length === 0 && (
          <p className={styles.muted}>
            {isOwn
              ? locked
                ? "You didn't pick anything this quarter. It's sealed now."
                : "No picks yet. Five releases, ranked — that's the whole job."
              : `${displayName} hasn't picked for this quarter.`}
          </p>
        )}

        {!loading && !editing && picks.length > 0 && (
          <ol className={styles.pickList}>
            {picks.map((p) => (
              <li key={p.album_id} className={styles.pickRow}>
                <span className={styles.rank}>{p.position}</span>
                <img className={styles.art} src={artFor(p)} alt="" loading="lazy" />
                <span className={styles.meta}>
                  <span className={styles.albumName}>{p.album_name}</span>
                  <span className={styles.artistName}>{p.artist_name}</span>
                </span>
              </li>
            ))}
          </ol>
        )}

        {editing && (
          <div className={styles.editor}>
            <div className={styles.slots}>
              <p className={styles.slotsLabel}>
                Your ranking ({draft.length}/{MAX_PICKS})
              </p>
              {draftAlbums.length === 0 && (
                <p className={styles.muted}>Pick from the releases below.</p>
              )}
              <ol className={styles.pickList}>
                {draftAlbums.map((a, i) => (
                  <li key={a.album_id} className={styles.pickRow}>
                    <span className={styles.rank}>{i + 1}</span>
                    <img className={styles.art} src={artFor(a)} alt="" loading="lazy" />
                    <span className={styles.meta}>
                      <span className={styles.albumName}>{a.album_name}</span>
                      <span className={styles.artistName}>{a.artist_name}</span>
                    </span>
                    <span className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label={`Move ${a.album_name} up`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => move(i, 1)}
                        disabled={i === draftAlbums.length - 1}
                        aria-label={`Move ${a.album_name} down`}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => toggle(a.album_id)}
                        aria-label={`Remove ${a.album_name}`}
                      >
                        ×
                      </button>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className={styles.ballot}>
              <p className={styles.slotsLabel}>
                Released this quarter
                {ballot?.albums?.length ? ` (${ballot.albums.length})` : ""}
              </p>
              {ballotLoading && <p className={styles.muted}>Loading releases…</p>}
              {ballotError && <p className={styles.error}>{ballotError}</p>}
              {!ballotLoading && !ballotError && (ballot?.albums?.length ?? 0) === 0 && (
                <p className={styles.muted}>
                  Nothing is listed for this quarter yet. Releases appear here as
                  they land.
                </p>
              )}
              <ul className={styles.ballotList}>
                {(ballot?.albums ?? []).map((a) => {
                  const picked = draft.includes(a.album_id);
                  return (
                    <li key={a.album_id}>
                      <button
                        type="button"
                        className={`${styles.ballotRow} ${picked ? styles.ballotRowOn : ""}`}
                        onClick={() => toggle(a.album_id)}
                        aria-pressed={picked}
                      >
                        <img className={styles.art} src={artFor(a)} alt="" loading="lazy" />
                        <span className={styles.meta}>
                          <span className={styles.albumName}>{a.album_name}</span>
                          <span className={styles.artistName}>{a.artist_name}</span>
                        </span>
                        <span className={styles.pickMark} aria-hidden="true">
                          {picked ? `#${draft.indexOf(a.album_id) + 1}` : "+"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className={styles.editorActions}>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save picks"}
              </button>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuarterlyPicks;
