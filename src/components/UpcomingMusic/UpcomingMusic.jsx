// src/components/UpcomingMusic/UpcomingMusic.jsx
// import React, { useState, useEffect } from "react";
// import styles from "./UpcomingMusic.module.css";

// function UpcomingMusic() {
//   const [releases, setReleases] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchMusic = async () => {
//       try {
//         // Fetching from YOUR OWN backend now
//         const response = await axiosInstance.get("/music/upcoming");
//         setReleases(response.data);
//       } catch (e) {
//         setError("Failed to load upcoming music.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMusic();
//   }, []);

//   // useEffect(() => {
//   //   const today = new Date().toISOString().split("T")[0];
//   //   const corsProxy = "https://cors-anywhere.herokuapp.com/";

//   //   // --- Spotify API Functions ---
//   //   const getSpotifyToken = async () => {
//   //     const clientId = "cc5f4c9fbf304384a5ae6c12a7751f61";
//   //     const clientSecret = "608ee54cd2e348b2bfd30173e47266ae";

//   //     const response = await fetch(
//   //       `${corsProxy}https://accounts.spotify.com/api/token`,
//   //       {
//   //         method: "POST",
//   //         headers: {
//   //           "Content-Type": "application/x-www-form-urlencoded",
//   //           Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
//   //         },
//   //         body: "grant_type=client_credentials",
//   //       }
//   //     );
//   //     if (!response.ok)
//   //       throw new Error(`Spotify Token API error! status: ${response.status}`);
//   //     const data = await response.json();
//   //     return data.access_token;
//   //   };

//   //   const fetchSpotifyReleases = async (token) => {
//   //     if (!token) return []; // Don't fetch if token is null
//   //     const url = `${corsProxy}https://api.spotify.com/v1/browse/new-releases?limit=50`;
//   //     const response = await fetch(url, {
//   //       headers: { Authorization: `Bearer ${token}` },
//   //     });
//   //     if (!response.ok)
//   //       throw new Error(`Spotify API error! status: ${response.status}`);
//   //     const data = await response.json();
//   //     return data.albums.items
//   //       .filter((album) => album.release_date >= today)
//   //       .map((album) => ({
//   //         id: `sp-${album.id}`,
//   //         title: album.name,
//   //         artist: album.artists[0]?.name || "Unknown Artist",
//   //         date: album.release_date,
//   //         source: "Spotify",
//   //         imageUrl: album.images?.[0]?.url || null,
//   //       }));
//   //   };

//   //   // --- MusicBrainz API Function ---
//   //   const fetchMusicBrainzReleases = async () => {
//   //     const query = `date:[${today} TO 2999-12-31] AND status:official`;
//   //     const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json`;
//   //     const response = await fetch(url, {
//   //       headers: {
//   //         "User-Agent": "UpcomingMusicApp/1.0.0 ( your-email@example.com )",
//   //       },
//   //     });
//   //     if (!response.ok)
//   //       throw new Error(`MusicBrainz API error! status: ${response.status}`);
//   //     const data = await response.json();

//   //     // Concurrently fetch cover art for all releases
//   //     const releasesWithCoverArt = await Promise.all(
//   //       data.releases.map(async (release) => {
//   //         let imageUrl = null;
//   //         try {
//   //           const coverArtUrl = `https://coverartarchive.org/release/${release.id}`;
//   //           const coverArtResponse = await fetch(coverArtUrl);
//   //           if (coverArtResponse.ok) {
//   //             const coverArtData = await coverArtResponse.json();
//   //             imageUrl =
//   //               coverArtData.images?.[0]?.thumbnails?.small ||
//   //               coverArtData.images?.[0]?.image ||
//   //               null;
//   //           }
//   //         } catch (e) {
//   //           console.warn(
//   //             `Could not fetch cover art for MB release ${release.id}`
//   //           );
//   //         }
//   //         return {
//   //           id: `mb-${release.id}`,
//   //           title: release.title,
//   //           artist: release["artist-credit"]?.[0]?.name || "Unknown Artist",
//   //           date: release.date,
//   //           source: "MusicBrainz",
//   //           imageUrl: imageUrl,
//   //         };
//   //       })
//   //     );
//   //     return releasesWithCoverArt;
//   //   };

