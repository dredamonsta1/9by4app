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

  // 2. Only show loading if we have a token but NO user data yet.
  if (status === "loading" && token && !user) {
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
  if (!token || !user || user.role?.toLowerCase() !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
