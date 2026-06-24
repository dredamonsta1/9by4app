// src/components/Events/Events.jsx
import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";
import EventCreator from "../EventCreator/EventCreator";
import styles from "./Events.module.css";

function EventCard({ event, currentUserId, currentUserRole, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const isOwner = currentUserId === event.user_id;
  const isAdmin = currentUserRole === "admin";

  const handleDelete = async () => {
    if (!window.confirm("Delete this event?")) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/events/${event.event_id}`);
      if (onDelete) onDelete();
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Failed to delete event.");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m));
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className={styles.eventCard}>
      {event.flyer_url && (
        <img src={event.flyer_url} alt={event.title} className={styles.flyerImage} />
      )}
      <div className={styles.eventBody}>
        <h3 className={styles.eventTitle}>{event.title}</h3>
        <div className={styles.eventMeta}>
          <span className={styles.eventDate}>{formatDate(event.event_date)}</span>
          {event.event_time && (
            <span className={styles.eventTime}>{formatTime(event.event_time)}</span>
          )}
        </div>
        {(event.venue || event.city) && (
          <p className={styles.eventLocation}>
            {[event.venue, event.city].filter(Boolean).join(", ")}
          </p>
        )}
        <p className={styles.eventPostedBy}>Posted by {event.username || `User ${event.user_id}`}</p>
        {(isOwner || isAdmin) && (
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "..." : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}

function Events() {
  const { user } = useSelector((state) => state.auth);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/events");
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>Upcoming Events</h1>

        {user && <EventCreator onEventCreated={fetchEvents} />}

        {error && <div className={styles.errorState}>{error}</div>}

        {loading ? (
          <div className={styles.loadingState}>Loading events...</div>
        ) : events.length === 0 ? (
          <div className={styles.emptyState}>No upcoming events. Be the first to add one!</div>
        ) : (
          <div className={styles.eventsList}>
            {events.map((ev) => (
              <EventCard
                key={ev.event_id}
                event={ev}
                currentUserId={user?.id}
                currentUserRole={user?.role}
                onDelete={fetchEvents}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;
