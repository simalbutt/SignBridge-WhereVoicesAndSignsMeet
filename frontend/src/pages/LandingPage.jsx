import React from "react";

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 overflow-hidden">
      
      {/* Decorative Background Circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="relative max-w-6xl w-full flex flex-col md:flex-row items-center justify-between bg-white shadow-2xl rounded-3xl p-8 md:p-16">
        
        {/* Left side: Text */}
        <div className="flex-1 mb-10 md:mb-0 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            SignBridge
          </h1>
          <h2 className="text-lg md:text-xl text-gray-500 mb-6 italic">
            Bridging voices through signs – making education accessible for everyone.
          </h2>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-600 hover:to-blue-600 transition duration-300">
              Login
            </button>
            <button className="px-8 py-3 border-2 border-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-100 transition duration-300">
              Sign Up
            </button>
          </div>
        </div>

        {/* Right side: Animated Avatar */}
        <div className="flex-1 flex justify-center md:justify-end">
          {/* Modern Avatar / Sign Circle */}
          <div className="relative w-40 h-40 md:w-52 md:h-52 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl animate-bounce hover:scale-105 transition-transform duration-500">
            ✋
            <span className="absolute -bottom-4 text-sm text-white opacity-70">Sign Avatar</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
