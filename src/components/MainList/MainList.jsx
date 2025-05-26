// import React from "react";
// import RapperList from "../RapperList";
// import { useNavigate } from "react-router-dom";
// import "./MainList.css";

// const MainList = (props) => {
//   const navigate = useNavigate();
//   return (
//     <div className="rapper-list-container">
//       <button
//         onClick={() => navigate("/dashboard")} // This navigates to the /dashboard route
//         style={{
//           marginTop: "10px",
//           padding: "12px 5px",
//           backgroundColor: "#28a745", // A green color for the dashboard button
//           color: "white",
//           border: "none",
//           borderRadius: "5px",
//           cursor: "pointer",
//           fontSize: "8px",
//           fontWeight: "bold",
//         }}
//       >
//         Go to Dashboard
//       </button>
//       {/* <h1> Pass Da Aux </h1> */}
//       <RapperList />
//     </div>
//   );
// };

// export default MainList;

// import React from "react";
// Import useNavigate hook
// Assuming you have other imports like:
// import axios from 'axios';
// import someOtherComponent from './someOtherComponent';
// import './MainList.css'; // If you have specific styles for MainList

// const MainList = () => {
//const navigate = useNavigate(); // Initialize the navigate function

// You'd typically have your existing MainList logic here,
// such as fetching data, state management, etc.
// For demonstration, I'm just showing the basic structure.

// return (
// <div style={{ textAlign: "center", marginTop: "50px" }}>
{
  /* <h1>Welcome to the Main List (Home Page)!</h1> */
}
{
  /* <p>This is where your main list content would go.</p> */
}

{
  /* Button to navigate to the Dashboard */
}
{
  /* <button
        onClick={() => navigate("/dashboard")} // This navigates to the /dashboard route
        style={{
          marginTop: "30px",
          padding: "12px 25px",
          backgroundColor: "#28a745", // A green color for the dashboard button
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        Go to Dashboard
      </button> */
}

{
  /* You can add other content or components of your MainList below */
}
{
  /* For example, your list of rappers, etc. */
}
{
  /* </div> */
}
//   );
// };

// export default MainList;

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
