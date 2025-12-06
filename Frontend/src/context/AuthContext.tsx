"use client";

import { createContext, useState, useContext, useEffect, ReactNode } from "react";

interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface User extends UserInfo {
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userInfo: UserInfo) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from localStorage only on client side
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("userInfo");

    if (token && userInfo) {
      try {
        setUser({ token, ...JSON.parse(userInfo) });
      } catch (error) {
        console.error("AuthContext - Error parsing user info from localStorage:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        setUser(null);
      }
    }

    setIsLoading(false);
  }, []);

  const login = (token: string, userInfo: UserInfo) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    setUser({ token, ...userInfo });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  // Listen for storage changes across tabs
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

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
