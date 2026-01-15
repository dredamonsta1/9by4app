// src/App.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUserFromToken } from "./redux/actions/authActions";
import { ToastContainer } from "react-toastify";
import { setCredentials, logout } from "./store/authSlice.jsx";
// import axiosInstance from "./utils/axiosInstance.js";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar/NavBar";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/profile/ProfilePage";
import DashBoard from "./components/Dashboard/Dashboard.jsx";
import ArtVideoFeed from "./components/ArtVideoFeed/ArtVideoFeed.jsx";
import Signup from "./components/Signup/Signup.jsx";
import Login from "./components/login/Login.jsx";
import Waitlist from "./components/Waitlist/Waitlist.jsx";
import ImageFeed from "./components/ImageFeed/ImageFeed"; // Let's audit this next
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard.jsx";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute/ProtectedAdminRoute.jsx";
import WaitlistAdmin from "./components/WaitlistAdmin/WaitlistAdmin.jsx";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";

const App = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(loadUserFromToken());
    }
  }, [dispatch, token, user]);

  return (
    <div className="app-container">
      <ToastContainer theme="dark" position="bottom-right" />
      <NavBar />
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashBoard" element={<DashBoard />} />
          <Route path="/art-video" element={<ArtVideoFeed />} />
          <Route path="/signup" element={<Waitlist />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/images" element={<ImageFeed />} />
          {/* Add others only after verifying these work */}

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
