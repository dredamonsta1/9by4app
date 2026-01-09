import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom"; // Use Link, not <a>
import styles from "./NavBar.module.css";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false); // Call this on link click

  return (
    <nav className={styles.navBar}>
      <div className={styles.logo}>9by4</div>

      {/* Hamburger Icon */}
      <button
        className={styles.hamburger}
        onClick={toggleMenu}
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
      >
        <span className={`${styles.bar} ${isOpen ? styles.active : ""}`}></span>
        <span className={`${styles.bar} ${isOpen ? styles.active : ""}`}></span>
        <span className={`${styles.bar} ${isOpen ? styles.active : ""}`}></span>
      </button>

      {/* Collapsible Content */}
      <div className={`${styles.navContent} ${isOpen ? styles.show : ""}`}>
        <ul className={styles.navLinks}>
          <ul className={styles.navLinks}>
            <li>
              <Link to="/">Home</Link>
            </li>

            {/* GUEST ONLY: Join Waitlist */}
            {!user && (
              <>
                <li>
                  <Link to="/signup" className={styles.highlight}>
                    Join Waitlist
                  </Link>
                </li>
                <li>
                  <Link to="/register" onClick={closeMenu}>
                    Register
                  </Link>
                </li>
              </>
            )}

            {/* LOGGED IN ONLY: Standard links */}
            {user && (
              <>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/images">Image Feed</Link>
                </li>
                {/* <li>
                  <Link to="/profile">Profile</Link>
                </li> */}
              </>
            )}

            {/* ADMIN ONLY: Control Room */}
            {user?.role === "admin" && (
              <li>
                <Link to="/admin" className={styles.adminLink}>
                  Admin Panel
                </Link>
              </li>
            )}

            {!user && (
              <li>
                <Link to="/login">Login</Link>
              </li>
            )}
          </ul>
        </ul>

        <div className={styles.userInfo}>
          <span className={styles.username}>
            <li>
              <Link to="/profile">{user ? user.username : "Guest"}</Link>
            </li>
          </span>
          {user && (
            <button
              className={styles.logoutButton}
              onClick={() => {
                closeMenu();
                navigate("/logout");
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
