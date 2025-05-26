// import UserProfile from "../userProfile/UserProfile";
// import MainList from "../MainList/MainList";
// const Dashboard = () => {
//   return (
//     <div>
//       <h2>Welcome to your Dashboard!</h2>
//       <p>This is a protected area.</p>
//       {/* You can render other protected components here */}
//       {/* <MainList /> Example: MainList could be protected */}
//       <UserProfile /> {/* Example: UserProfile could be protected */}
//     </div>
//   );
// };
// export default Dashboard;

import React from "react";
import ClickableList from "../RapperList"; // Import your RapperList component
import UserProfile from "../userProfile/UserProfile";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>
      <p>Welcome to your personalized dashboard!</p>

      <button
        onClick={() => navigate("/profile")}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          marginRight: "15px",
        }}
      >
        View Profile
      </button>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Logout
      </button>

      <h2 style={{ marginTop: "40px" }}>Manage Rappers</h2>
      {/* Render ClickableList:
          - showAdminActions={true} (display Delete/Edit buttons)
          - showCloutButton={true} (display the clickable Clout button) */}
      <ClickableList showAdminActions={true} showCloutButton={true} />
    </div>
  );
};

export default Dashboard;
