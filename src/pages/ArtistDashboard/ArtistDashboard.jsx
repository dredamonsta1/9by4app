import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import ClaimSearch from "../../components/ClaimSearch/ClaimSearch";
import styles from "./ArtistDashboard.module.css";

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const centsToDollars = (cents) => `$${((cents ?? 0) / 100).toFixed(2)}`;

const tierFor = (position) => {
  if (position == null) return "unranked";
  if (position <= 5) return "top5";
  if (position <= 10) return "top10";
  return "top20";
};

// The CSV endpoint is authenticated, so a plain <a href> can't fetch it —
// the browser wouldn't attach the bearer token. Pull it as a blob through
// axios and hand it to a synthetic anchor instead.
const FALLBACK_EXPORT_NAME = "stanbox-audience.csv";

const filenameFromDisposition = (disposition) => {
  if (!disposition) return null;
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return match?.[1] ?? null;
};

// Blob.prototype.text() is missing in Safari < 14 (and in jsdom), so fall
// back to FileReader rather than losing the server's message there.
const blobToText = (blob) =>
  typeof blob.text === "function"
    ? blob.text()
    : new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
      });

// With responseType "blob", an error body is a Blob too — err.response.data
// .message is undefined, so the real message has to be read back out.
// Without this the rate-limit copy ("Export limit reached…") would be
// replaced by a generic failure and the artist wouldn't know to wait.
const readErrorMessage = async (err, fallback) => {
  const data = err?.response?.data;
  try {
    if (data instanceof Blob) {
      const parsed = JSON.parse(await blobToText(data));
      return parsed.message || parsed.error || fallback;
    }
    return data?.message || data?.error || fallback;
  } catch {
    return fallback;
  }
};

const RANK_FILTERS = [
  { id: "all", label: "All" },
  { id: "top5", label: "Top 5" },
  { id: "mid", label: "6–10" },
  { id: "low", label: "11–20" },
];

const BUY_FILTERS = [
  { id: "all", label: "Everyone" },
  { id: "bought", label: "Bought" },
  { id: "not", label: "Haven't" },
];

const matchesRank = (row, filter) => {
  if (filter === "all") return true;
  const p = row.position;
  if (p == null) return false; // churned buyers have no rank to filter on
  if (filter === "top5") return p <= 5;
  if (filter === "mid") return p >= 6 && p <= 10;
  return p >= 11;
};

const matchesBuy = (row, filter) => {
  if (filter === "all") return true;
  const bought = (row.purchase_count ?? 0) > 0;
  return filter === "bought" ? bought : !bought;
};

