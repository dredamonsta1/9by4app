// src/pages/HomePage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchArtists } from "../redux/actions/artistActions"; // To ensure data is fetched if not already
import ClickableList from "../components/RapperList"; // Re-use ClickableList for display

const HomePage = () => {
  const { artists, loading, error } = useSelector((state) => state.artists);
  const dispatch = useDispatch();

  const navigate = useNavigate(); // Initialize useNavigate hook

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
      <h2>Home Page</h2>
      <button
        onClick={() => navigate("/login")}
        style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
      >
        Go to Login
      </button>

      <button
        onClick={() => navigate("/profile")}
        style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
      >
        Go to Profile
      </button>

      <button
        onClick={() => navigate("/dashboard")}
        style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
      >
        Go to Dashboard
      </button>

      <h3>Artists List</h3>
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
