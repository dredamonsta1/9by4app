// import React, { useState, useEffect } from "react";
// import "./RapperList.css";
// // import axios from "axios";
// // import {RapperCloutButton} from '../RapperCloutButton';

// const ClickableList = (props) => {
//   const [items, setItems] = useState([]); // To store the fetched data
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);
//   // Initialize the list with an array of objects containing strings and a count of 0
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

//         // axios
//         //   .get("https://ninebyfourapi.herokuapp.com/api", { method: "GET" })
//         //   .then((res) => {
//         //     const data = Array.isArray(res.data) ? res.data : [res.data];
//         //     setItems(data);
//         // console.log(data);

//         // console.log("User Agent:", navigator.userAgent);
//         // console.log("Location:", window.location.href);

//         // console.log(res.data);
//       })
//       .catch((error) => {
//         console.error("fetching data:", error);
//         setError(true);
//         setLoading(false);
//         if (error.res) {
//           console.log("Error response:", error.res.data);
//         } else if (error.req) {
//           console.log("Request error:", error.req);
//         } else {
//           console.log("General error:", error.message);
//         }
//       });
//   }, []);

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error fetching data</p>;

//   // Handle button click component
//   const handleClick = (index) => {
//     const newItems = items.map((item, i) =>
//       i === index ? { ...item, count: item.count + 1 } : item
//     );
//     //sort without mutating
//     const sortedItems = [...newItems].sort((a, b) => b.count - a.count);
//     setItems(sortedItems);

//     console.log(items);
//   };

//   return (
//     <div className="rapperList-outter-div">
//       {/* <h2 className="header-size-two">Pass Da Aux</h2> */}
//       <ul className="rapperList">
//         {items.map((item, index) => (
//           <li
//             className="rapperList-item"
//             key={item.artist_id}
//             style={{ marginBottom: "10px" }}
//           >
//             <button className="rapperButton" onClick={() => handleClick(index)}>
//               Clout: {item.count}
//             </button>
//             name: {item.name || " N/A "}, genre: {item.genre || " N/A "}, state:
//             {/* {item.state || "N/A "}, {item.state || " N/A "} */}
//             {/* region: {item.region || " N/A "}, label: {item.label || " N/A "}, */}
//             {/* album: {item.album || " N/A "}, year: {item.year || " N/A "} */}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ClickableList;

import React, { useState, useEffect } from "react";
import "./RapperList.css";
// import axios from "axios"; // Import axios for delete/edit actions
import axiosInstance from "../utils/axiosInstance"; // For authenticated actions

// Add showCloutButton to the destructured props
const ClickableList = ({ showAdminActions, showCloutButton }) => {
  const [items, setItems] = useState([]); // To store the fetched data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetching data
  useEffect(() => {
    setLoading(true);
    fetch("https://ninebyfourapi.herokuapp.com/api", { method: "GET" })
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

  // Handle Clout button click
  const handleClick = (index) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, count: item.count + 1 } : item
    );
    const sortedItems = [...newItems].sort((a, b) => b.count - a.count);
    setItems(sortedItems);
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
      setItems(items.filter((item) => item.artist_id !== artistId));
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
        {items.map((item, index) => (
          <li
            className="rapperList-item"
            key={item.artist_id}
            style={{ marginBottom: "10px" }}
          >
            {/* Display the image if image_url exists */}
            {item.image_url && (
              <img
                src={item.image_url} // Use the image_url from the backend
                alt={item.name}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  marginRight: "10px",
                  borderRadius: "5px",
                }}
              />
            )}
            {/* CONDITIONAL RENDERING OF CLOUT BUTTON */}
            {showCloutButton ? (
              <button
                className="rapperButton"
                onClick={() => handleClick(index)}
              >
                Clout: {item.count}
              </button>
            ) : (
              // Just display the clout data if the button is hidden
              <span className="clout-data-display">Clout: {item.count}</span>
            )}
            name: {item.name || " N/A "}, genre: {item.genre || " N/A "}, state:
            {/* {item.state || "N/A "}, {item.state || " N/A "} */}
            {/* region: {item.region || " N/A "}, label: {item.label || " N/A "}, */}
            {/* album: {item.album || " N/A "}, year: {item.year || " N/A "} */}
            {/* Admin Action Buttons - Conditional rendering (from previous step) */}
            {showAdminActions && (
              <div style={{ display: "inline-block", marginLeft: "15px" }}>
                <button
                  onClick={() => handleDelete(item.artist_id)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    marginRight: "5px",
                    padding: "5px 10px",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => handleEdit(item.artist_id)}
                  style={{
                    backgroundColor: "orange",
                    color: "white",
                    padding: "5px 10px",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClickableList;
