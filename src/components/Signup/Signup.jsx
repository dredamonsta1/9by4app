// src/components/Signup/Signup.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function AuthForm() {
  // Use Redux status to handle loading globally
  const { status, isLoggedIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isWaitlist, setIsWaitlist] = useState(false);
  const [localLoading, setLocalLoading] = useState(false); // Only for waitlist
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    inviteCode: "",
    fullName: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  // Redirect if already logged in - don't let them see the login page
  useEffect(() => {
    if (isLoggedIn) navigate("/dashboard");
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setMessage({ text: "", type: "" });

    try {
      let response;
      if (isWaitlist) {
        response = await axiosInstance.post("/waitlist/join", {
          email: formData.email,
          full_name: formData.fullName,
        });
        setMessage({ text: "Added to waitlist!", type: "success" });
      } else {
        const url = isSignUp ? "/users/register" : "/users/login";
        const payload = isSignUp
          ? { ...formData, invite_code: formData.inviteCode }
          : { username: formData.username, password: formData.password };

        response = await axiosInstance.post(url, payload);

        if (!isSignUp && response.data.token) {
          const { token, user } = response.data;
          // FIX: SYNCED KEY NAME
          localStorage.setItem("token", token);
          dispatch(setCredentials({ user, token }));
        } else if (isSignUp) {
          setMessage({
            text: "Account created! Please log in.",
            type: "success",
          });
          setIsSignUp(false);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "An error occurred.";
      setMessage({ text: errorMsg, type: "error" });

      if (error.response?.data?.waitlist_enabled) {
        setIsWaitlist(true);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  // Switch modes cleanly
  const switchMode = (mode) => {
    setIsSignUp(mode === "signup");
    setIsWaitlist(mode === "waitlist");
    setMessage({ text: "", type: "" });
  };

  const isLoading = localLoading || status === "loading";

  return (
    <div className="signup-container">
      <div className="inner-container">
        <h2>{isWaitlist ? "Join Waitlist" : isSignUp ? "Sign Up" : "Login"}</h2>

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
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />
          ) : (
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          {!isWaitlist && (
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
          )}

          {isSignUp && (
            <input
              type="text"
              name="inviteCode"
              placeholder="Invite Code"
              onChange={handleChange}
              required
            />
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : "Submit"}
          </button>
        </form>
        {/* Switcher buttons logic here */}
      </div>
    </div>
  );
}

export default AuthForm;
