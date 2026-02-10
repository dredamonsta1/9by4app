// src/pages/HomePage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./HomePage.module.css";
import ClickableList from "../components/RapperList";
import { fetchArtists, searchArtists, clearSearchResults } from "../redux/actions/artistActions";
import UpcomingMusic from "../components/UpcomingMusic/UpcomingMusic";

const HomePage = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimer = useRef(null);

  const { artists, loading, error, searchResults, searchLoading } =
    useSelector((state) => state.artists);

  useEffect(() => {
    dispatch(fetchArtists());
  }, [dispatch]);

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

  return (
    <div className={styles.homePageContainer}>
      <div className={styles.mainContent}>
        {loading && <p>Loading artists...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {!loading && !error && (
          <ClickableList
            artists={artists}
            showAdminActions={false}
            showCloutButton={false}
          />
        )}

        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search artists..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {searchLoading && <p>Searching...</p>}
        {!searchLoading && searchResults.length > 0 && (
          <div className={styles.searchResults}>
            <ClickableList
              artists={searchResults}
              showAdminActions={false}
              showCloutButton={false}
            />
          </div>
        )}
        {!searchLoading && searchTerm.trim() && searchResults.length === 0 && (
          <p className={styles.noResults}>No artists found</p>
        )}

        <div className={styles.upcomingMusicSection}>
          <UpcomingMusic />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
