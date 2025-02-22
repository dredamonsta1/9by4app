import React, { useState, useEffect } from "react";
import axios from "axios";
// import MainList from "../MainList/MainList";
import RapperList from "../RapperList";

const UserProfile = (props) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get("https://ninebyfourapi.herokuapp.com/api/users", { method: "GET" })
      .then((res) => {
        setUser(res.data);
        setLoading(false);
        console.log("Users:", res.data.users);
      })
      .catch((error) => {
        console.error("fetching data:", error);
        setError(true);
        setLoading(false);
        if (error.res) {
          console.log("Error response:", error.res.data);
        } else if (error.req) {
          console.log("Request error:", error.req);
        } else {
          console.log("General error:", error.message);
        }
        // console.log("Name", user.username);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data</p>;

  return (
    <div>
      <h1> user Profile </h1>
      {Array.isArray(user) ? (
        user.map((user) => (
          <div key={user.id}>
            <h2>Username: {user.username || "N/A"}</h2>
            <p>Email: {user.email || "N/A"}</p>
            <p>Role: {user.role || "N/A"}</p>
          </div>
        ))
      ) : (
        <div>
          <h2>Username: {user.username || "N/A"}</h2>
          <p>Email: {user.email || "N/A"}</p>
          <p>Role: {user.role || "N/A"}</p>
        </div>
      )}
      {/* <MainList /> */}
      <RapperList />
    </div>
  );
};
export default UserProfile;
