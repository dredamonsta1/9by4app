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
    <div
      style={{
        border: "1px solid #ddd",
        padding: "15px",
        margin: "10px",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column", // Stack main sections vertically
        gap: "10px",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        width: "250px", // Example fixed width for the card
      }}
    >
      {/* Top section for Artist Name and Genre */}
      <div>
        <h3 style={{ margin: "0 0 5px 0", color: "#333" }}>{artist.name}</h3>
        <p style={{ margin: 0, color: "#666" }}>Genre: {artist.genre}</p>
      </div>

      {/* Section for Image and Clout Item */}
      <div
        style={{
          display: "flex", // Use flexbox to align image and clout text side-by-side
          alignItems: "center", // Vertically align items in the center
          gap: "15px", // Space between the image and the text
          padding: "10px 0",
          borderTop: "1px dashed #eee",
          borderBottom: "1px dashed #eee",
        }}
      >
        <img
          src={fullImageUrl}
          alt={artist.name || "Artist Image"}
          style={{
            width: "60px", // Set a fixed width for the image
            height: "60px", // Set a fixed height for the image
            borderRadius: "50%", // Make the image circular
            objectFit: "cover", // Crop the image to cover the area without distortion
            border: "2px solid #007bff", // Add a small border
            flexShrink: 0, // Prevent image from shrinking if space is tight
          }}
        />
        {/* The 'clout item' - the count */}
        <p
          style={{
            margin: 0,
            fontSize: "1.1em",
            fontWeight: "bold",
            color: "#007bff",
          }}
        >
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
