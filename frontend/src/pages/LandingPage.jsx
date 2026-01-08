import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-100 to-cyan-100 flex items-start justify-center px-4 pt-16 md:pt-24">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-start justify-between p-8 md:p-16">

        <div className="flex-1 mb-10 md:mb-0 md:pr-8 text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-teal-800 mb-4">
            SignBridge – Where Voices and Signs Meet
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-cyan-700 italic mb-6">
            "Connecting learners and educators through the language of signs, 
            making knowledge accessible to everyone."
          </p>

          <div className="flex justify-center md:justify-start gap-4">
            <Link
              to="/login"
              className="px-6 py-2 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-600 transition duration-300"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-cyan-700 text-white font-semibold rounded-lg hover:bg-cyan-600 transition duration-300"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center md:justify-end w-full md:w-auto">
          Animation
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
