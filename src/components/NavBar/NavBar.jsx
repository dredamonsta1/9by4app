import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./NavBar.module.css";
import vediozLogo from "../../assets/vedioz-logo.png";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // FIX: Destructure from the auth slice, not the user object itself
  const { user } = useSelector((state) => state.auth);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    closeMenu();
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className={styles.navBar}>
      <Link to="/" className={styles.logo} onClick={closeMenu}>
        <img src={vediozLogo} alt="crates.fyi" className={styles.logoImg} />
      </Link>

      <button
        className={styles.hamburger}
        onClick={toggleMenu}
        aria-label="Toggle navigation"
      >
        <span className={`${styles.bar} ${isOpen ? styles.active : ""}`}></span>
        <span className={`${styles.bar} ${isOpen ? styles.active : ""}`}></span>
        <span className={`${styles.bar} ${isOpen ? styles.active : ""}`}></span>
      </button>

      <div className={`${styles.navContent} ${isOpen ? styles.show : ""}`}>
        <ul className={styles.navLinks}>
          {!user ? (
            <>
              <li>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className={styles.highlight}
                >
                  Join Waitlist
                </Link>
              </li>
              <li>
                <Link to="/register" onClick={closeMenu}>
                  Register
                </Link>
              </li>
              <li>
                <Link to="/login" onClick={closeMenu}>
                  Login
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/dashboard" onClick={closeMenu}>
                  Feed
                </Link>
              </li>
              <li>
                <Link to="/art-video" onClick={closeMenu}>
                  Videos
                </Link>
              </li>
              <li>
                <Link to="/events" onClick={closeMenu}>
                  Events
                </Link>
              </li>
              <li>
                <Link to="/rooms" onClick={closeMenu} className={styles.liveLink}>
                  Live
                </Link>
              </li>
              <li>
                <Link to="/streamers" onClick={closeMenu}>
                  Streamers
                </Link>
              </li>
              {user.role === "admin" && (
                <li>
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className={styles.adminLink}
                  >
                    Admin Panel
                  </Link>
                </li>
              )}
              <li>
                <Link to="/profile" onClick={closeMenu} className={styles.profileLink}>
                  {user.profile_image ? (
                    <img
                      src={resolveImageUrl(user.profile_image)}
                      alt={user.username}
                      className={styles.navAvatar}
                    />
                  ) : (
                    user.username
                  )}
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
