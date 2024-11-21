import React, { useState } from "react";
import { registerUser, sendVerificationCode } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import VerificationForm from "./VerificationForm";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasVerificationCode, setHasVerificationCode] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await registerUser(username, email, password);
      setMessage(response.data.message || "Registration successful!");
      setIsVerificationStep(true);
      setHasVerificationCode(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await sendVerificationCode(email);
      setMessage(response.data.message || "Verification code sent!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCheckbox = () => {
    setHasVerificationCode(!hasVerificationCode);
    if (hasVerificationCode) {
      setIsVerificationStep(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4" style={{ fontFamily: "Poppins", fontWeight: "600" }}>
        {isVerificationStep || hasVerificationCode
          ? "Verify Registration"
          : "Register"}
      </h2>

      <div className="form-check mb-4">
        <input
          type="checkbox"
          className="form-check-input"
          id="hasVerificationCode"
          checked={hasVerificationCode}
          onChange={handleToggleCheckbox}
        />
        <label className="form-check-label" htmlFor="hasVerificationCode">
          I already have a verification code
        </label>
      </div>

      {!isVerificationStep && !hasVerificationCode && (
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary mb-3"
            style={{ fontFamily: "Poppins" }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              "Register"
            )}
          </button>
        </form>
      )}

      {(isVerificationStep || hasVerificationCode) && (
        <VerificationForm
          email={email}
          setEmail={setEmail}
          handleSendVerificationCode={handleSendVerificationCode}
          setMessage={setMessage}
          setError={setError}
          setIsLoading={setIsLoading}
          setIsVerificationStep={setIsVerificationStep}
          isLoading={isLoading}
        />
      )}

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
    </div>
  );
};

export default Register;
