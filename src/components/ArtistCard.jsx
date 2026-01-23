// src/components/ArtistCard.jsx
// This component displays an individual artist's details including the image.

import React from "react";
import styles from "./ArtistCard.module.css";

const ArtistCard = ({ artist }) => {
  // Construct the full image URL.
  // IMPORTANT: Replace 'https://ninebyfourapi.herokuapp.com' with your actual API base URL.
  const fullImageUrl = artist.image_url
    ? `https://ninebyfourapi.herokuapp.com${artist.image_url}`
    : "https://via.placeholder.com/60?text=No+Image"; // Placeholder if no image URL exists

  return (
    <div className={styles.artistCard}>
      {/* Top section for Artist Name and Genre */}
      <div className={styles.artistHeader}>
        <h3 className={styles.artistHeaderH3}>{artist.name}</h3>
        <p className={styles.artistHeaderP}>Genre: {artist.genre}</p>
      </div>

      {/* Section for Image and Clout Item */}
      <div className="artistDetails">
        <img
          className={styles.artistImage}
          src={fullImageUrl}
          alt={artist.name || "Artist Image"}
        />
        {/* The 'clout item' - the count */}
        <p className={styles.cloutItem}>
          Clout: <span style={{ color: "#333" }}>{artist.count}</span>
        </p>
      </div>

      {/* Add more artist details here if you want to display them */}
      {/* <p style={{ margin: '10px 0 0 0', color: '#555' }}>State: {artist.state}</p>
      <p style={{ margin: '0', color: '#555' }}>Album: {artist.album}</p> */}
    </div>
  );
};

export default ArtistCard;
