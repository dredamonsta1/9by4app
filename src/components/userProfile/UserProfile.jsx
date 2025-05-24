import React, { useState, useEffect } from "react";
import axios from "axios";
// import MainList from "../MainList/MainList";
import axiosInstance from "../../utils/axiosInstance";
import RapperList from "../RapperList";

const UserProfile = (props) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      console.log("UserProfile: Token from localStorage:", token);

      if (!token) {
        setError("You are not logged in. Please log in to view your profile.");
        console.log("UserProfile: No token found in localStorage.");
        return;
      }
      try {
        const response = await axiosInstance.get("/users");
        setUser(response.data.users);
        setLoading(false);
      } catch (error) {
        console.error(
          "Error fetching user profile:",
          error.response?.data || error.message
        );
        setError(error.response?.data?.message || "failed to fetch user data.");

        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);
  //   setLoading(true);
  //   axios
  //     .get("https://ninebyfourapi.herokuapp.com/api/users", {
  //       method: "GET",
  //     })
  //     .then((res) => {
  //       setUser(res.data.users);
  //       setLoading(false);
  //       console.log("Users:", res.data.users);
  //     })
  //     .catch((error) => {
  //       console.error("fetching data:", error);
  //       setError(true);
  //       setLoading(false);
  //       if (error.res) {
  //         console.log("Error response:", error.res.data);
  //       } else if (error.req) {
  //         console.log("Request error:", error.req);
  //       } else {
  //         console.log("General error:", error.message);
  //       }
  //       console.log("Name", user.username);
  //     });
  // }, []);

  if (loading) return <p>Loading...</p>;
  if (error) {
    return <p>Error {error}fetching data</p>;
  }
  if (!user) {
    return <div>Loading user profile.....</div>;
  }

  return (
    <div>
      <h3> user Profile </h3>
      {user.length > 0 ? (
        <ul>
          {user.map((user) => (
            <li key={user.user_id}>
              <p>Username: {user.username}</p>
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No user data found</p>
      )}
      {/* <RapperList /> */}
    </div>
    // {Array.isArray(user) ? (
    //   user.map((user) => (
    //     <div key={user.id}>
    //       <h2>Username: {user.username || "N/A"}</h2>
    //       <p>Email: {user.email || "N/A"}</p>
    //       <p>Role: {user.role || "N/A"}</p>
    //     </div>
    //   ))
    // ) : (
    //   <div>
    //     <h2>Username: {user.username || "N/A"}</h2>
    //     <p>Email: {user.email || "N/A"}</p>
    //     <p>Role: {user.role || "N/A"}</p>
    // </div>
    // )}
    // {/* <MainList /> */}
    // </div>
  );
};
export default UserProfile;
