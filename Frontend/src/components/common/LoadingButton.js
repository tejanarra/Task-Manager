import React from "react";
import "./LoadingButton.css";

/**
 * Reusable button with loading state
 * @param {boolean} isLoading - Whether button is in loading state
 * @param {string} children - Button text content
 * @param {string} loadingText - Text to show when loading (optional)
 * @param {string} type - Button type (button, submit, reset)
 * @param {string} className - Additional CSS classes
 * @param {boolean} disabled - Whether button is disabled
 * @param {function} onClick - Click handler
 * @param {string} variant - Button variant (primary, secondary, danger, etc.)
 * @param {Object} rest - Other button attributes
 */
const LoadingButton = ({
  isLoading = false,
  children,
  loadingText = "Loading...",
  type = "button",
  className = "",
  disabled = false,
  onClick,
  variant = "primary",
  ...rest
}) => {
  const buttonClass = variant === "primary"
    ? "sign-in-btn"
    : `btn-${variant}`;

  return (
    <button
      type={type}
      className={`btn ${buttonClass} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      {isLoading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
