import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const StudentClassroomPage = () => {
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    setClassData({
      title: "Operations Research",
      code: "BCS-7E",
    });

    setAnnouncements([
      {
        id: 1,
        heading: "Quiz",
        text: "Submit by next Friday.",
        date: "2026-01-10",
        files: [],
      },
      {
        id: 2,
        heading: "Midterm Schedule",
        text: "Check the schedule on LMS.",
        date: "2026-01-12",
        files: [],
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-teal-50 pb-24">
      <div className="max-w-5xl mx-auto px-6">
      
        <div
          className="bg-gradient-to-r from-teal-100 to-cyan-100
                     text-teal-800 px-10 py-10 mt-6
                     rounded-3xl shadow-sm min-h-[160px]
                     flex flex-col justify-center"
        >
          <h1 className="text-3xl md:text-4xl font-semibold">
            {classData?.title}
          </h1>
          <p className="mt-2 text-base opacity-80">{classData?.code}</p>
        </div>

        <div className="mt-10 space-y-6">
          {announcements.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <p className="text-lg font-medium">No announcements yet</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <div
                key={ann.id}
                onClick={() =>
                  navigate(`/student/announcement/${ann.id}`, { state: { announcement: ann } })
                }
                className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-green-800">
                    {ann.heading}
                  </h2>
                  <span className="text-gray-400 text-sm">{ann.date}</span>
                </div>
                <p className="text-gray-700">{ann.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentClassroomPage;
