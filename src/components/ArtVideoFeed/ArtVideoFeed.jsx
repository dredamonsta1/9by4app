// import React, { useState, useEffect } from "react";
// import axiosInstance from "../../utils/axiosInstance";
// import NavBar from "../NavBar/NavBar";
// // Optional: Create an ArtVideoFeed.module.css file for styling

// const ArtVideoFeed = () => {
//   const [videos, setVideos] = useState([]);
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Fetch the curated feed when the component loads
//     const fetchVideoFeed = async () => {
//       try {
//         const response = await axiosInstance.get("/art/youtube-feed");
//         setVideos(response.data);
//         // Set the first video as the default one to play
//         if (response.data.length > 0) {
//           setSelectedVideo(response.data[0]);
//         }
//       } catch (err) {
//         setError("Failed to load video feed.");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchVideoFeed();
//   }, []); // The empty array ensures this runs only once

//   if (loading) return <p>Loading art feed...</p>;
//   if (error) return <p style={{ color: "red" }}>{error}</p>;

//   return (
//     <div style={{ padding: "2rem" }}>
//       <NavBar />
//       <h2>Art Documentary Feed 📺</h2>

//       {/* Main Video Player */}
//       {selectedVideo && (
//         <div className="video-player" style={{ marginBottom: "2rem" }}>
//           <h3>{selectedVideo.title}</h3>
//           <iframe
//             width="100%"
//             height="500"
//             src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
//             title={selectedVideo.title}
//             frameBorder="0"
//             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//             allowFullScreen
//           ></iframe>
//         </div>
//       )}

//       {/* Scrollable Video List */}
//       <div
//         className="video-list"
//         style={{
//           display: "flex",
//           gap: "1rem",
//           overflowX: "auto",
//           paddingBottom: "1rem",
//         }}
//       >
//         {videos.map((video) => (
//           <div
//             key={video.videoId}
//             className="video-thumbnail"
//             style={{ cursor: "pointer", flexShrink: 0 }}
//             onClick={() => setSelectedVideo(video)}
//           >
//             <img
//               src={video.thumbnail}
//               alt={video.title}
//               style={{
//                 width: "240px",
//                 border:
//                   selectedVideo?.videoId === video.videoId
//                     ? "3px solid #007bff"
//                     : "3px solid transparent",
//               }}
//             />
//             <p style={{ width: "240px", fontSize: "0.9rem" }}>{video.title}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ArtVideoFeed;

// ***********************New Code***********************

// import React, { useState, useEffect } from "react";
// import axiosInstance from "../../utils/axiosInstance";
// import NavBar from "../NavBar/NavBar";
// import styles from "./ArtVideoFeed.module.css"; // Import the CSS module

// const ArtVideoFeed = () => {
//   const [videos, setVideos] = useState([]);
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Fetch the curated feed when the component loads
//     const fetchVideoFeed = async () => {
//       try {
//         const response = await axiosInstance.get("/art/youtube-feed");
//         setVideos(response.data);
//         // Set the first video as the default one to play
//         if (response.data.length > 0) {
//           setSelectedVideo(response.data[0]);
//         }
//       } catch (err) {
//         setError("Failed to load video feed.");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchVideoFeed();
//   }, []); // The empty array ensures this runs only once

//   if (loading) return <p>Loading art feed...</p>;
//   if (error) return <p style={{ color: "red" }}>{error}</p>;

//   return (
//     // This is the new container for the entire layout
//     <div className={styles.container}>
//       <NavBar />

//       {/* This is the new container for the main content */}
//       <div className={styles.mainContent}>
//         <h2>Art Documentary Feed 📺</h2>

//         {/* Main Video Player */}
//         {selectedVideo && (
//           <div className="video-player" style={{ marginBottom: "2rem" }}>
//             <h3>{selectedVideo.title}</h3>
//             <iframe
//               width="100%"
//               height="500"
//               src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&mute=1`}
//               title={selectedVideo.title}
//               frameBorder="0"
//               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//               allowFullScreen
//             ></iframe>
//           </div>
//         )}

