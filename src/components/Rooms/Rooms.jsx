// src/components/Rooms/Rooms.jsx — Live rooms lobby (WebRTC)
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./Rooms.module.css";

function CreateRoomModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post("/rooms", { title: title.trim(), description: description.trim() });
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Start a Room</h2>
        {error && <div className={styles.errorMsg}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            placeholder="Room title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            maxLength={120}
          />
          <textarea
            className={styles.textarea}
            placeholder="What's this room about? (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={300}
          />
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.goLiveBtn} disabled={loading}>
              {loading ? "Creating..." : "Go Live"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoomCard({ room, onClick }) {
  return (
    <div className={styles.roomCard} onClick={onClick}>
      <div className={styles.liveIndicator}><span className={styles.liveDot} />LIVE</div>
      <h3 className={styles.roomTitle}>{room.title}</h3>
      {room.description && <p className={styles.roomDescription}>{room.description}</p>}
      <div className={styles.roomMeta}>
        <span className={styles.hostLabel}>Host: {room.host_username}</span>
        <span className={styles.participantCount}>
          {room.participant_count > 0 ? `${room.participant_count} listening` : "Be the first"}
        </span>
      </div>
    </div>
  );
}

function Rooms() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/rooms");
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 15000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const handleRoomCreated = (room) => {
    setShowCreate(false);
    navigate(`/rooms/${room.room_id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Live Rooms</h1>
          {user && <button className={styles.startBtn} onClick={() => setShowCreate(true)}>+ Start Room</button>}
        </div>

        {error && <div className={styles.errorState}>{error}</div>}

        {loading ? (
          <div className={styles.loadingState}>Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No live rooms right now.</p>
            {user && <button className={styles.startBtn} onClick={() => setShowCreate(true)}>Be the first to go live</button>}
          </div>
        ) : (
          <div className={styles.roomsGrid}>
            {rooms.map((room) => (
              <RoomCard key={room.room_id} room={room} onClick={() => navigate(`/rooms/${room.room_id}`)} />
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} onCreated={handleRoomCreated} />}
    </div>
  );
}

export default Rooms;
