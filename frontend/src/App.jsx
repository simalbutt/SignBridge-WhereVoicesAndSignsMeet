import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TeacherDashboard from "./pages/TeacherDashboard";
import TDashboardRoute from "../routes/TDashboardRoute";

function App() {
  return (
    <Router>
      <Navbar />

      {/* <TeacherDashboard/> */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

  
        <Route
          path="/teacher/dashboard"
          element={
            <TDashboardRoute>
              <TeacherDashboard />
            </TDashboardRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
