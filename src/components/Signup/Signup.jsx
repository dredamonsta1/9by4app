// import React, { useState } from "react";
// // --- FIX: Import your custom axiosInstance ---
// import axiosInstance from "../../utils/axiosInstance";
// import { useDispatch } from "react-redux";
// import { setCredentials } from "../../store/authSlice";
// import { useNavigate } from "react-router-dom";
// import "./Signup.css";

// function AuthForm() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: "",
//     role: "",
//   });
//   const [message, setMessage] = useState("");

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // --- FIX: No longer need BASE_URL, it's configured in axiosInstance ---

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleAuth = async () => {
//     let response;
//     if (isSignUp) {
//       // Register
//       // --- FIX: Use axiosInstance and relative URL ---
//       const url = `/users/register`;
//       const payload = {
//         username: formData.username,
//         email: formData.email,
//         password: formData.password,
//         role: formData.role || "user",
//       };
//       response = await axiosInstance.post(url, payload);
//     } else {
//       // Login
//       // --- FIX: Use axiosInstance and relative URL ---
//       const url = `/users/login`;
//       const payload = {
//         username: formData.username,
//         password: formData.password,
//       };
//       response = await axiosInstance.post(url, payload);
//     }
//     return response;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setMessage("");

//     try {
//       const response = await handleAuth();
//       setMessage(response.data.message);

//       if (!isSignUp && response.data.token) {
//         const { token, user } = response.data;

//         // --- THE CRITICAL FIX ---
//         // Use 'authToken' to match the key in axiosInstance.js
//         localStorage.setItem("authToken", token);

//         dispatch(setCredentials({ user, token }));
//         navigate("/dashboard");
//       } else if (isSignUp) {
//         setIsSignUp(false);
//         setFormData({ username: "", email: "", password: "", role: "" });
//       }
//     } catch (error) {
//       console.error(
//         "Authentication error:",
//         error.response?.data || error.message
//       );
//       setMessage(
//         error.response?.data?.message ||
//           "An unexpected error occurred. Please try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="signup-container">
//       <div className="inner-container">
//         <h2 className="text-xl font-bold mb-4 text-center">
//           {isSignUp ? "Sign Up" : "Login"}
//         </h2>
//         {message && (
//           <p
//             className={`text-center ${message.includes("success") ? "text-green-500" : "text-red-500"}`}
//           >
//             {message}
//           </p>
//         )}
//         <form onSubmit={handleSubmit} className="onSubmit-form">
//           <input
//             type="text"
//             name="username"
//             placeholder="Username"
//             value={formData.username}
//             onChange={handleChange}
//             className="email-text-box"
//             required
//           />
//           {isSignUp && (
//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={formData.email}
//               onChange={handleChange}
//               className="email-text-box"
//               required
//             />
//           )}
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//             className="password-text-box"
//             required
//           />
//           {isSignUp && (
//             <input
//               type="text"
//               name="role"
//               placeholder="Role (e.g., user, admin - optional)"
//               value={formData.role}
//               onChange={handleChange}
//               className="role-text-box"
//             />
//           )}

//           <button type="submit" className="submit-button" disabled={isLoading}>
//             {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
//           </button>
//         </form>
//         <p className="text-center mt-4 text-sm">
//           {isSignUp ? "Already have an account?" : "Don't have an account?"}
//           <button
//             onClick={() => {
//               setIsSignUp(!isSignUp);
//               setMessage("");
//               setFormData({
//                 username: "",
//                 email: "",
//                 password: "",
//                 role: "",
//               });
//             }}
//             className="signup-button"
//           >
//             {isSignUp ? "Login" : "Sign Up"}
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default AuthForm;

// ************************New Code Below************************

import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isWaitlist, setIsWaitlist] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    inviteCode: "",
    fullName: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWaitlistJoin = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axiosInstance.post("/waitlist/join", {
        email: formData.email,
        full_name: formData.fullName,
      });

      setMessage(
        response.data.message ||
          "Successfully added to waitlist! We'll send you an invite code soon."
      );
      setMessageType("success");

      // Reset form after successful waitlist join
      setTimeout(() => {
        setIsWaitlist(false);
        setFormData({
          username: "",
          email: "",
          password: "",
          role: "",
          inviteCode: "",
          fullName: "",
        });
      }, 3000);
    } catch (error) {
      console.error("Waitlist error:", error.response?.data || error.message);

      if (error.response?.status === 409) {
        setMessage("This email is already on the waitlist!");
      } else {
        setMessage(
          error.response?.data?.error ||
            error.response?.data?.message ||
            "Failed to join waitlist. Please try again."
        );
      }
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    let response;
    if (isSignUp) {
      // Register with invite code
      const url = `/users/register`;
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role || "user",
        invite_code: formData.inviteCode, // Add invite code to registration
      };
      response = await axiosInstance.post(url, payload);
    } else {
      // Login
      const url = `/users/login`;
      const payload = {
        username: formData.username,
        password: formData.password,
      };
      response = await axiosInstance.post(url, payload);
    }
    return response;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Handle waitlist submission separately
    if (isWaitlist) {
      await handleWaitlistJoin();
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await handleAuth();
      setMessage(response.data.message);
      setMessageType("success");

      if (!isSignUp && response.data.token) {
        const { token, user } = response.data;
        localStorage.setItem("authToken", token);
        dispatch(setCredentials({ user, token }));
        navigate("/dashboard");
      } else if (isSignUp) {
        setIsSignUp(false);
        setFormData({
          username: "",
          email: "",
          password: "",
          role: "",
          inviteCode: "",
          fullName: "",
        });
      }
    } catch (error) {
      console.error(
        "Authentication error:",
        error.response?.data || error.message
      );

      // Check if waitlist is enabled
      if (error.response?.data?.waitlist_enabled) {
        setMessage(
          error.response?.data?.message ||
            "Registration is currently invite-only. Please join our waitlist!"
        );
        setMessageType("error");

        // Optionally auto-switch to waitlist view
        setTimeout(() => {
          setIsWaitlist(true);
          setIsSignUp(false);
        }, 2000);
      } else {
        setMessage(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "An unexpected error occurred. Please try again."
        );
        setMessageType("error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (mode) => {
    setIsSignUp(mode === "signup");
    setIsWaitlist(mode === "waitlist");
    setMessage("");
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "",
      inviteCode: "",
      fullName: "",
    });
  };

  return (
    <div className="signup-container">
      <div className="inner-container">
        <h2 className="text-xl font-bold mb-4 text-center">
          {isWaitlist ? "Join Waitlist" : isSignUp ? "Sign Up" : "Login"}
        </h2>

        {message && (
          <p
            className={`text-center mb-4 ${
              messageType === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="onSubmit-form">
          {/* WAITLIST FORM */}
          {isWaitlist && (
            <>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="email-text-box"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="email-text-box"
                required
              />
            </>
          )}

          {/* SIGNUP/LOGIN FORMS */}
          {!isWaitlist && (
            <>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="email-text-box"
                required
              />

              {isSignUp && (
                <>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="email-text-box"
                    required
                  />
                  <input
                    type="text"
                    name="inviteCode"
                    placeholder="Invite Code (required)"
                    value={formData.inviteCode}
                    onChange={handleChange}
                    className="email-text-box"
                    required
                  />
                </>
              )}

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="password-text-box"
                required
              />

              {isSignUp && (
                <input
                  type="text"
                  name="role"
                  placeholder="Role (e.g., user, admin - optional)"
                  value={formData.role}
                  onChange={handleChange}
                  className="role-text-box"
                />
              )}
            </>
          )}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading
              ? "Loading..."
              : isWaitlist
                ? "Join Waitlist"
                : isSignUp
                  ? "Sign Up"
                  : "Login"}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          {isWaitlist ? (
            <p>
              Already have an invite code?{" "}
              <button
                onClick={() => switchMode("signup")}
                className="signup-button"
              >
                Sign Up
              </button>
            </p>
          ) : isSignUp ? (
            <>
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => switchMode("login")}
                  className="signup-button"
                >
                  Login
                </button>
              </p>
              <p className="mt-2">
                Don't have an invite code?{" "}
                <button
                  onClick={() => switchMode("waitlist")}
                  className="signup-button"
                >
                  Join Waitlist
                </button>
              </p>
            </>
          ) : (
            <>
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => switchMode("signup")}
                  className="signup-button"
                >
                  Sign Up
                </button>
              </p>
              <p className="mt-2">
                Need an invite?{" "}
                <button
                  onClick={() => switchMode("waitlist")}
                  className="signup-button"
                >
                  Join Waitlist
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
