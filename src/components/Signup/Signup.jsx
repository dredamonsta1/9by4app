// import React, { useState } from "react";
// import axios from "axios";
// import { useDispatch, useSelector } from "react-redux";
// import authSlice from "../../store/slice";
// import "./Signup.css";

// import { UserProfile } from "../UserProfile/UserProfile";

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

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSignUp = async () => {
//     const url = "https://ninebyfourapi.herokuapp.com/api/users";
//     const payload = {
//       username: formData.username,
//       email: formData.email,
//       password: formData.password,
//       role: formData.role,
//     };
//     const response = await axios.post(url, payload, {
//       headers: { "Content-Type": "application/json" },
//     });
//     return response;
//   };

//   const handleLogin = async () => {
//     const url = "https://ninebyfourapi.herokuapp.com/api/users/login";
//     const payload = {
//       username: formData.username,
//       password: formData.password,
//     };
//     const response = await axios.post(url, payload, {
//       headers: { "Content-Type": "application/json" },
//     });
//     return response;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const url = "https://ninebyfourapi.herokuapp.com/api/users";
//       const response = await axios.post(url, formData);

//       setMessage(response.data.message || "Success");
//       console.log("this is the isSignUp", response.data); // <--------not working
//     } catch (error) {
//       setMessage(error.response?.data?.message || "An error occurred");
//       console.log("Error:", error);
//     }
//   };
//   console.log("formData:", formData);

//   return (
//     <div className="signup-container">
//       <div className="inner-container">
//         <h2 className="text-xl font-bold mb-4 text-center">
//           {isSignUp ? "Sign Up" : "Login"}
//         </h2>
//         {message && <p className="text-center text-red-500">{message}</p>}
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
//           <input
//             type="text"
//             name="role"
//             placeholder="Role (e.g., user, admin)"
//             value={formData.role}
//             onChange={handleChange}
//             className="role-text-box"
//             // required
//           />
//           <button type="submit" className="submit-button">
//             {isSignUp ? "Sign Up" : "Login"}
//           </button>
//         </form>
//         <p className="text-center mt-4 text-sm">
//           {isSignUp ? "Already have an account?" : "Don't have an account?"}
//           <button
//             onClick={() => setIsSignUp(!isSignUp)}
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

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSignUp = async () => {
//     const url = "https://ninebyfourapi.herokuapp.com/api/users";
//     const payload = {
//       username: formData.username,
//       email: formData.email,
//       password: formData.password,
//       role: formData.role,
//     };
//     const response = await axios.post(url, payload, {
//       headers: { "Content-Type": "application/json" },
//     });
//     return response;
//   };

//   const handleLogin = async () => {
//     const url = "https://ninebyfourapi.herokuapp.com/api/users/login";
//     const payload = {
//       username: formData.username,
//       password: formData.password,
//     };
//     const response = await axios.post(url, payload, {
//       headers: { "Content-Type": "application/json" },
//     });
//     return response;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     try {
//       const response = isSignUp ? await handleSignUp() : await handleLogin();
//       setMessage(response.data.message || "Success");
//       console.log("Response:", response.data);
//     } catch (error) {
//       console.error("Auth error:", error);
//       setMessage(error.response?.data?.message || "An error occurred");
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
//         {message && <p className="text-center text-red-500">{message}</p>}
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
//           <input
//             type="text"
//             name="role"
//             placeholder="Role (e.g., user, admin)"
//             value={formData.role}
//             onChange={handleChange}
//             className="role-text-box"
//           />
//           <button type="submit" className="submit-button" disabled={isLoading}>
//             {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
//           </button>
//         </form>
//         <p className="text-center mt-4 text-sm">
//           {isSignUp ? "Already have an account?" : "Don't have an account?"}
//           <button
//             onClick={() => setIsSignUp(!isSignUp)}
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

import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slice"; // Assuming you have an authSlice
import { useNavigate } from "react-router-dom"; // For redirection
import "./Signup.css";

function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // true for signup, false for login
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "", // Optional, backend has a default
  });
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation

  const BASE_URL = "https://ninebyfourapi.herokuapp.com/api"; // Your backend base URL

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async () => {
    let response;
    if (isSignUp) {
      // Register
      const url = `${BASE_URL}/users/register`; // Updated registration endpoint
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role || "user", // Send role, or default to 'user'
      };
      response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Login
      const url = `${BASE_URL}/users/login`; // Updated login endpoint
      const payload = {
        username: formData.username,
        password: formData.password,
      };
      response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });
    }
    return response;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(""); // Clear previous messages

    try {
      const response = await handleAuth();
      setMessage(response.data.message);
      console.log("Response:", response.data);

      if (!isSignUp && response.data.token) {
        // If it's a login and a token is received
        const { token, user } = response.data;

        // 1. Store token in localStorage
        localStorage.setItem("token", token);

        // 2. Dispatch credentials to Redux store
        dispatch(setCredentials({ user, token }));

        // 3. Redirect to a protected page (e.g., dashboard or home)
        navigate("/dashboard"); // Or '/home'
      } else if (isSignUp) {
        // After successful signup, maybe offer to log in or show success
        // Optionally, you can automatically log in after signup by calling handleLogin here
        // For now, let's just switch to the login form
        setIsSignUp(false);
        setFormData({
          // Clear form data after successful signup
          username: "",
          email: "",
          password: "",
          role: "",
        });
      }
    } catch (error) {
      console.error(
        "Authentication error:",
        error.response?.data || error.message
      );
      setMessage(
        error.response?.data?.message ||
          "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="inner-container">
        <h2 className="text-xl font-bold mb-4 text-center">
          {isSignUp ? "Sign Up" : "Login"}
        </h2>
        {message && (
          <p
            className={`text-center ${message.includes("success") ? "text-green-500" : "text-red-500"}`}
          >
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="onSubmit-form">
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
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="email-text-box"
              required
            />
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
          {isSignUp && ( // Only show role during signup if needed, or if it has a default
            <input
              type="text"
              name="role"
              placeholder="Role (e.g., user, admin - optional)"
              value={formData.role}
              onChange={handleChange}
              className="role-text-box"
            />
          )}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(""); // Clear message when switching forms
              setFormData({
                // Clear form data when switching forms
                username: "",
                email: "",
                password: "",
                role: "",
              });
            }}
            className="signup-button"
          >
            {isSignUp ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;
