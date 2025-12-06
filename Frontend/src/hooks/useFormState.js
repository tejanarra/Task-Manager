"use client";

import { useState, useCallback } from "react";

/**
 * Custom hook for managing form state
 * @param {Object} initialState - Initial form values
 * @returns {Object} - { formData, handleChange, setFormData, resetForm }
 */
const useFormState = (initialState = {}) => {
  const [formData, setFormData] = useState(initialState);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
  }, [initialState]);

  const setFieldValue = useCallback((name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  return {
    formData,
    handleChange,
    setFormData,
    resetForm,
    setFieldValue,
  };
};

export default useFormState;
