import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import authSlice from "../../store/slice";
import "./Signup.css";

// import { UserProfile } from "../UserProfile/UserProfile";

function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async () => {
    const url = "https://ninebyfourapi.herokuapp.com/api/users";
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };
    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response;
  };

  const handleLogin = async () => {
    const url = "https://ninebyfourapi.herokuapp.com/api/users/login";
    const payload = {
      username: formData.username,
      password: formData.password,
    };
    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "https://ninebyfourapi.herokuapp.com/api/users";
      const response = await axios.post(url, formData);

      setMessage(response.data.message || "Success");
      console.log("this is the isSignUp", response.data); // <--------not working
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred");
      console.log("Error:", error);
    }
  };
  console.log("formData:", formData);

  return (
    <div className="signup-container">
      <div className="inner-container">
        <h2 className="text-xl font-bold mb-4 text-center">
          {isSignUp ? "Sign Up" : "Login"}
        </h2>
        {message && <p className="text-center text-red-500">{message}</p>}
        <form onSubmit={handleSubmit} className="onSubmit-form">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="email-text-box"
            required
          />
          {isSignUp && (
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="email-text-box"
              required
            />
          )}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="password-text-box"
            required
          />
          <input
            type="text"
            name="role"
            placeholder="Role (e.g., user, admin)"
            value={formData.role}
            onChange={handleChange}
            className="role-text-box"
            // required
          />
          <button type="submit" className="submit-button">
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="signup-button"
          >
            {isSignUp ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
export default AuthForm;
