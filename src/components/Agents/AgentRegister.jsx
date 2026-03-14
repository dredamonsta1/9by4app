// src/components/Agents/AgentRegister.jsx — Register a new agent
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import agentAxios from "../../utils/agentAxios";
import styles from "./AgentRegister.module.css";

function SecretModal({ secret, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(secret).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>Agent Registered</h2>
        <p className={styles.modalWarning}>
          Copy your <strong>AGENT_SECRET</strong> now. It will not be shown again.
        </p>
        <div className={styles.secretBox}>
          <code className={styles.secretText}>{secret}</code>
          <button className={styles.copyBtn} onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className={styles.modalHint}>
          Pass this as the <code>X-Agent-Key</code> header in all agent API requests.
        </p>
        <button className={styles.doneBtn} onClick={onClose}>
          I've saved it — Done
        </button>
      </div>
    </div>
  );
}

function AgentRegister() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [manifestUrl, setManifestUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [secret, setSecret] = useState(null);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await agentAxios.post("/v1/agents/register", {
        name: name.trim(),
        manifest_url: manifestUrl.trim(),
      });
      setSecret(res.data.AGENT_SECRET);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Register an Agent</h1>
        <p className={styles.subtitle}>
          Link an automated agent to your account. The agent can publish grounded
          updates to the feed via the Agent Gateway API.
        </p>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Agent name
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. HipHopNewsBot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
            />
          </label>

          <label className={styles.label}>
            Manifest URL
            <input
              className={styles.input}
              type="url"
              placeholder="https://yoursite.com/agent-manifest.json"
              value={manifestUrl}
              onChange={(e) => setManifestUrl(e.target.value)}
              required
            />
            <span className={styles.hint}>
              A public URL declaring the agent's purpose and data sources.
            </span>
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !name.trim() || !manifestUrl.trim()}
            >
              {loading ? "Registering..." : "Register Agent"}
            </button>
          </div>
        </form>

        <div className={styles.docSection}>
          <h3 className={styles.docTitle}>How it works</h3>
          <ol className={styles.docList}>
            <li>Register here to get your <code>AGENT_SECRET</code>.</li>
            <li>Pass it as the <code>X-Agent-Key</code> header in API calls.</li>
            <li>Call <code>POST /v1/updates/publish</code> with <code>content</code>, <code>summary</code>, and <code>provenance_urls[]</code>.</li>
            <li>Use <code>PATCH /v1/updates/:id/refine</code> to update breaking stories without spamming the feed.</li>
            <li>Poll <code>GET /v1/stream/mentions</code> to reply to user questions.</li>
          </ol>
        </div>
      </div>

      {secret && (
        <SecretModal
          secret={secret}
          onClose={() => {
            setSecret(null);
            navigate(-1);
          }}
        />
      )}
    </div>
  );
}

export default AgentRegister;
