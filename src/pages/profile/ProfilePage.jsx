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

// import React, { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   fetchArtists,
//   incrementClout,
// } from "../../redux/actions/artistActions";
// import ClickableList from "../../components/RapperList";
// import UserProfile from "../../components/userProfile/UserProfile";

// const ProfilePage = () => {
//   const dispatch = useDispatch();
//   const { artists, loading, error } = useSelector((state) => state.artists);

//   // --- NEW: State for the search functionality ---
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     dispatch(fetchArtists());
//   }, [dispatch]);

//   // The reducer already sorts artists by count, so we just slice the top 10.
//   const topTenArtists = artists.slice(0, 10);

//   // --- NEW: Filter artists based on the search term ---
//   // It will only show results if the user has typed at least 2 characters.
//   const searchResults =
//     searchTerm.length > 1
//       ? artists.filter((artist) =>
//           artist.name.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       : [];

//   // --- NEW: Handler for the "Add" button ---
//   const handleAddArtist = (artistId) => {
//     // Dispatch the existing incrementClout action to add 1 to the count.
//     dispatch(incrementClout(artistId));
//     // Clear the search bar after adding an artist.
//     setSearchTerm("");
//   };

//   if (error)
//     return <p style={{ color: "red" }}>Error loading artists: {error}</p>;

//   return (
//     <div>
//       <h2>Your Profile</h2>
//       <UserProfile />
//       <hr style={{ margin: "40px 0" }} />

//       {/* --- NEW: Search Bar Section --- */}
//       <h2>Add Artists to Your List</h2>
//       <input
//         type="text"
//         placeholder="Search for an artist..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
//       />
//       {/* Display search results */}
//       {searchResults.length > 0 && (
//         <ul style={{ listStyle: "none", padding: 0 }}>
//           {searchResults.map((artist) => (
//             <li
//               key={artist.artist_id}
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 padding: "8px",
//                 borderBottom: "1px solid #eee",
//               }}
//             >
//               <span>{artist.name}</span>
//               <button onClick={() => handleAddArtist(artist.artist_id)}>
//                 Add
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}
//       {/* --- End of Search Bar Section --- */}

//       <hr style={{ margin: "40px 0" }} />

//       <h2>Your Top 10 Artists</h2>
//       {/* Show loading text only for the top 10 list */}
//       {loading && <p>Loading your top artists...</p>}
//       {!loading && (
//         <ClickableList
//           artists={topTenArtists}
//           showAdminActions={false}
//           showCloutButton={true} // Enable voting on the top 10 list
//         />
//       )}
//     </div>
//   );
// };

// export default ProfilePage;

// *************************New Code****************************

// import React, { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   fetchArtists,
//   incrementClout,
// } from "../../redux/actions/artistActions";
// import UserProfile from "../../components/userProfile/UserProfile";

// const ProfilePage = () => {
//   const dispatch = useDispatch();
//   const { artists, loading, error } = useSelector((state) => state.artists);

//   // State for the search term
//   const [searchTerm, setSearchTerm] = useState("");
//   // --- NEW: State to hold the user's custom list of artists ---
//   const [profileList, setProfileList] = useState([]);

//   useEffect(() => {
//     dispatch(fetchArtists());
//   }, [dispatch]);

//   // Filter all artists based on the search term
//   const searchResults =
//     searchTerm.length > 1
//       ? artists.filter((artist) =>
//           artist.name.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       : [];

//   // --- UPDATED: Handler for the "Add" button ---
//   const handleAddArtist = (artistToAdd) => {
//     // Dispatch the action to increment the main clout score
//     dispatch(incrementClout(artistToAdd.artist_id));

//     // Add the artist to the local profile list, preventing duplicates
//     if (!profileList.find((a) => a.artist_id === artistToAdd.artist_id)) {
//       setProfileList([...profileList, artistToAdd]);
//     }

//     // Clear the search bar
//     setSearchTerm("");
//   };

//   if (error)
//     return <p style={{ color: "red" }}>Error loading artists: {error}</p>;

//   return (
//     <div>
//       <h2>Your Profile</h2>
//       <UserProfile />
//       <hr style={{ margin: "40px 0" }} />

//       {/* Search Bar Section */}
//       <h2>Add Artists to Your Profile</h2>
//       <input
//         type="text"
//         placeholder="Search for an artist..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
//       />
//       {loading && searchTerm.length > 1 && <p>Searching...</p>}
//       {searchResults.length > 0 && (
//         <ul style={{ listStyle: "none", padding: 0 }}>
//           {searchResults.map((artist) => (
//             <li
//               key={artist.artist_id}
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 padding: "8px",
//                 borderBottom: "1px solid #eee",
//               }}
//             >
//               <span>{artist.name}</span>
//               <button onClick={() => handleAddArtist(artist)}>Add</button>
//             </li>
//           ))}
//         </ul>
//       )}
//       {/* End of Search Bar Section */}

//       <hr style={{ margin: "40px 0" }} />

//       {/* --- NEW: Display the custom user-curated list --- */}
//       <h2>Your Curated Artist List</h2>
//       {profileList.length > 0 ? (
//         <ul style={{ listStyle: "none", padding: 0 }}>
//           {profileList.map((artist) => (
//             <li
//               key={artist.artist_id}
//               style={{
//                 padding: "8px",
//                 borderBottom: "1px solid #eee",
//               }}
//             >
//               {artist.name} - (Clout: {artist.count})
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>Your list is empty. Search for artists to add them.</p>
//       )}
//     </div>
//   );
// };

// export default ProfilePage;

// *************************New Code****************************

// import React, { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { fetchArtists } from "../../redux/actions/artistActions";
// // --- FIX: Import the new actions for the curated list ---
// import {
//   fetchProfileList,
//   addArtistToProfileList,
// } from "../../redux/actions/profileListActions";
// import UserProfile from "../../components/userProfile/UserProfile";

