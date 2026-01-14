import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Edit2, Trash2, Check, X } from "lucide-react";

const StudentAnnouncementDetail = () => {
  const location = useLocation();
  const { announcement } = location.state || {};
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  if (!announcement)
    return <p className="text-center mt-10">No announcement found!</p>;

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const commentObj = {
      id: comments.length + 1,
      author_name: "You",
      text: newComment,
    };

    setComments([...comments, commentObj]);
    setNewComment("");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      setComments(comments.filter((c) => c.id !== id));
    }
  };

  const handleEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleSaveEdit = (id) => {
    setComments(
      comments.map((c) =>
        c.id === id ? { ...c, text: editText } : c
      )
    );
    setEditingId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className="min-h-screen p-6 bg-teal-50">
      <div className="max-w-4xl mx-auto p-6 bg-teal-100 rounded shadow mt-6">

        <div className="bg-teal-50 p-6 rounded shadow-md mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-4">{announcement.heading}</h1>
          <p className="text-gray-800 mb-4">{announcement.text}</p>

          {announcement.files && announcement.files.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {announcement.files.map((f, idx) => (
                <a
                  key={idx}
                  href={f.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 text-sm"
                >
                  {f.file.split("/").pop()}
                </a>
              ))}
            </div>
          )}

          <p className="text-sm text-gray-500">
            {announcement.date && new Date(announcement.date).toLocaleDateString()}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Comments</h2>

          <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
            {comments.length === 0 && <p className="text-gray-400">No comments yet</p>}
            {comments.map(c => (
              <div key={c.id} className="bg-white p-3 rounded shadow-sm flex justify-between items-start">
                
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">{c.author_name}</p>
                  
                  {editingId === c.id ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 border rounded px-2 py-1 text-sm"
                      />
                      <button onClick={() => handleSaveEdit(c.id)}>
                        <Check className="w-4 h-4 text-green-600" />
                      </button>
                      <button onClick={handleCancelEdit}>
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-800 text-sm mt-1">{c.text}</p>
                  )}
                </div>

                {editingId !== c.id && (
                  <div className="flex gap-2 ml-4">
                    <Edit2
                      className="w-5 h-5 text-blue-500 cursor-pointer"
                      onClick={() => handleEdit(c.id, c.text)}
                    />
                    <Trash2
                      className="w-5 h-5 text-red-500 cursor-pointer"
                      onClick={() => handleDelete(c.id)}
                    />
                  </div>
                )}
                
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border rounded px-3 py-2 text-sm"
            />
            <button
              onClick={handleAddComment}
              className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
            >
              Comment
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentAnnouncementDetail;
