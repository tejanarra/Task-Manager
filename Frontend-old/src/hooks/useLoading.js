import { useState, useCallback } from "react";

/**
 * Custom hook for managing loading state
 * @param {boolean} initialState - Initial loading state (default: false)
 * @returns {Object} - { isLoading, startLoading, stopLoading, setIsLoading }
 */
const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    setIsLoading,
  };
};

export default useLoading;
