import { Navigate } from "react-router-dom";

const DashboardRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role");

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (role === "teacher") {
    return <Navigate to="/teacher/dashboard" />;
  }

  if (role === "student") {
    return <Navigate to="/student/dashboard" />;
  }

  return <Navigate to="/login" />;
};

export default DashboardRoute;
