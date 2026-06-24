import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./EventCreator.module.css";

// Self-contained event-create form. Lifted out of Events.jsx so the
// ArtistPanel sidebar can also embed it. POSTs multipart to /events
// — backend pulls user_id from the JWT, so verified-artist owners
// posting from their own panel will land via the artist_id filter
// on /events?artist_id=N.
const EventCreator = ({ onEventCreated, compact = false }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [flyer, setFlyer] = useState(null);
  const [flyerPreview, setFlyerPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFlyerChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFlyer(f);
      setFlyerPreview(URL.createObjectURL(f));
    }
  };

  const clearFlyer = () => {
    setFlyer(null);
    setFlyerPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !eventDate) {
      setError("Title and date are required.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("event_date", eventDate);
      if (eventTime) formData.append("event_time", eventTime);
      if (venue.trim()) formData.append("venue", venue.trim());
      if (city.trim()) formData.append("city", city.trim());
      if (flyer) formData.append("flyer", flyer);

      await axiosInstance.post("/events", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTitle("");
      setEventDate("");
      setEventTime("");
      setVenue("");
      setCity("");
      clearFlyer();
      setOpen(false);
      if (onEventCreated) onEventCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ""}`}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Cancel" : "+ Add Event"}
      </button>

      {open && (
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <input
            className={styles.input}
            type="text"
            placeholder="Event title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div className={styles.row}>
            <input
              className={styles.input}
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
            <input
              className={styles.input}
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />
          </div>
          <input
            className={styles.input}
            type="text"
            placeholder="Venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          {flyerPreview ? (
            <div className={styles.flyerPreview}>
              <img src={flyerPreview} alt="Flyer preview" />
              <button
                type="button"
                onClick={clearFlyer}
                className={styles.clearBtn}
              >
                Remove
              </button>
            </div>
          ) : (
            <label className={styles.fileLabel}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFlyerChange}
                className={styles.fileInput}
              />
              <span>Upload flyer (optional)</span>
            </label>
          )}

          <button
            type="submit"
            className={styles.submit}
            disabled={loading}
          >
            {loading ? "Creating…" : "Create Event"}
          </button>
        </form>
      )}
    </div>
  );
};

export default EventCreator;
