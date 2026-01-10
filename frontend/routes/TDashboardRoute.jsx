import React from "react";
import { Navigate } from "react-router-dom";

const TDashboardRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole"); 
  
  if (!isLoggedIn || userRole !== "teacher") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default TDashboardRoute;
