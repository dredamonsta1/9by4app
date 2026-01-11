// src/components/ProtectedAdminRoute/ProtectedAdminRoute.jsx

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedAdminRoute = ({ children }) => {
  const { user, token, status } = useSelector((state) => state.auth);
  const location = useLocation();

  // 1. Handle the "Hydration" state.
  // If we are still verifying the token, we MUST wait.
  if (status === "loading" || status === "idle") {
    return (
      <div className="p-10 text-center">Verifying Admin Credentials...</div>
    );
  }

  // 2. Check for existence of session
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Strict Role Check
  // We use .toLowerCase() to prevent "Admin" vs "admin" mismatches
  if (user.role?.toLowerCase() !== "admin") {
    console.warn(
      "Unauthorized access attempt to Admin route by:",
      user.username
    );
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
