import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isAuthorizationError } from "../utils/errorUtils";

/**
 * Custom hook for authorization checking
 * @returns {Object} - { checkAuth }
 */
const useAuthCheck = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const checkAuth = useCallback(
    (error) => {
      if (isAuthorizationError(error)) {
        logout();
        navigate("/login");
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  return { checkAuth };
};

export default useAuthCheck;
