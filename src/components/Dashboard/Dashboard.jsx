import React from "react";
import "./Dashboard.css"; // Import your CSS file for styling
import ClickableList from "../RapperList"; // Import your RapperList component
import UserProfile from "../userProfile/UserProfile";
import { useNavigate } from "react-router-dom";
import CreateArtistForm from "../CreateArtistForm/CreateArtistForm";
import NavBar from "../NavBar/NavBar";
import Feeds from "../Feeds/Feeds"; // Import your Feeds component
import ImageFeed from "../ImageFeed/ImageFeed";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-div">
      <h1>Feeds DashBoard</h1>
      <NavBar />
      <p>Welcome to your personalized dashboard!</p>
      {/* <button className="profile-button" onClick={() => navigate("/profile")}>
        View Profile
      </button>
      <button className="home-button" onClick={() => navigate("/")}>
        Go to Home
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
      <button className="image-feed-button" onClick={() => navigate("/images")}>
        View Image Feed
      </button> */}
      {/* <ImageFeed /> */}
      {/* <h2 style={{ marginTop: "40px" }}>Add New Rapper</h2>
      <CreateArtistForm /> */}
      <h1>Feeds</h1>
      <Feeds />
    </div>
  );
};

export default Dashboard;
