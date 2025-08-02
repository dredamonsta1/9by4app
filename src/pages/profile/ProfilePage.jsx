import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchArtists } from "../../redux/actions/artistActions";
import {
  fetchProfileList,
  addArtistToProfileList,
} from "../../redux/actions/profileListActions";
import UserProfile from "../../components/userProfile/UserProfile";
import CreateArtistForm from "../../components/CreateArtistForm/CreateArtistForm";
import NavBar from "../../components/NavBar/NavBar";
import styles from "./ProfilePage.module.css";

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

  // if (artistsError || profileListError)
  //   return (
  //     <p style={{ color: "red" }}>Error: {artistsError || profileListError}</p>
  //   );

  //   return (
  //     <div className={styles.profilePage}>
  //       <h2>Your Profile</h2>

  //       <button className={styles.loginButton} onClick={() => navigate("/login")}>
  //         Go to Login
  //       </button>
  //       <NavBar />

  //       <UserProfile />
  //       <hr style={{ margin: "40px 0" }} />

  //       <h2>artist creation</h2>
  //       <CreateArtistForm />

  //       {/* Search Bar Section */}
  //       <h2 className={styles.artistSearchBarTitle}>
  //         Add your all time Fav Artists
  //       </h2>
  //       <input
  //         className={styles.artistSearchBar}
  //         type="text"
  //         placeholder="Search for an artist..."
  //         value={searchTerm}
  //         onChange={(e) => setSearchTerm(e.target.value)}
  //         // style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
  //       />
  //       {artistsLoading && searchTerm.length > 1 && <p>Searching...</p>}
  //       {searchResults.length > 0 && (
  //         <ul
  //           className={styles.searchResultsList}
  //           // style={{
  //           //   listStyle: "none",
  //           //   padding: 0,
  //           //   backgroundColor: "blueviolet",
  //           // }}
  //         >
  //           {searchResults.map((artist) => (
  //             <li
  //               className={styles.searchResultItem}
  //               key={artist.artist_id}
  //               // style={{
  //               //   display: "flex",
  //               //   justifyContent: "space-between",
  //               //   alignItems: "center",
  //               //   padding: "8px",
  //               //   borderBottom: "1px solid #eee",
  //               //   backgroundColor: "red",
  //               // }}
  //             >
  //               <span className={styles.searchResultItemSpan}>{artist.name}</span>
  //               <button
  //                 className={styles.addArtistButton}
  //                 onClick={() => handleAddArtist(artist)}
  //               >
  //                 Add
  //               </button>
  //             </li>
  //           ))}
  //         </ul>
  //       )}
  //       {/* End of Search Bar Section */}

  //       <hr style={{ margin: "40px 0", backgroundColor: "red" }} />

  //       {/* --- FIX: Display the hydrated list --- */}
  //       <h2 className={styles.favArtistListHeader}>Your Fav Artist List</h2>
  //       {/* Wait for BOTH lists to finish loading */}
  //       {(profileListLoading || artistsLoading) && <p>Loading your list...</p>}

  //       {/* Only render the list when loading is complete */}
  //       {!(profileListLoading || artistsLoading) &&
  //       hydratedProfileList.length > 0 ? (
  //         <ul
  //           className={styles.favArtistList}
  //           style={{ listStyle: "none", padding: 0 }}
  //         >
  //           {hydratedProfileList.map((artist) => (
  //             <li
  //               className={styles.favArtistItem}
  //               key={artist.artist_id}
  //               // style={{
  //               //   padding: "8px",
  //               //   borderBottom: "1px solid #eee",
  //               //   backgroundColor: "red",
  //               // }}
  //             >
  //               {artist.name} - (Clout: {artist.count})
  //             </li>
  //           ))}
  //         </ul>
  //       ) : (
  //         !(profileListLoading || artistsLoading) && (
  //           <p>Your list is empty. Search for artists to add them.</p>
  //         )
  //       )}
  //     </div>
  //   );
  // };

  return (
    <div className={styles.profilePage}>
      {/* --- Left Side Column --- */}
      <div className={styles.navContainer}>
        <NavBar />
      </div>

      {/* --- Top Right Area --- */}
      <div className={styles.favoritesContainer}>
        <h2 className={styles.favArtistListHeader}>Your Fav Artist List</h2>
        {(profileListLoading || artistsLoading) && <p>Loading your list...</p>}
        {!(profileListLoading || artistsLoading) &&
        hydratedProfileList.length > 0 ? (
          <ul className={styles.favArtistList}>
            {hydratedProfileList.map((artist) => (
              <li className={styles.favArtistItem} key={artist.artist_id}>
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

      {/* --- Main Content Area (Below Favorites) --- */}
      <div className={styles.mainContent}>
        <h2 className={styles.profileSectionHeader}>Your Profile</h2>
        <UserProfile />
        <hr style={{ margin: "40px 0", backgroundColor: "reds" }} />

        <h2>Artist Creation</h2>
        <CreateArtistForm />
        <hr style={{ margin: "40px 0" }} />

        <h2 className={styles.artistSearchBarTitle}>
          Add your all time Fav Artists
        </h2>
        <input
          className={styles.artistSearchBar}
          type="text"
          placeholder="Search for an artist..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {artistsLoading && searchTerm.length > 1 && <p>Searching...</p>}
        {searchResults.length > 0 && (
          <ul className={styles.searchResultsList}>
            {searchResults.map((artist) => (
              <li className={styles.searchResultItem} key={artist.artist_id}>
                <span className={styles.searchResultItemSpan}>
                  {artist.name}
                </span>
                <button
                  className={styles.addArtistButton}
                  onClick={() => handleAddArtist(artist)}
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
