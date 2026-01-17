import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import auth from "../api/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);
  const handleLogout = async () => {
    try {
      await auth.logout(); 
      setIsLoggedIn(false); 
      navigate("/login");  
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="w-full bg-gradient-to-r from-teal-400 to-cyan-500 border-b border-gray-200 rounded-b-xl shadow-md">
      <div className="w-full">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 14l6.16-3.422a12 12 0 01.84 6.422v2H5v-2a12 12 0 01.84-6.422L12 14z"
              />
            </svg>
            <span className="text-xl font-semibold text-white">SignBridge</span>
          </div>

          <div className="flex gap-4">
            {!isLoggedIn ? (
              <>
                <a
                  href="/login"
                  className="text-sm font-medium text-white bg-teal-700 px-3 py-1 rounded-lg hover:bg-teal-600 transition-all duration-200"
                  onClick={() =>
                    window.dispatchEvent(new Event("authChange"))
                  }
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="text-sm font-medium text-white bg-cyan-700 px-3 py-1 rounded-lg hover:bg-cyan-600 transition-all duration-200"
                  onClick={() =>
                    window.dispatchEvent(new Event("authChange"))
                  }
                >
                  Sign Up
                </a>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-white bg-cyan-500 px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-200"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
