import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import auth from "../api/auth";

const Login = () => {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await auth.login({ email, password, role });

    if (!res.data.success) {
      setError(res.data.message || "Login failed!");
      return;
    }

    const { access, refresh, name, role: userRole } = res.data.data;

    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("userName", name);
    localStorage.setItem("isLoggedIn", "true"); 

  
    navigate(userRole === "teacher" ? "/teacher/dashboard" : "/student/dashboard");
      } catch (error) {
        console.log(error);
        setError("Something went wrong during login!");
      }
};


  return (
    <div className="min-h-[calc(100vh-70px)] bg-gradient-to-r from-teal-100 to-cyan-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-800 text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-cyan-700 mb-6">
          Login to continue to SignBridge
        </p>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-teal-700 font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-teal-700 font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-teal-700 font-medium mb-1">Role</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-600 transition"
          >
            Login as {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        </form>

        <p className="text-center text-sm text-cyan-700 mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="font-semibold text-teal-700 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};


export default Login;
