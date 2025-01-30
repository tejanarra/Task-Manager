// Login.js

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api";
import "../Styles/Login.css";

const Login = ({ theme }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data } = await loginUser(email, password);
      const { token, userInfo } = data;
      login(token, userInfo);
      navigate("/");
    } catch (err) {
      console.error(
        "Login failed:",
        err.response?.data?.message || err.message
      );
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <div className="login-form">
        <h1 className="fw-bold mb-2">Welcome back</h1>
        <p className={`text-${theme === "dark" ? "light" : "muted"} mb-4`}>
          Please enter your details
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control py-2"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control py-2"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn sign-in-btn w-100 mb-3`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span
                className="spinner-border spinner-border-sm text-light"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="d-flex justify-content-between mt-3">
          <Link to="/register" className="register-link">
            Register
          </Link>
          <button
            className="btn btn-link forgot-password-link p-0"
            onClick={handleForgotPassword}
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
