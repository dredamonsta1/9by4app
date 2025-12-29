// import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import styles from "./NavBar.module.css";

// const NavBar = () => {
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
//   return (
//     <nav className={styles.navBar}>
//       <div className={styles.logo}>9by4</div>
//       <ul className={styles.navLinks}>
//         <li>
//           <a href="/">Home</a>
//         </li>
//         <li>
//           <a href="/profile">Profile</a>
//         </li>
//         <li>
//           <a href="/dashBoard">DashBoard</a>
//         </li>
//         <li>
//           <a href="/images">Image Feed</a>
//         </li>
//         <li>
//           <a href="/art-video">Video</a>
//         </li>
//         <li>
//           <a href="/login">Login</a>
//         </li>
//       </ul>
//       <div className={styles.userInfo}>
//         <span className={styles.username}>
//           {user ? user.username : "Guest"}
//         </span>
//         <button
//           className={styles.logoutButton}
//           onClick={() => navigate("/logout")}
//         >
//           Logout
//         </button>
//       </div>
//     </nav>
//   );
// };

// export default NavBar;

// ****************************New Code***************************** //

// import React, { useState } from 'react';
// import './NavBar.css';

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
          {!user && (
            <li>
              <Link to="/login" onClick={closeMenu}>
                Login
              </Link>
            </li>
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
