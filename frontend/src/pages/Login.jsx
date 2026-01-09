import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../api/api";

const Login = () => {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser({
        email,
        password,
        role,
      });

      console.log("Backend response:", res.data);

    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data || error.message
      );
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-teal-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-teal-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
