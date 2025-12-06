"use client";

import "./AlertBanner.css";

/**
 * Reusable alert banner component
 * @param {string} type - Alert type (success, error, warning, info)
 * @param {string} message - Message to display
 * @param {function} onClose - Close handler (optional)
 * @param {string} className - Additional CSS classes
 */
const AlertBanner = ({ type = "info", message, onClose, className = "" }) => {
  if (!message) return null;

  const alertClass = {
    success: "alert-success",
    error: "alert-danger",
    warning: "alert-warning",
    info: "alert-info",
  }[type] || "alert-info";

  return (
    <div className={`alert ${alertClass} ${className} d-flex align-items-center justify-content-between`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};

export default AlertBanner;
