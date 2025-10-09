// src/components/ProtectedAdminRoute/ProtectedAdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedAdminRoute = ({ children }) => {
  const { user, token } = useSelector((state) => state.auth);

  // Check if user is logged in and has admin role
  if (!token || !user) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    // Logged in but not admin, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // User is admin, render the protected content
  return children;
};

export default ProtectedAdminRoute;
