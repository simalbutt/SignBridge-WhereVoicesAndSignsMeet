import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, BookOpen, Folder } from "lucide-react";

const ClassCard = ({ cls, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <div
        onClick={() => navigate(`/teacher/class/${cls.id}`)}
        className="cursor-pointer rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        <div className="h-28 bg-gradient-to-r from-teal-400 to-cyan-500 relative px-4 py-4">
          <h2 className="text-white text-lg font-semibold leading-tight">
            {cls.title}
          </h2>
          <p className="text-white text-sm opacity-90">{cls.code}</p>

          <MoreVertical
            className="absolute top-4 right-4 text-white w-5 h-5 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation(); 
              setShowMenu(!showMenu);
            }}
          />
        </div>

        <div className="m-4 bg-cyan-100/40 rounded-xl p-4 h-44 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span className="text-sm">Instructor</span>
          </div>
          <p className="font-medium text-gray-800">{cls.teacher_name}</p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-teal-600 text-sm font-medium">
              <Folder className="w-4 h-4" />
              Open Class
            </div>
          </div>
        </div>
      </div>
      {showMenu && (
        <div
          ref={menuRef} 
          className="absolute top-10 right-2 bg-white shadow-md rounded-md z-50"
        >
          <button
            className="px-4 py-2 text-red-600 hover:bg-red-100 w-full text-left rounded-md"
            onClick={() => onDelete(cls.id)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassCard;
