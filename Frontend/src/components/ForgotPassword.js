import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendForgotPasswordRequest, resetPassword } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

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
    <div className="container mt-5">
      <h2 className="mb-4" style={{ fontFamily: "Poppins", fontWeight: "600" }}>
        Forgot Password
      </h2>

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
          <label
            className="form-check-label"
            htmlFor="hasCodeCheck"
            style={{ fontFamily: "Poppins" }}
          >
            I already have a verification code
          </label>
        </div>

        <input
          type="email"
          className="form-control mb-3"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isEmailSent}
        />

        {(hasCode || isEmailSent) && (
          <>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
            <input
              type="password"
              className="form-control mb-3"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              className="form-control mb-3"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </>
        )}

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <div className="d-flex justify-content-between mt-3">
          <button
            type="submit"
            className="btn btn-primary"
            style={{ fontFamily: "Poppins" }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span
                className="spinner-border spinner-border-sm"
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
            className="btn btn-link"
            style={{ textDecoration: "none" }}
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
