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
      const user = await auth.login({ email, password, role });

      navigate(
        user.role === "teacher"
          ? "/teacher/dashboard"
          : "/student/dashboard"
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid email, password, or role"
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-63px)] bg-gradient-to-r from-teal-100 to-cyan-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-800 text-center mb-2">
          Welcome Back
        </h1>

        {error && (
          <p className="text-red-600 text-center mb-4">{error}</p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-teal-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-teal-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-teal-700 font-medium mb-1">
              Role
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-600"
          >
            Login as {role}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-teal-700 font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
