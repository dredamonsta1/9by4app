import React from "react";
import { Link } from "react-router-dom";
import styles from "./PaymentCancel.module.css";

const PaymentCancel = () => (
  <div className={styles.page}>
    <div className={styles.card}>
      <div className={styles.icon}>✕</div>
      <h1 className={styles.title}>Payment Cancelled</h1>
      <p className={styles.body}>
        No charge was made. You can upgrade anytime from the pricing page.
      </p>
      <Link to="/pricing" className={styles.btn}>
        Back to Pricing
      </Link>
    </div>
  </div>
);

export default PaymentCancel;
