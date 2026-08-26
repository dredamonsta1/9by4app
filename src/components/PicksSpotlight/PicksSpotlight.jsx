import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./PicksSpotlight.module.css";

/**
 * Album of the Quarter, as a small card at the top of the landing page's
 * right column.
 *
 * Two states, driven entirely by the server: "coming soon" with progress
 * toward the ballot floor, and the winner once a quarter clears it. The
 * client never decides whether the data is publishable — that floor lives
 * in one place, server-side, so the box and the chart page can't disagree
 * about whether a quarter counts.
 *
 * The quarter it shows is the most recent *publishable* one, not the
 * currently open one. Otherwise the winner would disappear at every
 * rollover, which is the opposite of what this box is for.
 */
const PicksSpotlight = () => {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get("/quarterly-picks/spotlight")
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        // A landing-page ornament must never take the page down with it.
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Render nothing at all until there's something to say. A skeleton in a
  // box this small is more visual noise than the content it stands in for.
  if (failed || !data) return null;

  const quarterName = `Q${data.quarter} ${data.year}`;
  const published = data.status === "published" && data.winner;

  return (
    <Link
      to={published ? `/picks/${data.year}/${data.quarter}` : "/profile"}
      className={styles.card}
      aria-label={
        published
          ? `Album of the Quarter, ${quarterName}: ${data.winner.album_name} by ${data.winner.artist_name}`
          : `Quarterly picks for ${quarterName}, coming soon`
      }
    >
      <span className={styles.kicker}>
        {published ? "Album of the Quarter" : "Quarterly Picks"}
      </span>

      {published ? (
        <>
          <span className={styles.quarter}>
            {quarterName}
            {data.provisional && <em className={styles.leading}> · leading</em>}
          </span>
          <span className={styles.body}>
            <img
              className={styles.art}
              src={resolveImageUrl(
                data.winner.album_image_url,
                `https://via.placeholder.com/72?text=${encodeURIComponent(
                  data.winner.album_name[0]
                )}`
              )}
              alt=""
              loading="lazy"
            />
            <span className={styles.meta}>
              <span className={styles.album}>{data.winner.album_name}</span>
              <span className={styles.artist}>{data.winner.artist_name}</span>
            </span>
          </span>
          <span className={styles.foot}>
            From {data.ballot_count} {data.ballot_count === 1 ? "ballot" : "ballots"}
          </span>
        </>
      ) : (
        <>
          <span className={styles.quarter}>{quarterName}</span>
          <span className={styles.soon}>Coming soon</span>
          <span className={styles.progress} aria-hidden="true">
            {Array.from({ length: data.minimum_ballots }, (_, i) => (
              <span
                key={i}
                className={i < data.ballot_count ? styles.pipOn : styles.pip}
              />
            ))}
          </span>
          <span className={styles.foot}>
            {data.ballot_count}/{data.minimum_ballots} ballots · add yours
          </span>
        </>
      )}
    </Link>
  );
};

export default PicksSpotlight;
