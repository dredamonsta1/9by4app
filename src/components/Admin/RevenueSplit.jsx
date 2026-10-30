import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./RevenueSplit.module.css";

// Admin control for the platform fee on album sales (Story 36).
// One global rate, plus per-artist deals that override it, optionally until
// an end date. The API stores basis points (1000 = 10%); this screen works
// in percent. A change only affects sales started after it.

const SEARCH_DEBOUNCE_MS = 250;

const bpsToPct = (bps) => (bps == null ? "" : String(bps / 100));

/** "7.5" → 750, or null if it isn't a valid rate. */
const pctToBps = (pct, maxBps) => {
  if (String(pct).trim() === "") return null;
  const n = Number(pct);
  if (!Number.isFinite(n)) return null;
  const bps = Math.round(n * 100);
  return bps >= 0 && bps <= maxBps ? bps : null;
};

const fmtPct = (bps) => `${bps / 100}%`;

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })
    : "";

const EMPTY_DEAL = { artist: null, pct: "", endsOn: "", note: "" };

const RevenueSplit = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [globalPct, setGlobalPct] = useState("");
  const [globalSaving, setGlobalSaving] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  const [deal, setDeal] = useState(EMPTY_DEAL);
  const [dealSaving, setDealSaving] = useState(false);
  const [dealError, setDealError] = useState(null);
  const [confirmEnd, setConfirmEnd] = useState(null);

  const [artistQuery, setArtistQuery] = useState("");
  const [artistResults, setArtistResults] = useState([]);

  const [flash, setFlash] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/admin/revenue-split");
      setData(res.data);
      setGlobalPct(bpsToPct(res.data.global_bps));
      setLoadError(null);
    } catch {
      setLoadError("Couldn't load the revenue split.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const trimmed = artistQuery.trim();
    if (trimmed.length < 2) {
      setArtistResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await axiosInstance.get(`/artists/?search=${encodeURIComponent(trimmed)}&limit=8`);
        setArtistResults(res.data?.artists ?? []);
      } catch {
        setArtistResults([]);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [artistQuery]);

  const showFlash = (msg) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 2500);
  };

  if (loading) return <p className={styles.muted}>Loading the revenue split…</p>;
  if (loadError)
    return (
      <div className={styles.error} role="alert">
        {loadError}{" "}
        <button type="button" className={styles.linkBtn} onClick={() => { setLoading(true); load(); }}>
          Try again
        </button>
      </div>
    );

  const maxBps = data.max_bps;
  const maxPct = maxBps / 100;
  const globalBps = pctToBps(globalPct, maxBps);
  const globalDirty = globalBps !== data.global_bps;
  const dealBps = pctToBps(deal.pct, maxBps);
  const editing = deal.artist && data.deals.some((d) => d.artist_id === deal.artist.artist_id);

  const saveGlobal = async () => {
    if (globalBps === null) {
      setGlobalError(`Enter a rate from 0 to ${maxPct}%.`);
      return;
    }
    setGlobalSaving(true);
    setGlobalError(null);
    try {
      await axiosInstance.put("/admin/revenue-split/global", { bps: globalBps });
      await load();
      showFlash(`Global rate is now ${fmtPct(globalBps)}.`);
    } catch (err) {
      setGlobalError(err.response?.data?.message || "Couldn't save the global rate.");
    } finally {
      setGlobalSaving(false);
    }
  };

  const saveDeal = async (e) => {
    e.preventDefault();
    if (!deal.artist) {
      setDealError("Pick an artist.");
      return;
    }
    if (dealBps === null) {
      setDealError(`Enter a rate from 0 to ${maxPct}%.`);
      return;
    }
    setDealSaving(true);
    setDealError(null);
    try {
      await axiosInstance.put(`/admin/revenue-split/artists/${deal.artist.artist_id}`, {
        bps: dealBps,
        ends_at: deal.endsOn || null,
        note: deal.note,
      });
      await load();
      showFlash(`Saved ${deal.artist.artist_name}'s deal.`);
      setDeal(EMPTY_DEAL);
    } catch (err) {
      setDealError(err.response?.data?.message || "Couldn't save the deal.");
    } finally {
      setDealSaving(false);
    }
  };

  const endDeal = async (d) => {
    try {
      await axiosInstance.delete(`/admin/revenue-split/artists/${d.artist_id}`);
      setConfirmEnd(null);
      await load();
      showFlash(`${d.artist_name} is back on the global rate.`);
    } catch (err) {
      setDealError(err.response?.data?.message || "Couldn't end the deal.");
    }
  };

  const editDeal = (d) => {
    setDeal({
      artist: { artist_id: d.artist_id, artist_name: d.artist_name },
      pct: bpsToPct(d.bps),
      endsOn: d.ends_at ? d.ends_at.slice(0, 10) : "",
      note: d.note ?? "",
    });
    setDealError(null);
  };

  const describeChange = (c) => {
    const from = c.old_bps == null ? "global rate" : fmtPct(c.old_bps);
    const to = c.new_bps == null ? "global rate" : fmtPct(c.new_bps);
    const who = c.artist_id == null ? "Global" : c.artist_name ?? `Artist ${c.artist_id}`;
    const until = c.ends_at ? ` until ${fmtDate(c.ends_at)}` : "";
    return `${who}: ${from} → ${to}${until}`;
  };

  return (
    <div className={styles.container}>
      <p className={styles.intro}>
        StanBox's cut of each album sale. Artists get the global rate unless they have a deal. Changes apply to new
        sales only; past and in-progress sales keep the rate they started at.
      </p>
      {flash && <p className={styles.flash} role="status">{flash}</p>}

      <div className={styles.card}>
        <label className={styles.label} htmlFor="global-rate">Global rate</label>
        <div className={styles.row}>
          <input
            id="global-rate"
            className={styles.pctInput}
            type="number"
            min="0"
            max={maxPct}
            step="0.01"
            value={globalPct}
            onChange={(e) => setGlobalPct(e.target.value)}
          />
          <span className={styles.suffix}>%</span>
          {globalBps !== null && (
            <span className={styles.muted}>Artists keep {(10000 - globalBps) / 100}%</span>
          )}
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={saveGlobal}
            disabled={globalSaving || !globalDirty}
          >
            {globalSaving ? "Saving…" : "Save rate"}
          </button>
        </div>
        {globalError && <p className={styles.error} role="alert">{globalError}</p>}
      </div>

      <h3 className={styles.subhead}>Artist deals</h3>
      {data.deals.length === 0 ? (
        <p className={styles.muted}>No deals yet. Every artist is on the global rate.</p>
      ) : (
        <ul className={styles.dealList}>
          {data.deals.map((d) => (
            <li key={d.artist_id} className={styles.deal}>
              <div className={styles.dealInfo}>
                <span className={styles.dealName}>{d.artist_name}</span>
                <span className={styles.dealRate}>
                  {fmtPct(d.bps)} · artist keeps {(10000 - d.bps) / 100}%
                </span>
                <span className={styles.muted}>
                  {d.active
                    ? d.ends_at ? `Ends ${fmtDate(d.ends_at)}` : "No end date"
                    : `Ended ${fmtDate(d.ends_at)}, on the global rate`}
                  {d.note ? ` · ${d.note}` : ""}
                </span>
              </div>
              <span className={d.active ? styles.badgeActive : styles.badgeEnded}>
                {d.active ? "Active" : "Ended"}
              </span>
              <div className={styles.dealActions}>
                <button type="button" className={styles.linkBtn} onClick={() => editDeal(d)}>
                  Edit
                </button>
                {confirmEnd === d.artist_id ? (
                  <>
                    <button type="button" className={styles.dangerBtn} onClick={() => endDeal(d)}>
                      Confirm: end deal
                    </button>
                    <button type="button" className={styles.linkBtn} onClick={() => setConfirmEnd(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button type="button" className={styles.linkBtn} onClick={() => setConfirmEnd(d.artist_id)}>
                    End deal
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className={styles.card} onSubmit={saveDeal}>
        <h4 className={styles.formTitle}>{editing ? `Edit ${deal.artist.artist_name}'s deal` : "New deal"}</h4>

        <span className={styles.label}>Artist</span>
        {deal.artist ? (
          <div className={styles.row}>
            <span className={styles.dealName}>{deal.artist.artist_name}</span>
            <button type="button" className={styles.linkBtn} onClick={() => setDeal(EMPTY_DEAL)}>
              Change
            </button>
          </div>
        ) : (
          <div className={styles.search}>
            <input
              className={styles.textInput}
              type="search"
              placeholder="Search artists…"
              aria-label="Search artists"
              value={artistQuery}
              onChange={(e) => setArtistQuery(e.target.value)}
            />
            {artistResults.length > 0 && (
              <ul className={styles.dropdown}>
                {artistResults.map((a) => (
                  <li key={a.artist_id}>
                    <button
                      type="button"
                      className={styles.dropdownItem}
                      onClick={() => {
                        const existing = data.deals.find((d) => d.artist_id === a.artist_id);
                        if (existing) editDeal(existing);
                        else setDeal((s) => ({ ...s, artist: { artist_id: a.artist_id, artist_name: a.artist_name } }));
                        setArtistQuery("");
                        setArtistResults([]);
                      }}
                    >
                      {a.artist_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className={styles.fields}>
          <label className={styles.field}>
            <span className={styles.label}>Rate</span>
            <span className={styles.row}>
              <input
                className={styles.pctInput}
                type="number"
                min="0"
                max={maxPct}
                step="0.01"
                aria-label="Deal rate"
                value={deal.pct}
                onChange={(e) => setDeal((s) => ({ ...s, pct: e.target.value }))}
              />
              <span className={styles.suffix}>%</span>
            </span>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Ends on (optional)</span>
            <input
              className={styles.textInput}
              type="date"
              aria-label="Deal end date"
              value={deal.endsOn}
              onChange={(e) => setDeal((s) => ({ ...s, endsOn: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Note (optional)</span>
            <input
              className={styles.textInput}
              type="text"
              maxLength={200}
              placeholder="e.g. Launch deal"
              aria-label="Deal note"
              value={deal.note}
              onChange={(e) => setDeal((s) => ({ ...s, note: e.target.value }))}
            />
          </label>
        </div>
        <p className={styles.muted}>Leave the end date empty for a deal with no end. On that date the artist goes back to the global rate.</p>
        {dealError && <p className={styles.error} role="alert">{dealError}</p>}
        <div className={styles.row}>
          <button type="submit" className={styles.primaryBtn} disabled={dealSaving}>
            {dealSaving ? "Saving…" : "Save deal"}
          </button>
          {deal.artist && (
            <button type="button" className={styles.linkBtn} onClick={() => { setDeal(EMPTY_DEAL); setDealError(null); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className={styles.subhead}>Recent changes</h3>
      {data.history.length === 0 ? (
        <p className={styles.muted}>No changes yet.</p>
      ) : (
        <ul className={styles.history}>
          {data.history.map((c) => (
            <li key={c.id}>
              <span>{describeChange(c)}</span>
              <span className={styles.muted}>
                {c.note ? `${c.note} · ` : ""}
                {c.changed_by ? `${c.changed_by} · ` : ""}
                {fmtDate(c.changed_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RevenueSplit;
