"use client";

import { useState, useCallback } from "react";
import { getErrorMessage, isAuthorizationError } from "../utils/errorUtils";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

/**
 * Custom hook for handling API errors
 * @param {boolean} handleAuth - Whether to handle authorization errors (default: true)
 * @returns {Object} - { error, setError, clearError, handleError }
 */
const useApiError = (handleAuth = true) => {
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const router = useRouter();

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const handleError = useCallback(
    (err, defaultMessage) => {
      console.error("API Error:", err);

      // Handle authorization errors
      if (handleAuth && isAuthorizationError(err)) {
        logout();
        router.push("/login");
        setError("Session expired. Please login again.");
        return;
      }

      // Set error message
      const message = getErrorMessage(err, defaultMessage);
      setError(message);
    },
    [handleAuth, logout, router]
  );

  return {
    error,
    setError,
    clearError,
    handleError,
  };
};

export default useApiError;
