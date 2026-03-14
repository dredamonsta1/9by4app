// src/components/Admin/UserAudit.jsx
import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./UserAudit.module.css";

const ROLE_OPTIONS = ["user", "admin", "agent"];

function UserAudit() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchUsers = useCallback(async (q = search) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`/admin/users?search=${encodeURIComponent(q)}&limit=100`);
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchUsers(""); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      const res = await axiosInstance.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, role: res.data.role } : u));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role.");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    setDeleting(userId);
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      setTotal((t) => t - 1);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>User Audit <span className={styles.count}>({total})</span></h2>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn}>Search</button>
          {search && (
            <button type="button" className={styles.clearBtn} onClick={() => { setSearch(""); fetchUsers(""); }}>
              Clear
            </button>
          )}
        </form>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <p className={styles.loading}>Loading users...</p>
      ) : users.length === 0 ? (
        <p className={styles.empty}>No users found.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Posts</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id}>
                  <td className={styles.idCol}>{u.user_id}</td>
                  <td className={styles.username}>{u.username}</td>
                  <td className={styles.email}>{u.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[u.role]}`}>{u.role}</span>
                  </td>
                  <td className={styles.count}>{u.post_count}</td>
                  <td className={styles.date}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className={styles.actions}>
                    <select
                      className={styles.roleSelect}
                      value={u.role}
                      disabled={updating === u.user_id}
                      onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <button
                      className={styles.deleteBtn}
                      disabled={deleting === u.user_id}
                      onClick={() => handleDelete(u.user_id, u.username)}
                    >
                      {deleting === u.user_id ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserAudit;
