import React from "react";
import "./Dashboard.css"; // Import your CSS file for styling
import ClickableList from "../RapperList"; // Import your RapperList component
import UserProfile from "../userProfile/UserProfile";
import { useNavigate } from "react-router-dom";
import CreateArtistForm from "../CreateArtistForm/CreateArtistForm";
import Feeds from "../Feeds/Feeds"; // Import your Feeds component

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-div">
      <h1>Feeds DashBoard</h1>
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
      >
        Logout
      </button>
      <h2 style={{ marginTop: "40px" }}>Add New Rapper</h2>
      <CreateArtistForm /> {/* Add the new form here */}
      <h1>Feeds</h1>
      <Feeds />
    </div>
  );
};

export default Dashboard;
