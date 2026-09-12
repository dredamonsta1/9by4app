import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { resolveImageUrl } from "../../utils/imageUrl";
import { fetchProfileList } from "../../redux/actions/profileListActions";
import { ONBOARDING_TARGET } from "../../components/OnboardingChecklist/OnboardingChecklist";
import styles from "./Crate.module.css";

/**
 * Somebody else's crate — a bundle of artists, adoptable in one tap.
 *
 * Public on purpose. A crate that 404s for logged-out visitors cannot travel,
 * and travelling is the entire point; it also matches the auth wall rule that
 * browsing is free while committing needs an account.
 *
 * The page is deliberately bare. Same reasoning as /welcome: it works because
 * there is nothing else on it to do.
 */
const Crate = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [crate, setCrate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adopting, setAdopting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axiosInstance
      .get(`/crates/${slug}`)
      .then((res) => {
        if (!cancelled) setCrate(res.data?.crate ?? null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.status === 404
              ? "That crate doesn't exist, or the link is wrong."
              : "Couldn't load this crate."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const adopt = async () => {
    setAdopting(true);
    try {
      const res = await axiosInstance.post(`/crates/${slug}/adopt`);
      const { added_count, crate_size, already_had, list_full, list_total } = res.data;

      // Say what actually happened. A list with 18 artists taking a 5-crate
      // gets 2, and reporting plain success would leave someone wondering
      // where the other three went.
      if (added_count === 0 && already_had > 0) {
        toast.info("You already had every artist in this crate.");
      } else if (list_full && added_count < crate_size) {
        toast.success(`Added ${added_count} of ${crate_size} — your Top 20 is full.`);
      } else if (added_count < crate_size) {
        toast.success(`Added ${added_count} of ${crate_size} — you already had the rest.`);
      } else {
        toast.success(`Added all ${added_count} to your Top 20.`);
      }

      // The list in redux is now stale, and the profile reads it.
      dispatch(fetchProfileList());

      // Crossing three for the first time should feel identical to picking
      // three by hand, because it is — so it ends in the same place.
      navigate(list_total >= ONBOARDING_TARGET ? "/welcome" : "/profile");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Couldn't adopt this crate.");
    } finally {
      setAdopting(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.muted}>Loading crate…</p>
      </main>
    );
  }

  if (error || !crate) {
    return (
      <main className={styles.page}>
        <p className={styles.error}>{error ?? "Crate not found."}</p>
        <Link to="/" className={styles.secondaryLink}>
          Back to stanbox
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <p className={styles.kicker}>A crate from {crate.owner_username}</p>
        <h1 className={styles.title}>{crate.name}</h1>
        <p className={styles.sub}>
          {crate.artists.length} artists. Adopt it and they go straight into your
          Top 20 — you can drop any of them later.
        </p>
      </header>

      <ul className={styles.grid}>
        {crate.artists.map((a) => (
          <li key={a.artist_id} className={styles.card}>
            <img
              className={styles.art}
              src={resolveImageUrl(
                a.image_url,
                `https://via.placeholder.com/160?text=${encodeURIComponent(
                  (a.artist_name || "?")[0]
                )}`
              )}
              alt=""
              loading="lazy"
            />
            <span className={styles.name}>{a.artist_name}</span>
            {a.genre && <span className={styles.genre}>{a.genre}</span>}
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        {user ? (
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={adopt}
            disabled={adopting}
          >
            {adopting ? "Adding…" : `Adopt all ${crate.artists.length}`}
          </button>
        ) : (
          <>
            {/* Browsing is free, committing needs an account — the same rule
                the rest of the platform follows. */}
            <Link to="/login" className={styles.primaryBtn}>
              Sign in to adopt
            </Link>
            <Link to="/signup" className={styles.secondaryLink}>
              No account yet?
            </Link>
          </>
        )}
      </div>
    </main>
  );
};

export default Crate;
