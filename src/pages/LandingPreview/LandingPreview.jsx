import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchArtists } from "../../redux/actions/artistActions";
import { addArtistToProfileList } from "../../redux/actions/profileListActions";
import RankView from "../../components/RankView/RankView";
import RankCardList from "../../components/landing/RankCardList";
import FeaturedCard from "../../components/landing/FeaturedCard";
import styles from "./LandingPreview.module.css";

/**
 * Story 5 comparison harness — NOT a shipping surface.
 *
 * The hierarchy is the locked part and doesn't vary here: rankings take the
 * dominant column, the featured artist becomes the companion detail view
 * for whichever row is selected, and the ▲/▼ flip arrows are gone because
 * clicking a rank row is the browse mechanism now.
 *
 * What varies is the card treatment, which is the open question: do the
 * rank rows become deck-style cards, does the featured card, or both.
 * Toggle and compare.
 *
 * Unlinked from the nav, at /landing-preview, and meant to be deleted once
 * a treatment is picked and folded into ArtistPanel.
 */
const TREATMENTS = [
  {
    id: "rows",
    label: "Rank rows as cards",
    note: "Rankings is the new hero, so its rows carry the deck framing. Featured card keeps its current full-bleed look.",
  },
  {
    id: "featured",
    label: "Featured card restyled",
    note: "Companion card picks up the deck framing — rank pill, art block, name in a body. Rankings stays the current table.",
  },
  {
    id: "both",
    label: "Both",
    note: "One card grammar across the page. Most cohesive, most surface changed at once.",
  },
];

const LandingPreview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allArtists = useSelector((state) => state.artists.artists);
  const loading = useSelector((state) => state.artists.loading);
  const profileList = useSelector((state) => state.profileList.list);
  const isLoggedIn = !!useSelector((state) => state.auth.user);

  const [treatment, setTreatment] = useState("rows");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!allArtists || allArtists.length === 0) {
      dispatch(fetchArtists({ page: 1, limit: 50, sort: "clout" }));
    }
  }, [dispatch, allArtists]);

  const artists = useMemo(() => (allArtists ?? []).slice(0, 25), [allArtists]);
  const inList = useMemo(
    () => new Set((profileList ?? []).map((a) => a.artist_id)),
    [profileList]
  );

  // Default the companion to #1 — the page still opens on the top artist,
  // it just isn't the only way to reach anyone else any more.
  const selected =
    artists.find((a) => a.artist_id === selectedId) ?? artists[0] ?? null;
  const selectedRank = selected
    ? artists.findIndex((a) => a.artist_id === selected.artist_id) + 1
    : null;

  const deckRows = treatment === "rows" || treatment === "both";
  const deckFeatured = treatment === "featured" || treatment === "both";

  const handleAdd = (artist) => {
    if (!isLoggedIn) {
      navigate("/signup");
      return;
    }
    dispatch(addArtistToProfileList(artist));
  };

  const active = TREATMENTS.find((t) => t.id === treatment);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <p className={styles.kicker}>Story 5 · mockup</p>
        <h1 className={styles.title}>Landing, rankings-first</h1>
        <p className={styles.sub}>
          Hierarchy is fixed: rankings dominant, featured artist as the
          companion detail view, no flip arrows. The card treatment is what
          you're choosing between.
        </p>

        <div className={styles.controls}>
          <div className={styles.group} role="group" aria-label="Card treatment">
            {TREATMENTS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`${styles.pill} ${treatment === t.id ? styles.on : ""}`}
                onClick={() => setTreatment(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Link to="/" className={styles.back}>
            ← Current landing
          </Link>
        </div>

        <p className={styles.note}>{active?.note}</p>
      </header>

      {loading && artists.length === 0 ? (
        <p className={styles.loading}>Loading rankings…</p>
      ) : (
        <div className={styles.layout}>
          {/* Dominant column. Bigger, heavier, and the thing the eye lands
              on — "the platform IS the leaderboard". */}
          <section className={styles.rankings}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Rankings</h2>
              <span className={styles.sectionCount}>Top {artists.length}</span>
            </div>

            {deckRows ? (
              <RankCardList
                artists={artists}
                selectedId={selected?.artist_id}
                onSelect={(a) => setSelectedId(a.artist_id)}
                onAdd={handleAdd}
                inList={inList}
              />
            ) : (
              <div className={styles.tableWrap}>
                <RankView artists={artists} isLoggedIn={isLoggedIn} />
              </div>
            )}
          </section>

          {/* Companion. Was the protagonist; now it's the spotlight on
              whichever row is selected. */}
          <aside className={styles.companion}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Spotlight</h2>
            </div>
            <FeaturedCard
              artist={selected}
              rank={selectedRank}
              deckStyle={deckFeatured}
              isLoggedIn={isLoggedIn}
              added={selected ? inList.has(selected.artist_id) : false}
              onAdd={handleAdd}
              onOpen={(a) => navigate(`/artist/${a.artist_id}`)}
            />
            <p className={styles.companionNote}>
              Selecting a rank row swaps this card. The old ▲/▼ arrows are
              gone — the list is the browse mechanism now.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
};

export default LandingPreview;
