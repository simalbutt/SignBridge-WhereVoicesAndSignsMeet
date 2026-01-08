import React from "react";

const Navbar = () => {
  return (
    <nav className="w-full bg-gradient-to-r from-teal-400 to-cyan-500 border-b border-gray-200 rounded-b-xl shadow-md">
      <div className="w-full">
        <div className="flex justify-between items-center h-12 px-4">

          {/* Left: Logo - Completely flush left */}
          <div className="flex-shrink-0">
            <span className="text-xl font-semibold text-white">
              SignBridge
            </span>
          </div>

          {/* Right: Links - Completely flush right */}
          <div className="flex gap-4">
            <a 
              href="/login" 
              className="text-sm font-medium text-white bg-teal-700 px-3 py-1 rounded-lg hover:bg-teal-600 transition-all duration-200"
            >
              Login
            </a>
            <a 
              href="/signup" 
              className="text-sm font-medium text-white bg-cyan-700 px-3 py-1 rounded-lg hover:bg-cyan-600 transition-all duration-200"
            >
              Sign Up
            </a>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
