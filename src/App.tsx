import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { Profile } from "./pages/Profile";
import { Layout } from "./components/Layout/Layout";
import { AuthProvider, useAuth } from "./components/AuthContext/AuthContext";

import "./App.css";
// import Rapper from './components/Rappers';
// import image from './image';
// import Rappers from "./components/RapperList";
import AuthForm from "./components/Signup/Signup";
// import ClickableList from "./components/RapperList";
import MainList from "./components/MainList/MainList";
import UserProfile from "./components/userProfile/UserProfile";

// function App() {
  // return (
    // <AuthProvider>
    // <Router>
    //   <Routes>
    //     <Route path="/auth" element={<AuthForm />} />
        {/* <Route element={<Layout />} */}
        // <Route path="/" element={<MainList />} />
        // <Route path="/profile/:username" element={<UserProfile />} />
        {/* </Route> */}

        {/* <UserProfile /> */}
        // <div className="App">
        //   <header className="App-header">
            {/* <h1> Pass Da Aux </h1> */}
            {/* <MainList /> */}
            {/* <AuthForm /> */}
          // </header>

          {/* <Rappers /> */}
          {/* <ClickableList /> */}
          {/* <RapperCloutButton /> */}
        {/* </div>
      </Routes>
    </Router> */}
    // {/* </AuthProvider> */}
//   );
// }
// export default App;


// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Home } from './pages/Home';
// import { Auth } from './pages/Auth';
// import { Profile } from './pages/Profile';
// import { Layout } from './components/Layout';
// import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/profile/:username" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;