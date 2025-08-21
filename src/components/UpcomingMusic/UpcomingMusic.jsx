import React, { useState, useEffect } from "react";
import styles from "./UpcomingMusic.module.css";
// This component fetches and displays upcoming music releases.
function UpcomingMusic() {
  // State to hold the list of releases
  const [releases, setReleases] = useState([]);
  // State to manage the loading status
  const [loading, setLoading] = useState(true);
  // State for any potential errors during the fetch
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch data from the MusicBrainz API
    const fetchUpcomingReleases = async () => {
      try {
        // Construct the query to get official releases from today onwards
        const today = new Date().toISOString().split("T")[0];
        const query = `date:[${today} TO 2999-12-31] AND status:official`;

        // Construct the API URL
        const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json`;

        // Fetch the data
        const response = await fetch(url, {
          headers: {
            // MusicBrainz API requires a User-Agent header.
            // Replace with your actual app name and contact info.
            "User-Agent": "UpcomingMusicApp/1.0.0 ( your-email@example.com )",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Filter out releases without a date and sort them chronologically
        const sortedReleases = data.releases
          .filter((release) => release.date)
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setReleases(sortedReleases);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch releases:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingReleases();
  }, []); // Empty dependency array means this effect runs once on mount

  // Display a loading message
  if (loading) {
    return <p className={styles.loading}>Loading upcoming releases...</p>;
  }

  // Display an error message if the fetch failed
  if (error) {
    return <p className={styles.error}>Error fetching data: {error}</p>;
  }

  return (
    <div className={styles.gridContainer}>
      <h1 className={styles.title}>Upcoming Music Releases</h1>
      {releases.length > 0 ? (
        releases.map((release) => (
          <div key={release.id} className={styles.releaseCard}>
            <h2 className={styles.releaseTitle}>{release.title}</h2>
            <p className={styles.artistName}>
              by {release["artist-credit"]?.[0]?.name || "Unknown Artist"}
            </p>
            <p className={styles.releaseDate}>Release Date: {release.date}</p>
            {release.country && (
              <p className={styles.country}>Country: {release.country}</p>
            )}
          </div>
        ))
      ) : (
        <p>No upcoming releases found.</p>
      )}
    </div>
  );
}

export default UpcomingMusic;
