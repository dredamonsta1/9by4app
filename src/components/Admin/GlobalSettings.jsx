// src/components/Admin/GlobalSettings.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./GlobalSettings.module.css";

const SETTINGS_META = {
  waitlist_enabled: {
    label: "Waitlist open",
    description: "Allow new signups on the waitlist page.",
    type: "toggle",
  },
  agent_posts_enabled: {
    label: "Agent posts in feed",
    description: "Show automated agent/RSS posts in the main feed.",
    type: "toggle",
  },
  agent_penalty_hours: {
    label: "Agent post penalty (hours)",
    description: "Agent posts are ranked as if they're this many hours older than human posts.",
    type: "number",
    min: 0,
    max: 72,
  },
  feed_limit: {
    label: "Feed page size",
    description: "Max number of posts returned per feed request.",
    type: "number",
    min: 10,
    max: 200,
  },
};

function GlobalSettings() {
  const [settings, setSettings] = useState(null);
  const [draft, setDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance.get("/admin/settings")
      .then((res) => {
        setSettings(res.data);
        setDraft(res.data);
      })
      .catch(() => setError("Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key) => {
    setDraft((d) => ({ ...d, [key]: d[key] === "true" ? "false" : "true" }));
  };

  const handleNumber = (key, val) => {
    setDraft((d) => ({ ...d, [key]: String(val) }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await axiosInstance.patch("/admin/settings", draft);
      setSettings(res.data);
      setDraft(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const isDirty = settings && JSON.stringify(draft) !== JSON.stringify(settings);

  if (loading) return <p className={styles.loading}>Loading settings...</p>;
  if (error && !settings) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Global Settings</h2>
        <div className={styles.headerActions}>
          {saved && <span className={styles.savedMsg}>Saved</span>}
          {error && <span className={styles.errorMsg}>{error}</span>}
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving || !isDirty}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className={styles.settingsList}>
        {Object.entries(SETTINGS_META).map(([key, meta]) => (
          <div key={key} className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>{meta.label}</span>
              <span className={styles.settingDesc}>{meta.description}</span>
            </div>
            <div className={styles.settingControl}>
              {meta.type === "toggle" ? (
                <button
                  className={`${styles.toggle} ${draft[key] === "true" ? styles.toggleOn : styles.toggleOff}`}
                  onClick={() => handleToggle(key)}
                  role="switch"
                  aria-checked={draft[key] === "true"}
                >
                  <span className={styles.toggleThumb} />
                </button>
              ) : (
                <input
                  className={styles.numberInput}
                  type="number"
                  min={meta.min}
                  max={meta.max}
                  value={draft[key] ?? ""}
                  onChange={(e) => handleNumber(key, e.target.value)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GlobalSettings;
