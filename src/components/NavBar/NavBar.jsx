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
          <li>
            <Link to="/" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/profile" onClick={closeMenu}>
              Profile
            </Link>
          </li>
          <li>
            <Link to="/dashBoard" onClick={closeMenu}>
              DashBoard
            </Link>
          </li>
          <li>
            <Link to="/images" onClick={closeMenu}>
              Image Feed
            </Link>
          </li>
          <li>
            <Link to="/art-video" onClick={closeMenu}>
              Video
            </Link>
          </li>
          {user && user.role == "admin" && (
            <li>
              <Link to="/admin" onClick={closeMenu}>
                Admin
              </Link>
            </li>
          )}

          {!user && (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/signup" className={styles.cta}>
                  Join Waitlist
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className={styles.userInfo}>
          <span className={styles.username}>
            {user ? user.username : "Guest"}
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
