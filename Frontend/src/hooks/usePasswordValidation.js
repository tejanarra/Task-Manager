"use client";

import { useState, useCallback } from "react";
import { VALIDATION_MESSAGES } from "../constants/appConstants";

/**
 * Custom hook for password validation
 * @returns {Object} - { passwordError, validatePassword, validatePasswordMatch, clearPasswordError }
 */
const usePasswordValidation = () => {
  const [passwordError, setPasswordError] = useState("");

  const clearPasswordError = useCallback(() => {
    setPasswordError("");
  }, []);

  const validatePassword = useCallback((password) => {
    if (!password) {
      setPasswordError(VALIDATION_MESSAGES.REQUIRED_FIELD);
      return false;
    }

    if (password.length < 8) {
      setPasswordError(VALIDATION_MESSAGES.PASSWORD_TOO_SHORT);
      return false;
    }

    clearPasswordError();
    return true;
  }, [clearPasswordError]);

  const validatePasswordMatch = useCallback((password, confirmPassword) => {
    if (password !== confirmPassword) {
      setPasswordError(VALIDATION_MESSAGES.PASSWORD_MISMATCH);
      return false;
    }

    clearPasswordError();
    return true;
  }, [clearPasswordError]);

  const validatePasswordStrength = useCallback((password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isStrong: hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    };
  }, []);

  return {
    passwordError,
    validatePassword,
    validatePasswordMatch,
    validatePasswordStrength,
    clearPasswordError,
  };
};

export default usePasswordValidation;
