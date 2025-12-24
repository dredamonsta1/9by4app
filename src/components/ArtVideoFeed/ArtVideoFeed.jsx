import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import NavBar from "../NavBar/NavBar";
import styles from "./ArtVideoFeed.module.css";

const ArtVideoFeed = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideoFeed = async () => {
      try {
        const response = await axiosInstance.get("/art/youtube-feed");
        setVideos(response.data);
      } catch (err) {
        setError("Failed to load video feed.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoFeed();
  }, []);

  if (loading) return <p>Loading art feed...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className={styles.container}>
      <NavBar />

      {/* This is the main scroll container */}
      <div className={styles.videoFeedContainer}>
        {videos.map((video) => (
          // Each video is a "slide" that will snap into place
          <div key={video.videoId} className={styles.videoSlide}>
            <div className={styles.videoPlayer}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&mute=1&loop=1&playlist=${video.videoId}`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            {/* You can add an overlay for the title, likes, comments, etc. here */}
            <div className={styles.videoOverlay}>
              <h3>{video.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtVideoFeed;
