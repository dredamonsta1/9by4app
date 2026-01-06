// // src/components/Signup/Signup.jsx
// import React, { useState, useEffect } from "react";
// import axiosInstance from "../../utils/axiosInstance";
// import { useDispatch, useSelector } from "react-redux";
// import { setCredentials } from "../../store/authSlice";
// import { useNavigate } from "react-router-dom";
// import "./Signup.css";

// function AuthForm() {
//   // Use Redux status to handle loading globally
//   const { status, isLoggedIn } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [isSignUp, setIsSignUp] = useState(false);
//   const [isWaitlist, setIsWaitlist] = useState(false);
//   const [localLoading, setLocalLoading] = useState(false); // Only for waitlist
//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: "",
//     inviteCode: "",
//     fullName: "",
//   });
//   const [message, setMessage] = useState({ text: "", type: "" });

//   // Redirect if already logged in - don't let them see the login page
//   useEffect(() => {
//     if (isLoggedIn) navigate("/dashboard");
//   }, [isLoggedIn, navigate]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLocalLoading(true);
//     setMessage({ text: "", type: "" });

//     try {
//       let response;
//       if (isWaitlist) {
//         response = await axiosInstance.post("/waitlist/join", {
//           email: formData.email,
//           full_name: formData.fullName,
//         });
//         setMessage({ text: "Added to waitlist!", type: "success" });
//       } else {
//         const url = isSignUp ? "/users/register" : "/users/login";
//         const payload = isSignUp
//           ? { ...formData, invite_code: formData.inviteCode }
//           : { username: formData.username, password: formData.password };

//         response = await axiosInstance.post(url, payload);

//         if (!isSignUp && response.data.token) {
//           const { token, user } = response.data;
//           // FIX: SYNCED KEY NAME
//           localStorage.setItem("token", token);
//           dispatch(setCredentials({ user, token }));
//         } else if (isSignUp) {
//           setMessage({
//             text: "Account created! Please log in.",
//             type: "success",
//           });
//           setIsSignUp(false);
//         }
//       }
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || "An error occurred.";
//       setMessage({ text: errorMsg, type: "error" });

//       if (error.response?.data?.waitlist_enabled) {
//         setIsWaitlist(true);
//       }
//     } finally {
//       setLocalLoading(false);
//     }
//   };

//   // Switch modes cleanly
//   const switchMode = (mode) => {
//     setIsSignUp(mode === "signup");
//     setIsWaitlist(mode === "waitlist");
//     setMessage({ text: "", type: "" });
//   };

//   const isLoading = localLoading || status === "loading";

//   return (
//     <div className="signup-container">
//       <div className="inner-container">
//         <h2>{isWaitlist ? "Join Waitlist" : isSignUp ? "Sign Up" : "Login"}</h2>

//         {message.text && (
//           <p
//             className={
//               message.type === "success" ? "text-green-500" : "text-red-500"
//             }
//           >
//             {message.text}
//           </p>
//         )}

//         <form onSubmit={handleSubmit}>
//           {isWaitlist ? (
//             <input
//               type="text"
//               name="fullName"
//               placeholder="Full Name"
//               onChange={handleChange}
//               required
//             />
//           ) : (
//             <input
//               type="text"
//               name="username"
//               placeholder="Username"
//               onChange={handleChange}
//               required
//             />
//           )}

//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             onChange={handleChange}
//             required
//           />

//           {!isWaitlist && (
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               onChange={handleChange}
//               required
//             />
//           )}

//           {isSignUp && (
//             <input
//               type="text"
//               name="inviteCode"
//               placeholder="Invite Code"
//               onChange={handleChange}
//               required
//             />
//           )}

//           <button type="submit" disabled={isLoading}>
//             {isLoading ? "Processing..." : "Submit"}
//           </button>
//         </form>
//         {/* Switcher buttons logic here */}
//       </div>
//     </div>
//   );
// }

// export default AuthForm;

// ***************************************************************
// OLD CODE FOR REFERENCE ONLY - DO NOT DELETE
// ***************************************************************

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { setCredentials } from "../../store/authSlice";
import "./Signup.css";

function AuthForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);

  // Switch mode based on the URL path
  const isSignUp = location.pathname === "/signup";
  const [isWaitlist, setIsWaitlist] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    inviteCode: "",
    fullName: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    try {
      if (isWaitlist) {
        await axiosInstance.post("/waitlist/join", {
          email: formData.email,
          full_name: formData.fullName,
        });
        setMessage({
          text: "Added to waitlist! Check your email soon.",
          type: "success",
        });
      } else if (isSignUp) {
        await axiosInstance.post("/users/register", {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          invite_code: formData.inviteCode,
        });
        setMessage({ text: "Success! Please log in.", type: "success" });
        navigate("/login");
      } else {
        // LOGIN logic - only username and password
        const response = await axiosInstance.post("/users/login", {
          username: formData.username,
          password: formData.password,
        });
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        dispatch(setCredentials({ user, token }));
        navigate("/dashboard");
      }
    } catch (error) {
      const resp = error.response?.data;
      setMessage({
        text: resp?.message || "An error occurred.",
        type: "error",
      });
      if (resp?.waitlist_enabled) setIsWaitlist(true);
    }
  };

  return (
    <div className="signup-container">
      <div className="inner-container">
        <h2>
          {isWaitlist ? "Waitlist" : isSignUp ? "Create Account" : "Sign In"}
        </h2>

        {message.text && (
          <p
            className={
              message.type === "success" ? "text-green-500" : "text-red-500"
            }
          >
            {message.text}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {isWaitlist ? (
            <>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
              />
            </>
          ) : (
            <>
              <input
                type="text"
                name="username"
                placeholder="Username"
                onChange={handleChange}
                required
              />
              {isSignUp && (
                <>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="inviteCode"
                    placeholder="Invite Code"
                    onChange={handleChange}
                    required
                  />
                </>
              )}
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </>
          )}

          <button type="submit" disabled={status === "loading"}>
            {status === "loading"
              ? "Processing..."
              : isWaitlist
                ? "Join Waitlist"
                : isSignUp
                  ? "Sign Up"
                  : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center">
          {isSignUp ? (
            <p>
              Already have a code?{" "}
              <button onClick={() => navigate("/login")}>Login</button>
            </p>
          ) : (
            <p>
              New creator?{" "}
              <button onClick={() => navigate("/signup")}>Sign Up</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthForm;

// src/components/Signup/Signup.jsx (Refactored logic)

// function AuthForm() {
//   const location = useLocation();
//   const isLoginPage = location.pathname === "/login";

//   // High-level UX: Default signup path to Waitlist, NOT the registration form
//   const [mode, setMode] = useState(isLoginPage ? "login" : "waitlist");

//   // ... (handleChange and handleSubmit remain similar)

//   return (
//     <div className="auth-container">
//       <h2>
//         {mode === "waitlist" ? "Join the Inner Circle" :
//          mode === "signup" ? "Create Creator Account" : "Welcome Back"}
//       </h2>

//       <form onSubmit={handleSubmit}>
//         {mode === "waitlist" && (
//           <>
//             <input type="text" name="fullName" placeholder="Full Name" required />
//             <input type="email" name="email" placeholder="Email" required />
//             <button type="submit">Get My Invite Code</button>
//             <p onClick={() => setMode("signup")}>Already have a code?</p>
//           </>
//         )}

//         {mode === "signup" && (
//           <>
//             <input type="text" name="inviteCode" placeholder="Enter Invite Code" required />
//             <input type="email" name="email" placeholder="Email Address" required />
//             <input type="text" name="username" placeholder="Pick a Username" required />
//             <input type="password" name="password" placeholder="Password" required />
//             <button type="submit">Register as Creator</button>
//           </>
//         )}

//         {mode === "login" && (
//            <>
//             <input type="text" name="username" placeholder="Username" required />
//             <input type="password" name="password" placeholder="Password" required />
//             <button type="submit">Login</button>
//            </>
//         )}
//       </form>
//     </div>
//   );
// }
