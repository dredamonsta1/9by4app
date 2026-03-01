import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  searchArtists,
  clearSearchResults,
} from "../../redux/actions/artistActions";
import {
  fetchProfileList,
  addArtistToProfileList,
  removeArtistFromProfileList,
  MAX_FAVORITE_ARTISTS,
} from "../../redux/actions/profileListActions";
import UserProfile from "../../components/UserProfilee/UserProfile";
import CreateArtistForm from "../../components/CreateArtistForm/CreateArtistForm";
import styles from "./ProfilePage.module.css";
import FollowButton from "../../components/FollowButton";
import MessageButton from "../../components/MessageButton";
import MessagesPanel from "../../components/Messages/MessagesPanel";
import axiosInstance from "../../utils/axiosInstance";
import { resolveImageUrl } from "../../utils/imageUrl";
import { setCredentials } from "../../store/authSlice";
import { jwtDecode } from "jwt-decode";

const ProfilePage = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const { searchResults, searchLoading } = useSelector(
    (state) => state.artists,
  );
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
  const [followersList, setFollowersList] = useState([]);
  const [manualId, setManualId] = useState("");
  const [myId, setMyId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    setUploadingImage(true);
    try {
      const res = await axiosInstance.post("/users/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Update Redux auth state with new profile_image
      dispatch(
        setCredentials({
          user: { ...currentUser, profile_image: res.data.profile_image },
        }),
      );
    } catch (err) {
      console.error("Failed to upload profile image:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (!userId) {
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

        const uid = decoded.id || decoded.user_id;

        axiosInstance
          .get(`/users/${uid}/following`)
          .then((res) => setFollowingList(res.data))
          .catch((err) => console.error("Network fetch error", err));

        axiosInstance
          .get(`/users/${uid}/followers`)
          .then((res) => setFollowersList(res.data))
          .catch((err) => console.error("Network fetch error", err));
      } catch (e) {
        console.error("Token decode failed", e);
      }
    }
  }, []);

  // Debounced search - calls backend API
  useEffect(() => {
    if (searchTerm.length < 2) {
      dispatch(clearSearchResults());
      return;
    }

    const timer = setTimeout(() => {
      dispatch(searchArtists({ search: searchTerm }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  // Debounced user search
  useEffect(() => {
    if (userSearchTerm.length < 2) {
      setUserSearchResults([]);
      return;
    }
    setUserSearchLoading(true);
    const timer = setTimeout(() => {
      axiosInstance
        .get(`/users/search?q=${encodeURIComponent(userSearchTerm)}`)
        .then((res) => setUserSearchResults(res.data))
        .catch((err) => console.error("User search error", err))
        .finally(() => setUserSearchLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchTerm]);

  const favoritedArtistIds = new Set(profileList.map((a) => a.artist_id));
  const listFull = profileList.length >= MAX_FAVORITE_ARTISTS;

  const handleAddArtist = (artistToAdd) => {
    if (listFull) return;
    dispatch(addArtistToProfileList(artistToAdd));
    setSearchTerm("");
    dispatch(clearSearchResults());
  };

  const handleRemoveArtist = (artistId) => {
    dispatch(removeArtistFromProfileList(artistId));
  };

  // Build hydrated profile list from the profile list data directly
  // (no longer depends on having all artists loaded in Redux)
  const hydratedProfileList = profileList.filter(Boolean);

  // Viewing another user's profile
  if (userId) {
    const isOwnProfile =
      currentUser && String(currentUser.id) === String(userId);

    if (!isOwnProfile) {
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
                  <p>
                    <strong>Username:</strong> {viewedUser.username}
                  </p>
                  <p>
                    <strong>Role:</strong> {viewedUser.role}
                  </p>
                </div>
                <div className={styles.profileActions}>
                  <FollowButton
                    targetUserId={Number(userId)}
                    initialIsFollowing={false}
                  />
                  <MessageButton targetUserId={Number(userId)} />
                </div>

                <h3
                  className={styles.sectionHeader}
                  style={{ marginTop: "1.5rem" }}
                >
                  Favorite Artists
                </h3>
                {viewedUserArtists.length > 0 ? (
                  <ul className={styles.favArtistList}>
                    {viewedUserArtists.map((artist) => (
                      <li
                        className={styles.favArtistItem}
                        key={artist.artist_id}
                      >
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

          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <img
                src={resolveImageUrl(
                  currentUser?.profile_image,
                  "https://via.placeholder.com/100?text=Avatar",
                )}
                alt="Profile"
                className={styles.avatarImage}
              />
            </div>
            <label className={styles.avatarUploadBtn}>
              {uploadingImage ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleProfileImageUpload}
                disabled={uploadingImage}
                hidden
              />
            </label>
          </div>

          <UserProfile />

          <h3 className={styles.sectionHeader} style={{ marginTop: "1.5rem" }}>
            Favorite Artists
          </h3>
          <p className={styles.sectionSubtext}>
            Search and add your all-time favorite artists ({profileList.length}/
            {MAX_FAVORITE_ARTISTS})
          </p>

          <input
            className={styles.artistSearchBar}
            type="text"
            placeholder="Search for an artist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchLoading && searchTerm.length > 1 && (
            <p className={styles.loadingText}>Searching...</p>
          )}

          {searchResults.length > 0 && searchTerm.length > 1 && (
            <ul className={styles.searchResultsList}>
              {searchResults.map((artist) => {
                const alreadyAdded = favoritedArtistIds.has(artist.artist_id);
                return (
                  <li
                    className={styles.searchResultItem}
                    key={artist.artist_id}
                  >
                    <span className={styles.searchResultItemSpan}>
                      {artist.name}
                    </span>
                    <button
                      className={styles.addArtistButton}
                      onClick={() => handleAddArtist(artist)}
                      disabled={alreadyAdded || listFull}
                    >
                      {alreadyAdded ? "Added" : listFull ? "List Full" : "Add"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {profileListLoading && (
            <p className={styles.loadingText}>Loading your list...</p>
          )}

          {!profileListLoading && hydratedProfileList.length > 0 ? (
            <ul className={styles.favArtistList}>
              {hydratedProfileList.map((artist) => (
                <li className={styles.favArtistItem} key={artist.artist_id}>
                  <span>{artist.artist_name || artist.name}</span>
                  <div className={styles.cloutActions}>
                    <span className={styles.cloutBadge}>
                      Clout: {artist.count || 0}
                    </span>
                    <button
                      className={styles.removeCloutBtn}
                      onClick={() => handleRemoveArtist(artist.artist_id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            !profileListLoading && (
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

      {/* Right Column: Community + Messages */}
      <div className={styles.rightColumn}>
        <section className={`${styles.section} ${styles.communitySection}`}>
          <h2 className={styles.sectionHeader}>My Community</h2>

          <div className={styles.userSearchWrapper}>
            <input
              className={styles.userSearchBar}
              type="text"
              placeholder="Search users..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
            />
            {userSearchLoading && (
              <p className={styles.loadingText}>Searching...</p>
            )}
            {userSearchResults.length > 0 && userSearchTerm.length > 1 && (
              <ul className={styles.userSearchResultsList}>
                {userSearchResults.map((user) => (
                  <li key={user.user_id} className={styles.userSearchResultItem}>
                    <span className={styles.followingUsername}>
                      {user.username}
                    </span>
                    <div className={styles.followingActions}>
                      <FollowButton
                        targetUserId={user.user_id}
                        initialIsFollowing={followingList.some(
                          (f) => f.user_id === user.user_id,
                        )}
                      />
                      <MessageButton targetUserId={user.user_id} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {!userSearchLoading &&
              userSearchTerm.length > 1 &&
              userSearchResults.length === 0 && (
                <p className={styles.loadingText}>No users found.</p>
              )}
          </div>

          <h3 className={styles.sectionHeader} style={{ fontSize: "1rem" }}>
            Following
          </h3>
          {followingList.length === 0 ? (
            <p className={styles.emptyState}>
              You aren't following anyone yet.
            </p>
          ) : (
            <ul className={styles.followingList}>
              {followingList.map((user) => (
                <li key={user.user_id} className={styles.followingItem}>
                  <span className={styles.followingUsername}>
                    {user.username}
                  </span>
                  <div className={styles.followingActions}>
                    <FollowButton
                      targetUserId={user.user_id}
                      initialIsFollowing={true}
                    />
                    <MessageButton targetUserId={user.user_id} />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h3 className={styles.sectionHeader} style={{ fontSize: "1rem" }}>
            Followers
          </h3>
          {followersList.length === 0 ? (
            <p className={styles.emptyState}>No followers yet.</p>
          ) : (
            <ul className={styles.followingList}>
              {followersList.map((user) => (
                <li key={user.user_id} className={styles.followingItem}>
                  <span className={styles.followingUsername}>
                    {user.username}
                  </span>
                  <div className={styles.followingActions}>
                    <FollowButton
                      targetUserId={user.user_id}
                      initialIsFollowing={followingList.some(
                        (f) => f.user_id === user.user_id,
                      )}
                    />
                    <MessageButton targetUserId={user.user_id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <MessagesPanel />
      </div>
    </div>
  );
};

export default ProfilePage;
