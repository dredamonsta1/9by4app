import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
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
import StanCard from "../../components/StanCard/StanCard";
import ArtistCommunity from "../../components/ArtistCommunity/ArtistCommunity";
import BeefAllianceMap from "../../components/BeefAllianceMap/BeefAllianceMap";

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

  const [tasteSuggestions, setTasteSuggestions] = useState([]);
  const [activeCommunityArtistId, setActiveCommunityArtistId] = useState(null);

  const [personality, setPersonality] = useState(null);
  const [personalityLoading, setPersonalityLoading] = useState(false);
  const [personalityPublic, setPersonalityPublic] = useState(false);

  const [userPosts, setUserPosts] = useState([]);
  const [userPostsLoading, setUserPostsLoading] = useState(false);

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
      axiosInstance.get("/users/me").then((res) => {
        if (res.data.music_personality_title) {
          setPersonality({
            title: res.data.music_personality_title,
            description: res.data.music_personality_desc,
          });
        }
        setPersonalityPublic(res.data.music_personality_public || false);
      }).catch(() => {});

      axiosInstance.get("/profile/suggestions")
        .then((res) => setTasteSuggestions(res.data))
        .catch(() => {});
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

      setUserPostsLoading(true);
      axiosInstance
        .get(`/feed/user/${userId}`)
        .then((res) => setUserPosts(res.data))
        .catch(() => {})
        .finally(() => setUserPostsLoading(false));
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

        setUserPostsLoading(true);
        axiosInstance
          .get(`/feed/user/${uid}`)
          .then((res) => setUserPosts(res.data))
          .catch(() => {})
          .finally(() => setUserPostsLoading(false));
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

  const handleAnalyzeTaste = async () => {
    setPersonalityLoading(true);
    try {
      const artists = profileList.map((a) => ({
        artist_name: a.artist_name || a.name,
        genre: a.genre || null,
      }));
      const res = await axiosInstance.post("/users/me/music-personality", { artists });
      setPersonality({ title: res.data.title, description: res.data.description });
    } catch (err) {
      console.error("Failed to analyze taste:", err);
    } finally {
      setPersonalityLoading(false);
    }
  };

  const handlePersonalityVisibility = async (e) => {
    const isPublic = e.target.checked;
    setPersonalityPublic(isPublic);
    try {
      await axiosInstance.patch("/users/me/music-personality/visibility", { public: isPublic });
    } catch (err) {
      console.error("Failed to update visibility:", err);
      setPersonalityPublic(!isPublic);
    }
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

                {viewedUser.music_personality_public && viewedUser.music_personality_title && (
                  <div className={styles.personalityCard}>
                    <span className={styles.personalityBadge}>{viewedUser.music_personality_title}</span>
                    <p className={styles.personalityDesc}>{viewedUser.music_personality_desc}</p>
                  </div>
                )}

                <StanCard userId={Number(userId)} />

                <h3
                  className={styles.sectionHeader}
                  style={{ marginTop: "1.5rem" }}
                >
                  Personal List
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
                  <p className={styles.emptyState}>No artists on this list yet.</p>
                )}

                <h3 className={styles.sectionHeader} style={{ marginTop: "1.5rem" }}>
                  Content
                </h3>
                {userPostsLoading ? (
                  <p className={styles.loadingText}>Loading posts...</p>
                ) : userPosts.length === 0 ? (
                  <p className={styles.emptyState}>No posts yet.</p>
                ) : (
                  <ul className={styles.postList}>
                    {userPosts.map((post) => (
                      <li key={`${post.post_type}-${post.id}`} className={styles.postItem}>
                        <span className={styles.postTypeBadge}>{post.post_type}</span>
                        {post.post_type === "image" && (
                          <img src={post.image_url} alt={post.caption || ""} className={styles.postImage} />
                        )}
                        <div className={styles.postBody}>
                          {post.post_type === "text" && (
                            <p className={styles.postContent}>{post.content}</p>
                          )}
                          {post.post_type === "image" && post.caption && (
                            <p className={styles.postCaption}>{post.caption}</p>
                          )}
                          {post.post_type === "video" && (
                            <p className={styles.postCaption}>{post.caption || "Video post"}</p>
                          )}
                          {post.post_type === "music" && (
                            <p className={styles.postContent}>{post.music_title || post.caption}</p>
                          )}
                        </div>
                        <span className={styles.postDate}>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
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
      {/* Sidebar Column */}
      <div className={styles.sidebarColumn}>
        <section className={styles.sectionSm}>
          <h2 className={styles.sectionHeader}>Create Artist</h2>
          <CreateArtistForm />
        </section>
      </div>

      {/* Left Column */}
      <div className={styles.leftColumn}>
        {/* Section: Profile + Personal List */}
        <section className={styles.section}>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.sectionHeader} style={{ margin: 0, border: 0, paddingBottom: 0 }}>Your Profile</h2>
            {myId && (
              <FollowButton targetUserId={myId} initialIsFollowing={false} />
            )}
          </div>

          <div className={styles.profileTopRow}>
            <div className={styles.avatarCol}>
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

            <div className={styles.analyzeSection}>
              <button
                className={styles.analyzeBtn}
                onClick={handleAnalyzeTaste}
                disabled={profileList.length < 3 || personalityLoading}
                title={profileList.length < 3 ? "Add at least 3 artists first" : ""}
              >
                {personalityLoading ? "Analyzing..." : "Analyze My Taste"}
              </button>

              {personality && (
                <div className={styles.personalityCard}>
                  <span className={styles.personalityBadge}>{personality.title}</span>
                  <p className={styles.personalityDesc}>{personality.description}</p>
                  <label className={styles.personalityToggle}>
                    <input
                      type="checkbox"
                      checked={personalityPublic}
                      onChange={handlePersonalityVisibility}
                    />
                    Show on my public profile
                  </label>
                </div>
              )}
            </div>
          </div>

          <UserProfile />

          <h3 className={styles.sectionHeader} style={{ marginTop: "1.5rem" }}>
            Personal List
          </h3>
          <p className={styles.sectionSubtext}>
            Search and add artists to your personal list ({profileList.length}/
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
                  <button
                    className={styles.artistCommunityBtn}
                    onClick={() => setActiveCommunityArtistId(artist.artist_id)}
                    title="View community"
                  >
                    {artist.artist_name || artist.name}
                  </button>
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
                Your personal list is empty. Search for artists to add them.
              </p>
            )
          )}
        </section>

        {/* Section: Content */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>Content</h2>
          {userPostsLoading ? (
            <p className={styles.loadingText}>Loading posts...</p>
          ) : userPosts.length === 0 ? (
            <p className={styles.emptyState}>You haven't posted anything yet.</p>
          ) : (
            <ul className={styles.postList}>
              {userPosts.map((post) => (
                <li key={`${post.post_type}-${post.id}`} className={styles.postItem}>
                  <span className={styles.postTypeBadge}>{post.post_type}</span>
                  {post.post_type === "image" && (
                    <img src={post.image_url} alt={post.caption || ""} className={styles.postImage} />
                  )}
                  <div className={styles.postBody}>
                    {post.post_type === "text" && (
                      <p className={styles.postContent}>{post.content}</p>
                    )}
                    {post.post_type === "image" && post.caption && (
                      <p className={styles.postCaption}>{post.caption}</p>
                    )}
                    {post.post_type === "video" && (
                      <p className={styles.postCaption}>{post.caption || "Video post"}</p>
                    )}
                    {post.post_type === "music" && (
                      <p className={styles.postContent}>{post.music_title || post.caption}</p>
                    )}
                  </div>
                  <span className={styles.postDate}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Community modal */}
      {activeCommunityArtistId && (
        <ArtistCommunity
          artistId={activeCommunityArtistId}
          onClose={() => setActiveCommunityArtistId(null)}
        />
      )}

      {/* Right Column: Community + Messages */}
      <div className={styles.rightColumn}>
        <section className={`${styles.section} ${styles.communitySection}`}>
          <h2 className={styles.sectionHeader}>My Community</h2>

          {myId && <StanCard userId={myId} />}

          <BeefAllianceMap />

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
                    <Link to={`/profile/${user.user_id}`} className={styles.followingUsername}>
                      {user.username}
                    </Link>
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

          {tasteSuggestions.length > 0 && (
            <>
              <h3 className={styles.sectionHeader} style={{ fontSize: "1rem" }}>
                People with similar taste
              </h3>
              <ul className={styles.followingList}>
                {tasteSuggestions.map((user) => (
                  <li key={user.user_id} className={styles.suggestionItem}>
                    <div>
                      <Link to={`/profile/${user.user_id}`} className={styles.followingUsername}>{user.username}</Link>
                      <span className={styles.overlapBadge}>
                        {user.overlap_count} shared {user.overlap_count === 1 ? "artist" : "artists"}
                      </span>
                    </div>
                    <div className={styles.followingActions}>
                      <FollowButton
                        targetUserId={user.user_id}
                        initialIsFollowing={false}
                      />
                      <MessageButton targetUserId={user.user_id} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

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
                  <Link to={`/profile/${user.user_id}`} className={styles.followingUsername}>
                    {user.username}
                  </Link>
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
                  <Link to={`/profile/${user.user_id}`} className={styles.followingUsername}>
                    {user.username}
                  </Link>
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
