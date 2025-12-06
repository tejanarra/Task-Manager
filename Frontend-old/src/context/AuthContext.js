import  { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("userInfo");
    if (token && userInfo) {
      try {
        return { token, ...JSON.parse(userInfo) };
      } catch (error) {
        console.error("AuthContext - Error parsing user info from localStorage:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        return null;
      }
    }
    return null;
  });

  const login = (token, userInfo) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    setUser({ token, ...userInfo });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const userInfo = localStorage.getItem("userInfo");
      if (token && userInfo) {
        try {
          setUser({ token, ...JSON.parse(userInfo) });
        } catch (error) {
          console.error("AuthContext - Error parsing user info from localStorage:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};