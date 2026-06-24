// src/App.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUserFromToken, loadPendingClaims, loadPurchases } from "./redux/actions/authActions";
import { ToastContainer } from "react-toastify";
import { setCredentials, logout } from "./store/authSlice";
// import axiosInstance from "./utils/axiosInstance.js";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar/NavBar";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/profile/ProfilePage";
import ArtVideoFeed from "./components/ArtVideoFeed/ArtVideoFeed.jsx";
import Signup from "./components/Signup/Signup.jsx";
import Login from "./components/login/Login.jsx";
import Waitlist from "./components/Waitlist/Waitlist.jsx";
import Events from "./components/Events/Events";
import Rooms from "./components/Rooms/Rooms";
import Room from "./components/Rooms/Room";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard.jsx";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute/ProtectedAdminRoute.jsx";
import WaitlistAdmin from "./components/WaitlistAdmin/WaitlistAdmin.jsx";
import AgentRegister from "./components/Agents/AgentRegister.jsx";
import TermsOfUse from "./pages/TermsOfUse/TermsOfUse.jsx";
import StreamersPage from "./pages/Streamers/StreamersPage.jsx";
import ArtistDashboard from "./pages/ArtistDashboard/ArtistDashboard.jsx";
import ArtistSettings from "./pages/ArtistSettings/ArtistSettings.jsx";
import Library from "./pages/Library/Library.jsx";
import Footer from "./components/Footer/Footer.jsx";
import PlayerBar from "./components/PlayerBar/PlayerBar";
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

  // Load pending claim requests once the user is hydrated. Drives the
  // "Claim pending review" state on artist pages and the dashboard block.
  useEffect(() => {
    if (token && user && !user.artist_id) {
      dispatch(loadPendingClaims());
    }
  }, [dispatch, token, user]);

  // Load album purchases once hydrated. Drives the "Download" state on
  // artist-page buy buttons and the Library page contents.
  useEffect(() => {
    if (token && user) {
      dispatch(loadPurchases());
    }
  }, [dispatch, token, user]);

  return (
    <div className="app-container">
      <ToastContainer theme="dark" position="bottom-right" />
      <NavBar />
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/artist/:artistId" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/art-video" element={<ArtVideoFeed />} />
          <Route path="/signup" element={<Waitlist />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/events" element={<Events />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<Room />} />
          <Route path="/agents/register" element={<AgentRegister />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/streamers" element={<StreamersPage />} />
          <Route path="/artist-dashboard" element={<ArtistDashboard />} />
          <Route path="/artist-settings" element={<ArtistSettings />} />
          <Route path="/library" element={<Library />} />

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
      <Footer />
      <PlayerBar />
    </div>
  );
};

export default App;
