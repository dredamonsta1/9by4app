import React, { useState, useEffect } from "react";
import styles from "./UpcomingMusic.module.css";
// This component fetches and displays upcoming music releases.
// function UpcomingMusic() {
//   // State to hold the list of releases
//   const [releases, setReleases] = useState([]);
//   // State to manage the loading status
//   const [loading, setLoading] = useState(true);
//   // State for any potential errors during the fetch
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Function to fetch data from the MusicBrainz API
//     const fetchUpcomingReleases = async () => {
//       try {
//         // Construct the query to get official releases from today onwards
//         const today = new Date().toISOString().split("T")[0];
//         const query = `date:[${today} TO 2999-12-31] AND status:official`;

//         // Construct the API URL
//         const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json`;

//         // Fetch the data
//         const response = await fetch(url, {
//           headers: {
//             // MusicBrainz API requires a User-Agent header.
//             // Replace with your actual app name and contact info.
//             "User-Agent": "UpcomingMusicApp/1.0.0 ( your-email@example.com )",
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();

//         // Filter out releases without a date and sort them chronologically
//         const sortedReleases = data.releases
//           .filter((release) => release.date)
//           .sort((a, b) => new Date(a.date) - new Date(b.date));

//         setReleases(sortedReleases);
//       } catch (e) {
//         setError(e.message);
//         console.error("Failed to fetch releases:", e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUpcomingReleases();
//   }, []); // Empty dependency array means this effect runs once on mount

//   // Display a loading message
//   if (loading) {
//     return <p className={styles.loading}>Loading upcoming releases...</p>;
//   }

//   // Display an error message if the fetch failed
//   if (error) {
//     return <p className={styles.error}>Error fetching data: {error}</p>;
//   }

//   return (
//     <div className={styles.gridContainer}>
//       <h1 className={styles.title}>Upcoming Music Releases</h1>
//       {releases.length > 0 ? (
//         releases.map((release) => (
//           <div key={release.id} className={styles.releaseCard}>
//             <h2 className={styles.releaseTitle}>{release.title}</h2>
//             <p className={styles.artistName}>
//               by {release["artist-credit"]?.[0]?.name || "Unknown Artist"}
//             </p>
//             <p className={styles.releaseDate}>Release Date: {release.date}</p>
//             {release.country && (
//               <p className={styles.country}>Country: {release.country}</p>
//             )}
//           </div>
//         ))
//       ) : (
//         <p>No upcoming releases found.</p>
//       )}
//     </div>
//   );
// }

// export default UpcomingMusic;

// *********************New Code*********************

// function UpcomingMusic() {
//   const [releases, setReleases] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const today = new Date().toISOString().split("T")[0];
//     const corsProxy = "https://cors-anywhere.herokuapp.com/";

//     // --- Spotify API Functions ---
//     const getSpotifyToken = async () => {
//       // IMPORTANT: Replace with your own Spotify Client ID and Secret
//       const clientId = "YOUR_SPOTIFY_CLIENT_ID";
//       const clientSecret = "YOUR_SPOTIFY_CLIENT_SECRET";

//       if (
//         clientId === "YOUR_SPOTIFY_CLIENT_ID" ||
//         clientSecret === "YOUR_SPOTIFY_CLIENT_SECRET"
//       ) {
//         console.warn(
//           "Spotify credentials are not set. Skipping Spotify API call."
//         );
//         return null;
//       }

//       const response = await fetch(
//         `${corsProxy}https://accounts.spotify.com/api/token`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
//           },
//           body: "grant_type=client_credentials",
//         }
//       );
//       if (!response.ok)
//         throw new Error(`Spotify Token API error! status: ${response.status}`);
//       const data = await response.json();
//       return data.access_token;
//     };

//     const fetchSpotifyReleases = async (token) => {
//       if (!token) return [];
//       const url = `${corsProxy}https://api.spotify.com/v1/browse/new-releases?limit=50`;
//       const response = await fetch(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!response.ok)
//         throw new Error(`Spotify API error! status: ${response.status}`);
//       const data = await response.json();
//       return data.albums.items
//         .filter((album) => album.release_date >= today)
//         .map((album) => ({
//           id: `sp-${album.id}`,
//           title: album.name,
//           artist: album.artists[0]?.name || "Unknown Artist",
//           date: album.release_date,
//           source: "Spotify",
//           imageUrl: album.images?.[0]?.url || null,
//         }));
//     };

//     // --- MusicBrainz API Function ---
//     const fetchMusicBrainzReleases = async () => {
//       const query = `date:[${today} TO 2999-12-31] AND status:official`;
//       const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json`;
//       const response = await fetch(url, {
//         headers: {
//           "User-Agent": "UpcomingMusicApp/1.0.0 ( your-email@example.com )",
//         },
//       });
//       if (!response.ok)
//         throw new Error(`MusicBrainz API error! status: ${response.status}`);
//       const data = await response.json();

