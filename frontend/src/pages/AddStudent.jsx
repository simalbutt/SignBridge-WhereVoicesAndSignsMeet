import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Plus, Minus } from "lucide-react";

import {
  getClassroomStudents,
  addStudentToClassroom,
  removeStudentFromClassroom,
} from "../api/students";

const AddStudent = () => {
  const { classId } = useParams();

  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getClassroomStudents(classId);
      if (res.data.success) {
        setStudents(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setError(res.data.message || "Failed to load students");
        setStudents([]);
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudent = async () => {
    if (!email) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await addStudentToClassroom(classId, email);
      if (res.data.success) {
        setEmail("");
        setShowModal(false);
        fetchStudents(); 
      } else {
        setError(res.data.message || "Failed to add student");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Remove this student from class?")) return;

    setLoading(true);
    setError("");
    try {
      const res = await removeStudentFromClassroom(classId, studentId);
      if (res.data.success) {
        setStudents((prev) =>
          prev.filter((s) => s.student !== studentId)
        );
      } else {
        setError(res.data.message || "Failed to remove student");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to remove student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Students in Class
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="bg-white rounded shadow p-4 space-y-2 max-h-[70vh] overflow-y-auto">
        {Array.isArray(students) && students.length === 0 && !loading && (
          <p className="text-gray-500">No students yet.</p>
        )}

        {Array.isArray(students) &&
          students.map((s) => (
            <div
              key={s.student} 
              className="flex justify-between items-center p-2 border-b last:border-b-0 rounded hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-semibold text-gray-700">
                  {s.student_name || s.name}
                </p>
                <p className="text-gray-500 text-sm">
                  {s.student_email || s.email}
                </p>
              </div>

              <button
                onClick={() => handleRemoveStudent(s.student)}
                className="w-8 h-8 bg-red-400 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              Add Student by Email
            </h2>

            <input
              type="email"
              placeholder="student@email.com"
              className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg"
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

export default AddStudent;
