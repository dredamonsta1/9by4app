import React from "react";
import styles from "./Dashboard.module.css";
import ClickableList from "../RapperList";
import UserProfile from "../userProfile/UserProfile";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import CreateArtistForm from "../CreateArtistForm/CreateArtistForm";
import NavBar from "../NavBar/NavBar";
import Feeds from "../Feeds/Feeds";
import ImageFeed from "../ImageFeed/ImageFeed";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className={styles.dashboardContainer}>
      <NavBar />

      <div className={styles.mainContent}>
        <h1>Feeds DashBoard</h1>
        <p>Welcome to your personalized dashboard!</p>

        {/* Admin-only link to waitlist management */}
        {user?.role === "admin" && (
          <div
            style={{
              margin: "20px 0",
              padding: "10px",
              backgroundColor: "#f0f0f0",
              borderRadius: "5px",
            }}
          >
            <Link
              to="/admin/waitlist"
              style={{
                color: "#2563eb",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              🔐 Manage Waitlist (Admin)
            </Link>
          </div>
        )}

        <h1>Feeds</h1>
        <Feeds />
      </div>
    </div>
  );
};

export default Dashboard;
