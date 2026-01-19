import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchArtists } from "../../redux/actions/artistActions";
import {
  fetchProfileList,
  addArtistToProfileList,
} from "../../redux/actions/profileListActions";
import UserProfile from "../../components/UserProfilee/UserProfile";
import CreateArtistForm from "../../components/CreateArtistForm/CreateArtistForm";
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
  const [followingList, setFollowingList] = useState([]);
  const [manualId, setManualId] = useState("");
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    dispatch(fetchArtists());
    dispatch(fetchProfileList());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setMyId(decoded.id || decoded.user_id);

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
    .filter(Boolean);

  return (
    <div className={styles.profilePage}>
      {/* Section: Favorite Artists */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeader}>Favorite Artists</h2>
        <p className={styles.sectionSubtext}>
          Search and add your all-time favorite artists
        </p>

        <input
          className={styles.artistSearchBar}
          type="text"
          placeholder="Search for an artist..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {artistsLoading && searchTerm.length > 1 && (
          <p className={styles.loadingText}>Searching...</p>
        )}

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

        {(profileListLoading || artistsLoading) && (
          <p className={styles.loadingText}>Loading your list...</p>
        )}

        {!(profileListLoading || artistsLoading) &&
        hydratedProfileList.length > 0 ? (
          <ul className={styles.favArtistList}>
            {hydratedProfileList.map((artist) => (
              <li className={styles.favArtistItem} key={artist.artist_id}>
                <span>{artist.name}</span>
                <span className={styles.cloutBadge}>
                  Clout: {artist.count}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          !(profileListLoading || artistsLoading) && (
            <p className={styles.emptyState}>
              Your list is empty. Search for artists to add them.
            </p>
          )
        )}
      </section>

      {/* Section: Community */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeader}>My Community</h2>

        <div className={styles.quickFollowBox}>
          <h4>Quick Follow (Test Mode)</h4>
          <p>Enter a User ID to follow them.</p>
          <input
            type="number"
            placeholder="User ID"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            className={styles.quickFollowInput}
          />
          {manualId && (
            <FollowButton targetUserId={manualId} initialIsFollowing={false} />
          )}
        </div>

        <h3 className={styles.sectionHeader} style={{ fontSize: "1rem" }}>
          People I Follow
        </h3>
        {followingList.length === 0 ? (
          <p className={styles.emptyState}>You aren't following anyone yet.</p>
        ) : (
          <ul className={styles.followingList}>
            {followingList.map((user) => (
              <li key={user.user_id} className={styles.followingItem}>
                <span className={styles.followingUsername}>{user.username}</span>
                <FollowButton
                  targetUserId={user.user_id}
                  initialIsFollowing={true}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Section: Profile */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeader}>Your Profile</h2>
        <UserProfile />
      </section>

      {/* Section: Artist Creation */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeader}>Create Artist</h2>
        <CreateArtistForm />
      </section>
    </div>
  );
};

export default ProfilePage;
