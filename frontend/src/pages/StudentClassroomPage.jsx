import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getClassroomAnnouncements } from "../api/announcementApi";
import API from "../api/axios";

const StudentClassroomPage = () => {
  const navigate = useNavigate();
  const { id: classroomId } = useParams();

  const [classData, setClassData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classroomId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const classRes = await API.get(`/classrooms/classes/${classroomId}/`);
        const data = classRes.data?.data ?? classRes.data;

        setClassData({
          title: data.title,
          code: data.code,
        });
        const annRes = await getClassroomAnnouncements(classroomId);
        const annData = annRes?.data ?? annRes;
        setAnnouncements(annData);
      } catch (err) {
        console.error("Failed to load classroom data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classroomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-teal-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

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
            {classData?.title || "Classroom"}
          </h1>
          <p className="mt-2 text-base opacity-80">{classData?.code || ""}</p>
        </div>

        <div className="mt-10 space-y-6">
          {announcements.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <p className="text-lg font-medium">No announcements yet</p>
            </div>
          ) : (
            announcements.map((ann) => {
              let dateStr = "";
              let timeStr = "";
              if (ann.date || ann.created_at) {
                const dt = new Date(ann.date || ann.created_at);
                dateStr = dt.toLocaleDateString(); 
                timeStr = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); 
              }

              return (
                <div
                  key={ann.id}
                  onClick={() =>
                    navigate(`/student/announcement/${ann.id}`, { state: { announcement: ann } })
                  }
                  className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg transition relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-green-800">
                      {ann.heading || ann.title}
                    </h2>
                    <span className="text-gray-400 text-sm">{dateStr}</span>
                  </div>
                  <p className="text-gray-700">{ann.text || ann.content}</p>
                  {timeStr && (
                    <span className="absolute bottom-3 right-3 text-gray-400 text-sm">
                      {timeStr}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentClassroomPage;
