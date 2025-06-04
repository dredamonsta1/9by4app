// import React from "react";
// import { Provider } from "react-redux";
// import store from "./redux/store"; // Import your Redux store
// import "./App.css";
// // import Rapper from './components/Rappers';
// // import image from './image';
// // import Rappers from "./components/RapperList";
// import AuthForm from "./components/Signup/Signup";
// // import Login from "./pages/login/Login";
// // import ClickableList from "./components/RapperList";
// import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
// import Dashboard from "./components/DashBoard/Dashboard";
// import MainList from "./components/MainList/MainList";
// import UserProfile from "./components/userProfile/UserProfile";
// import { BrowserRouter, Route, Routes } from "react-router-dom";

// function App() {
//   return (
//     <>
//       <Provider store={store}>
//         <BrowserRouter>
//           <Routes>
//             {/* Public Routes */}
//             <Route path="/login" element={<AuthForm />} />
//             {/* If you want a public homepage, define it here */}
//             <Route path="/" element={<MainList />} />
//             <Route
//               path="/register"
//               element={<AuthForm isSignUpDefault={true} />}
//             />{" "}
//             {/* Optional: dedicated register route */}
//             {/* Protected Routes */}
//             {/* All routes nested inside <ProtectedRoute> will require authentication */}
//             <Route element={<ProtectedRoute />}>
//               <Route path="/dashboard" element={<Dashboard />} />
//               <Route path="/profile" element={<UserProfile />} />
//               {/* Add more protected routes here */}
//               {/* Example: If MainList should only be accessible when logged in */}
//               {/* <Route path="/rappers" element={<MainList />} /> */}
//               {/* <Route path="/rappers/:id" element={<RapperDetails />} /> */}
//             </Route>
//             {/* Fallback for undefined routes */}
//             <Route path="*" element={<h2>404 - Page Not Found</h2>} />
//           </Routes>
//         </BrowserRouter>
//       </Provider>
//     </>
//   );
// }

// export default App;

// **************************************

// src/App.jsx
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
          <Route path="/home" element={<HomePage />} />
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
