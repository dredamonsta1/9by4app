// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";
import ClickableList from "../components/RapperList";
import { fetchArtists } from "../redux/actions/artistActions"; // Import the fetch action
import UpcomingMusic from "../components/UpcomingMusic/UpcomingMusic";

const PAGE_SIZE = 7;

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  const { artists, loading, error } = useSelector((state) => state.artists);

  useEffect(() => {
    dispatch(fetchArtists());
  }, [dispatch]);

  // Reset to page 1 if artists data changes (e.g. re-sort after clout increment)
  useEffect(() => {
    setCurrentPage(1);
  }, [artists.length]);

  const totalPages = Math.ceil(artists.length / PAGE_SIZE);
  const paginatedArtists = artists.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className={styles.homePageContainer}>
      <div className={styles.mainContent}>
        {/* <h2 className={styles.homePageHeader}>Home Page</h2> */}

        {/* <h3>Artists List</h3> */}
        {loading && <p>Loading artists...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {!loading && !error && (
          <>
            <ClickableList
              artists={paginatedArtists}
              showAdminActions={false}
              showCloutButton={false}
            />
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        <div className={styles.upcomingMusicSection}>
          <UpcomingMusic />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
