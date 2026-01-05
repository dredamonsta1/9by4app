// src/components/WaitlistAdmin/WaitlistAdmin.jsx
// import React, { useState, useEffect } from "react";
// import { Users, Check, X, Mail, Calendar, Search, Power } from "lucide-react";
// import axiosInstance from "../../utils/axiosInstance";
// import "./WaitlistAdmin.css";

// export default function WaitlistAdmin() {
//   const [waitlist, setWaitlist] = useState([]);
//   const [filter, setFilter] = useState("all");
//   const [search, setSearch] = useState("");
//   const [waitlistEnabled, setWaitlistEnabled] = useState(true);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchWaitlist();
//   }, [filter]);

//   const fetchWaitlist = async () => {
//     setLoading(true);
//     try {
//       const queryParam = filter !== "all" ? `?status=${filter}` : "";
//       const response = await axiosInstance.get(`/waitlist${queryParam}`);
//       setWaitlist(response.data);
//     } catch (error) {
//       console.error("Error fetching waitlist:", error);
//       alert("Failed to fetch waitlist. Make sure you are logged in as admin.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const approveUser = async (id) => {
//     try {
//       const response = await axiosInstance.post(`/waitlist/${id}/approve`);
//       alert(
//         `User approved! Invite code: ${response.data.invite_code}\n\nMake sure to send this to the user!`
//       );
//       fetchWaitlist();
//     } catch (error) {
//       console.error("Error approving user:", error);
//       alert("Failed to approve user");
//     }
//   };

//   const rejectUser = async (id) => {
//     const notes = prompt("Rejection reason (optional):");
//     try {
//       await axiosInstance.post(`/waitlist/${id}/reject`, { notes });
//       alert("User rejected");
//       fetchWaitlist();
//     } catch (error) {
//       console.error("Error rejecting user:", error);
//       alert("Failed to reject user");
//     }
//   };

//   const deleteUser = async (id) => {
//     if (!window.confirm("Delete this entry?")) return;
//     try {
//       await axiosInstance.delete(`/waitlist/${id}`);
//       alert("Entry deleted");
//       fetchWaitlist();
//     } catch (error) {
//       console.error("Error deleting entry:", error);
//       alert("Failed to delete entry");
//     }
//   };

//   const toggleWaitlist = async () => {
//     const newState = !waitlistEnabled;
//     try {
//       await axiosInstance.post("/waitlist/toggle", { enabled: newState });
//       setWaitlistEnabled(newState);
//       alert(`Waitlist ${newState ? "enabled" : "disabled"}`);
//     } catch (error) {
//       console.error("Error toggling waitlist:", error);
//       alert("Failed to toggle waitlist");
//     }
//   };

//   const copyInviteCode = (code) => {
//     navigator.clipboard.writeText(code);
//     alert("Invite code copied to clipboard!");
//   };

//   const filteredWaitlist = waitlist.filter(
//     (entry) =>
//       entry.email.toLowerCase().includes(search.toLowerCase()) ||
//       entry.full_name?.toLowerCase().includes(search.toLowerCase())
//   );

//   const stats = {
//     total: waitlist.length,
//     pending: waitlist.filter((e) => e.status === "pending").length,
//     approved: waitlist.filter((e) => e.status === "approved").length,
//     rejected: waitlist.filter((e) => e.status === "rejected").length,
//   };

//   return (
//     <div className="waitlist-admin-container">
//       <div className="waitlist-admin-content">
//         {/* Header */}
//         <div className="admin-header">
//           <div className="header-top">
//             <div className="header-title">
//               <Users className="title-icon" />
//               <h1>Waitlist Management</h1>
//             </div>

//             <button
//               onClick={toggleWaitlist}
//               className={`toggle-button ${waitlistEnabled ? "enabled" : "disabled"}`}
//             >
//               <Power className="button-icon" />
//               Waitlist {waitlistEnabled ? "ON" : "OFF"}
//             </button>
//           </div>

