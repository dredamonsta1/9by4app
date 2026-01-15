import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
// FIX #1: You MUST import toast to use it
import { toast } from "react-toastify";

const WaitlistAdmin = () => {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIX #2: You MUST call the fetch function when the component mounts
  useEffect(() => {
    const loadData = async () => {
      await fetchWaitlist();
      setLoading(false);
    };
    loadData();
  }, []); // Empty dependency array means "run once on load"

  const fetchWaitlist = async () => {
    try {
      const res = await axiosInstance.get("/admin/waitlist-entries");
      setWaitlist(res.data);
    } catch (err) {
      toast.error("Failed to load waitlist.");
    }
  };

  const handleApprove = async (email) => {
    try {
      const response = await axiosInstance.patch("/admin/approve-creator", {
        email,
      });
      toast.success(response.data.message);
      fetchWaitlist();
    } catch (err) {
      toast.error("Approval failed.");
    }
  };

  const handleReset = async (email) => {
    if (
      !window.confirm(`Are you sure you want to PERMANENTLY delete ${email}?`)
    )
      return;

    try {
      const response = await axiosInstance.delete("/admin/reset-user", {
        data: { email },
      });
      toast.info(response.data.message);
      fetchWaitlist();
    } catch (err) {
      toast.error("Reset failed. Check console.");
    }
  };

  if (loading)
    return (
      <div style={{ color: "white", padding: "20px" }}>
        Loading Control Room...
      </div>
    );

  return (
    <div
      className="admin-table"
      style={{ padding: "20px", background: "#0a0a0a", minHeight: "100vh" }}
    >
      <h2 style={{ color: "white" }}>Waitlist Management</h2>

      {waitlist.length === 0 ? (
        <p style={{ color: "#666", marginTop: "20px" }}>
          No one is on the waitlist yet.
        </p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            color: "white",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #333", textAlign: "left" }}>
              <th style={{ padding: "12px" }}>Name</th>
              <th style={{ padding: "12px" }}>Email</th>
              <th style={{ padding: "12px" }}>Status</th>
              <th style={{ padding: "12px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {waitlist.map((entry) => (
              <tr key={entry.email} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: "12px" }}>{entry.full_name}</td>
                <td style={{ padding: "12px" }}>{entry.email}</td>
                <td style={{ padding: "12px" }}>
                  <span
                    style={{
                      color: entry.status === "pending" ? "#ffcc00" : "#00e676",
                      fontWeight: "bold",
                    }}
                  >
                    {entry.status.toUpperCase()}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {entry.status === "pending" ? (
                    <button
                      onClick={() => handleApprove(entry.email)}
                      style={{
                        background: "#fff",
                        color: "#000",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Approve & Email
                    </button>
                  ) : (
                    <code
                      style={{
                        background: "#333",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {entry.invite_code || "Registered"}
                    </code>
                  )}

                  <button
                    onClick={() => handleReset(entry.email)}
                    style={{
                      background: "#ff4d4d",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Wipe User
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WaitlistAdmin;
