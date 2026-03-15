import React from "react";
import { Link } from "react-router-dom";
import styles from "./PaymentSuccess.module.css";

const PaymentSuccess = () => (
  <div className={styles.page}>
    <div className={styles.card}>
      <div className={styles.icon}>✓</div>
      <h1 className={styles.title}>You're a Creator!</h1>
      <p className={styles.body}>
        Your payment was successful. Your account has been upgraded and you can
        now add artists to the platform.
      </p>
      <Link to="/profile" className={styles.btn}>
        Go to Your Profile
      </Link>
    </div>
  </div>
);

export default PaymentSuccess;