//           {/* Stats */}
//           <div className="stats-grid">
//             <div className="stat-card total">
//               <div className="stat-number">{stats.total}</div>
//               <div className="stat-label">Total Entries</div>
//             </div>
//             <div className="stat-card pending">
//               <div className="stat-number">{stats.pending}</div>
//               <div className="stat-label">Pending</div>
//             </div>
//             <div className="stat-card approved">
//               <div className="stat-number">{stats.approved}</div>
//               <div className="stat-label">Approved</div>
//             </div>
//             <div className="stat-card rejected">
//               <div className="stat-number">{stats.rejected}</div>
//               <div className="stat-label">Rejected</div>
//             </div>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="filters-section">
//           <div className="search-box">
//             <Search className="search-icon" />
//             <input
//               type="text"
//               placeholder="Search by email or name..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>

//           <div className="filter-buttons">
//             {["all", "pending", "approved", "rejected"].map((status) => (
//               <button
//                 key={status}
//                 onClick={() => setFilter(status)}
//                 className={filter === status ? "active" : ""}
//               >
//                 {status.charAt(0).toUpperCase() + status.slice(1)}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Waitlist Table */}
//         <div className="table-container">
//           {loading ? (
//             <div className="empty-state">Loading...</div>
//           ) : filteredWaitlist.length === 0 ? (
//             <div className="empty-state">No entries found</div>
//           ) : (
//             <table className="waitlist-table">
//               <thead>
//                 <tr>
//                   <th>User</th>
//                   <th>Status</th>
//                   <th>Requested</th>
//                   <th>Invite Code</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredWaitlist.map((entry) => (
//                   <tr key={entry.waitlist_id}>
//                     <td>
//                       <div className="user-cell">
//                         <Mail className="user-icon" />
//                         <div>
//                           <div className="user-name">
//                             {entry.full_name || "N/A"}
//                           </div>
//                           <div className="user-email">{entry.email}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td>
//                       <span className={`status-badge ${entry.status}`}>
//                         {entry.status}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="date-cell">
//                         <Calendar className="date-icon" />
//                         {new Date(entry.requested_at).toLocaleDateString()}
//                       </div>
//                     </td>
//                     <td>
//                       {entry.invite_code ? (
//                         <button
//                           onClick={() => copyInviteCode(entry.invite_code)}
//                           className="invite-code-button"
//                         >
//                           {entry.invite_code.slice(0, 12)}...
//                         </button>
//                       ) : (
//                         <span className="no-code">-</span>
//                       )}
//                     </td>
//                     <td>
//                       <div className="action-buttons">
//                         {entry.status === "pending" && (
//                           <>
//                             <button
//                               onClick={() => approveUser(entry.waitlist_id)}
//                               className="action-btn approve"
//                               title="Approve"
//                             >
//                               <Check />
//                             </button>
//                             <button
//                               onClick={() => rejectUser(entry.waitlist_id)}
//                               className="action-btn reject"
//                               title="Reject"
//                             >
//                               <X />
//                             </button>
//                           </>
//                         )}
//                         <button
//                           onClick={() => deleteUser(entry.waitlist_id)}
//                           className="action-btn delete"
//                           title="Delete"
//                         >
//                           <X />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// ***************************************************************
// OLD CODE FOR REFERENCE ONLY - DO NOT DELETE
// ***************************************************************

import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

const WaitlistAdmin = () => {
  const [waitlist, setWaitlist] = useState([]);

  const fetchWaitlist = async () => {
    const res = await axiosInstance.get("/admin/waitlist-entries"); // You'll need this GET route
    setWaitlist(res.data);
  };

  const handleApprove = async (email) => {
    try {
      const res = await axiosInstance.patch("/admin/approve-creator", {
        email,
      });
      alert(`Approved! Code for ${email}: ${res.data.inviteCode}`);
      fetchWaitlist(); // Refresh list
    } catch (err) {
      console.error("Approval failed");
    }
  };

  return (
    <div className="admin-table">
      <h2>Waitlist Management</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {waitlist.map((entry) => (
            <tr key={entry.email}>
              <td>{entry.full_name}</td>
              <td>{entry.email}</td>
              <td>{entry.status}</td>
              <td>
                {entry.status === "pending" && (
                  <button onClick={() => handleApprove(entry.email)}>
                    Generate Code
                  </button>
                )}
                {entry.invite_code && <code>{entry.invite_code}</code>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WaitlistAdmin;

//
