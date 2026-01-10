import React from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar";

const LandingPage = () => {
  return (
    <div className="min-h-[calc(100vh-63px)]  bg-gradient-to-r from-teal-100 to-cyan-100 flex items-start justify-center px-4 pt-6 md:pt-12">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-start justify-between ">
        <div className="flex-1 mb-6 md:mb-0 md:pr-6 text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-teal-800 mb-2 mt-10">
            SignBridge
          </h1>
          <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-teal-700 mb-4">
            Where Voices and Signs Meet
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-cyan-700 italic mt-10 mb-10">
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

        <div className="flex-1 flex justify-center  w-full md:w-auto">
          <div
            className="relative w-full h-96 md:w-full md:h-[28rem] bg-no-repeat bg-center bg-cover rounded-lg"
            style={{ backgroundImage: "url('assets/backgroundlanding.jpg')" }}
          >
            <Avatar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
