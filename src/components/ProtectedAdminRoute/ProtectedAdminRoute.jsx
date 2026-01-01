// src/components/ProtectedAdminRoute/ProtectedAdminRoute.jsx
// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// const ProtectedAdminRoute = ({ children }) => {
//   const { user, token } = useSelector((state) => state.auth);

//   // Check if user is logged in and has admin role
//   if (!token || !user) {
//     // Not logged in, redirect to login
//     return <Navigate to="/login" replace />;
//   }

//   if (user.role !== "admin") {
//     // Logged in but not admin, redirect to dashboard
//     return <Navigate to="/dashboard" replace />;
//   }

//   // User is admin, render the protected content
//   return children;
// };

// export default ProtectedAdminRoute;

// ***************************New Code Below*************************** //

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedAdminRoute = ({ children }) => {
  const { user, token, status } = useSelector((state) => state.auth);
  const location = useLocation();

  // 1. If we are still checking the token, show a loader, NOT a redirect
  if (status === "loading" || status === "idle") {
    return <div className="loading-spinner">Authenticating...</div>;
  }

  // 2. Now that we are sure the check is done, validate the session
  if (!token || !user) {
    // Redirect to login but save the current location so they can return
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Validate Role
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
