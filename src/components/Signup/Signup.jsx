import React, { useState } from "react";
// --- FIX: Import your custom axiosInstance ---
import axiosInstance from "../../utils/axiosInstance";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- FIX: No longer need BASE_URL, it's configured in axiosInstance ---

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async () => {
    let response;
    if (isSignUp) {
      // Register
      // --- FIX: Use axiosInstance and relative URL ---
      const url = `/users/register`;
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role || "user",
      };
      response = await axiosInstance.post(url, payload);
    } else {
      // Login
      // --- FIX: Use axiosInstance and relative URL ---
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
    setIsLoading(true);
    setMessage("");

    try {
      const response = await handleAuth();
      setMessage(response.data.message);

      if (!isSignUp && response.data.token) {
        const { token, user } = response.data;

        // --- THE CRITICAL FIX ---
        // Use 'authToken' to match the key in axiosInstance.js
        localStorage.setItem("authToken", token);

        dispatch(setCredentials({ user, token }));
        navigate("/dashboard");
      } else if (isSignUp) {
        setIsSignUp(false);
        setFormData({ username: "", email: "", password: "", role: "" });
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

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage("");
              setFormData({
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
