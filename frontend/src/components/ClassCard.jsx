import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, BookOpen, Folder, UserPlus } from "lucide-react";

const ClassCard = ({ cls, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div
        onClick={() => navigate(`/teacher/class/${cls.id}`)}
        className="cursor-pointer rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        {/* HEADER */}
        <div className="h-28 bg-gradient-to-r from-teal-400 to-cyan-500 relative px-4 py-4">
          <h2 className="text-white text-lg font-semibold leading-tight">
            {cls.title}
          </h2>
          <p className="text-white text-sm opacity-90">{cls.code}</p>

          {/* TOP RIGHT ACTIONS */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {/* ADD STUDENT */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/add-student/${cls.id}`);
              }}
              className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow"
              title="Add Student"
            >
              <UserPlus className="w-4 h-4 text-teal-600" />
            </button>

            {/* THREE DOTS */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
              className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow"
            >
              <MoreVertical className="w-4 h-4 text-teal-600" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="m-4 bg-cyan-100/40 rounded-xl p-4 h-44 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span className="text-sm">Instructor</span>
          </div>
          <p className="font-medium text-gray-800">{cls.teacher_name}</p>

          <div className="flex items-center gap-2 text-teal-600 text-sm font-medium">
            <Folder className="w-4 h-4" />
            Open Class
          </div>
        </div>
      </div>

      {/* DROPDOWN MENU */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute top-14 right-4 bg-white shadow-lg rounded-md z-50 w-32"
        >
          <button
            onClick={() => onDelete(cls.id)}
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-100 rounded-md"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassCard;
