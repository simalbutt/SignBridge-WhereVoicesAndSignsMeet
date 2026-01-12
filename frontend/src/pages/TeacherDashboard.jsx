import React, { useState, useEffect } from "react";
import ClassCard from "../components/ClassCard";
import { Plus } from "lucide-react";
import classroomsApi from "../api/classrooms";

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newClass, setNewClass] = useState({ title: "", code: "" });
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

  const handleAddClass = async () => {
    if (!newClass.title || !newClass.code) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await classroomsApi.createClass(newClass);
      if (res.data.success) {
        setClasses([...classes, res.data.data]);
        setShowModal(false);
        setNewClass({ title: "", code: "" });
      }
    } catch {
      setError("Error creating class");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    try {
      const res = await classroomsApi.deleteClass(id);
      if (res.data.success) {
        setClasses(classes.filter((c) => c.id !== id));
      }
    } catch {
      setError("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-100 to-white px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6">Your Classes</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {classes.map((cls) => (
          <ClassCard key={cls.id} cls={cls} onDelete={handleDeleteClass} />
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
            <h2 className="text-xl font-semibold mb-4">Add New Class</h2>

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
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
