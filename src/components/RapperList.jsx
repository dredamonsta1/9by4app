// import React, { useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import "./RapperList.css";
// import axiosInstance from "../utils/axiosInstance";
// import { fetchArtists, incrementClout } from "../redux/actions/artistActions";

// const ClickableList = ({ showAdminActions, showCloutButton }) => {
//   const { artists, loading, error } = useSelector((state) => state.artists);
//   const dispatch = useDispatch();

//   const API_BASE_URL = "https://ninebyfourapi.herokuapp.com";

//   useEffect(() => {
//     if (!loading && !artists.length && !error) {
//       dispatch(fetchArtists());
//     }
//   }, [dispatch, loading, artists.length, error]);

//   if (loading) return <p>Loading artists...</p>;
//   if (error)
//     return <p style={{ color: "red" }}>Error fetching data: {error}</p>;

//   const handleCloutClick = (artistId) => {
//     dispatch(incrementClout(artistId));
//   };

//   const handleDelete = async (artistId) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this artist?"
//     );
//     if (!confirmDelete) return;

//     try {
//       // Corrected endpoint for DELETE, assuming it needs '/api/artists' as a base
//       // and then the artist_id as a parameter or segment.
//       // If your DELETE endpoint is truly '/api?artist_id=...', keep that.
//       // But based on the PUT request, it's more likely /api/artists/:id
//       const response = await axiosInstance.delete(`/artists/${artistId}`); // Adjusted DELETE endpoint
//       alert(response.data.message);
//       dispatch(fetchArtists());
//     } catch (err) {
//       console.error(
//         "Error deleting artist:",
//         err.response?.data || err.message
//       );
//       alert(err.response?.data?.message || "Failed to delete artist.");
//     }
//   };

//   const handleEdit = (artistId) => {
//     alert(`Editing artist with ID: ${artistId}`);
//   };

//   return (
//     <div className="rapperList-outter-div">
//       <ul className="rapperList">
//         {artists.map((item) => (
//           <li className="rapperList-item" key={item.artist_id}>
//             {/* Image must be a direct child and will be absolutely positioned */}
//             {item.image_url && (
//               <img
//                 src={`${API_BASE_URL}${item.image_url}`}
//                 alt={item.name || "Artist"}
//                 className="rapperList-item-image" // This class has absolute positioning
//               />
//             )}

//             {/* All content overlaid on the image goes inside this new wrapper */}
//             <div className="rapperList-content-overlay">
//               {/* Artist Name and Genre */}
//               <div className="rapperList-item-details">
//                 <h3>{item.name || "N/A"}</h3>
//                 <p>Genre: {item.genre || "N/A"}</p>
//               </div>

//               {/* Section for Clout Item (image removed from here) */}
//               <div className="rapperList-item-clout-section">
//                 {showCloutButton ? (
//                   <button
//                     className="rapperButton"
//                     onClick={() => handleCloutClick(item.artist_id)}
//                   >
//                     Clout: {item.count}
//                   </button>
//                 ) : (
//                   <p className="clout-data-display">
//                     Clout: <span>{item.count}</span>
//                   </p>
//                 )}
//               </div>

//               {/* Admin Action Buttons */}
//               {showAdminActions && (
//                 <div className="rapperList-admin-actions">
//                   <button onClick={() => handleDelete(item.artist_id)}>
//                     Delete
//                   </button>
//                   <button onClick={() => handleEdit(item.artist_id)}>
//                     Edit
//                   </button>
//                 </div>
//               )}
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ClickableList;

// ****************************New Code****************************

// import React, { useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import "./RapperList.css";
// import axiosInstance from "../utils/axiosInstance";
// import { fetchArtists, incrementClout } from "../redux/actions/artistActions";

// const ClickableList = ({ showAdminActions, showCloutButton }) => {
//   const { artists, loading, error } = useSelector((state) => state.artists);
//   const dispatch = useDispatch();

//   const API_BASE_URL = "https://ninebyfourapi.herokuapp.com";

//   // --- FIX FOR THE INFINITE LOOP ---
//   // This useEffect hook is now configured to run only ONCE when the component
//   // first mounts. The dependency array `[dispatch]` ensures it doesn't re-run
//   // on every state update, which was causing the stack overflow.
//   useEffect(() => {
//     dispatch(fetchArtists());
//   }, [dispatch]);