//       // Concurrently fetch cover art for all releases
//       const releasesWithCoverArt = await Promise.all(
//         data.releases.map(async (release) => {
//           let imageUrl = null;
//           try {
//             const coverArtUrl = `https://coverartarchive.org/release/${release.id}`;
//             const coverArtResponse = await fetch(coverArtUrl);
//             if (coverArtResponse.ok) {
//               const coverArtData = await coverArtResponse.json();
//               imageUrl =
//                 coverArtData.images?.[0]?.thumbnails?.small ||
//                 coverArtData.images?.[0]?.image ||
//                 null;
//             }
//           } catch (e) {
//             console.warn(
//               `Could not fetch cover art for MB release ${release.id}`
//             );
//           }
//           return {
//             id: `mb-${release.id}`,
//             title: release.title,
//             artist: release["artist-credit"]?.[0]?.name || "Unknown Artist",
//             date: release.date,
//             source: "MusicBrainz",
//             imageUrl: imageUrl,
//           };
//         })
//       );
//       return releasesWithCoverArt;
//     };

//     // --- Deezer API Function ---
//     const fetchDeezerReleases = async () => {
//       const url = `${corsProxy}https://api.deezer.com/editorial/0/releases`;
//       const response = await fetch(url);
//       if (!response.ok)
//         throw new Error(`Deezer API error! status: ${response.status}`);
//       const data = await response.json();
//       return data.data
//         .filter((release) => release.release_date >= today)
//         .map((release) => ({
//           id: `dz-${release.id}`,
//           title: release.title,
//           artist: release.artist?.name || "Unknown Artist",
//           date: release.release_date,
//           source: "Deezer",
//           imageUrl: release.cover_medium || null,
//         }));
//     };

//     // --- Main Fetch Function ---
//     const fetchAllReleases = async () => {
//       try {
//         const spotifyToken = await getSpotifyToken();
//         const [spotifyData, musicBrainzData, deezerData] = await Promise.all([
//           fetchSpotifyReleases(spotifyToken),
//           fetchMusicBrainzReleases(),
//           //   fetchDeezerReleases(),
//         ]);

//         const combinedReleases = [
//           ...spotifyData,
//           ...musicBrainzData,
//           ...deezerData,
//         ];
//         const uniqueReleases = Array.from(
//           new Map(
//             combinedReleases.map((item) => [
//               `${item.title.toLowerCase()}-${item.artist.toLowerCase()}`,
//               item,
//             ])
//           ).values()
//         );
//         const sortedReleases = uniqueReleases.sort(
//           (a, b) => new Date(a.date) - new Date(b.date)
//         );

//         setReleases(sortedReleases);
//       } catch (e) {
//         setError(e.message);
//         console.error("Failed to fetch releases:", e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllReleases();
//   }, []);

//   if (loading) {
//     return <p className={styles.loading}>Loading upcoming releases...</p>;
//   }

//   if (error) {
//     return <p className={styles.error}>Error fetching data: {error}</p>;
//   }

//   const getSourceStyle = (source) => {
//     switch (source) {
//       case "Deezer":
//         return styles.deezerTag;
//       case "Spotify":
//         return styles.spotifyTag;
//       case "MusicBrainz":
//       default:
//         return styles.musicBrainzTag;
//     }
//   };

//   return (
//     <div className={styles.gridContainer}>
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
//               {release.source}
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

// *****************New Code*******************

function UpcomingMusic() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    // --- MusicBrainz API Function ---
    const fetchMusicBrainzReleases = async () => {
      const query = `date:[${today} TO 2999-12-31] AND status:official`;
      const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "UpcomingMusicApp/1.0.0 ( your-email@example.com )",
        },
      });
      if (!response.ok)
        throw new Error(`MusicBrainz API error! status: ${response.status}`);
      const data = await response.json();

      // Concurrently fetch cover art for all releases
      const releasesWithCoverArt = await Promise.all(
        data.releases.map(async (release) => {
          let imageUrl = null;
          try {
            const coverArtUrl = `https://coverartarchive.org/release/${release.id}`;
            const coverArtResponse = await fetch(coverArtUrl);
            if (coverArtResponse.ok) {
              const coverArtData = await coverArtResponse.json();
              imageUrl =
                coverArtData.images?.[0]?.thumbnails?.small ||
                coverArtData.images?.[0]?.image ||
                null;
            }
          } catch (e) {
            console.warn(
              `Could not fetch cover art for MB release ${release.id}`
            );
          }
          return {
            id: `mb-${release.id}`,
            title: release.title,
            artist: release["artist-credit"]?.[0]?.name || "Unknown Artist",
            date: release.date,
            imageUrl: imageUrl,
          };
        })
      );

      // Sort releases by date
      return releasesWithCoverArt.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    };

    // --- Main Fetch Function ---
    const fetchReleases = async () => {
      try {
        const musicBrainzData = await fetchMusicBrainzReleases();
        setReleases(musicBrainzData);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch releases:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, []);

  if (loading) {
    return <p className={styles.loading}>Loading upcoming releases...</p>;
  }

  if (error) {
    return <p className={styles.error}>Error fetching data: {error}</p>;
  }

  return (
    <div className={styles.gridContainer}>
      {releases.length > 0 ? (
        releases.map((release) => (
          <div key={release.id} className={styles.releaseCard}>
            {release.imageUrl ? (
              <img
                src={release.imageUrl}
                alt={`Cover for ${release.title}`}
                className={styles.releaseImage}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>No Image</span>
              </div>
            )}
            <h2 className={styles.releaseTitle}>{release.title}</h2>
            <p className={styles.artistName}>by {release.artist}</p>
            <p className={styles.releaseDate}>Release Date: {release.date}</p>
          </div>
        ))
      ) : (
        <p>No upcoming releases found.</p>
      )}
    </div>
  );
}

export default UpcomingMusic;
