// import React from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { Home } from "./pages/Home";
// import { Auth } from "./pages/Auth";
// import { Profile } from "./pages/Profile";
// import { Layout } from "./components/Layout/Layout";
// import { AuthProvider, useAuth } from "./components/AuthContext/AuthContext";

// import "./App.css";
// // import Rapper from './components/Rappers';
// // import image from './image';
// // import Rappers from "./components/RapperList";
// import AuthForm from "./components/Signup/Signup";
// // import ClickableList from "./components/RapperList";
// import MainList from "./components/MainList/MainList";
// import UserProfile from "./components/userProfile/UserProfile";

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

// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (!user) {
//     return <Navigate to="/auth" replace />;
//   }

//   return <>{children}</>;
// }

// function App() {
//   return <>{
//     // <>
//     <AuthProvider>
//       <Router>
//         <Routes>
//           <Route path="/auth" element={<Auth />} />
//           <Route
//             element={
              
              
//               <ProtectedRoute>
//                 <Layout />
//               </ProtectedRoute>
              
//             }
//           >
//             <Route path="/" element={<Home />} />
//             <Route path="/profile/:username" element={<Profile />} />
//           </Route>
//         </Routes>
//       </Router>
//     </AuthProvider>
//             // </>
//           }</>;
// }

// export default App;

import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/AuthContext/Auth';
import { CreatePost } from './components/CreatePost/CreatePost';
import { Feed } from './components/Feed';
import { LogOut, Twitter } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Auth />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm fixed top-0 w-full z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Twitter className="text-blue-500" />
            <span className="font-bold text-xl">Social App</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-10">
        <CreatePost />
        <Feed />
      </main>
    </div>
  );
}

export default App;