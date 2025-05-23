import React from "react";
import "./App.css";
// import Rapper from './components/Rappers';
// import image from './image';
// import Rappers from "./components/RapperList";
import AuthForm from "./components/Signup/Signup";
// import Login from "./pages/login/Login";
// import ClickableList from "./components/RapperList";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Dashboard from "./components/DashBoard/Dashboard";
import MainList from "./components/MainList/MainList";
import UserProfile from "./components/userProfile/UserProfile";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// function App() {
//   return (
//     <>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/login" element={<AuthForm />} />

//           <Route element={<ProtectedRoute />}>
//             <Route path="/dashboard" element={<Dashboard />} />
//             // Other protected routes
//           </Route>
//         </Routes>
//         {/* <Routes>
//           <Route path="/" element={<MainList />} /> */}
//         {/* <Route path="/login" element={<Login />} /> */}
//         {/* <Route path="/signup" element={<AuthForm />} />
//           <Route path="/profile" element={<UserProfile />} />
//           <Route path="/login" element={<AuthForm />} /> */}
//         {/* <Route path="/rappers" element={<Rappers />} /> */}
//         {/* <Route path="/rappers/:id" element={<RapperDetails />} /> */}
//         {/* <Route path="/" element={<MainList />} /> */}
//         {/* <Route path="/" element={<MainList />} /> */}
//         {/* <Route path="/" element={<RapperList />} /> */}
//         {/* <Route path="/" element={<ClickableList />} /> */}
//         {/* <Route path="/" element={<RapperCloutButton />} /> */}
//         {/* <Route path="/" element={<RapperCloutButton />} /> */}
//         {/* <UserProfile />
//           <div className="App">
//             <header className="App-header">
//               <h1> Pass Da Aux </h1>
//               <MainList />
//               <AuthForm />
//             </header> */}
//         {/* <Rappers /> */}
//         {/* <ClickableList /> */}
//         {/* <RapperCloutButton /> */}
//         {/* </div> */}
//         {/* </Routes> */}
//       </BrowserRouter>
//     </>
//   );
// }

// export default App;

// <Routes>
//   <Route path="/login" element={<AuthForm />} />
//   <Route element={<ProtectedRoute />}>
//     <Route path="/dashboard" element={<Dashboard />} />
//     {/* Other protected routes */}
//   </Route>
// </Routes>

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthForm />} />
          {/* If you want a public homepage, define it here */}
          <Route path="/" element={<MainList />} />
          <Route
            path="/register"
            element={<AuthForm isSignUpDefault={true} />}
          />{" "}
          {/* Optional: dedicated register route */}
          {/* Protected Routes */}
          {/* All routes nested inside <ProtectedRoute> will require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            {/* Add more protected routes here */}
            {/* Example: If MainList should only be accessible when logged in */}
            {/* <Route path="/rappers" element={<MainList />} /> */}
            {/* <Route path="/rappers/:id" element={<RapperDetails />} /> */}
          </Route>
          {/* Fallback for undefined routes */}
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
