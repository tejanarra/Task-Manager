import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendForgotPasswordRequest, resetPassword } from "../services/api";
import "../Styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [hasCode, setHasCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await sendForgotPasswordRequest(email);
      setMessage(
        response.data.message ||
          "Please check your email for further instructions."
      );
      setIsEmailSent(true);
    } catch (err) {
      console.error("Error sending reset email:", err);
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await resetPassword(
        email,
        verificationCode,
        newPassword
      );
      setMessage(response.data.message || "Password reset successful!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Error resetting password:", err);
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page d-flex align-items-center justify-content-center">
      <div className="forgot-password-form wider-form">
        <h1 className="fw-bold mb-2">Forgot Password</h1>
        <p className="text-muted mb-4">
          {hasCode || isEmailSent
            ? "Enter your verification code and reset your password."
            : "Enter your email to receive a verification code."}
        </p>

        <form
          onSubmit={
            hasCode || isEmailSent ? handleResetPassword : handleSendEmail
          }
        >
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="hasCodeCheck"
              checked={hasCode}
              onChange={() => {
                setHasCode(!hasCode);
                setError("");
                setMessage("");
              }}
            />
            <label className="form-check-label" htmlFor="hasCodeCheck">
              I already have a verification code
            </label>
          </div>

          <div className="mb-3">
            <input
              type="email"
              className="form-control py-2"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isEmailSent}
            />
          </div>

          {(hasCode || isEmailSent) && (
            <>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control py-2"
                  id="verificationCode"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control py-2"
                  id="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control py-2"
                  id="confirmNewPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <div className="d-flex justify-content-between mt-4">
            <button type="submit" className="btn btn-dark" disabled={isLoading}>
              {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm text-light"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : hasCode || isEmailSent ? (
                "Reset Password"
              ) : (
                "Send Code"
              )}
            </button>
            <button
              type="button"
              className="btn btn-link back-to-login"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
