import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchArtists } from "../../redux/actions/artistActions";
import {
  fetchProfileList,
  addArtistToProfileList,
} from "../../redux/actions/profileListActions";
import UserProfile from "../../components/UserProfile/UserProfile";
import CreateArtistForm from "../../components/CreateArtistForm/CreateArtistForm";
import NavBar from "../../components/NavBar/NavBar";
import styles from "./ProfilePage.module.css";

import FollowButton from "../../components/FollowButton";
import { jwtDecode } from "jwt-decode";

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

  // --- NEW LOGIC FOR FOLLOWING ---
  const [followingList, setFollowingList] = useState([]);
  const [manualId, setManualId] = useState("");
  const [myId, setMyId] = useState(null);

  // Fetch who I am following on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setMyId(decoded.id || decoded.user_id); // Adjust based on your token structure

        // Fetch my following list
        fetch(
          `http://localhost:3010/api/users/${decoded.id || decoded.user_id}/following`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
          .then((res) => res.json())
          .then((data) => setFollowingList(data))
          .catch((err) => console.error("Network fetch error", err));
      } catch (e) {
        console.error("Token decode failed", e);
      }
    }
  }, []);

  return (
    <div className={styles.profilePage}>
      <div className={styles.navContainer}>
        <NavBar />
      </div>
      {/* --- Left Side Column --- */}
      {/* --- NEW SECTION: COMMUNITY --- */}
      <hr style={{ margin: "40px 0" }} />
      <h2 className={styles.profileSectionHeader}>My Community</h2>
      {/* 1. Quick Follow Test */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          background: "#f0f0f0",
          borderRadius: "8px",
        }}
      >
        <h4>Quick Follow (Test Mode)</h4>
        <p style={{ fontSize: "12px" }}>
          Enter a User ID (e.g., 1, 2, 3) to follow them.
        </p>
        <input
          type="number"
          placeholder="User ID"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        {/* We pass initialIsFollowing={false} because we assume we aren't following this random ID yet */}
        {manualId && (
          <FollowButton targetUserId={manualId} initialIsFollowing={false} />
        )}
      </div>
      {/* 2. Who I am Following */}
      <div className={styles.favArtistList}>
        <h3>People I Follow</h3>
        {followingList.length === 0 ? (
          <p>You aren't following anyone yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {followingList.map((user) => (
              <li
                key={user.user_id}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #ddd",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  <strong>{user.username}</strong>
                </span>
                {/* The list proves we follow them, so initialIsFollowing={true} */}
                <FollowButton
                  targetUserId={user.user_id}
                  initialIsFollowing={true}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* *************************** */}
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
