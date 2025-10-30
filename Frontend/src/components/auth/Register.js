import  { useState } from "react";
import { registerUser, sendVerificationCode } from "../../services/api";
import VerificationForm from "./VerificationForm";
import "./Register.css";
import { Link } from "react-router-dom";
import { FormInput, AlertBanner, LoadingButton } from "../common";
import { useFormState, useApiError, useLoading, usePasswordValidation } from "../../hooks";
import { ERROR_MESSAGES } from "../../constants/appConstants";

const Register = ({ theme }) => {
  const { formData, handleChange } = useFormState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { error, setError, clearError, handleError } = useApiError(false);
  const { isLoading, startLoading, stopLoading } = useLoading();
  const { passwordError, validatePasswordMatch, clearPasswordError } = usePasswordValidation();

  const [message, setMessage] = useState("");
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [hasVerificationCode, setHasVerificationCode] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    clearError();
    clearPasswordError();
    setMessage("");

    if (!validatePasswordMatch(formData.password, formData.confirmPassword)) {
      return;
    }

    startLoading();
    try {
      const response = await registerUser(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      );
      setMessage(response.data.message || "Registration successful!");
      setIsVerificationStep(true);
      setHasVerificationCode(true);
    } catch (err) {
      handleError(err, ERROR_MESSAGES.REGISTRATION_FAILED);
    } finally {
      stopLoading();
    }
  };

  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    clearError();
    setMessage("");
    startLoading();

    try {
      const response = await sendVerificationCode(formData.email);
      setMessage(response.data.message || "Verification code sent!");
    } catch (err) {
      handleError(err, "Failed to send code.");
    } finally {
      stopLoading();
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

        <AlertBanner type="error" message={error} onClose={clearError} />
        <AlertBanner type="success" message={message} onClose={() => setMessage("")} />

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
            <div className="row">
              <div className="col-6">
                <FormInput
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-6">
                <FormInput
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <FormInput
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <FormInput
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <FormInput
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={passwordError}
              required
            />

            <LoadingButton
              type="submit"
              isLoading={isLoading}
              className="register-btn w-100 mb-3"
              variant="primary"
            >
              Register
            </LoadingButton>
          </form>
        )}

        {(isVerificationStep || hasVerificationCode) && (
          <VerificationForm
            email={formData.email}
            setEmail={(value) => handleChange({ target: { name: "email", value } })}
            handleSendVerificationCode={handleSendVerificationCode}
            setMessage={setMessage}
            setError={setError}
            setIsLoading={startLoading}
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
