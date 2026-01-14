import React from "react";
import { Navigate } from "react-router-dom";

const DashboardRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole"); 
  
  if (!isLoggedIn || userRole !== "student") {
    return <Navigate to="/login" replace />;
  }
  

  return children;
};

export default DashboardRoute;