// const ProfilePage = () => {
//   const dispatch = useDispatch();

//   // Get the global artists list from Redux
//   const {
//     artists,
//     loading: artistsLoading,
//     error: artistsError,
//   } = useSelector((state) => state.artists);

//   // --- FIX: Get the curated profile list from the new Redux slice ---
//   const {
//     list: profileList,
//     loading: profileListLoading,
//     error: profileListError,
//   } = useSelector((state) => state.profileList);

//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     // Fetch both the main artist list and the user's curated list on load
//     dispatch(fetchArtists());
//     dispatch(fetchProfileList());
//   }, [dispatch]);

//   const searchResults =
//     searchTerm.length > 1
//       ? artists.filter((artist) =>
//           artist.name.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       : [];

//   // --- FIX: The handler now dispatches the correct persistent action ---
//   const handleAddArtist = (artistToAdd) => {
//     dispatch(addArtistToProfileList(artistToAdd));
//     setSearchTerm("");
//   };

//   if (artistsError || profileListError)
//     return (
//       <p style={{ color: "red" }}>Error: {artistsError || profileListError}</p>
//     );

//   return (
//     <div>
//       <h2>Your Profile</h2>
//       <UserProfile />
//       <hr style={{ margin: "40px 0" }} />

//       {/* Search Bar Section */}
//       <h2>Add Artists to Your Profile</h2>
//       <input
//         type="text"
//         placeholder="Search for an artist..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
//       />
//       {artistsLoading && searchTerm.length > 1 && <p>Searching...</p>}
//       {searchResults.length > 0 && (
//         <ul style={{ listStyle: "none", padding: 0 }}>
//           {searchResults.map((artist) => (
//             <li
//               key={artist.artist_id}
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 padding: "8px",
//                 borderBottom: "1px solid #eee",
//               }}
//             >
//               <span>{artist.name}</span>
//               <button onClick={() => handleAddArtist(artist)}>Add</button>
//             </li>
//           ))}
//         </ul>
//       )}
//       {/* End of Search Bar Section */}

//       <hr style={{ margin: "40px 0" }} />

//       {/* --- FIX: Display the custom list from the Redux state --- */}
//       <h2>Your Curated Artist List</h2>
//       {profileListLoading && <p>Loading your list...</p>}
//       {!profileListLoading && profileList.length > 0 ? (
//         <ul style={{ listStyle: "none", padding: 0 }}>
//           {profileList.map((artist) => (
//             <li
//               key={artist.artist_id}
//               style={{
//                 padding: "8px",
//                 borderBottom: "1px solid #eee",
//               }}
//             >
//               {artist.name} - (Clout: {artist.count})
//             </li>
//           ))}
//         </ul>
//       ) : (
//         !profileListLoading && (
//           <p>Your list is empty. Search for artists to add them.</p>
//         )
//       )}
//     </div>
//   );
// };

// export default ProfilePage;

// **************************New Code****************************

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchArtists } from "../../redux/actions/artistActions";
import {
  fetchProfileList,
  addArtistToProfileList,
} from "../../redux/actions/profileListActions";
import UserProfile from "../../components/userProfile/UserProfile";

const ProfilePage = () => {
  const dispatch = useDispatch();

  const {
    artists,
    loading: artistsLoading,
    error: artistsError,
  } = useSelector((state) => state.artists);
  const {
    list: profileList,
    loading: profileListLoading,
    error: profileListError,
  } = useSelector((state) => state.profileList);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchArtists());
    dispatch(fetchProfileList());
  }, [dispatch]);

  const searchResults =
    searchTerm.length > 1
      ? artists.filter((artist) =>
          artist.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const handleAddArtist = (artistToAdd) => {
    dispatch(addArtistToProfileList(artistToAdd));
    setSearchTerm("");
  };

  const artistsMap = new Map(
    artists.map((artist) => [artist.artist_id, artist])
  );

  const hydratedProfileList = profileList
    .map((profileArtist) => artistsMap.get(profileArtist.artist_id))
    .filter(Boolean); // Use .filter(Boolean) to remove any undefined entries

  if (artistsError || profileListError)
    return (
      <p style={{ color: "red" }}>Error: {artistsError || profileListError}</p>
    );

  return (
    <div>
      <h2>Your Profile</h2>
      <UserProfile />
      <hr style={{ margin: "40px 0" }} />

      {/* Search Bar Section */}
      <h2>Add Artists to Your Profile</h2>
      <input
        type="text"
        placeholder="Search for an artist..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      {artistsLoading && searchTerm.length > 1 && <p>Searching...</p>}
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
              <button onClick={() => handleAddArtist(artist)}>Add</button>
            </li>
          ))}
        </ul>
      )}
      {/* End of Search Bar Section */}

      <hr style={{ margin: "40px 0" }} />

      {/* --- FIX: Display the hydrated list --- */}
      <h2>Your Curated Artist List</h2>
      {/* Wait for BOTH lists to finish loading */}
      {(profileListLoading || artistsLoading) && <p>Loading your list...</p>}

      {/* Only render the list when loading is complete */}
      {!(profileListLoading || artistsLoading) &&
      hydratedProfileList.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {hydratedProfileList.map((artist) => (
            <li
              key={artist.artist_id}
              style={{
                padding: "8px",
                borderBottom: "1px solid #eee",
              }}
            >
              {artist.name} - (Clout: {artist.count})
            </li>
          ))}
        </ul>
      ) : (
        !(profileListLoading || artistsLoading) && (
          <p>Your list is empty. Search for artists to add them.</p>
        )
      )}
    </div>
  );
};

export default ProfilePage;
