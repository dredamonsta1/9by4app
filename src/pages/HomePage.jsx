import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./HomePage.module.css";
import ClickableList from "../components/RapperList";
import { ArtistModal } from "../components/RapperList";
import { fetchArtists, searchArtists, clearSearchResults } from "../redux/actions/artistActions";
import { fetchProfileList } from "../redux/actions/profileListActions";
import HeroSection from "../components/HeroSection/HeroSection";
import FiltersBar from "../components/FiltersBar/FiltersBar";
import TrendingShelf from "../components/TrendingShelf/TrendingShelf";
import RankView from "../components/RankView/RankView";
import StickyCtaBar from "../components/StickyCtaBar/StickyCtaBar";
import NewMusicSection from "../components/NewMusicSection/NewMusicSection";
import axiosInstance from "../utils/axiosInstance";

const VIEW_MODE_KEY = "9by4_view_mode";

const HomePage = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [upcomingReleases, setUpcomingReleases] = useState([]);
  const [activeFilter, setActiveFilter] = useState({ type: "all", value: "" });
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem(VIEW_MODE_KEY) || "scroll"
  );
  const [trendingSelected, setTrendingSelected] = useState(null);
  const debounceTimer = useRef(null);

  const { artists, loading, error, searchResults, searchLoading } =
    useSelector((state) => state.artists);
  const { isLoggedIn } = useSelector((state) => state.auth);
  const profileList = useSelector((state) => state.profileList.list);

  useEffect(() => {
    dispatch(fetchArtists());
    axiosInstance.get("/music/upcoming")
      .then((res) => setUpcomingReleases(res.data))
      .catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (isLoggedIn) dispatch(fetchProfileList());
  }, [isLoggedIn, dispatch]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setSearchTerm("");
    dispatch(clearSearchResults());

    if (filter.type === "mylist") return; // handled client-side

    dispatch(fetchArtists({
      genre: filter.type === "genre" ? filter.value : "",
      region: filter.type === "region" ? filter.value : "",
    }));
  };

  const handleViewToggle = (mode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    clearTimeout(debounceTimer.current);
    if (!value.trim()) {
      dispatch(clearSearchResults());
      return;
    }
    debounceTimer.current = setTimeout(() => {
      dispatch(searchArtists({ search: value.trim() }));
    }, 300);
  };

  // My List filter: scope displayed artists to only those in profileList, ranked globally
  const profileListIds = new Set(profileList.map((a) => a.artist_id));
  const displayedArtists = activeFilter.type === "mylist"
    ? artists.filter((a) => profileListIds.has(a.artist_id))
    : artists;

  const showSearch = !searchTerm.trim();

  return (
    <div className={styles.page}>
      {/* Section 1 — Hero */}
      <HeroSection />

      {/* Section 2 — Filters bar */}
      <FiltersBar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        isLoggedIn={isLoggedIn}
      />

      {/* Section 3 — Trending shelf */}
      <TrendingShelf onArtistClick={setTrendingSelected} />

      {/* Section 4 — Main list */}
      <section className={styles.listSection}>
        <div className={styles.listHeader}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleBtn} ${viewMode === "scroll" ? styles.toggleActive : ""}`}
              onClick={() => handleViewToggle("scroll")}
            >
              Cards
            </button>
            <button
              className={`${styles.toggleBtn} ${viewMode === "rank" ? styles.toggleActive : ""}`}
              onClick={() => handleViewToggle("rank")}
            >
              Rank
            </button>
          </div>

          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search artists..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {loading && <p className={styles.loadingText}>Loading...</p>}
        {error && <p className={styles.errorText}>Error: {error}</p>}

        {searchLoading && <p className={styles.loadingText}>Searching...</p>}

        {!searchLoading && searchResults.length > 0 && searchTerm.trim() && (
          viewMode === "rank"
            ? <RankView artists={searchResults} isLoggedIn={isLoggedIn} />
            : <ClickableList
                artists={searchResults}
                showAdminActions={false}
                showCloutButton={isLoggedIn}
                upcomingReleases={upcomingReleases}
              />
        )}

        {!searchLoading && searchTerm.trim() && searchResults.length === 0 && (
          <p className={styles.noResults}>No artists found.</p>
        )}

        {showSearch && !loading && !error && (
          viewMode === "rank"
            ? <RankView artists={displayedArtists} isLoggedIn={isLoggedIn} />
            : <ClickableList
                artists={displayedArtists}
                showAdminActions={false}
                showCloutButton={isLoggedIn}
                showRank={true}
                upcomingReleases={upcomingReleases}
              />
        )}
      </section>

      {/* Trending shelf artist modal */}
      {trendingSelected && (
        <ArtistModal
          artist={trendingSelected}
          onClose={() => setTrendingSelected(null)}
          upcomingReleases={upcomingReleases}
        />
      )}

      {/* Section 5 — New Music */}
      <NewMusicSection isLoggedIn={isLoggedIn} upcomingReleases={upcomingReleases} />

      {/* Section 6 — Sticky CTA bar (logged-out only) */}
      {!isLoggedIn && <StickyCtaBar />}
    </div>
  );
};

export default HomePage;
