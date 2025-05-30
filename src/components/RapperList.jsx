// import React, { useState, useEffect } from "react";
// import "./RapperList.css";
// import axiosInstance from "../utils/axiosInstance";

// const ClickableList = ({ showAdminActions, showCloutButton }) => {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   const API_BASE_URL = "https://ninebyfourapi.herokuapp.com"; // Your API Base URL

//   useEffect(() => {
//     setLoading(true);
//     fetch(`${API_BASE_URL}/api`, { method: "GET" })
//       .then((res) => res.json())
//       .then((data) => {
//         const itemsWithCount = (
//           Array.isArray(data.rappers) ? data.rappers : [data.rappers]
//         ).map((item) => ({ count: item.count || 0, ...item }));
//         setItems(itemsWithCount);
//         setLoading(false);
//         console.log(data.rappers);
//       })
//       .catch((error) => {
//         console.error("fetching data:", error);
//         setError(true);
//         setLoading(false);
//         if (error.response) {
//           console.log("Error response:", error.response.data);
//         } else if (error.request) {
//           console.log("Request error:", error.request);
//         } else {
//           console.log("General error:", error.message);
//         }
//       });
//   }, []);

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error fetching data</p>;

//   const handleClick = (index) => {
//     const newItems = items.map((item, i) =>
//       i === index ? { ...item, count: item.count + 1 } : item
//     );
//     const sortedItems = [...newItems].sort((a, b) => b.count - a.count);
//     setItems(sortedItems);
//   };

//   const handleDelete = async (artistId) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this artist?"
//     );
//     if (!confirmDelete) return;

//     try {
//       const response = await axiosInstance.delete(`/api?artist_id=${artistId}`);
//       alert(response.data.message);
//       setItems(items.filter((item) => item.artist_id !== artistId));
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
//         {items.map((item, index) => (
//           <li
//             className="rapperList-item" // Apply main card styling
//             key={item.artist_id}
//           >
//             {/* Artist Name and Genre */}
//             <div className="rapperList-item-details">
//               <h3>{item.name || "N/A"}</h3>
//               <p>Genre: {item.genre || "N/A"}</p>
//             </div>

//             {/* Section for Image and Clout Item - This is the primary row */}
//             <div className="rapperList-item-clout-section">
//               {item.image_url && (
//                 <img
//                   src={`<span class="math-inline">\{API_BASE_URL}</span>{item.image_url}`} // Construct full URL
//                   alt={item.name || "Artist"}
//                   className="rapperList-item-image" // Apply image styling
//                 />
//               )}

//               {showCloutButton ? (
//                 <button
//                   className="rapperButton"
//                   onClick={() => handleClick(index)}
//                 >
//                   Clout: {item.count}
//                 </button>
//               ) : (
//                 <p className="clout-data-display">
//                   Clout: <span>{item.count}</span>
//                 </p>
//               )}
//             </div>

//             {/* Admin Action Buttons */}
//             {showAdminActions && (
//               <div className="rapperList-admin-actions">
//                 <button onClick={() => handleDelete(item.artist_id)}>
//                   Delete
//                 </button>
//                 <button onClick={() => handleEdit(item.artist_id)}>Edit</button>
//               </div>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ClickableList;

//******************************************** */

// src/components/RapperList.jsx
import React, { useEffect } from "react"; // Removed useState for items, loading, error
import { useSelector, useDispatch } from "react-redux"; // Import Redux hooks
import "./RapperList.css";
import axiosInstance from "../utils/axiosInstance";
import { fetchArtists, incrementClout } from "../redux/actions/artistActions"; // Import your Redux actions

const ClickableList = ({ showAdminActions, showCloutButton }) => {
  // Use useSelector to get state from the Redux store
  const { artists, loading, error } = useSelector((state) => state.artists);
  const dispatch = useDispatch(); // Get the dispatch function

  const API_BASE_URL = "https://ninebyfourapi.herokuapp.com"; // Your API Base URL

  // Fetch data when the component mounts or when dependencies change
  useEffect(() => {
    // Only fetch if data hasn't been loaded or is in an error state
    // You might want a more sophisticated loading/error state management for re-fetches
    if (!loading && !artists.length && !error) {
      // Simple check to avoid re-fetching on every re-render
      dispatch(fetchArtists());
    }
  }, [dispatch, loading, artists.length, error]); // Include all dependencies

  if (loading) return <p>Loading artists...</p>;
  if (error)
    return <p style={{ color: "red" }}>Error fetching data: {error}</p>;

  // Handle Clout button click - now dispatches Redux action
  const handleCloutClick = (artistId) => {
    dispatch(incrementClout(artistId));
  };

  // Handle Delete Action
  const handleDelete = async (artistId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this artist?"
    );
    if (!confirmDelete) return;

    try {
      const response = await axiosInstance.delete(`/api?artist_id=${artistId}`);
      alert(response.data.message);
      // After successful delete, re-fetch artists to update the list in Redux
      dispatch(fetchArtists());
    } catch (err) {
      console.error(
        "Error deleting artist:",
        err.response?.data || err.message
      );
      alert(err.response?.data?.message || "Failed to delete artist.");
    }
  };

  // Handle Edit Action (placeholder)
  const handleEdit = (artistId) => {
    alert(`Editing artist with ID: ${artistId}`);
  };

  return (
    <div className="rapperList-outter-div">
      <ul className="rapperList">
        {/* Render artists from the Redux store. They are already sorted by the reducer. */}
        {artists.map((item) => (
          <li className="rapperList-item" key={item.artist_id}>
            {/* Artist Name and Genre */}
            <div className="rapperList-item-details">
              <h3>{item.name || "N/A"}</h3>
              <p>Genre: {item.genre || "N/A"}</p>
            </div>

            {/* Section for Image and Clout Item */}
            <div className="rapperList-item-clout-section">
              {item.image_url && (
                <img
                  src={`${API_BASE_URL}${item.image_url}`} // Construct full URL
                  alt={item.name || "Artist"}
                  className="rapperList-item-image" // Apply image styling
                />
              )}

              {showCloutButton ? (
                <button
                  className="rapperButton"
                  onClick={() => handleCloutClick(item.artist_id)} // Pass artist_id
                >
                  Clout: {item.count}
                </button>
              ) : (
                <p className="clout-data-display">
                  Clout: <span>{item.count}</span>
                </p>
              )}
            </div>

            {/* Admin Action Buttons */}
            {showAdminActions && (
              <div className="rapperList-admin-actions">
                <button onClick={() => handleDelete(item.artist_id)}>
                  Delete
                </button>
                <button onClick={() => handleEdit(item.artist_id)}>Edit</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClickableList;
