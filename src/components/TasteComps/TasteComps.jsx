import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./TasteComps.module.css";

/**
 * "Fans of your Top 20 also love…" — the profile-level counterpart to the
 * per-artist Fans Also Love box on the artist panel.
 *
 * Backed by GET /users/me/related-artists, which resolves the whole list in
 * one query. Doing this from the per-artist endpoint would mean up to twenty
 * requests to render one section.
 *
 * Deliberately silent when it has nothing worth saying. Signal is thin at
 * low user counts, and an empty "we found nothing" shell on your own profile
 * is worse than no section at all. Errors are silent for the same reason —
 * this is a bonus surface, and a red banner over a failed recommendation is
 * noise the user can do nothing about.
 */
const TasteComps = ({ enabled = true, limit = 12 }) => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    axiosInstance
      .get(`/users/me/related-artists?limit=${limit}`)
      .then((res) => {
        if (cancelled) return;
        setArtists(res.data?.related ?? []);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, limit]);

  if (!enabled || failed) return null;

  if (loading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Fans of your Top 20 also love</h2>
        <p className={styles.loading}>Looking for people with your taste…</p>
      </section>
    );
  }

  if (artists.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>Fans of your Top 20 also love</h2>
        <span className={styles.note}>Based on who else stans your artists</span>
      </div>

      <div className={styles.rail}>
        {artists.map((a) => (
          <button
            key={a.artist_id}
            type="button"
            className={styles.card}
            onClick={() => navigate(`/artist/${a.artist_id}`)}
            title={a.artist_name}
          >
            <img
              src={resolveImageUrl(
                a.image_url,
                `https://via.placeholder.com/100?text=${encodeURIComponent(
                  (a.artist_name || "?")[0]
                )}`
              )}
              alt=""
              className={styles.image}
            />
            <span className={styles.name}>{a.artist_name}</span>
            {a.genre && <span className={styles.genre}>{a.genre}</span>}
          </button>
        ))}
      </div>
    </section>
  );
};

export default TasteComps;
