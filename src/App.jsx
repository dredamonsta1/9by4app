// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loadUserFromToken } from "./redux/actions/authActions";
import NavBar from "./components/NavBar/NavBar";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/profile/ProfilePage";
import DashBoard from "./components/Dashboard/Dashboard.jsx";
import ArtVideoFeed from "./components/ArtVideoFeed/ArtVideoFeed.jsx";
import AuthForm from "./components/Signup/Signup";
import ImageFeed from "./components/ImageFeed/ImageFeed"; // Let's audit this next
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard.jsx";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute/ProtectedAdminRoute.jsx";
import WaitlistAdmin from "./components/WaitlistAdmin/WaitlistAdmin.jsx";

import "./App.css";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUserFromToken());
  }, [dispatch]);

  return (
    <div className="app-container">
      <NavBar />
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashBoard" element={<DashBoard />} />
          <Route path="/art-video" element={<ArtVideoFeed />} />
          <Route path="/login" element={<AuthForm />} />
          <Route path="/images" element={<ImageFeed />} />
          {/* Add others only after verifying these work */}
          {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          {/* Your existing admin waitlist route */}
          <Route
            path="/admin/waitlist"
            element={
              <ProtectedAdminRoute>
                <WaitlistAdmin />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;
