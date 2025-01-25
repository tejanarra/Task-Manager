import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyRegistrationCode } from "../services/api";
import "../Styles/VerificationForm.css";

const VerificationForm = ({
  email,
  setEmail,
  handleSendVerificationCode,
  setMessage,
  setError,
  setIsLoading,
  setIsVerificationStep,
  isLoading,
}) => {
  const [verificationCode, setVerificationCode] = useState("");
  const navigate = useNavigate();

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await verifyRegistrationCode(email, verificationCode);
      setMessage(response.data.message || "Verification successful!");

      setTimeout(() => {
        setIsVerificationStep(false);
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerifyCode} className="verification-form">
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
          type="text"
          className="form-control py-2"
          id="verificationCode"
          placeholder="Enter verification code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          required
        />
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <button type="submit" className="btn btn-dark" disabled={isLoading}>
          {isLoading ? (
            <span
              className="spinner-border spinner-border-sm text-light"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            "Verify Code"
          )}
        </button>
        <button
          type="button"
          className="btn btn-link resend-link"
          onClick={handleSendVerificationCode}
        >
          Resend Code
        </button>
      </div>
    </form>
  );
};

export default VerificationForm;
