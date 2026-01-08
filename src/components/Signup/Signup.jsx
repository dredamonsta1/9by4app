// src/components/Signup/Signup.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
// import "./Signup.css";
import styles from "./Signup.module.css";

function Signup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    // Auto-fill from the URL if present
    email: searchParams.get("email") || "",
    inviteCode: searchParams.get("code") || "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await axiosInstance.post("/users/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        invite_code: formData.inviteCode, // Matches your backend key
      });

      setMessage({
        text: "Account created! Redirecting to login...",
        type: "success",
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Registration failed.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="inner-container">
        <h2>Creator Registration</h2>
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
          {/* Email is read-only if it came from the invite to prevent mismatches */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            readOnly={!!searchParams.get("email")}
            className={searchParams.get("email") ? "bg-gray-100" : ""}
            required
          />
          <input
            type="text"
            name="inviteCode"
            placeholder="Invite Code"
            value={formData.inviteCode}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Join 9by4"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
