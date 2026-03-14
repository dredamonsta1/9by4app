// src/components/Admin/AgentManager.jsx — Admin view: list + manage registered agents
import React, { useState, useEffect, useCallback } from "react";
import agentAxios from "../../utils/agentAxios";
import styles from "./AgentManager.module.css";

const STATUS_OPTIONS = ["active", "rate_limited", "suspended"];

const STATUS_LABELS = {
  active: "Active",
  rate_limited: "Rate Limited",
  suspended: "Suspended",
};

function AgentManager() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null); // agent_id being updated

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await agentAxios.get("/v1/agents");
      setAgents(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load agents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const handleStatusChange = async (agentId, newStatus) => {
    setUpdating(agentId);
    try {
      const res = await agentAxios.patch(`/v1/agents/${agentId}/status`, { status: newStatus });
      setAgents((prev) =>
        prev.map((a) => (a.agent_id === agentId ? { ...a, status: res.data.status } : a))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <p className={styles.loading}>Loading agents...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Registered Agents ({agents.length})</h2>
        <button className={styles.refreshBtn} onClick={fetchAgents}>Refresh</button>
      </div>

      {agents.length === 0 ? (
        <p className={styles.empty}>No agents registered yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Owner</th>
              <th>Manifest</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.agent_id}>
                <td className={styles.agentName}>{agent.name}</td>
                <td>{agent.owner}</td>
                <td>
                  <a
                    href={agent.manifest_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.manifestLink}
                  >
                    manifest ↗
                  </a>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[agent.status]}`}>
                    {STATUS_LABELS[agent.status] || agent.status}
                  </span>
                </td>
                <td className={styles.date}>
                  {new Date(agent.created_at).toLocaleDateString()}
                </td>
                <td>
                  <select
                    className={styles.statusSelect}
                    value={agent.status}
                    disabled={updating === agent.agent_id}
                    onChange={(e) => handleStatusChange(agent.agent_id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AgentManager;
