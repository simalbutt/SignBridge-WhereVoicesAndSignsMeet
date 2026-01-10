import React, { useState } from "react";
import ClassCard from "../components/ClassCard";
import { Plus } from "lucide-react"; 

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([
    { id: 1, name: "Web Engineering", code: "CS-401", teacher: "Fatima Javed" },
    { id: 2, name: "Data Structures", code: "CS-201", teacher: "Fatima Javed" },
    { id: 3, name: "Operating Systems", code: "CS-301", teacher: "Fatima Javed" },
    { id: 4, name: "Software Design", code: "CS-402", teacher: "Fatima Javed" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newClass, setNewClass] = useState({ name: "", code: "", teacher: "" });

  const handleAddClass = () => {
    const nextId = classes.length ? classes[classes.length - 1].id + 1 : 1;
    setClasses([...classes, { id: nextId, ...newClass }]);
    setNewClass({ name: "", code: "", teacher: "" });
    setShowModal(false);
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-100 to-white relative px-8 py-6">

      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Your Classes
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {classes.map((cls) => (
          <ClassCard key={cls.id} cls={cls} />
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
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Class Code"
                className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={newClass.code}
                onChange={(e) => setNewClass({ ...newClass, code: e.target.value })}
              />
              <input
                type="text"
                placeholder="Instructor Name"
                className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={newClass.teacher}
                onChange={(e) => setNewClass({ ...newClass, teacher: e.target.value })}
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
