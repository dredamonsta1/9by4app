import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchArtists } from "../../redux/actions/artistActions";
import {
  fetchProfileList,
  addArtistToProfileList,
} from "../../redux/actions/profileListActions";
import UserProfile from "../../components/UserProfilee/UserProfile";
import CreateArtistForm from "../../components/CreateArtistForm/CreateArtistForm";
import styles from "./ProfilePage.module.css";
import FollowButton from "../../components/FollowButton";
import axiosInstance from "../../utils/axiosInstance";
import { jwtDecode } from "jwt-decode";

const ProfilePage = () => {
  const { userId } = useParams();
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

  const currentUser = useSelector((state) => state.auth.user);
  const [viewedUser, setViewedUser] = useState(null);
  const [viewedUserLoading, setViewedUserLoading] = useState(false);
  const [viewedUserArtists, setViewedUserArtists] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [followingList, setFollowingList] = useState([]);
  const [manualId, setManualId] = useState("");
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    if (!userId) {
      dispatch(fetchArtists());
      dispatch(fetchProfileList());
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (userId) {
      setViewedUserLoading(true);
      axiosInstance
        .get(`/users/${userId}/profile`)
        .then((res) => setViewedUser(res.data))
        .catch((err) => console.error("Failed to fetch user profile", err))
        .finally(() => setViewedUserLoading(false));

      axiosInstance
        .get(`/profile/user/${userId}`)
        .then((res) => setViewedUserArtists(res.data.list || []))
        .catch((err) => console.error("Failed to fetch user artists", err));
    }
  }, [userId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setMyId(decoded.id || decoded.user_id);

        axiosInstance
          .get(`/users/${decoded.id || decoded.user_id}/following`)
          .then((res) => setFollowingList(res.data))
          .catch((err) => console.error("Network fetch error", err));
      } catch (e) {
        console.error("Token decode failed", e);
      }
    }
  }, []);

  const favoritedArtistIds = new Set(
    profileList.map((a) => a.artist_id)
  );

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

  // Viewing another user's profile
  if (userId) {
    const isOwnProfile = currentUser && String(currentUser.id) === String(userId);

    if (isOwnProfile) {
      // If viewing own profile via /profile/:userId, fall through to normal view
    } else {
      return (
        <div className={styles.profilePage}>
          <section className={styles.section}>
            {viewedUserLoading ? (
              <p className={styles.loadingText}>Loading profile...</p>
            ) : viewedUser ? (
              <>
                <h2 className={styles.sectionHeader}>
                  {viewedUser.username}'s Profile
                </h2>
                <div>
                  <p><strong>Username:</strong> {viewedUser.username}</p>
                  <p><strong>Role:</strong> {viewedUser.role}</p>
                </div>
                <FollowButton
                  targetUserId={Number(userId)}
                  initialIsFollowing={false}
                />

                <h3 className={styles.sectionHeader} style={{ marginTop: "1.5rem" }}>
                  Favorite Artists
                </h3>
                {viewedUserArtists.length > 0 ? (
                  <ul className={styles.favArtistList}>
                    {viewedUserArtists.map((artist) => (
                      <li className={styles.favArtistItem} key={artist.artist_id}>
                        <span>{artist.artist_name}</span>
                        <span className={styles.cloutBadge}>
                          Clout: {artist.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyState}>No favorite artists yet.</p>
                )}
              </>
            ) : (
              <p className={styles.emptyState}>User not found.</p>
            )}
          </section>
        </div>
      );
    }
  }

  return (
    <div className={styles.profilePage}>
      {/* Left Column */}
      <div className={styles.leftColumn}>
        {/* Section: Profile + Favorite Artists */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>Your Profile</h2>
          <UserProfile />

          <h3 className={styles.sectionHeader} style={{ marginTop: "1.5rem" }}>
            Favorite Artists
          </h3>
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
              {searchResults.map((artist) => {
                const alreadyAdded = favoritedArtistIds.has(artist.artist_id);
                return (
                  <li className={styles.searchResultItem} key={artist.artist_id}>
                    <span className={styles.searchResultItemSpan}>
                      {artist.name}
                    </span>
                    <button
                      className={styles.addArtistButton}
                      onClick={() => handleAddArtist(artist)}
                      disabled={alreadyAdded}
                    >
                      {alreadyAdded ? "Added" : "Add"}
                    </button>
                  </li>
                );
              })}
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

        {/* Section: Artist Creation */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>Create Artist</h2>
          <CreateArtistForm />
        </section>
      </div>

      {/* Right Column: Community */}
      <div className={styles.rightColumn}>
        <section className={`${styles.section} ${styles.communitySection}`}>
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
      </div>
    </div>
  );
};

export default ProfilePage;
