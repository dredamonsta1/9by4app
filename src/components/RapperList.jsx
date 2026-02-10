import React, { useState } from "react";
import { useDispatch } from "react-redux";
import "./RapperList.css";
import { incrementClout } from "../redux/actions/artistActions";

const ArtistModal = ({ artist, onClose }) => {
  const API_BASE_URL = "https://ninebyfourapi.herokuapp.com";
  const albums = artist.albums || [];

  return (
    <div className="artist-modal-overlay" onClick={onClose}>
      <div className="artist-modal" onClick={(e) => e.stopPropagation()}>
        <button className="artist-modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="artist-modal-header">
          {artist.image_url && (
            <img
              src={`${API_BASE_URL}${artist.image_url}`}
              alt={artist.name || "Artist"}
              className="artist-modal-image"
            />
          )}
          <div className="artist-modal-info">
            <h2>{artist.name || artist.artist_name || "N/A"}</h2>
            {artist.aka && <p className="artist-modal-aka">{artist.aka}</p>}
            <p>Genre: {artist.genre || "N/A"}</p>
            {artist.state && <p>State: {artist.state}</p>}
            {artist.label && <p>Label: {artist.label}</p>}
            <p className="artist-modal-clout">Clout: {artist.count || 0}</p>
          </div>
        </div>
        {albums.length > 0 && (
          <div className="artist-modal-albums">
            <h3>Albums</h3>
            <ul>
              {albums.map((album, i) => (
                <li key={album.album_id || i} className="artist-modal-album-item">
                  <span className="artist-modal-album-name">
                    {album.album_name}
                  </span>
                  {album.year && (
                    <span className="artist-modal-album-year">({album.year})</span>
                  )}
                  {(album.certifications || album.Certifications) && (
                    <span className="artist-modal-album-cert">
                      {album.certifications || album.Certifications}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const ClickableList = ({ artists, showAdminActions, showCloutButton }) => {
  const dispatch = useDispatch();
  const [selectedArtist, setSelectedArtist] = useState(null);

  const API_BASE_URL = "https://ninebyfourapi.herokuapp.com";

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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this artist?",
    );
    if (!confirmDelete) return;
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
          <li
            className="rapperList-item"
            key={item.artist_id}
            onClick={() => setSelectedArtist(item)}
          >
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloutClick(item.artist_id);
                    }}
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
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(item.artist_id); }}>
                    Delete
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(item.artist_id); }}>
                    Edit
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {selectedArtist && (
        <ArtistModal
          artist={selectedArtist}
          onClose={() => setSelectedArtist(null)}
        />
      )}
    </div>
  );
};

export default ClickableList;
