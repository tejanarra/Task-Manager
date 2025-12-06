"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { isAuthorizationError } from "../utils/errorUtils";

/**
 * Custom hook for authorization checking
 * @returns {Object} - { checkAuth }
 */
const useAuthCheck = () => {
  const router = useRouter();
  const { logout } = useAuth();

  const checkAuth = useCallback(
    (error) => {
      if (isAuthorizationError(error)) {
        logout();
        router.push("/login");
        return true;
      }
      return false;
    },
    [logout, router]
  );

  return { checkAuth };
};

export default useAuthCheck;
