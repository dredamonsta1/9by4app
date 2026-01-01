// src/pages/HomePage.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";
import ClickableList from "../components/RapperList";
import { fetchArtists } from "../redux/actions/artistActions"; // Import the fetch action
import UpcomingMusic from "../components/UpcomingMusic/UpcomingMusic";

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { artists, loading, error } = useSelector((state) => state.artists);

  // 2. Use useEffect to fetch the artists once when the component mounts.
  useEffect(() => {
    dispatch(fetchArtists());
  }, [dispatch]); // This dependency array ensures it only runs once.

  return (
    <div className={styles.homePageContainer}>
      {/* This is the first item in the grid (left column) */}

      {/* This new div wraps all other content, becoming the second item (right column) */}
      <div className={styles.mainContent}>
        <h2 className={styles.homePageHeader}>Home Page</h2>

        <h3>Artists List</h3>
        {loading && <p>Loading artists...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {!loading && !error && (
          <ClickableList
            artists={artists}
            showAdminActions={false}
            showCloutButton={false}
          />
        )}

        {/* This button navigates to the login page */}
        <div className={styles.upcomingMusicSection}>
          <UpcomingMusic />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
