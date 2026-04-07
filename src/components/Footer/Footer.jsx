import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>Vedioz</Link>
          <p className={styles.tagline}>The culture's ranking system.</p>
        </div>

        {/* Nav links */}
        <nav className={styles.nav}>
          <div className={styles.navCol}>
            <span className={styles.navLabel}>Platform</span>
            <Link to="/" className={styles.navLink}>Home</Link>
            <Link to="/feed" className={styles.navLink}>Feed</Link>
            <Link to="/images" className={styles.navLink}>Images</Link>
            <Link to="/events" className={styles.navLink}>Events</Link>
            <Link to="/rooms" className={styles.navLink}>Rooms</Link>
          </div>
          <div className={styles.navCol}>
            <span className={styles.navLabel}>Account</span>
            <Link to="/signup" className={styles.navLink}>Join Waitlist</Link>
            <Link to="/register" className={styles.navLink}>Register</Link>
            <Link to="/login" className={styles.navLink}>Login</Link>
            <Link to="/pricing" className={styles.navLink}>Pricing</Link>
          </div>
        </nav>

      </div>

      <div className={styles.bottom}>
        <span>© {year} Vedioz. All rights reserved.</span>
        <Link to="/terms" className={styles.termsLink}>Terms of Use</Link>
      </div>
    </footer>
  );
};

export default Footer;
