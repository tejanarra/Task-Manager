import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser, loginWithGoogle } from "../../services/api";
import "./Login.css";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import googlelogo from "../../assets/google_logo.png";
import { FormInput, AlertBanner, LoadingButton } from "../common";
import { useFormState, useApiError, useLoading } from "../../hooks";
import { ERROR_MESSAGES } from "../../constants/appConstants";

const Login = ({ theme }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const { formData, handleChange } = useFormState({
    email: "",
    password: "",
  });
  const { error, clearError, handleError } = useApiError(false);
  const { isLoading, startLoading, stopLoading } = useLoading();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    startLoading();

    try {
      const { data } = await loginUser(formData.email, formData.password);
      const { token, userInfo } = data;
      login(token, userInfo);
      navigate("/tasks");
    } catch (err) {
      handleError(err, ERROR_MESSAGES.LOGIN_FAILED);
    } finally {
      stopLoading();
    }
  };

  const handleGoogleLoginFlow = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (response) => {
      startLoading();
      try {
        const { data } = await loginWithGoogle(response.code);
        login(data.token, data.userInfo);
        navigate("/tasks");
      } catch (err) {
        handleError(err, "Google login failed");
        googleLogout();
      } finally {
        stopLoading();
      }
    },
    onError: () => {
      handleError({ message: "Google login failed" });
      stopLoading();
    },
    scope: "openid email profile",
  });

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

        <AlertBanner type="error" message={error} onClose={clearError} />

        <form onSubmit={handleSubmit}>
          <FormInput
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <FormInput
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <LoadingButton
            type="submit"
            isLoading={isLoading}
            className="w-100 mb-3"
            variant="primary"
          >
            Login
          </LoadingButton>
        </form>

        <div className="oauth-container mb-3">
          <button
            className={`btn google-signin-btn w-100 mb-3 d-flex align-items-center justify-content-center gap-2 ${
              theme === "dark" ? "dark-theme" : ""
            }`}
            onClick={handleGoogleLoginFlow}
            disabled={isLoading}
            type="button"
            useOneTap
          >
            <img
              src={googlelogo}
              alt="Google logo"
              style={{ width: "24px", height: "24px" }}
            />
            <span>Sign in with Google</span>
          </button>
        </div>

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
