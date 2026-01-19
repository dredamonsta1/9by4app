import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// import RapperList from "../RapperList";

import FollowButton from "../FollowButton";
import { jwtDecode } from "jwt-decode";
import styles from "./UserProfile.module.css";

const UserProfile = () => {
  // Get the authentication state directly from the Redux store.
  // This is now the single source of truth for user data.
  const { user, loading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Display a loading message while the app is checking the token on initial load.
  if (loading) {
    return <p className={styles.loadingText}>Loading user profile...</p>;
  }

  // Display an error message if the token was invalid or fetching failed.
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>Error: {error}</p>
        <button
          className={styles.loginButton}
          onClick={() => navigate("/login")}
          // style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // If there's no user and no error, it means the user is not logged in.
  if (!user) {
    return (
      <div className={styles.notLoggedInContainer}>
        <p className={styles.errorText}>
          You are not logged in. Please log in to view your profile.
        </p>
        <button
          className={styles.loginButton}
          onClick={() => navigate("/login")}
          // style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // If a user object exists in the Redux state, display the profile.
  return (
    <div className={styles.profileContainer}>
      <FollowButton targetUserId={user.id} initialIsFollowing={false} />
      <h3 className={styles.profileTitle}>{user.username} Profile</h3>

      <div className={styles.profileDetails}>
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        {/* <p>
          <strong>Email:</strong> {user.email}
        </p> */}
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>
    </div>
  );
};

export default UserProfile;
