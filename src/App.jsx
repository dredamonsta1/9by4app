import React from "react";
import { Provider } from "react-redux";
import store from "./redux/store"; // Import your Redux store
import AuthForm from "./components/Signup/Signup"; // Import your authentication form
import "./App.css"; // Import your main CSS file
import {
  BrowserRouter as Router,
  Route,
  Routes,
  BrowserRouter,
} from "react-router-dom"; // Import React Router components
import ClickableList from "./components/RapperList"; // Your dashboard component
import HomePage from "./pages/HomePage"; // Placeholder for your home page
import ProfilePage from "./pages/profile/ProfilePage"; // Assuming you have this page
import UserProfile from "./components/userProfile/UserProfile";

import CreateArtistForm from "./components/CreateArtistForm/CreateArtistForm"; // Assuming you have this form
import Dashboard from "./components/DashBoard/Dashboard";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthForm />} />
          {/* Wrap your entire application with Provider */}
          {/* <div
            className="App"
            style={{
              fontFamily: "Arial, sans-serif",
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "20px",
            }} */}
          {/* > */}
          {/* <h1 style={{ textAlign: "center", color: "#333" }}>
            Rapper Clout Dashboard
          </h1> */}
          {/* <CreateArtistForm /> Your form for creating artists
          <hr style={{ margin: "40px 0" }} />
          {/* Dashboard View */}
          {/* <h2 style={{ textAlign: "center", color: "#555" }}>
            Artist List (Dashboard)
          </h2> */}{" "}
          {/* Dashboard View */}
          {/* Create Artist Form */}
          <Route path="/create-artist" element={<CreateArtistForm />} />
          {/* Home Page List */}
          {/* <Route path="/home" element={<HomePage />} /> */}
          {/* Profile Page List */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* ClickableList component for the dashboard */}
          {/* This will render the list of artists with admin actions and clout buttons */}
          {/* <ClickableList showAdminActions={true} showCloutButton={true} /> */}
          {/* --- */}
          {/* Placeholder for other views */}
          {/* These components will automatically get updated artist data from Redux */}
          {/* <HomePage />
          <ProfilePage /> */}
          {/* </div> */}
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
