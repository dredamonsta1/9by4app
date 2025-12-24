import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import store from "./redux/store";
import AuthForm from "./components/Signup/Signup";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/profile/ProfilePage";
import CreateArtistForm from "./components/CreateArtistForm/CreateArtistForm";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import ArtVideoFeed from "./components/ArtVideoFeed/ArtVideoFeed";
import ImageFeed from "./components/ImageFeed/ImageFeed";

import WaitlistAdmin from "./components/WaitlistAdmin/WaitlistAdmin";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute/ProtectedAdminRoute";
// Import the new action for re-hydrating auth state
import { loadUserFromToken } from "./redux/actions/authActions";

// import { Link } from "react-router-dom";

/**
 * This new component wraps the Routes and contains the logic
 * to initialize the app's state, like checking for an existing auth token.
 */
const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // On initial app load, dispatch the action to check for a token
    // and try to log the user in automatically.
    dispatch(loadUserFromToken());
  }, [dispatch]); // The empty dependency array ensures this runs only once.

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthForm />} />
      <Route path="/signup" element={<AuthForm />} />
      <Route path="/create-artist" element={<CreateArtistForm />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/images" element={<ImageFeed />} />
      <Route path="/art-video" element={<ArtVideoFeed />} />
      {/* <Route path="/admin/waitlist" element={<WaitlistAdmin />} /> */}
      {/* Admin-only route for waitlist management */}
      <Route
        path="/admin/waitlist"
        element={
          <ProtectedAdminRoute>
            <WaitlistAdmin />
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
