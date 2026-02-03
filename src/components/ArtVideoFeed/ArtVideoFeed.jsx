// src/components/ArtVideoFeed/ArtVideoFeed.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./ArtVideoFeed.module.css";

const ArtVideoFeed = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE =
    import.meta.env.VITE_API_URL || "https://ninebyfourapi.herokuapp.com";

  useEffect(() => {
    const fetchVideoFeed = async () => {
      try {
        const response = await axiosInstance.get("/art/combined-video-feed");
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

  if (loading) return <p>Loading video feed...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const getVideoUrl = (video) => {
    if (video.video_type === "upload") {
      return video.video_url.startsWith("http")
        ? video.video_url
        : `${API_BASE}${video.video_url}`;
    }
    return video.video_url;
  };

  return (
    <div className={styles.container}>
      <div className={styles.videoFeedContainer}>
        {videos.map((video, index) => (
          <div
            key={video.id || `yt-${index}`}
            className={styles.videoSlide}
          >
            <div className={styles.videoPlayer}>
              {video.video_type === "youtube" || video.source === "youtube_playlist" ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${video.video_url}?autoplay=1&mute=1&loop=1&playlist=${video.video_url}`}
                  title={video.caption || "Video"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  width="100%"
                  height="100%"
                  controls
                  style={{ objectFit: "contain", background: "#000" }}
                >
                  <source src={getVideoUrl(video)} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            <div className={styles.videoOverlay}>
              <h3>{video.caption || ""}</h3>
              {video.username && video.source !== "youtube_playlist" && (
                <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>
                  @{video.username}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtVideoFeed;
