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
      "Are you sure you want to delete this artist?",
    );
    if (!confirmDelete) return;
    // Note: The delete/edit logic might be better handled in the parent page
    // to keep this component purely for display.
    console.log("Deleting artist with ID:", artistId);
    alert("Delete functionality would be handled here.");
  };

  const handleEdit = (artistId) => {
    console.log("Editing artist with ID:", artistId);
    alert(`Editing artist with ID: ${artistId}`);
  };

  return (
    <div className="rapperList-outter-div">
      <ul className="rapperList">
        {artists.map((item) => (
          <li className="rapperList-item" key={item.artist_id}>
            {item.image_url && (
              <img
                src={
                  `${API_BASE_URL}${item.image_url}` ||
                  "https://via.placeholder.com/60?text=No+Image"
                }
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
