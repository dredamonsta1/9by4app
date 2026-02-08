// src/pages/HomePage.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./HomePage.module.css";
import ClickableList from "../components/RapperList";
import { fetchArtists, fetchMoreArtists } from "../redux/actions/artistActions";
import UpcomingMusic from "../components/UpcomingMusic/UpcomingMusic";

const HomePage = () => {
  const dispatch = useDispatch();

  const { artists, loading, loadingMore, error, page, hasMore, totalCount } =
    useSelector((state) => state.artists);

  useEffect(() => {
    dispatch(fetchArtists());
  }, [dispatch]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      dispatch(fetchMoreArtists({ page: page + 1 }));
    }
  };

  return (
    <div className={styles.homePageContainer}>
      <div className={styles.mainContent}>
        {loading && <p>Loading artists...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {!loading && !error && (
          <>
            <ClickableList
              artists={artists}
              showAdminActions={false}
              showCloutButton={false}
            />
            {hasMore && (
              <div className={styles.loadMoreContainer}>
                <button
                  className={styles.loadMoreButton}
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load More Artists"}
                </button>
                <p className={styles.artistCount}>
                  Showing {artists.length} of {totalCount} artists
                </p>
              </div>
            )}
            {!hasMore && artists.length > 0 && (
              <p className={styles.artistCount}>
                Showing all {artists.length} artists
              </p>
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