const ArtistDashboard = () => {
  const { user, token, claimRequests } = useSelector((state) => state.auth);
  const artistId = user?.artist_id ?? null;
  const pendingClaims = (claimRequests ?? []).filter((c) => c.status === "pending");

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commerce, setCommerce] = useState(null);
  const [rankFilter, setRankFilter] = useState("all");
  const [buyFilter, setBuyFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!artistId) return;
    setLoading(true);
    setError(null);

    // Commerce status is supplementary — if it fails we still render the
    // audience, we just can't say whether $0.00 means "no sales" or
    // "payments aren't switched on".
    Promise.all([
      axiosInstance.get(`/artists/${artistId}/stans`),
      axiosInstance.get("/artists/me/stripe/status").catch(() => null),
    ])
      .then(([audienceRes, statusRes]) => {
        setRows(audienceRes.data.stans ?? []);
        setSummary(audienceRes.data.summary ?? null);
        setCommerce(statusRes?.data ?? null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load your audience.");
      })
      .finally(() => setLoading(false));
  }, [artistId]);

  const visibleRows = useMemo(
    () => rows.filter((r) => matchesRank(r, rankFilter) && matchesBuy(r, buyFilter)),
    [rows, rankFilter, buyFilter]
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await axiosInstance.get(`/artists/${artistId}/stans.csv`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        filenameFromDisposition(res.headers?.["content-disposition"]) ??
        FALLBACK_EXPORT_NAME;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(await readErrorMessage(err, "Failed to export your audience."));
    } finally {
      setExporting(false);
    }
  };

  const handleCopyEmail = async (row) => {
    try {
      await navigator.clipboard.writeText(row.email);
      setCopiedId(row.user_id);
      setTimeout(() => setCopiedId((id) => (id === row.user_id ? null : id)), 1600);
    } catch {
      // Clipboard is unavailable (insecure context, denied permission) —
      // the mailto affordance next to it still works.
    }
  };

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.gate}>
          <h1>Artist Dashboard</h1>
          <p>Log in to see your audience.</p>
          <Link to="/login" className={styles.gateBtn}>Log in</Link>
        </div>
      </div>
    );
  }

  if (!artistId) {
    const hasPending = pendingClaims.length > 0;
    return (
      <div className={styles.page}>
        <div className={styles.gate}>
          <h1>Artist Dashboard</h1>
          <p>This dashboard is for verified artists on stanbox.</p>
          {hasPending && (
            <div className={styles.pendingBlock}>
              <p className={styles.pendingTitle}>Pending review</p>
              <ul className={styles.pendingList}>
                {pendingClaims.map((c) => (
                  <li key={c.id} className={styles.pendingRow}>
                    <span className={styles.pendingArtist}>{c.artist_name}</span>
                    <span className={styles.pendingSub}>
                      Submitted {formatDate(c.created_at)} — we'll email you when it's reviewed.
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ClaimSearch
            heading={hasPending ? "Claim another artist" : "Find your artist page"}
          />
        </div>
      </div>
    );
  }

  // "Payments are live" requires Stripe verified AND the artist's own kill
  // switch on. Null commerce (status call failed) is treated as live so a
  // transient error never hides real revenue.
  const commerceLive =
    commerce == null ||
    !!(commerce.charges_enabled && commerce.payouts_enabled && commerce.commerce_enabled);

  const totalStans = summary?.total_stans ?? 0;
  const buyers = summary?.buyers ?? 0;
  const nonBuyers = summary?.non_buyers ?? 0;
  const earned = summary?.artist_earned_cents ?? 0;
  const churned = summary?.churned_buyers ?? 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your audience</h1>
        <p className={styles.subtitle}>
          Everyone who has you in their Top 20 on stanbox — and what they've bought.
        </p>
        <Link to="/artist-settings" className={styles.editWorldLink}>
          Edit your world →
        </Link>
      </header>

      <section className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{totalStans}</span>
          <span className={styles.statLabel}>Total stans</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{buyers}</span>
          <span className={styles.statLabel}>Buyers</span>
        </div>
        {/* The headline number: people who declared you a favourite and
            haven't been sold to yet. No streaming dashboard can produce it. */}
        <div className={`${styles.statCard} ${styles.statCardLead}`}>
          <span className={styles.statNum}>{nonBuyers}</span>
          <span className={styles.statLabel}>Haven't bought</span>
        </div>
        <div className={styles.statCard}>
          {commerceLive ? (
            <>
              <span className={styles.statNum}>{centsToDollars(earned)}</span>
              <span className={styles.statLabel}>You've earned</span>
            </>
          ) : (
            <>
              <span className={styles.statOff}>Off</span>
              <span className={styles.statLabel}>Payments</span>
              <Link to="/artist-settings" className={styles.statLink}>
                Set up →
              </Link>
            </>
          )}
        </div>
      </section>

      <section className={styles.listSection}>
        <div className={styles.listHead}>
          <h2 className={styles.listTitle}>Your people</h2>
          <div className={styles.filters}>
            <div className={styles.filterGroup} role="group" aria-label="Filter by rank">
              {RANK_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`${styles.pill} ${rankFilter === f.id ? styles.pillOn : ""}`}
                  aria-pressed={rankFilter === f.id}
                  onClick={() => setRankFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className={styles.filterGroup} role="group" aria-label="Filter by purchase">
              {BUY_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`${styles.pill} ${buyFilter === f.id ? styles.pillOn : ""}`}
                  aria-pressed={buyFilter === f.id}
                  onClick={() => setBuyFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Export always covers the whole audience, not the current
                filter — the file is the artist's copy of their people, and
                a filtered download would quietly omit rows they paid for. */}
            {rows.length > 0 && (
              <button
                type="button"
                className={styles.exportBtn}
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? "Preparing…" : "Export CSV"}
              </button>
            )}
          </div>
        </div>

        {loading && <p className={styles.muted}>Loading your audience…</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && rows.length === 0 && (
          <p className={styles.muted}>
            No one has you in their Top 20 yet. That changes once fans start
            ranking you.
          </p>
        )}

        {/* Stans but no sales — turn the zero into the actionable number
            rather than reporting an empty revenue column. */}
        {!loading && !error && rows.length > 0 && buyers === 0 && (
          <p className={styles.noSales}>
            No sales yet. <strong>{totalStans}</strong>{" "}
            {totalStans === 1 ? "person has" : "people have"} you in their Top 20
            — they're who to release for.
          </p>
        )}

        {!loading && !error && rows.length > 0 && visibleRows.length === 0 && (
          <p className={styles.muted}>No one matches this filter.</p>
        )}

        {!loading && !error && visibleRows.length > 0 && (
          <ul className={styles.list}>
            {visibleRows.map((s) => {
              const bought = (s.purchase_count ?? 0) > 0;
              const albums = s.purchased_albums ?? [];
              return (
                <li key={s.user_id} className={styles.row}>
                  <span className={`${styles.rank} ${styles[tierFor(s.position)]}`}>
                    {s.position ?? "—"}
                  </span>

                  <Link to={`/profile/${s.user_id}`} className={styles.userLink}>
                    {s.profile_image ? (
                      <img
                        src={s.profile_image}
                        alt={s.username}
                        className={styles.avatar}
                      />
                    ) : (
                      <span className={styles.avatarFallback}>
                        {(s.username?.[0] ?? "?").toUpperCase()}
                      </span>
                    )}
                    <span className={styles.userMeta}>
                      <span className={styles.username}>@{s.username}</span>
                      {s.is_stan === false && (
                        <span className={styles.churnTag}>No longer ranked</span>
                      )}
                    </span>
                  </Link>

                  {/* Email exists only on rows with a completed purchase —
                      the backend nulls it otherwise. The empty cell is the
                      point: buying is what turns a fan into a contact. */}
                  <span className={styles.emailCell}>
                    {s.email ? (
                      <>
                        <button
                          type="button"
                          className={styles.emailBtn}
                          onClick={() => handleCopyEmail(s)}
                          title="Copy email address"
                        >
                          {copiedId === s.user_id ? "Copied" : s.email}
                        </button>
                        <a
                          href={`mailto:${s.email}`}
                          className={styles.mailLink}
                          aria-label={`Email ${s.username}`}
                        >
                          ✉
                        </a>
                      </>
                    ) : (
                      <span className={styles.dash} aria-hidden="true">—</span>
                    )}
                  </span>

                  <span className={styles.spendCell}>
                    {bought ? (
                      <>
                        <span className={styles.spendAmount}>
                          {centsToDollars(s.total_spent_cents)}
                        </span>
                        <span className={styles.spendSub}>
                          {albums.length > 1
                            ? `${albums.length} releases`
                            : albums[0]?.album_name ?? "1 release"}
                        </span>
                      </>
                    ) : (
                      <span className={styles.dash} aria-hidden="true">—</span>
                    )}
                  </span>

                  <span className={styles.added}>
                    {bought
                      ? `Bought ${formatDate(s.last_purchase_at)}`
                      : `Added ${formatDate(s.added_at)}`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && !error && churned > 0 && (
          <p className={styles.churnNote}>
            {churned} {churned === 1 ? "buyer has" : "buyers have"} since dropped
            you from their Top 20. Their purchases still count.
          </p>
        )}
      </section>
    </div>
  );
};

export default ArtistDashboard;
