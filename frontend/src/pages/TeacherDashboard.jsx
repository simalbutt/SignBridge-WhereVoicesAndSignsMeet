import React, { useState, useEffect } from "react";
import ClassCard from "../components/ClassCard";
import { Plus, MoreVertical } from "lucide-react";
import classroomsApi from "../api/classrooms";

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newClass, setNewClass] = useState({ title: "", code: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fetchClasses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await classroomsApi.getClasses();
      console.log("Fetched classes:", res.data);
      if (res.data.success) {
        setClasses(res.data.data);
      } else {
        setError(res.data.message || "Failed to load classes.");
      }
    } catch (err) {
      setError(err.message || "Network error while fetching classes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClass = async () => {
    if (!newClass.title || !newClass.code) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await classroomsApi.createClass(newClass);
      console.log("Create class response:", res.data);
      if (res.data.success) {
        setClasses([...classes, res.data.data]);
        setNewClass({ title: "", code: "" });
        setShowModal(false);
      } else {
        setError(res.data.message || "Failed to create class.");
      }
    } catch (err) {
      setError(err.message || "Network error while creating class.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;

    setLoading(true);
    setError("");
    try {
      const res = await classroomsApi.deleteClass(id);
      console.log("Delete class response:", res.data);
      if (res.data.success) {
        setClasses(classes.filter((cls) => cls.id !== id));
      } else {
        setError(res.data.message || "Failed to delete class.");
      }
    } catch (err) {
      setError(err.message || "Network error while deleting class.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-100 to-white relative px-8 py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Your Classes</h1>

      {loading && <p className="text-center text-gray-600 mb-4">Loading...</p>}
      {error && <p className="text-center text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {classes.map((cls) => (
          <ClassCard key={cls.id} cls={cls} onDelete={handleDeleteClass} />
        ))}
      </div>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl transition-all"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Add New Class</h2>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Class Name"
                className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={newClass.title}
                onChange={(e) =>
                  setNewClass({ ...newClass, title: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Class Code"
                className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={newClass.code}
                onChange={(e) =>
                  setNewClass({ ...newClass, code: e.target.value })
                }
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                  setNewClass({ title: "", code: "" });
                }}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClass}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
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
