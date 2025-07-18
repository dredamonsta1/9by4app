// // src/pages/HomePage.jsx
// import React, { useEffect } from "react";
// import "./HomePage.css"; // Import your CSS file for styling
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { fetchArtists } from "../redux/actions/artistActions"; // To ensure data is fetched if not already
// import ClickableList from "../components/RapperList"; // Re-use ClickableList for display
// import Feeds from "../components/Feeds/Feeds";

// const HomePage = () => {
//   const { artists, loading, error } = useSelector((state) => state.artists);
//   const dispatch = useDispatch();

//   const navigate = useNavigate(); // Initialize useNavigate hook

//   useEffect(() => {
//     // Fetch artists if not already loaded, similar to dashboard
//     if (!loading && !artists.length && !error) {
//       dispatch(fetchArtists());
//     }
//   }, [dispatch, loading, artists.length, error]);

//   if (loading) return <p>Loading artists for Home page...</p>;
//   if (error)
//     return <p style={{ color: "red" }}>Error loading artists: {error}</p>;

//   return (
//     <div className="home-page-container">
//       <h2 className="home-page-header">Home Page</h2>
//       <button
//         className="login-button"
//         onClick={() => navigate("/login")}
//         // style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
//       >
//         Go to Login
//       </button>

//       <button
//         onClick={() => navigate("/profile")}
//         style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
//       >
//         Go to Profile
//       </button>

//       <button
//         onClick={() => navigate("/dashboard")}
//         style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
//       >
//         Go to Dashboard
//       </button>

//       <h3>Artists List</h3>
//       {/* Home list probably doesn't need admin actions or clout buttons */}
//       <ClickableList
//         items={artists} // Pass artists from Redux
//         showAdminActions={false}
//         showCloutButton={false}
//       />
//       <h3>Feeds</h3>
//       {/* Include Feeds component to display feeds */}
//       <Feeds />
//     </div>
//   );
// };

// export default HomePage;

// *************************New Code****************************

// src/pages/HomePage.jsx
// import React, { useEffect } from "react";
// import "./HomePage.css"; // Import your CSS file for styling
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { fetchArtists } from "../redux/actions/artistActions";
// import ClickableList from "../components/RapperList";
// import Feeds from "../components/Feeds/Feeds";

// const HomePage = () => {
//   // Data fetching and state management remain the same
//   const { artists, loading, error } = useSelector((state) => state.artists);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // --- FIX FOR THE INFINITE LOOP ---
//   // This useEffect hook is now configured to run only ONCE when the component
//   // first mounts. The dependency array `[dispatch]` is stable and prevents
//   // the hook from re-running unnecessarily, which was causing the stack overflow.
//   useEffect(() => {
//     dispatch(fetchArtists());
//   }, [dispatch]);

//   // Conditional rendering for loading and error states
//   if (loading) return <p>Loading artists for Home page...</p>;
//   if (error)
//     return <p style={{ color: "red" }}>Error loading artists: {error}</p>;

//   return (
//     <div className="home-page-container">
//       <h2 className="home-page-header">Home Page</h2>
//       <div className="navigation-buttons">
//         <button className="login-button" onClick={() => navigate("/login")}>
//           Go to Login
//         </button>
//         <button className="nav-button" onClick={() => navigate("/profile")}>
//           Go to Profile
//         </button>
//         <button className="nav-button" onClick={() => navigate("/dashboard")}>
//           Go to Dashboard
//         </button>
//       </div>

//       <h3>Artists List</h3>
//       {/* The ClickableList component will display the artists fetched from Redux */}
//       <ClickableList showAdminActions={false} showCloutButton={false} />

//       <h3>Feeds</h3>
//       {/* The Feeds component will handle its own data fetching and display */}
//       <Feeds />
//     </div>
//   );
// };

// export default HomePage;

// *************************New Code****************************

// src/pages/HomePage.jsx
// import React, { useEffect } from "react";
// import "./HomePage.css"; // Import your CSS file for styling
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { fetchArtists } from "../redux/actions/artistActions";
// import ClickableList from "../components/RapperList";
// // import Feeds from "../components/Feeds/Feeds"; // Temporarily commented out for debugging

