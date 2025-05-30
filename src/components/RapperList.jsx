// import React, { useState, useEffect } from "react";
// import "./RapperList.css";
// // import axios from "axios"; // Import axios for delete/edit actions
// import ArtistCard from "./ArtistCard";
// import axiosInstance from "../utils/axiosInstance"; // For authenticated actions

// // Add showCloutButton to the destructured props
// const ClickableList = ({ showAdminActions, showCloutButton }) => {
//   const [items, setItems] = useState([]); // To store the fetched data
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   // Fetching data
//   useEffect(() => {
//     setLoading(true);
//     fetch("https://ninebyfourapi.herokuapp.com/api", { method: "GET" })
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

//   // Handle Clout button click
//   const handleClick = (index) => {
//     const newItems = items.map((item, i) =>
//       i === index ? { ...item, count: item.count + 1 } : item
//     );
//     const sortedItems = [...newItems].sort((a, b) => b.count - a.count);
//     setItems(sortedItems);
//   };

//   // Handle Delete Action
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

//   // Handle Edit Action (placeholder)
//   const handleEdit = (artistId) => {
//     alert(`Editing artist with ID: ${artistId}`);
//   };

//   return (
//     <div className="rapperList-outter-div">
//       <ul className="rapperList">
//         {items.map((item, index) => (
//           <li
//             className="rapperList-item"
//             key={item.artist_id}
//             style={{ marginBottom: "10px" }}
//           >
//             {/* Display the image if image_url exists */}
//             {item.image_url && (
//               <img
//                 src={item.image_url} // Use the image_url from the backend
//                 alt={item.name}
//                 style={{
//                   width: "100px",
//                   height: "100px",
//                   objectFit: "cover",
//                   marginRight: "10px",
//                   borderRadius: "5px",
//                 }}
//               />
//             )}
//             {/* CONDITIONAL RENDERING OF CLOUT BUTTON */}
//             {showCloutButton ? (
//               <button
//                 className="rapperButton"
//                 onClick={() => handleClick(index)}
//               >
//                 Clout: {item.count}
//               </button>
//             ) : (
//               // Just display the clout data if the button is hidden
//               <span className="clout-data-display">Clout: {item.count}</span>
//             )}
//             name: {item.name || " N/A "}, genre: {item.genre || " N/A "}, state:
//             {/* {item.state || "N/A "}, {item.state || " N/A "} */}
//             {/* region: {item.region || " N/A "}, label: {item.label || " N/A "}, */}
//             {/* album: {item.album || " N/A "}, year: {item.year || " N/A "} */}
//             {/* Admin Action Buttons - Conditional rendering (from previous step) */}
//             {showAdminActions && (
//               <div style={{ display: "inline-block", marginLeft: "15px" }}>
//                 <button
//                   onClick={() => handleDelete(item.artist_id)}
//                   style={{
//                     backgroundColor: "red",
//                     color: "white",
//                     marginRight: "5px",
//                     padding: "5px 10px",
//                     border: "none",
//                     borderRadius: "3px",
//                     cursor: "pointer",
//                   }}
//                 >
//                   Delete
//                 </button>
//                 <button
//                   onClick={() => handleEdit(item.artist_id)}
//                   style={{
//                     backgroundColor: "orange",
//                     color: "white",
//                     padding: "5px 10px",
//                     border: "none",
//                     borderRadius: "3px",
//                     cursor: "pointer",
//                   }}
//                 >
//                   Edit
//                 </button>
//               </div>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ClickableList;

import React, { useState, useEffect } from "react";
import "./RapperList.css";
import axiosInstance from "../utils/axiosInstance";

const ClickableList = ({ showAdminActions, showCloutButton }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_BASE_URL = "https://ninebyfourapi.herokuapp.com"; // Your API Base URL

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api`, { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        const itemsWithCount = (
          Array.isArray(data.rappers) ? data.rappers : [data.rappers]
        ).map((item) => ({ count: item.count || 0, ...item }));
        setItems(itemsWithCount);
        setLoading(false);
        console.log(data.rappers);
      })
      .catch((error) => {
        console.error("fetching data:", error);
        setError(true);
        setLoading(false);
        if (error.response) {
          console.log("Error response:", error.response.data);
        } else if (error.request) {
          console.log("Request error:", error.request);
        } else {
          console.log("General error:", error.message);
        }
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data</p>;

  const handleClick = (index) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, count: item.count + 1 } : item
    );
    const sortedItems = [...newItems].sort((a, b) => b.count - a.count);
    setItems(sortedItems);
  };

  const handleDelete = async (artistId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this artist?"
    );
    if (!confirmDelete) return;

    try {
      const response = await axiosInstance.delete(`/api?artist_id=${artistId}`);
      alert(response.data.message);
      setItems(items.filter((item) => item.artist_id !== artistId));
    } catch (err) {
      console.error(
        "Error deleting artist:",
        err.response?.data || err.message
      );
      alert(err.response?.data?.message || "Failed to delete artist.");
    }
  };

  const handleEdit = (artistId) => {
    alert(`Editing artist with ID: ${artistId}`);
  };

  return (
    <div className="rapperList-outter-div">
      <ul className="rapperList">
        {items.map((item, index) => (
          <li
            className="rapperList-item" // Apply main card styling
            key={item.artist_id}
          >
            {/* Artist Name and Genre */}
            <div className="rapperList-item-details">
              <h3>{item.name || "N/A"}</h3>
              <p>Genre: {item.genre || "N/A"}</p>
            </div>

            {/* Section for Image and Clout Item - This is the primary row */}
            <div className="rapperList-item-clout-section">
              {item.image_url && (
                <img
                  src={`<span class="math-inline">\{API\_BASE\_URL\}</span>{item.image_url}`} // Construct full URL
                  alt={item.name || "Artist"}
                  className="rapperList-item-image" // Apply image styling
                />
              )}

              {showCloutButton ? (
                <button
                  className="rapperButton"
                  onClick={() => handleClick(index)}
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
