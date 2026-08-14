import React, { useState, useEffect, useRef } from "react";
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
  reorderProfileList,
  MAX_FAVORITE_ARTISTS,
} from "../../redux/actions/profileListActions";
import CreateArtistForm from "../../components/CreateArtistForm/CreateArtistForm";
import styles from "./ProfilePage.module.css";
import FollowButton from "../../components/FollowButton";
import MessageButton from "../../components/MessageButton";
import MessagesPanel from "../../components/Messages/MessagesPanel";
import axiosInstance from "../../utils/axiosInstance";
import { resolveImageUrl } from "../../utils/imageUrl";
import { setCredentials } from "../../store/authSlice";
import StanCard from "../../components/StanCard/StanCard";
import OnboardingChecklist, {
  ONBOARDING_TARGET,
  ONBOARDING_DISMISSED_KEY,
} from "../../components/OnboardingChecklist/OnboardingChecklist";
import TasteComps from "../../components/TasteComps/TasteComps";
import ArtistCommunity from "../../components/ArtistCommunity/ArtistCommunity";
import BeefAllianceMap from "../../components/BeefAllianceMap/BeefAllianceMap";

// Retired with the Fan/Artist toggle. Kept only to clear the value out of
// users' browsers on next visit — see the cleanup effect below.
const LEGACY_PROFILE_MODE_KEY = "cratesfyi_profile_mode";

