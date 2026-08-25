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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const query = year && quarter ? `?year=${year}&quarter=${quarter}` : "";
    axiosInstance
      .get(`/quarterly-picks/aggregate${query}`)
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
  }, [year, quarter]);

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
          {data ? quarterLabel(data.year, data.quarter) : "Quarterly Chart"}
        </h1>
        {data && <p className={styles.months}>{quarterMonths(data.year, data.quarter)}</p>}

        {data?.provisional && (
          <p className={styles.provisional}>
            Provisional — this quarter is still open and picks can still change.
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
              ? "Nobody has picked for this quarter."
              : `${data.ballot_count} ${
                  data.ballot_count === 1 ? "person has" : "people have"
                } picked so far.`}{" "}
            A chart needs {data.minimum_ballots} before it says anything about
            the quarter rather than about one person.
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
