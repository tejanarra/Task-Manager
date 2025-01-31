import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  if (user && user.token) {
    return <Navigate to="/tasks" replace />;
  }

  return children;
};

export default PublicRoute;
