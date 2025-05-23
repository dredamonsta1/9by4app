import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux"; // If you're using Redux for auth state
import { selectIsLoggedIn } from "../../store/authSlice"; // Adjust path if needed

const ProtectedRoute = () => {
  // Option 1: Check Redux state (Recommended if you're managing auth there)
  const isLoggedIn = useSelector(selectIsLoggedIn);

  // Option 2: Directly check localStorage (Less ideal if you have Redux, but works)
  // const token = localStorage.getItem('token');
  // const isLoggedIn = !!token; // Convert truthy/falsy to boolean

  if (!isLoggedIn) {
    // User is not logged in, redirect them to the login page
    return <Navigate to="/login" replace />;
  }

  // User is logged in, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
