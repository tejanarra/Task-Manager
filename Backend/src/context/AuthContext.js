import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("userInfo");

    if (token && userInfo) {
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        setUser({ token, ...parsedUserInfo });
        if (
          (location.pathname === "/login" ||
            location.pathname === "/register") &&
          location.pathname !== "/forgot-password"
        ) {
          navigate("/");
        }
      } catch (error) {
        console.error("Error parsing user info from localStorage:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        if (
          location.pathname !== "/login" &&
          location.pathname !== "/register" &&
          location.pathname !== "/forgot-password"
        ) {
          navigate("/login");
        }
      }
    } else {
      if (
        location.pathname !== "/login" &&
        location.pathname !== "/register" &&
        location.pathname !== "/forgot-password"
      ) {
        navigate("/login");
      }
    }
  }, [navigate, location]);

  const login = (token, userInfo) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    setUser({ token, ...userInfo });
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
