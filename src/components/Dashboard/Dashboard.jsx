import React from "react";
import styles from "./Dashboard.module.css"; // Import your CSS module
import ClickableList from "../RapperList"; // Import your RapperList component
import UserProfile from "../userProfile/UserProfile";
import { useNavigate } from "react-router-dom";
import CreateArtistForm from "../CreateArtistForm/CreateArtistForm";
import NavBar from "../NavBar/NavBar";
import Feeds from "../Feeds/Feeds"; // Import your Feeds component
import ImageFeed from "../ImageFeed/ImageFeed";

const Dashboard = () => {
  const navigate = useNavigate();

  // return (
  //   <div className="dashboard-div">
  //     <h1>Feeds DashBoard</h1>
  //     <NavBar />
  //     <p>Welcome to your personalized dashboard!</p>
  {
    /* <button className="profile-button" onClick={() => navigate("/profile")}>
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
      </button> */
  }
  {
    /* <ImageFeed /> */
  }
  {
    /* <h2 style={{ marginTop: "40px" }}>Add New Rapper</h2>
      <CreateArtistForm /> */
  }
  {
    /* <h1>Feeds</h1>
      <Feeds />
    </div>
  ); */
  }

  // **************************New Code**************************

  return (
    // Use the CSS module class for the grid container
    <div className={styles.dashboardContainer}>
      {/* This is the first item in the grid (left column) */}
      <NavBar />

      {/* This new div wraps all other content, becoming the second item (right column) */}
      <div className={styles.mainContent}>
        <h1>Feeds DashBoard</h1>
        <p>Welcome to your personalized dashboard!</p>

        <h1>Feeds</h1>
        <Feeds />
      </div>
    </div>
  );
};

export default Dashboard;
