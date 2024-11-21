import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await loginUser(email, password);
      const { token, userInfo } = data;
      login(token, userInfo);
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err.response?.message || err.message);
      setError(err.response?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4" style={{ fontFamily: "Poppins", fontWeight: "600" }}>
        Login
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className="form-control mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="alert alert-danger">{error}</div>}{" "}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ fontFamily: "Poppins" }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
