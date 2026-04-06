import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./TrendingShelf.module.css";

const TrendingShelf = ({ onArtistClick }) => {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    axiosInstance.get("/artists/trending")
      .then((res) => setArtists(res.data))
      .catch(() => {});
  }, []);

  if (artists.length === 0) return null;

  return (
    <section className={styles.shelf}>
      <div className={styles.shelfHeader}>
        <span className={styles.label}>Most added this week</span>
      </div>
      <div className={styles.track}>
        {artists.map((artist) => (
          <button
            key={artist.artist_id}
            className={styles.card}
            onClick={() => onArtistClick(artist)}
          >
            <div className={styles.imgWrap}>
              <img
                src={resolveImageUrl(artist.image_url, "https://via.placeholder.com/72?text=?")}
                alt={artist.artist_name}
                className={styles.img}
              />
              <span className={styles.arrow}>↑</span>
            </div>
            <span className={styles.name}>{artist.artist_name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default TrendingShelf;
