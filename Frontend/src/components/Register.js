import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await registerUser(username, email, password);
      const response = await loginUser(email, password);
      const { token, userInfo } = response.data;
      login(token, userInfo);
      navigate("/");
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4" style={{ fontFamily: "Poppins", fontWeight: "600" }}>
        Register
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
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
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
