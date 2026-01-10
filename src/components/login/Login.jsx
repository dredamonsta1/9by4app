// // src/components/login/login.jsx
// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { setCredentials } from "../../store/authSlice";
// import axiosInstance from "../../utils/axiosInstance";
// import styles from "../../AuthLayout.module.css";

// function Login() {
//   const [formData, setFormData] = useState({ username: "", password: "" });
//   const [error, setError] = useState("");
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axiosInstance.post("/users/login", formData);
//       const { token, user } = response.data;

//       localStorage.setItem("token", token);
//       dispatch(setCredentials({ user, token }));
//       navigate("/dashboard");
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="login-container">
//       <form onSubmit={handleSubmit}>
//         <h2>Login</h2>
//         {error && <p className="text-red-500">{error}</p>}
//         <input
//           type="text"
//           placeholder="Username"
//           onChange={(e) =>
//             setFormData({ ...formData, username: e.target.value })
//           }
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           onChange={(e) =>
//             setFormData({ ...formData, password: e.target.value })
//           }
//           required
//         />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// }

// export default Login;

// ***************************************************

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { setCredentials } from "../../store/authSlice";
import axiosInstance from "../../utils/axiosInstance";
import styles from "../../AuthLayout.module.css"; // Ensure this path is correct

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/users/login", formData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      dispatch(setCredentials({ user, token }));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>
          Enter your credentials to access 9by4.
        </p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              className={styles.input}
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            No invite yet? <Link to="/signup">Join the Waitlist</Link>
          </p>
          <p>
            Received a code? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
