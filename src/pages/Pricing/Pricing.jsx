import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./Pricing.module.css";

const PLANS = [
  {
    key: "subscription",
    name: "Creator Monthly",
    price: "$9.99 / mo",
    description: "Full creator access, billed monthly. Cancel anytime.",
    perks: ["Add artists to the platform", "Manage discography & albums", "Cancel anytime"],
    cta: "Subscribe Monthly",
  },
  {
    key: "one_time",
    name: "Creator Lifetime",
    price: "$49.99 once",
    description: "Pay once and own it forever. No recurring charges.",
    perks: ["Add artists to the platform", "Manage discography & albums", "Never pay again"],
    cta: "Get Lifetime Access",
    featured: true,
  },
];

const Pricing = () => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null); // plan key being loaded
  const [error, setError] = useState(null);

  const handleSelect = async (planKey) => {
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(planKey);
    setError(null);
    try {
      const res = await axiosInstance.post("/payments/checkout", { planType: planKey });
      window.location.href = res.data.url;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start checkout. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Become a Creator</h1>
        <p className={styles.subtitle}>
          Unlock the ability to add and manage artists on the platform.
        </p>
      </div>

      <div className={styles.grid}>
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`${styles.card} ${plan.featured ? styles.featured : ""}`}
          >
            {plan.featured && <span className={styles.badge}>Best Value</span>}
            <h2 className={styles.planName}>{plan.name}</h2>
            <p className={styles.planPrice}>{plan.price}</p>
            <p className={styles.planDesc}>{plan.description}</p>

            <ul className={styles.perks}>
              {plan.perks.map((perk) => (
                <li key={perk} className={styles.perk}>
                  <span className={styles.check}>✓</span> {perk}
                </li>
              ))}
            </ul>

            <button
              className={`${styles.ctaBtn} ${plan.featured ? styles.ctaBtnFeatured : ""}`}
              onClick={() => handleSelect(plan.key)}
              disabled={!!loading}
            >
              {loading === plan.key ? "Redirecting..." : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default Pricing;
