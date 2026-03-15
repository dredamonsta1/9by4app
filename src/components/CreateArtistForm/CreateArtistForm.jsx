import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./CreateArtistForm.module.css";

const emptyAlbum = () => ({ album_name: "", year: "", certifications: "" });

const CreateArtistForm = () => {
  const { user } = useSelector((state) => state.auth);
  const [tierStatus, setTierStatus] = useState(null); // null = loading, 'creator' | 'free'

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") { setTierStatus("creator"); return; }
    axiosInstance.get("/payments/status")
      .then((res) => setTierStatus(res.data.creator_tier))
      .catch(() => setTierStatus("free"));
  }, [user]);

  const [artistName, setArtistName] = useState("");
  const [artistGenre, setArtistGenre] = useState("");
  const [mixtape, setMixtape] = useState("");
  const [artistImage, setArtistImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Set after artist is created — unlocks album section
  const [createdArtistId, setCreatedArtistId] = useState(null);

  // Album rows state
  const [albumRows, setAlbumRows] = useState([emptyAlbum()]);
  const [albumMessage, setAlbumMessage] = useState("");
  const [savingAlbums, setSavingAlbums] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let imageUrl = null;
      if (artistImage) {
        const formData = new FormData();
        formData.append("artistImage", artistImage);
        const uploadResponse = await axiosInstance.post(
          "/artists/upload-image",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        imageUrl = uploadResponse.data.imageUrl;
      }

      const artistData = {
        artist_name: artistName,
        genre: artistGenre,
        mixtape: mixtape,
        count: 0,
        image_url: imageUrl,
        aka: "",
        state: "",
        region: "",
        label: "",
        album: "",
        year: 0,
        certifications: "",
      };

      const res = await axiosInstance.post("/artists", artistData);
      const newId = res.data.artist?.artist_id ?? res.data.artist_id;
      setCreatedArtistId(newId);
      setMessage("Artist created! Now add albums below.");
      setArtistName("");
      setArtistGenre("");
      setMixtape("");
      setArtistImage(null);
      document.getElementById("artistImageInput").value = "";
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create artist.");
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (index, field, value) => {
    setAlbumRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => setAlbumRows((rows) => [...rows, emptyAlbum()]);

  const removeRow = (index) =>
    setAlbumRows((rows) => rows.filter((_, i) => i !== index));

  const handleSaveAlbums = async () => {
    const valid = albumRows.filter((r) => r.album_name.trim());
    if (!valid.length) {
      setAlbumMessage("Enter at least one album name.");
      return;
    }
    setSavingAlbums(true);
    setAlbumMessage("");
    try {
      const payload = valid.map((r) => ({
        album_name: r.album_name.trim(),
        year: r.year ? parseInt(r.year) : null,
        certifications: r.certifications.trim() || null,
      }));
      await axiosInstance.post(`/artists/${createdArtistId}/albums`, payload);
      setAlbumMessage(`${valid.length} album(s) saved!`);
      setAlbumRows([emptyAlbum()]);
    } catch (err) {
      setAlbumMessage(err.response?.data?.message || "Failed to save albums.");
    } finally {
      setSavingAlbums(false);
    }
  };

  if (!user) return null;

  if (tierStatus === null) {
    return <p className={styles.tierLoading}>Checking account status...</p>;
  }

  if (tierStatus !== "creator") {
    return (
      <div className={styles.upgradeBox}>
        <h2 className={styles.title}>Create New Artist</h2>
        <p className={styles.upgradeText}>
          Adding artists requires a <strong>Creator account</strong>.
        </p>
        <Link to="/pricing" className={styles.upgradeBtn}>
          View Creator Plans →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <form className={styles.createArtistForm} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Create New Artist</h2>

        {message && (
          <p className={message.includes("created") ? styles.success : styles.error}>
            {message}
          </p>
        )}

        <div>
          <label className={styles.fieldLabel}>Artist Name</label>
          <input
            className={styles.fieldInput}
            type="text"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Genre</label>
          <input
            className={styles.fieldInput}
            type="text"
            value={artistGenre}
            onChange={(e) => setArtistGenre(e.target.value)}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Mixtape</label>
          <input
            className={styles.fieldInput}
            type="text"
            placeholder="e.g. So Far Gone"
            value={mixtape}
            onChange={(e) => setMixtape(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Artist Image</label>
          <input
            className={styles.fieldInput}
            type="file"
            id="artistImageInput"
            onChange={(e) => setArtistImage(e.target.files[0])}
            accept="image/*"
          />
        </div>

        <button
          className={styles.createArtistSubmitButton}
          type="submit"
          disabled={loading || !!createdArtistId}
        >
          {loading ? "Creating..." : createdArtistId ? "Artist Created ✓" : "Create Artist"}
        </button>
      </form>

      {/* Album Manager — revealed after artist is created */}
      {createdArtistId && (
        <div className={styles.albumSection}>
          <h3 className={styles.albumSectionTitle}>Add Albums</h3>
          <p className={styles.albumSectionHint}>
            Add discography below. Only Album Name is required.
          </p>

          {albumRows.map((row, i) => (
            <div key={i} className={styles.albumRow}>
              <input
                className={styles.albumNameInput}
                type="text"
                placeholder="Album name *"
                value={row.album_name}
                onChange={(e) => updateRow(i, "album_name", e.target.value)}
              />
              <input
                className={styles.albumSmallInput}
                type="number"
                placeholder="Year"
                value={row.year}
                onChange={(e) => updateRow(i, "year", e.target.value)}
                min="1900"
                max="2099"
              />
              <input
                className={styles.albumSmallInput}
                type="text"
                placeholder="Certifications"
                value={row.certifications}
                onChange={(e) => updateRow(i, "certifications", e.target.value)}
              />
              {albumRows.length > 1 && (
                <button
                  className={styles.removeRowBtn}
                  type="button"
                  onClick={() => removeRow(i)}
                  aria-label="Remove row"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button className={styles.addRowBtn} type="button" onClick={addRow}>
            + Add Another Album
          </button>

          {albumMessage && (
            <p className={albumMessage.includes("saved") ? styles.success : styles.error}>
              {albumMessage}
            </p>
          )}

          <div className={styles.albumActions}>
            <button
              className={styles.saveAlbumsBtn}
              type="button"
              onClick={handleSaveAlbums}
              disabled={savingAlbums}
            >
              {savingAlbums ? "Saving..." : "Save Albums"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateArtistForm;
