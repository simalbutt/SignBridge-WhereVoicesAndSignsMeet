import React, { useEffect, useState } from "react";
import StudentClassCard from "../components/StudentClassCard";
import { Plus, Trash2 } from "lucide-react";

import {
  getStudentClasses,
  enrollInClass,
  unenrollFromClass,
} from "../api/studentClassApi";

const StudentDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newClass, setNewClass] = useState({ title: "", code: "" });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getStudentClasses();
        setClasses(res.data.data);
      } catch (error) {
        console.error("Failed to load classes", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleAddClass = async () => {
    if (!newClass.title || !newClass.code) return;

    try {
      await enrollInClass(newClass);
      const res = await getStudentClasses();
      setClasses(res.data.data);

      setNewClass({ title: "", code: "" });
      setShowModal(false);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to enroll in class"
      );
    }
  };
  const handleUnenroll = async (id) => {
    if (!window.confirm("Are you sure you want to unenroll from this class?"))
      return;

    try {
      await unenrollFromClass(id);
      setClasses((prev) => prev.filter((cls) => cls.id !== id));
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to unenroll"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-100 to-white px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6">My Classes</h1>

      {loading && <p>Loading...</p>}

      {!loading && classes.length === 0 && (
        <p className="text-gray-600">No classes joined yet</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {classes.map((cls) => (
          <div key={cls.id} className="relative">
            <StudentClassCard cls={cls} />
            <Trash2
              className="w-5 h-5 text-red-200 absolute top-2 right-2 cursor-pointer hover:text-red-600"
              onClick={() => handleUnenroll(cls.id)}
              title="Unenroll"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <Plus />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Join Class</h2>

            <input
              className="w-full border px-3 py-2 rounded mb-3"
              placeholder="Class Name"
              value={newClass.title}
              onChange={(e) =>
                setNewClass({ ...newClass, title: e.target.value })
              }
            />

            <input
              className="w-full border px-3 py-2 rounded mb-4"
              placeholder="Class Code"
              value={newClass.code}
              onChange={(e) =>
                setNewClass({ ...newClass, code: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClass}
                className="px-4 py-2 bg-teal-500 text-white rounded"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
