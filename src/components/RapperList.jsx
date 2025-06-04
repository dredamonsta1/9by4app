import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./RapperList.css";
import axiosInstance from "../utils/axiosInstance";
import { fetchArtists, incrementClout } from "../redux/actions/artistActions";

const ClickableList = ({ showAdminActions, showCloutButton }) => {
  const { artists, loading, error } = useSelector((state) => state.artists);
  const dispatch = useDispatch();

  const API_BASE_URL = "https://ninebyfourapi.herokuapp.com";

  useEffect(() => {
    if (!loading && !artists.length && !error) {
      dispatch(fetchArtists());
    }
  }, [dispatch, loading, artists.length, error]);

  if (loading) return <p>Loading artists...</p>;
  if (error)
    return <p style={{ color: "red" }}>Error fetching data: {error}</p>;

  const handleCloutClick = (artistId) => {
    dispatch(incrementClout(artistId));
  };

  const handleDelete = async (artistId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this artist?"
    );
    if (!confirmDelete) return;

    try {
      // Corrected endpoint for DELETE, assuming it needs '/api/rappers' as a base
      // and then the artist_id as a parameter or segment.
      // If your DELETE endpoint is truly '/api?artist_id=...', keep that.
      // But based on the PUT request, it's more likely /api/rappers/:id
      const response = await axiosInstance.delete(`/rappers/${artistId}`); // Adjusted DELETE endpoint
      alert(response.data.message);
      dispatch(fetchArtists());
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
        {artists.map((item) => (
          <li className="rapperList-item" key={item.artist_id}>
            {/* Image must be a direct child and will be absolutely positioned */}
            {item.image_url && (
              <img
                src={`${API_BASE_URL}${item.image_url}`}
                alt={item.name || "Artist"}
                className="rapperList-item-image" // This class has absolute positioning
              />
            )}

            {/* All content overlaid on the image goes inside this new wrapper */}
            <div className="rapperList-content-overlay">
              {/* Artist Name and Genre */}
              <div className="rapperList-item-details">
                <h3>{item.name || "N/A"}</h3>
                <p>Genre: {item.genre || "N/A"}</p>
              </div>

              {/* Section for Clout Item (image removed from here) */}
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

              {/* Admin Action Buttons */}
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
