import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { resolveImageUrl } from "../../utils/imageUrl";
import { quarterLabel, quarterMonths } from "../../hooks/useQuarterlyPicks";
import styles from "./QuarterlyChart.module.css";

/**
 * "StanBox's Q3 2026" — the aggregate of everyone's picks.
 *
 * Its own public page rather than a profile section, because this is the
 * artifact with outside-world value: a shareable claim about a quarter that
 * isn't tied to one person. Individual picks stay on profiles.
 *
 * The page is honest about thin data. Below the server's ballot floor it
 * publishes nothing and says so — a chart built from one or two ballots is
 * one person's taste wearing a platform-wide headline, which is a worse
 * claim than making none.
 */
const QuarterlyChart = () => {
  const { year, quarter } = useParams();
  const isYear = Boolean(year) && !quarter;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // One page, two scopes: /picks/2026 is the year, /picks/2026/3 a
    // quarter. Same chart shape either way, so duplicating the page to
    // render the same list twice would only guarantee they drift.
    const path = isYear
      ? `/quarterly-picks/aggregate/year?year=${year}`
      : `/quarterly-picks/aggregate${year && quarter ? `?year=${year}&quarter=${quarter}` : ""}`;
    axiosInstance
      .get(path)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message ?? "Couldn't load the chart.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [year, quarter, isYear]);

  const artFor = (e) =>
    resolveImageUrl(
      e?.album_image_url,
      `https://via.placeholder.com/96?text=${encodeURIComponent((e?.album_name || "?")[0])}`
    );

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <p className={styles.kicker}>StanBox</p>
        <h1 className={styles.title}>
          {!data
            ? "Chart"
            : isYear
            ? `${data.year} Standings`
            : quarterLabel(data.year, data.quarter)}
        </h1>
        {data && !isYear && (
          <p className={styles.months}>{quarterMonths(data.year, data.quarter)}</p>
        )}
        {data && isYear && (
          <p className={styles.months}>
            Running totals from the quarterly charts — not a year-end vote.
          </p>
        )}

        {data?.provisional && (
          <p className={styles.provisional}>
            {isYear
              ? "Standings move as each quarter's picks land, and settle once Q4 locks in January."
              : "Provisional — this quarter is still open and picks can still change."}
          </p>
        )}
      </header>

      {loading && <p className={styles.muted}>Loading the chart…</p>}
      {error && !loading && <p className={styles.error}>{error}</p>}

      {!loading && !error && data && !data.published && (
        <section className={styles.notYet}>
          <h2 className={styles.notYetTitle}>Not enough picks yet</h2>
          <p className={styles.muted}>
            {data.ballot_count === 0
              ? `Nobody has picked for this ${isYear ? "year" : "quarter"}.`
              : `${data.ballot_count} ${
                  data.ballot_count === 1 ? "person has" : "people have"
                } picked so far.`}{" "}
            {isYear ? "Standings need" : "A chart needs"} {data.minimum_ballots}{" "}
            before {isYear ? "they say" : "it says"} anything about the{" "}
            {isYear ? "year" : "quarter"} rather than about one person.
          </p>
          <Link to="/profile" className={styles.cta}>
            Make your picks
          </Link>
        </section>
      )}

      {!loading && !error && data?.published && (
        <>
          <p className={styles.basis}>
            From {data.ballot_count} ballots · {data.pick_count} picks
          </p>

          {isYear && data.quarter_breakdown?.length > 0 && (
            <div className={styles.turnout}>
              {/* Deriving the year from the quarters means uneven turnout
                  silently weights it. Showing the split makes that a fact
                  the reader can see rather than a bias hidden in a total. */}
              <span className={styles.turnoutLabel}>Ballots per quarter</span>
              <span className={styles.turnoutBars}>
                {[1, 2, 3, 4].map((q) => {
                  const row = data.quarter_breakdown.find((b) => b.quarter === q);
                  const max = Math.max(
                    ...data.quarter_breakdown.map((b) => b.ballot_count),
                    1
                  );
                  const pct = row ? Math.round((row.ballot_count / max) * 100) : 0;
                  return (
                    <span key={q} className={styles.turnoutCol}>
                      <span className={styles.turnoutTrack}>
                        <span
                          className={styles.turnoutFill}
                          style={{ height: `${pct}%` }}
                        />
                      </span>
                      <span className={styles.turnoutQ}>Q{q}</span>
                      <span className={styles.turnoutN}>{row?.ballot_count ?? 0}</span>
                    </span>
                  );
                })}
              </span>
            </div>
          )}
          <ol className={styles.chart}>
            {data.entries.map((e) => (
              <li key={e.album_id} className={styles.row}>
                <span className={styles.rank}>{e.rank}</span>
                <img className={styles.art} src={artFor(e)} alt="" loading="lazy" />
                <span className={styles.meta}>
                  <span className={styles.album}>{e.album_name}</span>
                  <Link to={`/artist/${e.artist_id}`} className={styles.artist}>
                    {e.artist_name}
                  </Link>
                </span>
                <span className={styles.score}>
                  <span className={styles.points}>{e.points}</span>
                  <span className={styles.votes}>
                    {e.votes} {e.votes === 1 ? "pick" : "picks"}
                    {e.first_place_votes > 0 && ` · ${e.first_place_votes} at #1`}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </main>
  );
};

export default QuarterlyChart;
