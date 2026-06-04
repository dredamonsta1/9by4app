// src/components/ProtectedAdminRoute/ProtectedAdminRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedAdminRoute = ({ children }) => {
  const { user, token, status } = useSelector((state) => state.auth);
  const location = useLocation();

  // 1. DATA-FIRST CHECK: If we already have the user and they are admin, let them in immediately.
  if (user && user.role?.toLowerCase() === "admin") {
    return children;
  }

  // 2. Token present but user not loaded yet — wait, regardless of status.
  // Covers the cold-load race where status starts as "idle" and the thunk
  // hasn't dispatched yet. "failed" still falls through to the redirect below.
  if (token && !user && status !== "failed") {
    return (
      <div className="p-10 text-center text-white">
        <h2 className="text-xl font-bold">Verifying Admin Credentials...</h2>
        <p className="text-gray-400">
          Please wait while we secure your session.
        </p>
      </div>
    );
  }

  // 3. Fallback: If not loading and not authorized, redirect.
  if (!token || !user || user?.role?.toLowerCase() !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// src/components/ProtectedAdminRoute/ProtectedAdminRoute.jsx
// const ProtectedAdminRoute = ({ children }) => {
//   const { user, token, status } = useSelector((state) => state.auth);

//   // If we are still loading, show a focused message instead of crashing
//   if (status === "loading") {
//     return (
//       <div style={{ color: "white", textAlign: "center" }}>Verifying...</div>
//     );
//   }

//   // USE OPTIONAL CHAINING: user?.role
//   if (!token || !user || user?.role?.toLowerCase() !== "admin") {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

export default ProtectedAdminRoute;
