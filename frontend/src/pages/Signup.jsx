import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { validate as isValidUUID } from "uuid";
import auth from "../api/auth";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const initialInviteToken = searchParams.get("invite") || "";

  const [inviteToken] = useState(initialInviteToken);
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email, and password are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
      };

      if (inviteToken && isValidUUID(inviteToken)) {
        payload.invite_token = inviteToken;
      } else {
        payload.role = role || "student"; 
      }

      console.log("Signup payload:", payload); 

      const signupRes = await auth.signup(payload);

      if (!signupRes.success) {
 
        if (signupRes.errors) {
          const fieldErrors = Object.entries(signupRes.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join(" | ");
          setError(`Signup failed: ${fieldErrors}`);
        } else {
          setError(signupRes.message || "Signup failed.");
        }
        setLoading(false);
        return;
      }

      const loginRes = await auth.login({
        email: email.trim(),
        password,
        role: inviteToken ? "student" : role,
      });

      const { access, refresh, name: userName, role: userRole } = loginRes;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("userName", userName);
      localStorage.setItem("isLoggedIn", "true");

      window.dispatchEvent(new Event("authChange"));

      navigate(userRole === "teacher" ? "/teacher/dashboard" : "/student/dashboard");
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message || err);

      const backendMessage =
        err.response?.data?.message ||
        JSON.stringify(err.response?.data?.errors) ||
        err.message;

      setError(backendMessage || "Something went wrong during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-gradient-to-r from-teal-100 to-cyan-100 flex items-center justify-center px-4">
      <div className="my-6 bg-white shadow-xl rounded-xl w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-800 text-center mb-2">
          Create Account
        </h1>
        <p className="text-center text-cyan-700 mb-6">
          Sign up to get started with SignBridge
        </p>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-teal-700 font-medium mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            <label className="block text-teal-700 font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {!inviteToken && (
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
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-2 text-white font-semibold rounded-lg transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-teal-700 hover:bg-teal-600"
            }`}
          >
            {loading ? "Signing Up..." : `Sign Up as ${inviteToken ? "Student" : role.charAt(0).toUpperCase() + role.slice(1)}`}
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
