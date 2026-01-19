import React from "react";
import styles from "./Dashboard.module.css";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Feed from "../Feed/Feed";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className={styles.dashboardContainer}>
      <Feed />
    </div>
  );
};

export default Dashboard;
