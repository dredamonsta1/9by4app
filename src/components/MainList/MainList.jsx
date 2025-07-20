import React from "react";
import { useNavigate } from "react-router-dom";
import ClickableList from "../RapperList"; // Import your RapperList component

const MainList = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to the Main List (Home Page)!</h1>
      <p>Explore our collection of rappers.</p>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "30px",
          padding: "12px 25px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "18px",
          fontWeight: "bold",
          marginBottom: "30px",
        }}
      >
        Go to Dashboard
      </button>

      {/* Render ClickableList:
          - showAdminActions={false} (no Delete/Edit buttons)
          - showCloutButton={false} (display clout data, but hide the clickable button) */}
      <ClickableList showAdminActions={false} showCloutButton={false} />
    </div>
  );
};

export default MainList;