const ProfilePage = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const { searchResults, searchLoading } = useSelector((state) => state.artists);
  const {
    list: profileList,
    loading: profileListLoading,
  } = useSelector((state) => state.profileList);
  const currentUser = useSelector((state) => state.auth.user);

  // ─── Derived constants ───────────────────────────────────────────────────
  // /users/me returns user_id; normalize to handle both field names
  const myId = currentUser?.id ?? currentUser?.user_id;
  const isOwnProfile = !userId || (myId != null && String(myId) === String(userId));
  const targetUserId = isOwnProfile ? myId : userId;
  const hydratedProfileList = profileList.filter(Boolean);
  const favoritedArtistIds = new Set(profileList.map((a) => a.artist_id));
  const listFull = profileList.length >= MAX_FAVORITE_ARTISTS;

  // ─── State ───────────────────────────────────────────────────────────────
  // Other-user data
  const [viewedUser, setViewedUser] = useState(null);
  const [viewedUserLoading, setViewedUserLoading] = useState(false);
  const [viewedUserArtists, setViewedUserArtists] = useState([]);

  // Social
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  // Profile image
  const [uploadingImage, setUploadingImage] = useState(false);

  // Artist search (Top 20 add)
  const [searchTerm, setSearchTerm] = useState("");

  // Music personality
  const [personality, setPersonality] = useState(null);
  const [personalityLoading, setPersonalityLoading] = useState(false);
  const [personalityPublic, setPersonalityPublic] = useState(false);

  // First-run onboarding
  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => localStorage.getItem(ONBOARDING_DISMISSED_KEY) === "1"
  );
  const [justRevealed, setJustRevealed] = useState(false);
  // Tracks the previous list length so the reveal fires on the *transition*
  // to the target, not on every render where the list happens to be big
  // enough. Starts null so the first render after load can't count as one.
  const prevListCountRef = useRef(null);

  // Posts / feed
  const [userPosts, setUserPosts] = useState([]);
  const [userPostsLoading, setUserPostsLoading] = useState(false);

  // User search (community)
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  // Taste suggestions
  const [tasteSuggestions, setTasteSuggestions] = useState([]);

  // UI state
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showAddArtistModal, setShowAddArtistModal] = useState(false);
  const [activeCommunityArtistId, setActiveCommunityArtistId] = useState(null);
  const [editModeTop20, setEditModeTop20] = useState(false);
  const [createArtistOpen, setCreateArtistOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const dragIndexRef = useRef(null);

  // ─── Effects ─────────────────────────────────────────────────────────────

  // Own profile data
  useEffect(() => {
    if (!isOwnProfile || !myId) return;
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
  }, [dispatch, isOwnProfile, myId]);

  // Other user data
  useEffect(() => {
    if (isOwnProfile || !userId) return;
    setViewedUserLoading(true);
    axiosInstance.get(`/users/${userId}/profile`)
      .then((res) => setViewedUser(res.data))
      .catch(() => {})
      .finally(() => setViewedUserLoading(false));
    axiosInstance.get(`/profile/user/${userId}`)
      .then((res) => setViewedUserArtists(res.data.list || []))
      .catch(() => {});
  }, [userId, isOwnProfile]);

  // Social counts (both own and other)
  useEffect(() => {
    if (!targetUserId) return;
    axiosInstance.get(`/users/${targetUserId}/followers`)
      .then((res) => setFollowersList(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
    axiosInstance.get(`/users/${targetUserId}/following`)
      .then((res) => setFollowingList(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, [targetUserId]);

  // User posts
  useEffect(() => {
    if (!targetUserId) return;
    setUserPostsLoading(true);
    axiosInstance.get(`/feed/user/${targetUserId}`)
      .then((res) => setUserPosts(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setUserPostsLoading(false));
  }, [targetUserId]);

  // One-time cleanup of the retired Fan/Artist toggle's stored mode, so the
  // value doesn't sit in users' browsers indefinitely after the feature is
  // gone. Safe to delete this effect once it's been live long enough that
  // returning users have all been through it.
  useEffect(() => {
    localStorage.removeItem(LEGACY_PROFILE_MODE_KEY);
  }, []);

  // Auto-reveal: crossing the third artist fires the personality analysis
  // without the user asking for it, so the payoff lands at the moment the
  // work is done rather than behind a button they have to find.
  //
  // Guarded three ways:
  //   - fires on the transition only (prev < target && next >= target), so a
  //     reload with 3+ artists already saved doesn't re-trigger
  //   - skipped entirely if a personality already exists, so dropping to 2
  //     and coming back doesn't silently overwrite it
  //   - failure is swallowed by handleAnalyzeTaste; the artist add has
  //     already committed independently and the manual button remains
  useEffect(() => {
    if (!isOwnProfile) return;
    const prev = prevListCountRef.current;
    const next = profileList.length;
    prevListCountRef.current = next;
    if (prev === null) return;
    if (prev >= ONBOARDING_TARGET || next < ONBOARDING_TARGET) return;
    if (personality || personalityLoading) return;
    setJustRevealed(true);
    handleAnalyzeTaste();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileList.length, isOwnProfile]);

  // Artist search debounce
  useEffect(() => {
    if (searchTerm.length < 2) { dispatch(clearSearchResults()); return; }
    const t = setTimeout(() => dispatch(searchArtists({ search: searchTerm })), 300);
    return () => clearTimeout(t);
  }, [searchTerm, dispatch]);

  // User search debounce
  useEffect(() => {
    if (userSearchTerm.length < 2) { setUserSearchResults([]); return; }
    setUserSearchLoading(true);
    const t = setTimeout(() => {
      axiosInstance.get(`/users/search?q=${encodeURIComponent(userSearchTerm)}`)
        .then((res) => setUserSearchResults(Array.isArray(res.data) ? res.data : []))
        .catch(() => {})
        .finally(() => setUserSearchLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [userSearchTerm]);

  // ─── Handlers ────────────────────────────────────────────────────────────

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
      dispatch(setCredentials({ user: { ...currentUser, profile_image: res.data.profile_image } }));
    } catch (err) {
      console.error("Failed to upload profile image:", err);
    } finally {
      setUploadingImage(false);
    }
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

  const handleDismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "1");
    setOnboardingDismissed(true);
  };

  const handlePersonalityVisibility = async (isPublic) => {
    setPersonalityPublic(isPublic);
    try {
      await axiosInstance.patch("/users/me/music-personality/visibility", { public: isPublic });
    } catch (err) {
      console.error("Failed to update visibility:", err);
      setPersonalityPublic(!isPublic);
    }
  };

  const handleAddArtist = (artist) => {
    if (listFull) return;
    dispatch(addArtistToProfileList(artist));
    setSearchTerm("");
    dispatch(clearSearchResults());
  };

  const handleRemoveArtist = (artistId) => {
    dispatch(removeArtistFromProfileList(artistId));
  };

  const handleDragStart = (index) => { dragIndexRef.current = index; };
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndexRef.current === null || dragIndexRef.current === index) return;
    const reordered = [...hydratedProfileList];
    const [moved] = reordered.splice(dragIndexRef.current, 1);
    reordered.splice(index, 0, moved);
    dragIndexRef.current = index;
    dispatch(reorderProfileList(reordered.map((a) => a.artist_id)));
  };
  const handleDragEnd = () => { dragIndexRef.current = null; };

  const handleShareProfile = () => {
    const url = `${window.location.origin}/profile/${targetUserId}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  // ─── Computed display values ─────────────────────────────────────────────

  const displayedUser = isOwnProfile ? currentUser : viewedUser;
  const displayedList = isOwnProfile ? hydratedProfileList : viewedUserArtists;

  // Show while short of the target, or while the reveal is playing out — the
  // reveal has to survive the list crossing the target, which is exactly the
  // moment the progress view stops qualifying.
  const showOnboarding =
    !onboardingDismissed &&
    (profileList.length < ONBOARDING_TARGET || justRevealed);

  const creatorTierLabel =
    displayedUser?.creator_tier && displayedUser.creator_tier !== "free"
      ? displayedUser.creator_tier
      : null;

  const formatMemberSince = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // ─── Loading / not found guards ──────────────────────────────────────────

  if (!isOwnProfile && viewedUserLoading) {
    return (
      <div className={styles.profilePage}>
        <p className={styles.loadingText}>Loading profile...</p>
      </div>
    );
  }

  if (!isOwnProfile && !viewedUserLoading && !viewedUser) {
    return (
      <div className={styles.profilePage}>
        <p className={styles.emptyState}>User not found.</p>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className={styles.profilePage}>

      {/* ── Section 1: Profile Header ── */}
      <section className={styles.profileHeader}>
        <div className={styles.avatarWrap}>
          <img
            src={resolveImageUrl(
              displayedUser?.profile_image,
              "https://via.placeholder.com/96?text=Avatar"
            )}
            alt={displayedUser?.username || "Avatar"}
            className={styles.avatar}
          />
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.headerNameRow}>
            <h1 className={styles.username}>@{displayedUser?.username}</h1>
            {creatorTierLabel && (
              <span className={styles.tierBadge}>{creatorTierLabel}</span>
            )}
          </div>
          {formatMemberSince(displayedUser?.created_at) && (
            <p className={styles.memberSince}>
              Member since {formatMemberSince(displayedUser.created_at)}
            </p>
          )}
          <div className={styles.socialCounts}>
            <button
              className={styles.socialCount}
              onClick={() => setShowFollowersModal(true)}
            >
              <span className={styles.socialNumber}>{followersList.length}</span>
              <span className={styles.socialLabel}>Followers</span>
            </button>
            <button
              className={styles.socialCount}
              onClick={() => setShowFollowingModal(true)}
            >
              <span className={styles.socialNumber}>{followingList.length}</span>
              <span className={styles.socialLabel}>Following</span>
            </button>
          </div>
        </div>

        <div className={styles.headerActions}>
          {isOwnProfile ? (
            <>
              <button className={styles.editProfileBtn} onClick={() => setShowEditDrawer(true)}>
                Edit Profile
              </button>
              <button className={styles.shareBtn} onClick={handleShareProfile}>
                Share
              </button>
            </>
          ) : (
            <>
              <FollowButton targetUserId={Number(userId)} initialIsFollowing={false} />
              <MessageButton targetUserId={Number(userId)} />
            </>
          )}
        </div>
      </section>

      {shareToast && (
        <div className={styles.toast}>Profile link copied!</div>
      )}

      {/* Section 2 was the Fan/Artist view toggle. Retired — the profile is
          a fan-side identity artifact, and artists reach their business
          surface via /artist-dashboard and /artist-settings, both already
          linked from the NavBar when user.artist_id is set. */}

      {/* ── Section 3: Stats Bar ── */}
      <section className={styles.statsBar}>
        <div className={styles.statCell}>
          <span className={styles.statNumber}>{displayedList.length}</span>
          <span className={styles.statLabel}>Top 20</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statCell}>
          <span className={styles.statNumber}>{userPosts.length}</span>
          <span className={styles.statLabel}>Posts</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statCell}>
          <span className={styles.statNumber}>{followersList.length}</span>
          <span className={styles.statLabel}>Followers</span>
        </div>
      </section>

      {/* ── First-run onboarding ──
          Sits directly above the rail it's asking the user to fill. Only
          for your own profile, only while you're short of the target, and
          only until you skip it. The reveal takes the same slot so the
          payoff appears where the ask was. */}
      {isOwnProfile && showOnboarding && (
        <OnboardingChecklist
          count={profileList.length}
          target={ONBOARDING_TARGET}
          analyzing={justRevealed && personalityLoading}
          reveal={justRevealed && !personalityLoading ? personality : null}
          onAddArtist={() => setShowAddArtistModal(true)}
          onDismiss={handleDismissOnboarding}
        />
      )}

      {/* ── Section 4: Top 20 List ── */}
      <section className={styles.section}>
        <div className={styles.sectionTitleRow}>
          <h2 className={styles.sectionTitle}>
            Top 20
            <span className={styles.sectionCount}>{displayedList.length}/20</span>
          </h2>
          {isOwnProfile && (
            <div className={styles.sectionActions}>
              {editModeTop20 ? (
                <>
                  <button
                    className={styles.actionBtnPrimary}
                    onClick={() => setEditModeTop20(false)}
                  >
                    Done
                  </button>
                  <button
                    className={styles.actionBtnSecondary}
                    onClick={() => setShowAddArtistModal(true)}
                  >
                    + Add
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={styles.actionBtnSecondary}
                    onClick={() => setEditModeTop20(true)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.actionBtnSecondary}
                    onClick={() => setShowAddArtistModal(true)}
                    disabled={listFull}
                  >
                    + Add
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {profileListLoading ? (
          <p className={styles.loadingText}>Loading your list...</p>
        ) : displayedList.length === 0 ? (
          <p className={styles.emptyState}>
            {isOwnProfile
              ? "Build your Top 20 — add your favorite artists."
              : "This user hasn't built their Top 20 yet."}
          </p>
        ) : (
          <div className={styles.top20Rail}>
            {displayedList.map((artist, index) => (
              <div
                key={artist.artist_id}
                className={`${styles.top20Card} ${editModeTop20 ? styles.top20CardEdit : ""}`}
                draggable={editModeTop20 && isOwnProfile}
                onDragStart={editModeTop20 ? () => handleDragStart(index) : undefined}
                onDragOver={editModeTop20 ? (e) => handleDragOver(e, index) : undefined}
                onDragEnd={editModeTop20 ? handleDragEnd : undefined}
                onClick={!editModeTop20 ? () => setActiveCommunityArtistId(artist.artist_id) : undefined}
                title={artist.artist_name || artist.name}
              >
                <div className={styles.top20CardImageWrap}>
                  <img
                    src={resolveImageUrl(
                      artist.image_url,
                      `https://via.placeholder.com/100?text=${encodeURIComponent(
                        (artist.artist_name || artist.name || "?")[0]
                      )}`
                    )}
                    alt={artist.artist_name || artist.name}
                    className={styles.top20CardImage}
                  />
                  <span className={styles.top20Rank}>
                    #{artist.position ?? index + 1}
                  </span>
                  {editModeTop20 && isOwnProfile && (
                    <button
                      className={styles.top20RemoveBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveArtist(artist.artist_id);
                      }}
                      title="Remove from list"
                    >
                      ×
                    </button>
                  )}
                </div>
                <p className={styles.top20CardName}>
                  {artist.artist_name || artist.name}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add Artist Panel */}
        {showAddArtistModal && isOwnProfile && (
          <div className={styles.addArtistPanel}>
            <div className={styles.addArtistPanelHeader}>
              <span>Add to Top 20 ({profileList.length}/{MAX_FAVORITE_ARTISTS})</span>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowAddArtistModal(false);
                  setSearchTerm("");
                  dispatch(clearSearchResults());
                }}
              >
                ×
              </button>
            </div>
            <input
              className={styles.artistSearchBar}
              type="text"
              placeholder="Search for an artist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchLoading && searchTerm.length > 1 && (
              <p className={styles.loadingText}>Searching...</p>
            )}
            {searchResults.length > 0 && searchTerm.length > 1 && (
              <ul className={styles.searchResultsList}>
                {searchResults.map((artist) => {
                  const alreadyAdded = favoritedArtistIds.has(artist.artist_id);
                  return (
                    <li key={artist.artist_id} className={styles.searchResultItem}>
                      <span className={styles.searchResultItemSpan}>{artist.name}</span>
                      <button
                        className={styles.addArtistButton}
                        onClick={() => handleAddArtist(artist)}
                        disabled={alreadyAdded || listFull}
                      >
                        {alreadyAdded ? "Added" : listFull ? "Full" : "Add"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* ── Taste comps ──
          Sits directly under the Top 20 it's derived from. Unlocks at the
          same threshold as the personality, so hitting three artists opens
          both rewards at once rather than dribbling them out. Own profile
          only — these are recommendations, not public identity. */}
      {isOwnProfile && (
        <TasteComps enabled={profileList.length >= ONBOARDING_TARGET} />
      )}

      {/* ── Section 5: Music Personality Card ── */}
      {(personality || isOwnProfile) && (
        <section className={styles.section}>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>Music Personality</h2>
            {isOwnProfile && (
              <button
                className={styles.actionBtnSecondary}
                onClick={handleAnalyzeTaste}
                disabled={profileList.length < 3 || personalityLoading}
                title={profileList.length < 3 ? "Add at least 3 artists first" : ""}
              >
                {personalityLoading
                  ? "Analyzing..."
                  : personality
                  ? "Regenerate"
                  : "Analyze My Taste"}
              </button>
            )}
          </div>

          {personality ? (
            <div className={styles.personalityCard}>
              <div className={styles.personalityHeader}>
                <span className={styles.personalityBadge}>{personality.title}</span>
                {isOwnProfile && !personalityPublic && (
                  <span className={styles.privateBadge}>Private</span>
                )}
              </div>
              <p className={styles.personalityDesc}>{personality.description}</p>
              {isOwnProfile && (
                <label className={styles.personalityToggle}>
                  <input
                    type="checkbox"
                    checked={personalityPublic}
                    onChange={(e) => handlePersonalityVisibility(e.target.checked)}
                  />
                  Show on my public profile
                </label>
              )}
            </div>
          ) : isOwnProfile ? (
            <p className={styles.emptyState}>
              {profileList.length < 3
                ? "Add at least 3 artists to your Top 20 to analyze your taste."
                : "Generate your music personality identity."}
            </p>
          ) : null}
        </section>
      )}

      {/* ── Section 6: Activity Feed ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Activity
          {userPosts.length > 0 && (
            <span className={styles.sectionCount}>{userPosts.length}</span>
          )}
        </h2>

        {userPostsLoading ? (
          <div className={styles.feedSkeletonList}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.feedSkeleton} />
            ))}
          </div>
        ) : userPosts.length === 0 ? (
          <p className={styles.emptyState}>
            {isOwnProfile
              ? "You haven't posted yet. Share something with the community."
              : "No posts yet."}
          </p>
        ) : (
          <div className={styles.feedList}>
            {userPosts.map((post) => (
              <div
                key={`${post.post_type}-${post.id}`}
                className={styles.feedCard}
              >
                <div className={styles.feedCardMeta}>
                  <span
                    className={styles.postTypeBadge}
                    data-type={post.post_type}
                  >
                    {post.post_type}
                  </span>
                  {post.is_agent_post && (
                    <span className={styles.agentBadge}>Agent</span>
                  )}
                  {isOwnProfile &&
                    post.moderation_status &&
                    post.moderation_status !== "clean" && (
                      <span className={styles.moderationBadge}>
                        {post.moderation_status}
                      </span>
                    )}
                  <span className={styles.feedTimestamp}>
                    {formatRelativeTime(post.created_at)}
                  </span>
                </div>

                {post.post_type === "image" && post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.caption || ""}
                    className={styles.feedImage}
                  />
                )}

                <div className={styles.feedCardBody}>
                  {post.post_type === "text" && (
                    <p className={styles.feedText}>{post.content}</p>
                  )}
                  {post.post_type === "image" && post.caption && (
                    <p className={styles.feedCaption}>{post.caption}</p>
                  )}
                  {post.post_type === "video" && (
                    <p className={styles.feedCaption}>
                      {post.caption || "Video post"}
                    </p>
                  )}
                  {post.post_type === "music" && (
                    <>
                      <p className={styles.feedMusicTitle}>
                        {post.music_title || post.caption || "Untitled"}
                      </p>
                      {post.platform && (
                        <span className={styles.platformBadge}>
                          {post.platform}
                        </span>
                      )}
                      {post.audio_url && (
                        <audio
                          controls
                          src={post.audio_url}
                          className={styles.audioPlayer}
                        />
                      )}
                    </>
                  )}
                  {post.is_agent_post && post.source_url && (
                    <a
                      href={post.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.sourceLink}
                    >
                      Source
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sections 7-9 were artist-view-only: music posts, events, and a
          "Rank stats coming soon" placeholder. Retired with the Fan/Artist
          toggle. Music lives in ArtistSettings via <YourMusic>, events at
          /events and via EventCreator on the artist world page, so nothing
          here was the only home for a feature. */}

      {/* ── Community Section (own profile only) ── */}
      {isOwnProfile && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Community</h2>

          <div className={styles.communitySearch}>
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
            {!userSearchLoading &&
              userSearchTerm.length > 1 &&
              userSearchResults.length === 0 && (
                <p className={styles.loadingText}>No users found.</p>
              )}
            {userSearchResults.length > 0 && (
              <ul className={styles.userSearchResultsList}>
                {userSearchResults.map((user) => (
                  <li key={user.user_id} className={styles.userSearchResultItem}>
                    <Link
                      to={`/profile/${user.user_id}`}
                      className={styles.followingUsername}
                    >
                      {user.username}
                    </Link>
                    <div className={styles.followingActions}>
                      <FollowButton
                        targetUserId={user.user_id}
                        initialIsFollowing={followingList.some(
                          (f) => f.user_id === user.user_id
                        )}
                      />
                      <MessageButton targetUserId={user.user_id} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {tasteSuggestions.length > 0 && (
            <>
              <h3 className={styles.subSectionTitle}>People with similar taste</h3>
              <ul className={styles.followingList}>
                {tasteSuggestions.map((user) => (
                  <li key={user.user_id} className={styles.suggestionItem}>
                    <div>
                      <Link
                        to={`/profile/${user.user_id}`}
                        className={styles.followingUsername}
                      >
                        {user.username}
                      </Link>
                      <span className={styles.overlapBadge}>
                        {user.overlap_count}{" "}
                        {user.overlap_count === 1 ? "artist" : "artists"} in common
                      </span>
                    </div>
                    <div className={styles.followingActions}>
                      <FollowButton targetUserId={user.user_id} initialIsFollowing={false} />
                      <MessageButton targetUserId={user.user_id} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          <StanCard userId={myId} />
          <BeefAllianceMap />
        </section>
      )}

      {/* ── Create Artist (own profile, collapsible) ── */}
      {isOwnProfile && (
        <section className={styles.section}>
          <button
            className={styles.collapsibleHeader}
            onClick={() => setCreateArtistOpen((o) => !o)}
          >
            <span>Create Artist</span>
            <span className={styles.collapsibleArrow}>
              {createArtistOpen ? "▲" : "▼"}
            </span>
          </button>
          {createArtistOpen && <CreateArtistForm />}
        </section>
      )}

      {/* ── Messages Panel (own profile only) ── */}
      {isOwnProfile && <MessagesPanel />}

      {/* ── Modals ── */}

      {/* Followers Modal */}
      {showFollowersModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowFollowersModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Followers</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setShowFollowersModal(false)}
              >
                ×
              </button>
            </div>
            {followersList.length === 0 ? (
              <p className={styles.emptyState}>No followers yet.</p>
            ) : (
              <ul className={styles.followingList}>
                {followersList.map((user) => (
                  <li key={user.user_id} className={styles.followingItem}>
                    <Link
                      to={`/profile/${user.user_id}`}
                      className={styles.followingUsername}
                      onClick={() => setShowFollowersModal(false)}
                    >
                      {user.username}
                    </Link>
                    <div className={styles.followingActions}>
                      <FollowButton
                        targetUserId={user.user_id}
                        initialIsFollowing={followingList.some(
                          (f) => f.user_id === user.user_id
                        )}
                      />
                      <MessageButton targetUserId={user.user_id} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowFollowingModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Following</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setShowFollowingModal(false)}
              >
                ×
              </button>
            </div>
            {followingList.length === 0 ? (
              <p className={styles.emptyState}>Not following anyone yet.</p>
            ) : (
              <ul className={styles.followingList}>
                {followingList.map((user) => (
                  <li key={user.user_id} className={styles.followingItem}>
                    <Link
                      to={`/profile/${user.user_id}`}
                      className={styles.followingUsername}
                      onClick={() => setShowFollowingModal(false)}
                    >
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
          </div>
        </div>
      )}

      {/* Edit Profile Drawer */}
      {showEditDrawer && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowEditDrawer(false)}
        >
          <div
            className={`${styles.modal} ${styles.drawer}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit Profile</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setShowEditDrawer(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.editProfileContent}>
              <div className={styles.editAvatarRow}>
                <img
                  src={resolveImageUrl(
                    currentUser?.profile_image,
                    "https://via.placeholder.com/72?text=Avatar"
                  )}
                  alt="Profile"
                  className={styles.editAvatar}
                />
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
              <p className={styles.drawerNote}>
                More profile fields coming soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Artist Community Modal */}
      {activeCommunityArtistId && (
        <ArtistCommunity
          artistId={activeCommunityArtistId}
          onClose={() => setActiveCommunityArtistId(null)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
