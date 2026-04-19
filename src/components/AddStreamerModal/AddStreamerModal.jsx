// src/components/AddStreamerModal/AddStreamerModal.jsx
import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./AddStreamerModal.module.css";

const PLATFORMS  = ["twitch", "youtube", "kick", "tiktok", "cratesfyi"];
const CATEGORIES = ["Gaming", "Music", "IRL", "Sports", "Podcasts"];

const AddStreamerModal = ({ onClose, onAdded }) => {
  const [form, setForm] = useState({
    name:       "",
    platform:   "",
    stream_url: "",
    category:   "",
    image_url:  "",
    bio:        "",
  });
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axiosInstance.post("/streamers", {
        name:       form.name.trim(),
        platform:   form.platform,
        stream_url: form.stream_url.trim(),
        category:   form.category || null,
        image_url:  form.image_url.trim() || null,
        bio:        form.bio.trim() || null,
      });
      onAdded(res.data.streamer);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add streamer.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = form.name.trim() && form.platform && form.stream_url.trim();

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add a Streamer</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Name */}
          <div className={styles.field}>
            <label className={styles.label}>Streamer Name <span className={styles.req}>*</span></label>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. Ninja, MrBeast, Pokimane"
              value={form.name}
              onChange={set("name")}
              maxLength={255}
            />
          </div>

          {/* Platform */}
          <div className={styles.field}>
            <label className={styles.label}>Platform <span className={styles.req}>*</span></label>
            <div className={styles.platformPills}>
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.platformPill} ${form.platform === p ? styles.platformPillActive : ""}`}
                  onClick={() => setForm(prev => ({ ...prev, platform: p }))}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Stream URL */}
          <div className={styles.field}>
            <label className={styles.label}>Stream URL <span className={styles.req}>*</span></label>
            <input
              className={styles.input}
              type="url"
              placeholder="https://twitch.tv/username"
              value={form.stream_url}
              onChange={set("stream_url")}
            />
          </div>

          {/* Category */}
          <div className={styles.field}>
            <label className={styles.label}>Category <span className={styles.opt}>(optional)</span></label>
            <div className={styles.platformPills}>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.platformPill} ${form.category === c ? styles.platformPillActive : ""}`}
                  onClick={() => setForm(prev => ({ ...prev, category: prev.category === c ? "" : c }))}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Image URL */}
          <div className={styles.field}>
            <label className={styles.label}>Image URL <span className={styles.opt}>(optional)</span></label>
            <input
              className={styles.input}
              type="url"
              placeholder="https://..."
              value={form.image_url}
              onChange={set("image_url")}
            />
          </div>

          {/* Bio */}
          <div className={styles.field}>
            <label className={styles.label}>Bio <span className={styles.opt}>(optional)</span></label>
            <textarea
              className={styles.textarea}
              placeholder="Short description..."
              value={form.bio}
              onChange={set("bio")}
              maxLength={300}
              rows={3}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!canSubmit || loading}
          >
            {loading ? "Adding..." : "Add Streamer"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStreamerModal;
