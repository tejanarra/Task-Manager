import React, { useState } from "react";
import { registerUser, sendVerificationCode } from "../services/api";
import VerificationForm from "./VerificationForm";
import "../Styles/Register.css";
import { Link } from "react-router-dom";

const Register = ({ theme }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasVerificationCode, setHasVerificationCode] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await registerUser(firstName, lastName, email, password);
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
    <div className="register-page d-flex align-items-center justify-content-center">
      <div className="register-form wider-form">
        <h1 className="fw-bold mb-2">
          {isVerificationStep || hasVerificationCode
            ? "Verify Registration"
            : "Register"}
        </h1>
        <p className={`text-${theme === "dark" ? "light" : "muted"} mb-4`}>
          {isVerificationStep || hasVerificationCode
            ? "Enter your verification code"
            : "Fill in the details to create your account"}
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <div className="form-check mb-3">
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
            <div className="row mb-3">
              <div className="col-6">
                <input
                  type="text"
                  className="form-control py-2"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="col-6">
                <input
                  type="text"
                  className="form-control py-2"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <input
                type="email"
                className="form-control py-2"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control py-2"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control py-2"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordsMatch(e.target.value === password);
                }}
                required
              />
            </div>

            {!passwordsMatch && (
              <div className="alert alert-danger">Passwords do not match.</div>
            )}

            <button
              type="submit"
              className={`btn register-btn w-100 mb-3`}
              disabled={isLoading || !passwordsMatch}
            >
              {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm text-light"
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

        <div className="text-center mt-4">
          <p className="mb-0 d-flex justify-content-center align-items-center gap-1">
            Already have an account?{" "}
            <Link to="/login" className="login-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