//   if (loading) return <p>Loading artists...</p>;
//   if (error)
//     return <p style={{ color: "red" }}>Error fetching data: {error}</p>;

//   // A check to handle the case where loading is done but no artists were found.
//   if (!artists || artists.length === 0) {
//     return <p>No artists found.</p>;
//   }

//   const handleCloutClick = (artistId) => {
//     dispatch(incrementClout(artistId));
//   };

//   const handleDelete = async (artistId) => {
//     // Note: window.confirm is generally discouraged in favor of custom modal components.
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this artist?"
//     );
//     if (!confirmDelete) return;

//     try {
//       const response = await axiosInstance.delete(`/artists/${artistId}`);
//       alert(response.data.message); // Also consider replacing alerts with a notification system.
//       dispatch(fetchArtists()); // Re-fetch artists to update the list.
//     } catch (err) {
//       console.error(
//         "Error deleting artist:",
//         err.response?.data || err.message
//       );
//       alert(err.response?.data?.message || "Failed to delete artist.");
//     }
//   };

//   const handleEdit = (artistId) => {
//     // This would typically navigate to an edit form.
//     alert(`Editing artist with ID: ${artistId}`);
//   };

//   return (
//     <div className="rapperList-outter-div">
//       <ul className="rapperList">
//         {artists.map((item) => (
//           <li className="rapperList-item" key={item.artist_id}>
//             {item.image_url && (
//               <img
//                 src={`${API_BASE_URL}${item.image_url}`}
//                 alt={item.name || "Artist"}
//                 className="rapperList-item-image"
//               />
//             )}
//             <div className="rapperList-content-overlay">
//               <div className="rapperList-item-details">
//                 <h3>{item.name || "N/A"}</h3>
//                 <p>Genre: {item.genre || "N/A"}</p>
//               </div>

//               <div className="rapperList-item-clout-section">
//                 {showCloutButton ? (
//                   <button
//                     className="rapperButton"
//                     onClick={() => handleCloutClick(item.artist_id)}
//                   >
//                     Clout: {item.count}
//                   </button>
//                 ) : (
//                   <p className="clout-data-display">
//                     Clout: <span>{item.count}</span>
//                   </p>
//                 )}
//               </div>

//               {showAdminActions && (
//                 <div className="rapperList-admin-actions">
//                   <button onClick={() => handleDelete(item.artist_id)}>
//                     Delete
//                   </button>
//                   <button onClick={() => handleEdit(item.artist_id)}>
//                     Edit
//                   </button>
//                 </div>
//               )}
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ClickableList;

// **********************************New Code**********************************

// import React, { useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import "./RapperList.css";
// import axiosInstance from "../utils/axiosInstance";
// import { fetchArtists, incrementClout } from "../redux/actions/artistActions";

// // The component now accepts an `items` prop
// const ClickableList = ({ items, showAdminActions, showCloutButton }) => {
//   // Get the global artist state from Redux
//   const reduxArtists = useSelector((state) => state.artists);
//   const dispatch = useDispatch();

//   const API_BASE_URL = "https://ninebyfourapi.herokuapp.com";

//   useEffect(() => {
//     // Only fetch artists if no specific list (`items`) was passed down.
//     // This prevents the component from re-fetching data when it doesn't need to.
//     if (!items) {
//       dispatch(fetchArtists());
//     }
//   }, [dispatch, items]);

//   // Determine which list to render: the one from props, or the one from Redux.
//   const artistsToRender = items || reduxArtists.artists;
//   const loading = !items && reduxArtists.loading;
//   const error = !items && reduxArtists.error;

//   if (loading) return <p>Loading artists...</p>;
//   if (error)
//     return <p style={{ color: "red" }}>Error fetching data: {error}</p>;

//   if (!artistsToRender || artistsToRender.length === 0) {
//     return <p>No artists found.</p>;
//   }

//   const handleCloutClick = (artistId) => {
//     dispatch(incrementClout(artistId));
//   };

//   const handleDelete = async (artistId) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this artist?"
//     );
//     if (!confirmDelete) return;

