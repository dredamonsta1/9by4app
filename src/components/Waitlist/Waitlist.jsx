import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "../Waitlist/Waitlist.module.css";

const Waitlist = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      // Logic: Send the prospect to the backend waitlist table
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

  if (status === "success") {
    return (
      <div className={styles.message}>
        You're on the list! Keep an eye on your inbox.
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Join the 9by4 Waitlist</h2>
      <p>Registration is currently invite-only for selected creators.</p>
      <form onSubmit={handleJoinWaitlist}>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Joining..." : "Get My Invite Code"}
        </button>
      </form>
    </div>
  );
};

export default Waitlist;