// const HomePage = () => {
//   // Data fetching and state management remain the same
//   const { artists, loading, error } = useSelector((state) => state.artists);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // This useEffect is correct and fetches the artists list only once.
//   useEffect(() => {
//     dispatch(fetchArtists());
//   }, [dispatch]);

//   // Conditional rendering for loading and error states
//   if (loading) return <p>Loading artists for Home page...</p>;
//   if (error)
//     return <p style={{ color: "red" }}>Error loading artists: {error}</p>;

//   return (
//     <div className="home-page-container">
//       <h2 className="home-page-header">Home Page</h2>
//       <div className="navigation-buttons">
//         <button className="login-button" onClick={() => navigate("/login")}>
//           Go to Login
//         </button>
//         <button className="nav-button" onClick={() => navigate("/profile")}>
//           Go to Profile
//         </button>
//         <button className="nav-button" onClick={() => navigate("/dashboard")}>
//           Go to Dashboard
//         </button>
//       </div>

//       <h3>Artists List</h3>
//       {/* The ClickableList component will display the artists fetched from Redux */}
//       <ClickableList showAdminActions={false} showCloutButton={false} />

//       {/* --- FIX FOR THE INFINITE LOOP --- */}
//       {/* The Feeds component has been temporarily removed. If the loop stops, */}
//       {/* it confirms the problem is inside the Feeds.jsx file. */}
//       {/* <h3>Feeds</h3> */}
//       {/* <Feeds /> */}
//     </div>
//   );
// };

// export default HomePage;

// *************************New Code****************************

// src/pages/HomePage.jsx
// import React from "react";
// import "./HomePage.css"; // Import your CSS file for styling
// import { useNavigate } from "react-router-dom";
// import ClickableList from "../components/RapperList";
// import Feeds from "../components/Feeds/Feeds"; // Feeds remains commented out until the loop is fixed

// const HomePage = () => {
//   const navigate = useNavigate();

//   // --- FIX FOR THE INFINITE LOOP ---
//   // All data fetching logic (`useEffect`, `useSelector`, `useDispatch`) has been removed
//   // from this parent component. This component is now only responsible for layout.
//   // The <ClickableList /> component will now be solely responsible for fetching
//   // and displaying the artist data, which prevents conflicting fetch calls.

//   return (
//     <div className="home-page-container">
//       <h2 className="home-page-header">Home Page</h2>
//       <div className="navigation-buttons">
//         <button className="login-button" onClick={() => navigate("/login")}>
//           Go to Login
//         </button>
//         <button className="nav-button" onClick={() => navigate("/profile")}>
//           Go to Profile
//         </button>
//         <button className="nav-button" onClick={() => navigate("/dashboard")}>
//           Go to Dashboard
//         </button>
//       </div>

//       <h3>Artists List</h3>
//       {/* The ClickableList component now handles its own data lifecycle. */}
//       <ClickableList showAdminActions={false} showCloutButton={false} />

//       <h3>Feeds</h3>
//       <Feeds />
//     </div>
//   );
// };

// export default HomePage;

// **************************New Code****************************

// src/pages/HomePage.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import ClickableList from "../components/RapperList";
import Feeds from "../components/Feeds/Feeds";
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

  return (
    <div className="home-page-container">
      <h2 className="home-page-header">Home Page</h2>
      <div className="navigation-buttons">
        <button className="login-button" onClick={() => navigate("/login")}>
          Go to Login
        </button>
        <button className="nav-button" onClick={() => navigate("/profile")}>
          Go to Profile
        </button>
        <button className="nav-button" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </button>
      </div>

      <h3>Artists List</h3>
      {/* 3. Handle loading and error states before rendering the list */}
      {loading && <p>Loading artists...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && (
        // 4. Pass the `artists` array as a prop to ClickableList
        <ClickableList
          artists={artists}
          showAdminActions={false}
          showCloutButton={false}
        />
      )}

      <h3>Feeds</h3>
      <Feeds />
    </div>
  );
};

export default HomePage;
