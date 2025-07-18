// import React, { useState, useEffect } from "react";
// import axios from "axios";
// // import MainList from "../MainList/MainList";
// import axiosInstance from "../../utils/axiosInstance";
// import RapperList from "../RapperList";

// const UserProfile = (props) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       const token = localStorage.getItem("token");
//       console.log("UserProfile: Token from localStorage:", token);

//       if (!token) {
//         setError("You are not logged in. Please log in to view your profile.");
//         console.log("UserProfile: No token found in localStorage.");
//         return;
//       }
//       try {
//         const response = await axiosInstance.get("/users");
//         setUser(response.data.users);
//         setLoading(false);
//       } catch (error) {
//         console.error(
//           "Error fetching user profile:",
//           error.response?.data || error.message
//         );
//         setError(error.response?.data?.message || "failed to fetch user data.");

//         setLoading(false);
//       }
//     };
//     fetchUserProfile();
//   }, []);

//   if (loading) return <p>Loading...</p>;
//   if (error) {
//     return <p>Error {error}fetching data</p>;
//   }
//   if (!user) {
//     return <div>Loading user profile.....</div>;
//   }

//   return (
//     <div>
//       <h3> user Profile </h3>
//       {user.length > 0 ? (
//         <ul>
//           {/* {user.map((user) => ( */}
//           <li>
//             <p>Username: {user.username}</p>
//             <p>Email: {user.email}</p>
//             <p>Role: {user.role}</p>
//           </li>
//           {/* ))} */}
//         </ul>
//       ) : (
//         <p>No user data found</p>
//       )}
//       {/* <RapperList /> */}
//     </div>
//   );
// };
// export default UserProfile;

// import React, { useState, useEffect } from "react";
// import axiosInstance from "../../utils/axiosInstance";
// import RapperList from "../RapperList"; // Uncomment if you use it

// const UserProfile = () => {
//   const [user, setUser] = useState(null); // This will now hold a single user object
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       const token = localStorage.getItem("token");
//       console.log("UserProfile: Token from localStorage:", token);

//       if (!token) {
//         setError("You are not logged in. Please log in to view your profile.");
//         console.log("UserProfile: No token found in localStorage.");
//         setLoading(false);
//         return;
//       }
//       try {
//         // --- CRITICAL CHANGE: Call the /profile endpoint ---
//         const response = await axiosInstance.get("/users/profile");

//         // --- Update state to expect a single user object ---
//         // The backend returns { message: ..., user: { id: ..., username: ..., role: ... } }
//         setUser(response.data.user); // Store the single user object from response.data.user
//         setLoading(false);
//       } catch (err) {
//         console.error(
//           "Error fetching user profile:",
//           err.response?.data || err.message
//         );
//         // Handle specific 401/403 errors if the token becomes invalid mid-session
//         if (
//           err.response &&
//           (err.response.status === 401 || err.response.status === 403)
//         ) {
//           setError(
//             "Your session has expired or is invalid. Please log in again."
//           );
//           localStorage.removeItem("token"); // Clear invalid token
//           // Optionally redirect to login page here, e.g., navigate('/login');
//         } else {
//           setError(err.response?.data?.message || "Failed to fetch user data.");
//         }
//         setLoading(false);
//       }
//     };
//     fetchUserProfile();
//   }, []); // Empty dependency array means this runs once on mount

//   if (loading) {
//     return <p>Loading user profile...</p>;
//   }

//   if (error) {
//     return <p style={{ color: "red" }}>Error: {error}</p>;
//   }

//   // If loading is false and there's no error, but user is null
//   if (!user) {
//     return <div>No user data found. Please ensure you are logged in.</div>;
//   }

//   // --- Rendering for a SINGLE user object ---
//   return (
//     <div>
//       <h3>Your Profile</h3>
//       <div>
//         <p>
//           <strong>Username:</strong> {user.username}
//         </p>
//         <p>
//           <strong>Email:</strong> {user.email}
//         </p>{" "}
//         {/* Assuming email is part of req.user payload */}
//         <p>
//           <strong>Role:</strong> {user.role}
//         </p>
//         {/* Add more user details here if available in the 'user' object */}
//         {/* The `id` property from JWT is also available as user.id */}
//       </div>
//       {/* If you want to use RapperList, uncomment it and ensure it's imported */}
//       <RapperList />
//     </div>
//   );
// };

