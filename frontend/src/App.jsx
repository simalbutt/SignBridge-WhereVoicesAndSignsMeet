import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TeacherDashboard from "./pages/TeacherDashboard";
import ClassroomPage from "./pages/ClassroomPage";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import AddStudent from "./pages/AddStudent"; 
import TDashboardRoute from "../routes/TDashboardRoute";

function App() {
  return (
    <Router>
      <Navbar />

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
      </Routes>
    </Router>
  );
}

export default App;