//   //   // --- Main Fetch Function ---
//   //   const fetchAllReleases = async () => {
//   //     try {
//   //       const spotifyToken = await getSpotifyToken();
//   //       const [spotifyData, musicBrainzData] = await Promise.all([
//   //         fetchSpotifyReleases(spotifyToken),
//   //         fetchMusicBrainzReleases(),
//   //       ]);

//   //       const combinedReleases = [...spotifyData, ...musicBrainzData];
//   //       const uniqueReleases = Array.from(
//   //         new Map(
//   //           combinedReleases.map((item) => [
//   //             `${item.title.toLowerCase()}-${item.artist.toLowerCase()}`,
//   //             item,
//   //           ])
//   //         ).values()
//   //       );
//   //       const sortedReleases = uniqueReleases.sort(
//   //         (a, b) => new Date(a.date) - new Date(b.date)
//   //       );

//   //       setReleases(sortedReleases);
//   //     } catch (e) {
//   //       setError(e.message);
//   //       console.error("Failed to fetch releases:", e);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchAllReleases();
//   // }, []);

//   if (loading) {
//     return <p className={styles.loading}>Loading upcoming releases...</p>;
//   }

//   if (error) {
//     return <p className={styles.error}>Error fetching data: {error}</p>;
//   }

//   const getSourceStyle = (source) => {
//     switch (source) {
//       case "Spotify":
//         return styles.spotifyTag;
//       case "MusicBrainz":
//       default:
//         return styles.musicBrainzTag;
//     }
//   };

//   return (
//     <div className={styles.gridContainer}>
//       <h1 className={styles.upcomingTitle}>Upcoming Music</h1>
//       {releases.length > 0 ? (
//         releases.map((release) => (
//           <div key={release.id} className={styles.releaseCard}>
//             {release.imageUrl ? (
//               <img
//                 src={release.imageUrl}
//                 alt={`Cover for ${release.title}`}
//                 className={styles.releaseImage}
//               />
//             ) : (
//               <div className={styles.imagePlaceholder}>
//                 <span>No Image</span>
//               </div>
//             )}
//             <span
//               className={{
//                 ...styles.sourceTag,
//                 ...getSourceStyle(release.source),
//               }}
//             >
//               {/* {release.source} */}
//             </span>
//             <h2 className={styles.releaseTitle}>{release.title}</h2>
//             <p className={styles.artistName}>by {release.artist}</p>
//             <p className={styles.releaseDate}>Release Date: {release.date}</p>
//           </div>
//         ))
//       ) : (
//         <p>No upcoming releases found.</p>
//       )}
//     </div>
//   );
// }

// export default UpcomingMusic;

// ***************************************************************
// OLD CODE FOR REFERENCE ONLY - DO NOT DELETE
// ***************************************************************
// src/components/UpcomingMusic/UpcomingMusic.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./UpcomingMusic.module.css";

function UpcomingMusic() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const response = await axiosInstance.get("/music/upcoming");
        setReleases(response.data);
      } catch (e) {
        setError("Failed to load music updates.");
      } finally {
        setLoading(false);
      }
    };
    fetchMusic();
  }, []);

  if (loading) return <div className={styles.shimmer}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.gridContainer}>
      {releases.map((release) => (
        <div key={release.id} className={styles.card}>
          <img
            src={release.imageUrl || "/placeholder.png"}
            alt={release.title}
          />
          <h3>{release.title}</h3>
          <p>{release.artist}</p>
          <span className={styles[release.source.toLowerCase()]}>
            {release.source}
          </span>
        </div>
      ))}
    </div>
  );
}

export default UpcomingMusic;
