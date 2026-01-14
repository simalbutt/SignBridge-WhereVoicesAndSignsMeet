import React, { useState, useEffect } from "react";
import ClassCard from "../components/ClassCard";
import classroomsApi from "../api/classrooms";

const StudentDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await classroomsApi.getClasses();
      if (res.data.success) {
        setClasses(res.data.data);
      } else {
        setError(res.data.message || "Failed to load classes");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-100 to-white px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6">My Classes</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {classes.length === 0 && !loading && (
        <p className="text-gray-600">No classes joined yet</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {classes.map((cls) => (
          <ClassCard
            key={cls.id}
            cls={cls}
            hideActions   
          />
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
