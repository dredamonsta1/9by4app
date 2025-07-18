// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { fetchArtists } from "../../redux/actions/artistActions"; // To ensure data is fetched if not already
// import ClickableList from "../../components/RapperList"; // Re-use ClickableList for display
// import UserProfile from "../../components/userProfile/UserProfile";

// const ProfilePage = () => {
//   const { artists, loading, error } = useSelector((state) => state.artists);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     // Fetch artists if not already loaded, similar to dashboard
//     if (!loading && !artists.length && !error) {
//       dispatch(fetchArtists());
//     }
//   }, [dispatch, loading, artists.length, error]);

//   if (loading) return <p>Loading artists for Profile page...</p>;
//   if (error)
//     return <p style={{ color: "red" }}>Error loading artists: {error}</p>;

//   return (
//     <div>
//       {/* Profile list probably doesn't need admin actions or clout buttons */}
//       <h2>Your Profile</h2>
//       {/* Display user profile information */}
//       <UserProfile />
//       {/* <ClickableList showAdminActions={true} showCloutButton={true} /> */}
//       {/* Include UserProfile component to display user details */}
//     </div>
//   );
// };
// export default ProfilePage;

// ************************New Code****************************

// import React from "react";
// import UserProfile from "../../components/userProfile/UserProfile";

// /**
//  * The ProfilePage component serves as a container for the user's profile view.
//  * All data fetching and display logic is now handled by the child components,
//  * primarily UserProfile and RapperList. This removes the conflicting useEffect
//  * that was causing an infinite loop.
//  */
// const ProfilePage = () => {
//   return (
//     <div>
//       <h2>Your Profile</h2>
//       {/* The UserProfile component is now solely responsible for handling
//         the display of user information and rendering the artist list.
//       */}
//       <UserProfile />
//     </div>
//   );
// };

// export default ProfilePage;

// *************************New Code****************************

// import React, { useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { fetchArtists } from "../../redux/actions/artistActions";
// import ClickableList from "../../components/RapperList";
// import UserProfile from "../../components/userProfile/UserProfile";

// const ProfilePage = () => {
//   const dispatch = useDispatch();
//   // We still need the full artist list from Redux
//   const { artists, loading, error } = useSelector((state) => state.artists);

//   // Fetch the artists when the component loads
//   useEffect(() => {
//     dispatch(fetchArtists());
//   }, [dispatch]);

//   // The reducer already sorts the artists by count, so we just need to take the top 10.
//   // We use .slice(0, 10) to get a new array with only the first 10 items.
//   const topTenArtists = artists.slice(0, 10);

//   if (loading) return <p>Loading artists for Profile page...</p>;
//   if (error)
//     return <p style={{ color: "red" }}>Error loading artists: {error}</p>;

//   return (
//     <div>
//       <h2>Your Profile</h2>
//       <UserProfile />

//       <hr style={{ margin: "40px 0" }} />

//       <h2>Top 10 Artists - Vote for your Favorite</h2>
//       {/* We pass the `topTenArtists` array directly to the ClickableList.
//         We also enable the clout button so users can vote.
//       */}
//       <ClickableList items={topTenArtists} showCloutButton={true} />
//     </div>
//   );
// };

// export default ProfilePage;

// ************************New Code****************************

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchArtists,
  incrementClout,
} from "../../redux/actions/artistActions";
import ClickableList from "../../components/RapperList";
import UserProfile from "../../components/userProfile/UserProfile";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { artists, loading, error } = useSelector((state) => state.artists);

  // --- NEW: State for the search functionality ---
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchArtists());
  }, [dispatch]);

  // The reducer already sorts artists by count, so we just slice the top 10.
  const topTenArtists = artists.slice(0, 10);

  // --- NEW: Filter artists based on the search term ---
  // It will only show results if the user has typed at least 2 characters.
  const searchResults =
    searchTerm.length > 1
      ? artists.filter((artist) =>
          artist.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  // --- NEW: Handler for the "Add" button ---
  const handleAddArtist = (artistId) => {
    // Dispatch the existing incrementClout action to add 1 to the count.
    dispatch(incrementClout(artistId));
    // Clear the search bar after adding an artist.
    setSearchTerm("");
  };

  if (error)
    return <p style={{ color: "red" }}>Error loading artists: {error}</p>;

  return (
    <div>
      <h2>Your Profile</h2>
      <UserProfile />
      <hr style={{ margin: "40px 0" }} />

      {/* --- NEW: Search Bar Section --- */}
      <h2>Add Artists to Your List</h2>
      <input
        type="text"
        placeholder="Search for an artist..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      {/* Display search results */}
      {searchResults.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {searchResults.map((artist) => (
            <li
              key={artist.artist_id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>{artist.name}</span>
              <button onClick={() => handleAddArtist(artist.artist_id)}>
                Add
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* --- End of Search Bar Section --- */}

      <hr style={{ margin: "40px 0" }} />

      <h2>Your Top 10 Artists</h2>
      {/* Show loading text only for the top 10 list */}
      {loading && <p>Loading your top artists...</p>}
      {!loading && (
        <ClickableList
          artists={topTenArtists}
          showAdminActions={false}
          showCloutButton={true} // Enable voting on the top 10 list
        />
      )}
    </div>
  );
};

export default ProfilePage;
