import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signupUser } from "../api/api";

const Signup = () => {
  const [role, setRole] = useState("student"); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await signupUser({
        name,
        email,
        password,
        role,
      });

      console.log("Signup successful:", res.data);
      alert("Signup successful! You can now login.");
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      alert("Signup failed! Check console for details.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-gradient-to-r from-teal-100 to-cyan-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-800 text-center mb-2">
          Create Account
        </h1>
        <p className="text-center text-cyan-700 mb-6">
          Sign up to join SignBridge
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-teal-700 font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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

          <div>
            <label className="block text-teal-700 font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-teal-700 font-medium mb-1">
              Role
            </label>
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
            Sign Up as {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        </form>

        <p className="text-center text-sm text-cyan-700 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-teal-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>

  );
};

export default Signup;
