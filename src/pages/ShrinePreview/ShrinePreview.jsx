import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import {
  mergeShrineEntries,
  padToSlots,
  demoEntries,
  SHRINE_SLOTS,
} from "../../components/shrine/shrineData";
import VinylStack from "../../components/shrine/VinylStack";
import FrameWall from "../../components/shrine/FrameWall";
import CardDeck from "../../components/shrine/CardDeck";
import RankedShelf from "../../components/shrine/RankedShelf";
import TrophyCase from "../../components/shrine/TrophyCase";
import StanCardEvolved from "../../components/shrine/StanCardEvolved";
import styles from "./ShrinePreview.module.css";

/**
 * Story 6 comparison harness — NOT a shipping surface.
 *
 * Six directions for the Top 20 shrine, rendered from the same data so the
 * choice is about form rather than content. Deliberately unlinked from the
 * nav: reachable at /shrine-preview and meant to be deleted (along with the
 * five losing directions) once a direction is picked.
 *
 * The data toggle matters more than it looks. A shrine that works at 20
 * artists can look broken at 3, and vice versa — both need judging before
 * committing.
 */
const DIRECTIONS = [
  {
    id: "frames",
    name: "Wall of frames",
    Component: FrameWall,
    note: "Museum hang. Artwork is the hero; first five get heavier frames. Most reverent, least playful.",
  },
  {
    id: "shelf",
    name: "Ranked shelf",
    Component: RankedShelf,
    note: "Vinyl discs with chartreuse centre labels — speaks the brand mark's language. Circular crops are unkind to photos.",
  },
  {
    id: "trophy",
    name: "Trophy case",
    Component: TrophyCase,
    note: "Only direction that states the first-five rule structurally. Carries tier + tenure best. Risks reading game-like.",
  },
  {
    id: "stack",
    name: "Stack of vinyl",
    Component: VinylStack,
    note: "Records leaning in a crate. Twenty fit in almost no space, but artwork stays hidden.",
  },
  {
    id: "deck",
    name: "Card deck",
    Component: CardDeck,
    note: "Click to deal. Most collectible feel, but only one artist is legible at a time — judge by interacting.",
  },
  {
    id: "stancard",
    name: "Stan card, evolved",
    Component: StanCardEvolved,
    note: "Densest and most legible; tier and tenure as real columns. Least new code if it wins — but it's a list.",
  },
];

const ShrinePreview = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const profileList = useSelector((state) => state.profileList.list);
  const myId = currentUser?.id ?? currentUser?.user_id;

  const [stanRanks, setStanRanks] = useState([]);
  const [source, setSource] = useState("demo");
  const [only, setOnly] = useState("all");

  useEffect(() => {
    if (!myId) return;
    axiosInstance
      .get(`/communities/user/${myId}/stan-card`)
      .then((res) => setStanRanks(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, [myId]);

  const entries = useMemo(() => {
    const base =
      source === "demo"
        ? demoEntries()
        : mergeShrineEntries(profileList ?? [], stanRanks);
    return padToSlots(base, SHRINE_SLOTS);
  }, [source, profileList, stanRanks]);

  const realCount = (profileList ?? []).filter(Boolean).length;
  const shown = only === "all" ? DIRECTIONS : DIRECTIONS.filter((d) => d.id === only);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Story 6 · mockups</p>
        <h1 className={styles.title}>Top 20 as a shrine</h1>
        <p className={styles.sub}>
          Six directions, same data. Nothing here ships — pick one and the
          other five get deleted along with this page.
        </p>

        <div className={styles.controls}>
          <div className={styles.group} role="group" aria-label="Data source">
            <button
              type="button"
              className={`${styles.pill} ${source === "demo" ? styles.on : ""}`}
              onClick={() => setSource("demo")}
            >
              Full 20 (demo)
            </button>
            <button
              type="button"
              className={`${styles.pill} ${source === "real" ? styles.on : ""}`}
              onClick={() => setSource("real")}
            >
              Your list ({realCount})
            </button>
          </div>

          <select
            className={styles.select}
            value={only}
            onChange={(e) => setOnly(e.target.value)}
            aria-label="Show one direction"
          >
            <option value="all">All six</option>
            {DIRECTIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <Link to="/profile" className={styles.back}>
            ← Profile
          </Link>
        </div>

        {source === "real" && realCount < 5 && (
          <p className={styles.warn}>
            Only {realCount} artist{realCount === 1 ? "" : "s"} in your list —
            the sparse case is worth judging, but switch to the demo set to see
            how each direction handles a full twenty.
          </p>
        )}
      </header>

      <div className={styles.directions}>
        {shown.map(({ id, name, Component, note }, i) => (
          <section key={id} className={styles.block}>
            <div className={styles.blockHead}>
              <h2 className={styles.blockTitle}>
                <span className={styles.blockNum}>
                  {DIRECTIONS.findIndex((d) => d.id === id) + 1}
                </span>
                {name}
              </h2>
              <p className={styles.note}>{note}</p>
            </div>
            <Component entries={entries} />
          </section>
        ))}
      </div>
    </div>
  );
};

export default ShrinePreview;
