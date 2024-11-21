import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyRegistrationCode } from "../services/api";

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
    <form onSubmit={handleVerifyCode}>
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
          type="text"
          className="form-control"
          placeholder="Enter Verification Code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          required
        />
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
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
            "Verify Code"
          )}
        </button>

        <button
          type="button"
          className="btn btn-link"
          style={{ textDecoration: "none", fontFamily: "Poppins" }}
          onClick={handleSendVerificationCode}
        >
          Resend Code
        </button>
      </div>
    </form>
  );
};

export default VerificationForm;
