import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Folder } from "lucide-react";

const StudentClassCard = ({ cls }) => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <div
        onClick={() => navigate(`/student/class/${cls.id}`)}
        className="cursor-pointer rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        {/* HEADER */}
        <div className="h-28 bg-gradient-to-r from-teal-400 to-cyan-500 px-4 py-4">
          <h2 className="text-white text-lg font-semibold leading-tight">
            {cls.title}
          </h2>
          <p className="text-white text-sm opacity-90">{cls.code}</p>
        </div>

        {/* BODY */}
        <div className="m-4 bg-cyan-100/40 rounded-xl p-4 h-44 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span className="text-sm">Instructor</span>
          </div>

          <p className="font-medium text-gray-800">
            {cls.teacher_name || ""}
          </p>

          <div className="flex items-center gap-2 text-teal-600 text-sm font-medium">
            <Folder className="w-4 h-4" />
            Open Class
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentClassCard;
