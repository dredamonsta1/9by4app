// Example: src/routes/ProtectedRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsLoggedIn } from "../store/authSlice"; // Your selector

const ProtectedRoute = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

// In your App.js or router setup:
<Routes>
  <Route path="/login" element={<AuthForm />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    {/* Other protected routes */}
  </Route>
</Routes>;
