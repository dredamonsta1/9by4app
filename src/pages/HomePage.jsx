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

  useEffect(() => {
    dispatch(fetchArtists());
  }, [dispatch]);

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

        <div className={styles.upcomingMusicSection}>
          <UpcomingMusic />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
