// src/pages/HomePage.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchArtists } from "../redux/actions/artistActions"; // To ensure data is fetched if not already
import ClickableList from "../components/RapperList"; // Re-use ClickableList for display

const HomePage = () => {
  const { artists, loading, error } = useSelector((state) => state.artists);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch artists if not already loaded, similar to dashboard
    if (!loading && !artists.length && !error) {
      dispatch(fetchArtists());
    }
  }, [dispatch, loading, artists.length, error]);

  if (loading) return <p>Loading artists for Home page...</p>;
  if (error)
    return <p style={{ color: "red" }}>Error loading artists: {error}</p>;

  return (
    <div>
      {/* Home list probably doesn't need admin actions or clout buttons */}
      <ClickableList
        items={artists} // Pass artists from Redux
        showAdminActions={false}
        showCloutButton={false}
      />
    </div>
  );
};

export default HomePage;
