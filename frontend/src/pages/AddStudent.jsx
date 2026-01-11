import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Minus } from "lucide-react";

const AddStudent = () => {
  const { classId } = useParams();

  const initialStudents = [
    { id: 1, name: "Khan BiBi", roll: "22l-1234", department: "BSCS" },
    { id: 2, name: "Fatima Javed", roll: "22l-6652", department: "BSCS" },
    { id: 3, name: "Sara Ali", roll: "22l-7649", department: "BSCS" },
  ];

  const [students, setStudents] = useState(initialStudents);
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", roll: "", department: "" });

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.roll || !newStudent.department) return;

    const studentToAdd = {
      ...newStudent,
      id: students.length ? students[students.length - 1].id + 1 : 1, 
    };

    setStudents([...students, studentToAdd]);
    setNewStudent({ name: "", roll: "", department: "" });
    setShowModal(false);
  };

  const handleRemoveStudent = (id) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-teal-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Students in Class {classId}</h1>

        <button
          onClick={() => setShowModal(true)}
          className="w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md"
          title="Add Student"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded shadow p-4 space-y-2 max-h-[70vh] overflow-y-auto">
        {students.length === 0 && <p className="text-gray-500">No students yet.</p>}
        {students.map((s) => (
          <div
            key={s.id}
            className="flex justify-between items-center p-2 border-b last:border-b-0 rounded hover:bg-gray-50 transition"
          >
            <div>
              <p className="font-semibold text-gray-700">{s.name}</p>
              <p className="text-gray-500 text-sm">
                Roll: {s.roll} • Dept: {s.department}
              </p>
            </div>

            <button
              onClick={() => handleRemoveStudent(s.id)}
              className="w-8 h-8 bg-red-400 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md"
              title="Remove Student"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Add New Student</h2>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Student Name"
                className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Roll Number"
                className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={newStudent.roll}
                onChange={(e) => setNewStudent({ ...newStudent, roll: e.target.value })}
              />
              <input
                type="text"
                placeholder="Department"
                className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={newStudent.department}
                onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
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

export default AddStudent;
