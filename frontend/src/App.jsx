import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TeacherDashboard from "./pages/TeacherDashboard";
import ClassroomPage from "./pages/ClassroomPage";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import AddStudent from "./pages/AddStudent";
import StudentDashboard from "./pages/StudentDashboard";
import StudentClassroomPage from "./pages/StudentClassroomPage";
import StudentAnnouncementDetail from "./pages/StudentAnnouncementDetail";
import StudentVideoPage from "./pages/StudentVideoPage";
import SignAvatarPage from "./pages/ClassroomExperience";

import TDashboardRoute from "../routes/TDashboardRoute";
import DashboardRoute from "../routes/DashboardRoute";
import auth from "./api/auth";

import MainLayout from "./layouts/MainLayout";
import NoNavbarLayout from "./layouts/NoNavbarLayout";

function App() {
  const [, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) auth.setAuthHeader(token);

    const syncAuth = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
      auth.setAuthHeader(localStorage.getItem("accessToken"));
    };

    window.addEventListener("authChange", syncAuth);
    return () => window.removeEventListener("authChange", syncAuth);
  }, []);

  return (
    <Router>
      <Routes>

        {/* 🌐 Routes WITH Navbar */}
        <Route element={<MainLayout />}>
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
          <Route
            path="/teacher/class/:id"
            element={
              <TDashboardRoute>
                <ClassroomPage />
              </TDashboardRoute>
            }
          />
          <Route
            path="/announcement/:id"
            element={
              <TDashboardRoute>
                <AnnouncementDetail />
              </TDashboardRoute>
            }
          />
          <Route
            path="/add-student/:classId"
            element={
              <TDashboardRoute>
                <AddStudent />
              </TDashboardRoute>
            }
          />

          <Route
            path="/student/dashboard"
            element={
              <DashboardRoute>
                <StudentDashboard />
              </DashboardRoute>
            }
          />
          <Route
            path="/student/class/:id"
            element={
              <DashboardRoute>
                <StudentClassroomPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/student/announcement/:id"
            element={
              <DashboardRoute>
                <StudentAnnouncementDetail />
              </DashboardRoute>
            }
          />
          <Route
            path="/student/video"
            element={
              <DashboardRoute>
                <StudentVideoPage />
              </DashboardRoute>
            }
          />
        </Route>

        {/* 🎮 Route WITHOUT Navbar */}
        <Route element={<NoNavbarLayout />}>
          <Route
            path="/student/avatar"
            element={
              <DashboardRoute>
                <SignAvatarPage />
              </DashboardRoute>
            }
          />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
