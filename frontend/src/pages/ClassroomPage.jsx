import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import AnnouncementCard from "../components/AnnouncementCard";
import AddAnnouncementModal from "../components/AddAnnouncementModal";

const ClassroomPage = () => {
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null); 

  useEffect(() => {
    setClassData({
      title: "Operations Research",
      code: "BCS-7E",
    });
  }, []);

  const handleAddOrUpdate = (ann) => {
    if (editingAnn) {
     
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === ann.id ? ann : a))
      );
      setEditingAnn(null);
    } else {
    
      setAnnouncements((prev) => [...prev, ann]);
    }
    setShowModal(false);
  };

  const handleEdit = (ann) => {
    setEditingAnn(ann);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-teal-50 pb-24">

      <div className="max-w-5xl mx-auto px-6">

        <div className="bg-gradient-to-r from-teal-100 to-cyan-100
                        text-teal-800 px-10 py-10 mt-6
                        rounded-3xl shadow-sm min-h-[160px]
                        flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-semibold">
            {classData?.title}
          </h1>
          <p className="mt-2 text-base opacity-80">
            {classData?.code}
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {announcements.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <p className="text-lg font-medium">No announcements yet</p>
              <p className="text-sm mt-2">
                Click the + button to add your first announcement
              </p>
            </div>
          ) : (
            announcements.map((ann) => (
              <AnnouncementCard
                key={ann.id}
                ann={ann}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      <button
        onClick={() => {
          setEditingAnn(null); 
          setShowModal(true);
        }}
        className="fixed bottom-10 right-10
                   bg-teal-500 text-white
                   w-16 h-16 rounded-full
                   flex items-center justify-center
                   shadow-xl hover:bg-teal-600
                   transition-all duration-300"
      >
        <Plus size={28} />
      </button>
      {showModal && (
        <AddAnnouncementModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddOrUpdate}
          existingAnnouncement={editingAnn} 
        />
      )}
    </div>
  );
};

export default ClassroomPage;
