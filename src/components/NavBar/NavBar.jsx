import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./NavBar.module.css";

const NavBar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  return (
    <nav className={styles.navBar}>
      <div className={styles.logo}>9by4</div>
      <ul className={styles.navLinks}>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/profile">Profile</a>
        </li>
        <li>
          <a href="/dashBoard">DashBoard</a>
        </li>
        <li>
          <a href="/images">Image Feed</a>
        </li>
        <li>
          <a href="/art-video">Video</a>
        </li>
        <li>
          <a href="/login">Login</a>
        </li>
      </ul>
      <div className={styles.userInfo}>
        <span className={styles.username}>
          {user ? user.username : "Guest"}
        </span>
        <button
          className={styles.logoutButton}
          onClick={() => navigate("/logout")}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
