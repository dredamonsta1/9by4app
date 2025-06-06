import React from "react";
import "./Dashboard.css"; // Import your CSS file for styling
import ClickableList from "../RapperList"; // Import your RapperList component
import UserProfile from "../userProfile/UserProfile";
import { useNavigate } from "react-router-dom";
import CreateArtistForm from "../CreateArtistForm/CreateArtistForm";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-div">
      <h1>Dashboard </h1>
      <p>Welcome to your personalized dashboard!</p>
      <button className="profile-button" onClick={() => navigate("/profile")}>
        View Profile
      </button>
      <button
        className="logout-button"
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Logout
      </button>
      <h2 style={{ marginTop: "40px" }}>Add New Rapper</h2>
      <CreateArtistForm /> {/* Add the new form here */}
      <h2 style={{ marginTop: "40px" }}>Manage Rappers</h2>
      {/* Render ClickableList:
          - showAdminActions={true} (display Delete/Edit buttons)
          - showCloutButton={true} (display the clickable Clout button) */}
      <ClickableList showAdminActions={true} showCloutButton={true} />
    </div>
  );
};

export default Dashboard;
