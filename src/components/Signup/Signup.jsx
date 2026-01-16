import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import styles from "../../AuthLayout.module.css";

function Signup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
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
      await axiosInstance.post("/users/register", {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        invite_code: formData.inviteCode.trim().toUpperCase(),
      });

      setMessage({
        text: "Account verified! Redirecting to login...",
        type: "success",
      });

      // High-level UX: shorter delay for a snappier feel
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setMessage({
        text:
          error.response?.data?.message ||
          "Registration failed. Check your code.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Creator Registration</h1>
        <p className={styles.subtitle}>
          Enter your details to activate your account.
        </p>

        {message.text && (
          <div
            className={
              message.type === "success" ? styles.successBox : styles.errorBox
            }
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              className={styles.input}
              value={formData.email}
              onChange={handleChange}
              readOnly={!!searchParams.get("email")}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Invite Code</label>
            <input
              type="text"
              name="inviteCode"
              className={styles.input}
              value={formData.inviteCode}
              onChange={handleChange}
              placeholder="ENTER-CODE"
              required
              readOnly={!!searchParams.get("code")}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Choose Username</label>
            <input
              type="text"
              name="username"
              className={styles.input}
              value={formData.username}
              onChange={handleChange}
              placeholder="username"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Set Password</label>
            <input
              type="password"
              name="password"
              className={styles.input}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Activate Account"}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
