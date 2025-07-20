import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import RapperList from "../RapperList";
import "./UserProfile.css"; // Import your CSS file for styling

const UserProfile = () => {
  // Get the authentication state directly from the Redux store.
  // This is now the single source of truth for user data.
  const { user, loading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Display a loading message while the app is checking the token on initial load.
  if (loading) {
    return <p>Loading user profile...</p>;
  }

  // Display an error message if the token was invalid or fetching failed.
  if (error) {
    return (
      <div style={{ color: "red" }}>
        <p>Error: {error}</p>
        <button
          className="login-button"
          onClick={() => navigate("/login")}
          style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // If there's no user and no error, it means the user is not logged in.
  if (!user) {
    return (
      <div>
        <p>You are not logged in. Please log in to view your profile.</p>
        <button
          onClick={() => navigate("/login")}
          style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // If a user object exists in the Redux state, display the profile.
  return (
    <div>
      <h3>Your Profile</h3>
      <div>
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Go to Home
      </button>

      <button onClick={() => navigate("/dashboard")}>Go to Dashboard</button>

      {/* This component will fetch its own data as before */}
      <RapperList />
    </div>
  );
};

export default UserProfile;
