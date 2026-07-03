import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import {
  searchArtists,
  clearSearchResults,
} from "../../redux/actions/artistActions";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./NavBar.module.css";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debounceTimer = useRef(null);
  const searchWrapRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { searchResults, searchLoading } = useSelector((state) => state.artists);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    closeMenu();
    dispatch(logout());
    navigate("/login");
  };

  // Debounced artist search. Reuses the existing /artists?search= endpoint
  // and the search results live in the artists redux slice.
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    clearTimeout(debounceTimer.current);
    if (!value.trim()) {
      dispatch(clearSearchResults());
      setShowResults(false);
      return;
    }
    setShowResults(true);
    debounceTimer.current = setTimeout(() => {
      dispatch(searchArtists({ search: value.trim() }));
    }, 250);
  };

  const handleResultClick = (artistId) => {
    setSearchTerm("");
    setShowResults(false);
    dispatch(clearSearchResults());
    closeMenu();
    navigate(`/artist/${artistId}`);
  };

  // Close the search dropdown when the user clicks outside.
  useEffect(() => {
    if (!showResults) return;
    const handler = (e) => {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(e.target)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showResults]);

  return (
    <nav className={styles.navBar}>
      <Link to="/" className={styles.logo} onClick={closeMenu}>
        <span className={styles.logoText}>StanBox</span>
        <span className={styles.logoTag}>the culture&rsquo;s ranking system</span>
      </Link>

      {/* Artist search — primary discovery affordance. Only shows when
          logged in (logged-out users still need the auth CTAs first). */}
      {user && (
        <div className={styles.searchWrap} ref={searchWrapRef}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search artists…"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm.trim() && setShowResults(true)}
          />
          {showResults && (
            <div className={styles.searchResults}>
              {searchLoading && (
                <div className={styles.searchHint}>Searching…</div>
              )}
              {!searchLoading && searchResults.length === 0 && (
                <div className={styles.searchHint}>No artists found.</div>
              )}
              {!searchLoading &&
                searchResults.slice(0, 8).map((a) => (
                  <button
                    key={a.artist_id}
                    type="button"
                    className={styles.searchResult}
                    onMouseDown={() => handleResultClick(a.artist_id)}
                  >
                    <img
                      src={resolveImageUrl(
                        a.image_url,
                        "https://via.placeholder.com/32?text=?",
                      )}
                      alt=""
                      className={styles.searchResultImg}
                    />
                    <span className={styles.searchResultName}>
                      {a.artist_name || a.name}
                    </span>
                    {a.genre && (
                      <span className={styles.searchResultGenre}>
                        {a.genre}
                      </span>
                    )}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

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
              {user.role === "admin" && (
                <li>
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className={styles.adminLink}
                  >
                    Admin
                  </Link>
                </li>
              )}
              {user.artist_id && (
                <>
                  <li>
                    <Link to="/artist-dashboard" onClick={closeMenu}>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/artist-settings" onClick={closeMenu}>
                      Settings
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/library" onClick={closeMenu}>
                  Library
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className={styles.profileLink}
                >
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
            </>
          )}
        </ul>
      </div>

      {/* Logout pinned to the far right of the navbar, outside the
          hamburger-toggled navContent so it's always visible on mobile too. */}
      {user && (
        <button
          onClick={handleLogout}
          className={`${styles.logoutButton} ${styles.logoutPinned}`}
        >
          Logout
        </button>
      )}
    </nav>
  );
};

export default NavBar;
