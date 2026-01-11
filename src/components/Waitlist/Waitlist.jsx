import React, { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import styles from "../../AuthLayout.module.css";

const Waitlist = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await axiosInstance.post("/waitlist/join", {
        email: email.toLowerCase().trim(),
        full_name: fullName.trim(),
      });
      setStatus("success");
    } catch (err) {
      console.error("Waitlist Error:", err);
      setStatus("error");
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Join the Waitlist</h1>

        {status === "success" ? (
          <div className={styles.successContainer}>
            <div className={styles.successBox}>
              You're on the list! We'll email your invite code soon.
            </div>
            <p className={styles.subtitle}>
              Keep an eye on <strong>{email}</strong> for your access link.
            </p>
            <Link
              to="/login"
              className={styles.submitBtn}
              style={{
                textAlign: "center",
                display: "block",
                textDecoration: "none",
              }}
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className={styles.subtitle}>
              9by4 is currently invite-only to ensure a high-quality community.
            </p>

            {status === "error" && (
              <div className={styles.errorBox}>
                Something went wrong. Please try again or use a different email.
              </div>
            )}

            <form onSubmit={handleJoinWaitlist}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className={styles.input}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={status === "loading"}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="name@provider.com"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "loading"}
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Requesting..." : "Request Invite Code"}
              </button>
            </form>

            <div className={styles.authFooter}>
              <p>
                Already have a code? <Link to="/register">Register here</Link>
              </p>
              <p>
                Member? <Link to="/login">Sign In</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Waitlist;
