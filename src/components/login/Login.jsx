// src/components/login/Login.jsx (Refactored logic)

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useLocation } from "react-router-dom";
// import { setCredentials } from "../../redux/slices/authSlice";
import { setCredentials } from "../../store/authSlice";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./Login.module.css";

function LoginForm() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  // High-level UX: Default signup path to Waitlist, NOT the registration form
  const [mode, setMode] = useState(isLoginPage ? "login" : "waitlist");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    inviteCode: "",
    fullName: "",
  });

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
    <div className="auth-container">
      <h2>
        {mode === "waitlist"
          ? "Join the Inner Circle"
          : mode === "signup"
            ? "Create Creator Account"
            : "Welcome Back"}
      </h2>

      <form onSubmit={handleSubmit}>
        {mode === "waitlist" && (
          <>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              required
            />
            <input type="email" name="email" placeholder="Email" required />
            <button type="submit">Get My Invite Code</button>
            <p onClick={() => setMode("signup")}>Already have a code?</p>
          </>
        )}

        {mode === "signup" && (
          <>
            <input
              type="text"
              name="inviteCode"
              placeholder="Enter Invite Code"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Pick a Username"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <button type="submit">Register as Creator</button>
          </>
        )}

        {mode === "login" && (
          <>
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <button type="submit">Login</button>
          </>
        )}
      </form>
    </div>
  );
}
export default LoginForm;