//         {/* Scrollable Video List */}
//         <div
//           className="video-list"
//           style={{
//             display: "flex",
//             gap: "1rem",
//             overflowX: "auto",
//             paddingBottom: "1rem",
//           }}
//         >
//           {videos.map((video) => (
//             <div
//               key={video.videoId}
//               className="video-thumbnail"
//               style={{ cursor: "pointer", flexShrink: 0 }}
//               onClick={() => setSelectedVideo(video)}
//             >
//               <img
//                 src={video.thumbnail}
//                 alt={video.title}
//                 style={{
//                   width: "240px",
//                   border:
//                     selectedVideo?.videoId === video.videoId
//                       ? "3px solid #007bff"
//                       : "3px solid transparent",
//                 }}
//               />
//               <p style={{ width: "240px", fontSize: "0.9rem" }}>
//                 {video.title}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ArtVideoFeed;

// *************************New Code***********************

// import React, { useState, useEffect } from "react";
// import axiosInstance from "../../utils/axiosInstance";
// import NavBar from "../NavBar/NavBar";
// import styles from "./ArtVideoFeed.module.css";

// const ArtVideoFeed = () => {
//   const [videos, setVideos] = useState([]);
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchVideoFeed = async () => {
//       try {
//         const response = await axiosInstance.get("/art/youtube-feed");
//         setVideos(response.data);
//         if (response.data.length > 0) {
//           setSelectedVideo(response.data[0]);
//         }
//       } catch (err) {
//         setError("Failed to load video feed.");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchVideoFeed();
//   }, []);

//   // --- New Logic for Next/Previous Video Navigation ---
//   const playNextVideo = () => {
//     // Find the index of the currently playing video
//     const currentIndex = videos.findIndex(
//       (video) => video.videoId === selectedVideo.videoId
//     );
//     // Check if there is a next video
//     if (currentIndex < videos.length - 1) {
//       setSelectedVideo(videos[currentIndex + 1]);
//     }
//   };

//   const playPreviousVideo = () => {
//     // Find the index of the currently playing video
//     const currentIndex = videos.findIndex(
//       (video) => video.videoId === selectedVideo.videoId
//     );
//     // Check if there is a previous video
//     if (currentIndex > 0) {
//       setSelectedVideo(videos[currentIndex - 1]);
//     }
//   };

//   if (loading) return <p>Loading art feed...</p>;
//   if (error) return <p style={{ color: "red" }}>{error}</p>;

//   // Get the index of the current video to disable buttons at the ends
//   const currentIndex = videos.findIndex(
//     (video) => video.videoId === selectedVideo?.videoId
//   );

//   return (
//     <div className={styles.container}>
//       <NavBar />

//       <div className={styles.mainContent}>
//         <h2>Art Feed</h2>

//         {selectedVideo && (
//           <div className={styles.videoPlayer}>
//             <h3>{selectedVideo.title}</h3>
//             {/* The src URL is updated for autoplay and mute */}
//             <iframe
//               width="75%"
//               height="500"
//               src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&mute=1`}
//               title={selectedVideo.title}
//               frameBorder="0"
//               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//               allowFullScreen
//             ></iframe>

//             {/* New Navigation Buttons */}
//             <div className={styles.navigation}>
//               <button onClick={playPreviousVideo} disabled={currentIndex === 0}>
//                 &lt; Previous
//               </button>
//               <button
//                 onClick={playNextVideo}
//                 disabled={currentIndex === videos.length - 1}
//               >
//                 Next &gt;
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Scrollable Video List */}
//         <div className={styles.videoList}>
//           {videos.map((video) => (
//             <div
//               key={video.videoId}
//               className={styles.videoThumbnail}
//               onClick={() => setSelectedVideo(video)}
//             >
//               <img
//                 src={video.thumbnail}
//                 alt={video.title}
//                 className={
//                   selectedVideo?.videoId === video.videoId
//                     ? styles.selectedThumbnail
//                     : ""
//                 }
//               />
//               <p>{video.title}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ArtVideoFeed;

// *******************New Code***********************

import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import NavBar from "../NavBar/NavBar";
// Make sure to import the CSS module
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
