import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import { resolveImageUrl } from "../../utils/imageUrl";
import {
  fetchProfileList,
  addArtistToProfileList,
  MAX_FAVORITE_ARTISTS,
} from "../../redux/actions/profileListActions";
import { ONBOARDING_TARGET } from "../../components/OnboardingChecklist/OnboardingChecklist";
import styles from "./Welcome.module.css";

// Same vocabulary as FiltersBar. Duplicated rather than imported because that
// component owns a full filter bar with its own "All" and "My list" pills,
// and this page wants the genre list alone.
const GENRES = [
  "Hip Hop",
  "R&B",
  "Pop",
  "Rock",
  "Country",
  "Latin",
  "Drill",
  "Trap",
  "Reggae",
  "Dancehall",
];

const GRID_SIZE = 24;

/**
 * First-run artist picking.
 *
 * 13 of 24 registered users have zero artists — they never started, rather
 * than failing to finish. Signup and login both landed on "/", where adding
 * an artist is one of a dozen available actions, and the onboarding checklist
 * lives on the profile, which a new user has no reason to visit. This page
 * removes the choice: there is nothing else on it to do.
 *
 * Ends on the personality rather than dropping into the app, so the flow pays
 * off with something the platform could not have said a minute earlier.
 */
const Welcome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const list = useSelector((state) => state.profileList.list);
  const loaded = useSelector((state) => state.profileList.loaded);

  const [genre, setGenre] = useState(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [personality, setPersonality] = useState(null);
  const [revealing, setRevealing] = useState(false);

  const count = list.length;
  const remaining = Math.max(ONBOARDING_TARGET - count, 0);

  useEffect(() => {
    if (!loaded) dispatch(fetchProfileList());
  }, [dispatch, loaded]);

  // No grid until a genre is tapped or something is searched. The default
  // sort is clout and only ~57 artists have any, so an ungated grid opens on
  // ":wumpscut:" and "!!!" — a poor first screen for a page whose whole job
  // is to prevent hesitation.
  const load = useCallback(async ({ genre: g, search: q }) => {
    if (!g && !q) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: String(GRID_SIZE) });
      if (q) params.set("search", q);
      else params.set("genre", g);
      const res = await axiosInstance.get(`/artists?${params}`);
      setResults(res.data?.artists ?? []);
    } catch {
      setError("Couldn't load artists. Try another genre.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const pickGenre = (g) => {
    setGenre(g);
    setSearch("");
    load({ genre: g, search: "" });
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setGenre(null);
    load({ genre: null, search: search.trim() });
  };

  const inList = new Set(list.map((a) => a.artist_id));

  const add = (artist) => {
    if (inList.has(artist.artist_id) || count >= MAX_FAVORITE_ARTISTS) return;
    dispatch(addArtistToProfileList(artist));
  };

  /**
   * Generate the personality, then move on.
   *
   * Navigates to the profile even when generation fails. The artists are
   * already saved, the profile generates the card itself, and stranding
   * someone on an error at the moment the product is trying to delight them
   * is worse than skipping the flourish.
   */
  const finish = async () => {
    setRevealing(true);
    try {
      const artists = list.map((a) => ({
        artist_name: a.artist_name || a.name,
        genre: a.genre || null,
      }));
      const res = await axiosInstance.post("/users/me/music-personality", {
        artists,
      });
      setPersonality({
        title: res.data.title,
        description: res.data.description,
      });
    } catch {
      navigate("/profile");
    } finally {
      setRevealing(false);
    }
  };

  // Skipping deliberately does NOT set ONBOARDING_DISMISSED_KEY. Skip is
  // "not now"; dismiss is "stop asking". Setting it here would silence the
  // navbar nudge, which is the only thing left to bring them back.
  const skip = () => navigate("/");

  if (personality) {
    return (
      <main className={styles.page}>
        <div className={styles.reveal}>
          <p className={styles.kicker}>Your music personality</p>
          <h1 className={styles.revealTitle}>{personality.title}</h1>
          <p className={styles.revealBody}>{personality.description}</p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => navigate("/profile")}
          >
            See your profile
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <p className={styles.kicker}>Welcome to stanbox</p>
        <h1 className={styles.title}>
          {remaining > 0
            ? `Pick ${remaining} more artist${remaining === 1 ? "" : "s"}`
            : "Your Top 20 has started"}
        </h1>
        <p className={styles.sub}>
          Three unlocks your music personality. You have{" "}
          <strong>{MAX_FAVORITE_ARTISTS} slots</strong> to fill in all — this is
          the start of your Top 20, not the end.
        </p>

        <div
          className={styles.progress}
          aria-label={`${count} of ${MAX_FAVORITE_ARTISTS} artists added`}
        >
          {Array.from({ length: ONBOARDING_TARGET }, (_, i) => (
            <span key={i} className={i < count ? styles.pipOn : styles.pip} />
          ))}
          <span className={styles.progressText}>
            {count} of {MAX_FAVORITE_ARTISTS}
          </span>
        </div>
      </header>

      <form className={styles.searchRow} onSubmit={submitSearch} role="search">
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search for any artist…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search for an artist"
        />
        <button type="submit" className={styles.searchBtn}>
          Search
        </button>
      </form>

      <nav className={styles.genres} aria-label="Pick a genre">
        {GENRES.map((g) => (
          <button
            key={g}
            type="button"
            className={`${styles.genrePill} ${
              genre === g ? styles.genrePillOn : ""
            }`}
            onClick={() => pickGenre(g)}
          >
            {g}
          </button>
        ))}
      </nav>

      {loading && <p className={styles.muted}>Loading artists…</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && results.length === 0 && (
        <p className={styles.muted}>
          {genre || search
            ? "No artists found. Try another genre or search."
            : "Tap a genre to see artists, or search for someone you already love."}
        </p>
      )}

      <ul className={styles.grid}>
        {results.map((a) => {
          const added = inList.has(a.artist_id);
          return (
            <li key={a.artist_id}>
              <button
                type="button"
                className={`${styles.card} ${added ? styles.cardAdded : ""}`}
                onClick={() => add(a)}
                aria-pressed={added}
              >
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
                <span className={styles.mark} aria-hidden="true">
                  {added ? "✓" : "+"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={finish}
          disabled={count < ONBOARDING_TARGET || revealing}
        >
          {revealing
            ? "Reading your taste…"
            : count < ONBOARDING_TARGET
            ? `Pick ${remaining} more`
            : "Reveal my music personality"}
        </button>
        <button type="button" className={styles.skipBtn} onClick={skip}>
          I'll do this later
        </button>
      </div>
    </main>
  );
};

export default Welcome;
