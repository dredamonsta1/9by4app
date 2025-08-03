// src/pages/HomePage.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar/NavBar";
import ClickableList from "../components/RapperList";
import { fetchArtists } from "../redux/actions/artistActions"; // Import the fetch action

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- FIX: Re-introducing data fetching logic ---
  // 1. Get the artists, loading, and error states from the Redux store.
  const { artists, loading, error } = useSelector((state) => state.artists);

  // 2. Use useEffect to fetch the artists once when the component mounts.
  useEffect(() => {
    dispatch(fetchArtists());
  }, [dispatch]); // This dependency array ensures it only runs once.

  // return (
  //   <div className={styles.homePageContainer}>
  //     <h2 className="home-page-header">Home Page</h2>
  //     <NavBar />
  {
    /* <div className="navigation-buttons">
        <button className="login-button" onClick={() => navigate("/login")}>
          Go to Login
        </button>
        <button className="nav-button" onClick={() => navigate("/profile")}>
          Go to Profile
        </button>
        <button className="nav-button" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </button>
        <button
          className="image-feed-button"
          onClick={() => navigate("/images")}
        >
          View Image Feed
        </button>
      </div> */
  }

  {
    /* <h3>Artists List</h3> */
  }
  {
    /* 3. Handle loading and error states before rendering the list */
  }
  {
    /* {loading && <p>Loading artists...</p>} */
  }
  {
    /* {error && <p style={{ color: "red" }}>Error: {error}</p>} */
  }
  {
    /* {!loading && !error && ( */
  }
  {
    /* // 4. Pass the `artists` array as a prop to ClickableList */
  }
  {
    /* <ClickableList
          artists={artists}
          showAdminActions={false}
          showCloutButton={false}
        />
      )}
    </div>
  );
}; */
  }

  // *********************************New Code*********************************

  return (
    <div className={styles.homePageContainer}>
      {/* This is the first item in the grid (left column) */}
      <NavBar />

      {/* This new div wraps all other content, becoming the second item (right column) */}
      <div className={styles.mainContent}>
        <h2 className="home-page-header">Home Page</h2>

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
      </div>
    </div>
  );
};

export default HomePage;