// export default UserProfile;

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom"; // Import useNavigate
// import axiosInstance from "../../utils/axiosInstance";
// import RapperList from "../RapperList"; // Uncomment if you use it

// const UserProfile = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const navigate = useNavigate(); // Initialize useNavigate hook

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       const token = localStorage.getItem("token");
//       console.log("UserProfile: Token from localStorage:", token);

//       if (!token) {
//         setError("You are not logged in. Please log in to view your profile.");
//         console.log("UserProfile: No token found in localStorage.");
//         setLoading(false);
//         return;
//       }
//       try {
//         const response = await axiosInstance.get("/users/profile");

//         setUser(response.data.user);
//         setLoading(false);
//       } catch (err) {
//         console.error(
//           "Error fetching user profile:",
//           err.response?.data || err.message
//         );
//         if (
//           err.response &&
//           (err.response.status === 401 || err.response.status === 403)
//         ) {
//           setError(
//             "Your session has expired or is invalid. Please log in again."
//           );
//           localStorage.removeItem("token");
//           // Optionally redirect to login page here if you want an immediate redirect:
//           // navigate('/login');
//         } else {
//           setError(err.response?.data?.message || "Failed to fetch user data.");
//         }
//         setLoading(false);
//       }
//     };
//     fetchUserProfile();
//   }, []);

//   if (loading) {
//     return <p>Loading user profile...</p>;
//   }

//   if (error) {
//     return (
//       <div style={{ color: "red" }}>
//         <p>Error: {error}</p>
//         <button
//           onClick={() => navigate("/")}
//           style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
//         >
//           Go to Home
//         </button>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div>
//         <p>No user data found. Please ensure you are logged in.</p>
//         <button
//           onClick={() => navigate("/")}
//           style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
//         >
//           Go to Home
//         </button>
//       </div>
//     );
//   }

//   // Rendering for a SINGLE user object
//   return (
//     <div>
//       <h3>Your Profile</h3>
//       <div>
//         <p>
//           <strong>Username:</strong> {user.username}
//         </p>
//         <p>
//           <strong>Email:</strong> {user.email}
//         </p>
//         <p>
//           <strong>Role:</strong> {user.role}
//         </p>
//       </div>

//       {/* The new button */}
//       <button
//         onClick={() => navigate("/")} // Use navigate('/') to go to the home route
//         style={{
//           marginTop: "20px", // Add some space above the button
//           padding: "10px 20px",
//           backgroundColor: "#007bff", // Example styling
//           color: "white",
//           border: "none",
//           borderRadius: "5px",
//           cursor: "pointer",
//           fontSize: "16px",
//         }}
//       >
//         Go to Home
//       </button>

//       <RapperList />
//     </div>
//   );
// };

// export default UserProfile;

// ***********************New Code****************************

import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import RapperList from "../RapperList";

const UserProfile = () => {
  // Get the authentication state directly from the Redux store.
  // This is now the single source of truth for user data.
  const { user, loading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Display a loading message while the app is checking the token on initial load.
  if (loading) {
    return <p>Loading user profile...</p>;
  }

  // Display an error message if the token was invalid or fetching failed.
  if (error) {
    return (
      <div style={{ color: "red" }}>
        <p>Error: {error}</p>
        <button
          onClick={() => navigate("/login")}
          style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // If there's no user and no error, it means the user is not logged in.
  if (!user) {
    return (
      <div>
        <p>You are not logged in. Please log in to view your profile.</p>
        <button
          onClick={() => navigate("/login")}
          style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // If a user object exists in the Redux state, display the profile.
  return (
    <div>
      <h3>Your Profile</h3>
      <div>
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Go to Home
      </button>

      {/* This component will fetch its own data as before */}
      <RapperList />
    </div>
  );
};

export default UserProfile;