//     try {
//       const response = await axiosInstance.delete(`/artists/${artistId}`);
//       alert(response.data.message);
//       dispatch(fetchArtists());
//     } catch (err) {
//       console.error(
//         "Error deleting artist:",
//         err.response?.data || err.message
//       );
//       alert(err.response?.data?.message || "Failed to delete artist.");
//     }
//   };

//   const handleEdit = (artistId) => {
//     alert(`Editing artist with ID: ${artistId}`);
//   };

//   return (
//     <div className="rapperList-outter-div">
//       <ul className="rapperList">
//         {artistsToRender.map((item) => (
//           <li className="rapperList-item" key={item.artist_id}>
//             {item.image_url && (
//               <img
//                 src={`${API_BASE_URL}${item.image_url}`}
//                 alt={item.name || "Artist"}
//                 className="rapperList-item-image"
//               />
//             )}
//             <div className="rapperList-content-overlay">
//               <div className="rapperList-item-details">
//                 <h3>{item.name || "N/A"}</h3>
//                 <p>Genre: {item.genre || "N/A"}</p>
//               </div>

//               <div className="rapperList-item-clout-section">
//                 {showCloutButton ? (
//                   <button
//                     className="rapperButton"
//                     onClick={() => handleCloutClick(item.artist_id)}
//                   >
//                     Clout: {item.count}
//                   </button>
//                 ) : (
//                   <p className="clout-data-display">
//                     Clout: <span>{item.count}</span>
//                   </p>
//                 )}
//               </div>

//               {showAdminActions && (
//                 <div className="rapperList-admin-actions">
//                   <button onClick={() => handleDelete(item.artist_id)}>
//                     Delete
//                   </button>
//                   <button onClick={() => handleEdit(item.artist_id)}>
//                     Edit
//                   </button>
//                 </div>
//               )}
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ClickableList;

// **********************************New Code*********************************

import React from "react";
import { useDispatch } from "react-redux";
import "./RapperList.css";
import { incrementClout } from "../redux/actions/artistActions";

// --- FIX FOR THE INFINITE LOOP ---
// The component is now a "presentational" component.
// It no longer fetches its own data. It relies entirely on the `artists` prop
// passed down from its parent. This prevents conflicting data fetches and loops.
const ClickableList = ({ artists, showAdminActions, showCloutButton }) => {
  const dispatch = useDispatch();

  const API_BASE_URL = "https://ninebyfourapi.herokuapp.com";

  // All internal state fetching (useSelector, useEffect for fetching) has been removed.

  // A simple check for loading should be handled by the parent component now.
  if (!artists) {
    return <p>Loading artists...</p>;
  }

  if (artists.length === 0) {
    return <p>No artists found.</p>;
  }

  const handleCloutClick = (artistId) => {
    dispatch(incrementClout(artistId));
  };

  const handleDelete = async (artistId) => {
    // This logic remains, but ideally would be moved to the parent component as well.
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this artist?"
    );
    if (!confirmDelete) return;
    // Note: The delete/edit logic might be better handled in the parent page
    // to keep this component purely for display.
    alert("Delete functionality would be handled here.");
  };

  const handleEdit = (artistId) => {
    alert(`Editing artist with ID: ${artistId}`);
  };

  return (
    <div className="rapperList-outter-div">
      <ul className="rapperList">
        {artists.map((item) => (
          <li className="rapperList-item" key={item.artist_id}>
            {item.image_url && (
              <img
                src={`${API_BASE_URL}${item.image_url}`}
                alt={item.name || "Artist"}
                className="rapperList-item-image"
              />
            )}
            <div className="rapperList-content-overlay">
              <div className="rapperList-item-details">
                <h3>{item.name || "N/A"}</h3>
                <p>Genre: {item.genre || "N/A"}</p>
              </div>

              <div className="rapperList-item-clout-section">
                {showCloutButton ? (
                  <button
                    className="rapperButton"
                    onClick={() => handleCloutClick(item.artist_id)}
                  >
                    Clout: {item.count}
                  </button>
                ) : (
                  <p className="clout-data-display">
                    Clout: <span>{item.count}</span>
                  </p>
                )}
              </div>

              {showAdminActions && (
                <div className="rapperList-admin-actions">
                  <button onClick={() => handleDelete(item.artist_id)}>
                    Delete
                  </button>
                  <button onClick={() => handleEdit(item.artist_id)}>
                    Edit
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClickableList;
