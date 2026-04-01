import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowRight, Trash2, Edit2, Check, X } from "lucide-react";
import { getAnnouncementDetail } from "../api/announcementApi";
import {
  getAnnouncementComments,
  addCommentReply,
  editCommentReply,
  deleteCommentReply,
} from "../api/commentApi";

const AnnouncementDetail = () => {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [annData, commentsData] = await Promise.all([
          getAnnouncementDetail(id),
          getAnnouncementComments(id),
        ]);
        setAnnouncement(annData);
        const commentsArray = Array.isArray(commentsData)
          ? commentsData
          : commentsData?.data || [];
        setComments(commentsArray);
      } catch (err) {
        console.error("Error fetching announcement:", err);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10">Loading announcement...</p>;
  }

  if (!announcement) {
    return <p className="text-center mt-10">Announcement not found!</p>;
  }

  const handleReply = async (commentId) => {
    const text =
      editingReplyId === commentId ? editingText : replyText[commentId];

    if (!text?.trim()) return;

    try {
      let response;
      if (editingReplyId === commentId) {
        response = await editCommentReply(commentId, { reply: text });
      } else {
        response = await addCommentReply(commentId, { reply: text });
      }
      const updatedComment = response.data || response;
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updatedComment : c)),
      );
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      setEditingReplyId(null);
      setEditingText("");
    } catch (err) {
      console.error("Reply Error:", err);
      console.error("Error response:", err.response?.data);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Could not save reply. Make sure the backend server is running.";
      alert(errorMessage);
    }
  };

  const handleDeleteReply = async (commentId) => {
    if (!window.confirm("Delete this reply?")) return;

    try {
      const response = await deleteCommentReply(commentId);
      const updatedComment = response.data || response;
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updatedComment : c)),
      );
    } catch (err) {
      console.error("Delete Reply Error:", err);
      console.error("Error response:", err.response?.data); 

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Could not delete reply.";
      alert(errorMessage);
    }
  };

  const handleEditReply = (commentId, text) => {
    setEditingReplyId(commentId);
    setEditingText(text);
    setReplyText((prev) => ({ ...prev, [commentId]: "" }));
  };

  const handleCancelEdit = () => {
    setEditingReplyId(null);
    setEditingText("");
  };

  const handleReplyInputChange = (commentId, value) => {
    setReplyText((prev) => ({
      ...prev,
      [commentId]: value,
    }));
  };

  const commentsArray = Array.isArray(comments) ? comments : [];

  return (
    <div className="min-h-screen p-6 bg-teal-50">
      <div className="max-w-4xl mx-auto p-6 bg-teal-100 rounded shadow mt-6">
        <div className="bg-teal-50 p-6 rounded shadow mb-6">
          <h1 className="text-3xl font-bold text-teal-700">
            {announcement.heading}
          </h1>
          <p className="mt-2 text-gray-700">{announcement.text}</p>
          {announcement.files?.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {announcement.files.map((f) => (
                <a
                  key={f.id}
                  href={f.file_url || f.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 text-sm"
                >
                  {f.file_url
                    ? f.file_url.split("/").pop()
                    : f.file.split("/").pop()}
                </a>
              ))}
            </div>
          )}
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Comments</h2>

        {commentsArray.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">
            No comments yet.
          </p>
        ) : (
          <div className="space-y-4">
            {commentsArray.map((comment) => (
              <div
                key={comment.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-teal-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-sm text-teal-700">
                    {comment.author_name}
                  </p>
                  <ArrowRight className="w-4 h-4 text-teal-500" />
                </div>

                <p className="text-sm text-gray-700 mb-3">{comment.text}</p>
                <div className="ml-6 mt-3 border-l-2 border-teal-200 pl-3">
                  {comment.reply ? (
                    <div className="bg-teal-50 p-3 rounded relative">
                      <div className="absolute top-2 right-2 flex gap-2">
                        {editingReplyId !== comment.id ? (
                          <>
                            <button
                              onClick={() =>
                                handleEditReply(comment.id, comment.reply)
                              }
                              className="p-1 hover:bg-blue-100 rounded transition"
                              title="Edit reply"
                            >
                              <Edit2 className="w-4 h-4 text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleDeleteReply(comment.id)}
                              className="p-1 hover:bg-red-100 rounded transition"
                              title="Delete reply"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleReply(comment.id)}
                              className="p-1 hover:bg-green-100 rounded transition"
                              title="Save reply"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 hover:bg-red-100 rounded transition"
                              title="Cancel edit"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          </>
                        )}
                      </div>

                      {editingReplyId === comment.id ? (
                        <div className="pr-16">
                          <p className="font-semibold text-sm text-teal-700 mb-1">
                            Edit Reply:
                          </p>
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            rows="2"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold text-xs text-teal-700 uppercase tracking-wider mb-1">
                            Teacher Reply:
                          </p>
                          <p className="text-sm text-gray-700 pr-16">
                            {comment.reply}
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="font-semibold text-xs text-teal-700 uppercase tracking-wider mb-2">
                        Add Reply:
                      </p>
                      <div className="flex gap-2">
                        <textarea
                          className="flex-1 border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Write a reply..."
                          value={replyText[comment.id] || ""}
                          onChange={(e) =>
                            handleReplyInputChange(comment.id, e.target.value)
                          }
                          rows="2"
                        />
                        <button
                          className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-600 transition self-end disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleReply(comment.id)}
                          disabled={!replyText[comment.id]?.trim()}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementDetail;