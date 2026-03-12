import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowRight,
  Trash2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import API from "../api/axios";
import {
  postCommentReply,
  getAnnouncementComments,
} from "../api/commentApi";

const AnnouncementDetail = () => {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [annRes, commentsRes] = await Promise.all([
          API.get(`/announcements/${id}/`),
          getAnnouncementComments(id),
        ]);
        setAnnouncement(annRes.data);
        setComments(commentsRes);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  if (!announcement)
    return <p className="text-center mt-10">Loading announcement...</p>;

  /* ---------------- ADD / EDIT REPLY ---------------- */
  const handleReply = async (commentId) => {
    // Get the text from the correct state
    const text = editingReplyId === commentId ? editingText : replyText[commentId];

    if (!text?.trim()) return;

    try {
      // 1. Call the new transcription endpoint
      const res = await API.post(`/transcription/comments/${commentId}/reply/`, {
        reply: text, // This matches request.data.get('reply') in your view
      });

      // 2. The backend returns the full updated comment object
      const updatedComment = res.data;

      // 3. Update the UI state
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updatedComment : c))
      );

      // 4. Reset UI states
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      setEditingReplyId(null);
      setEditingText("");
      
    } catch (err) {
      console.error("Reply Error:", err);
      alert("Could not save reply. Make sure the backend server is running.");
    }
  };

  /* ---------------- DELETE REPLY ONLY ---------------- */
  const handleDeleteReply = async (commentId) => {
    if (!window.confirm("Delete this reply?")) return;

    try {
      // ✅ Use the new transcription path
      const res = await API.post(`/transcription/comments/${commentId}/reply/`, {
        reply: null,
      });

      const updatedComment = res.data;

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updatedComment : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditReply = (commentId, text) => {
    setEditingReplyId(commentId);
    setEditingText(text);
  };

  return (
    <div className="min-h-screen p-6 bg-teal-50">
      <div className="max-w-4xl mx-auto p-6 bg-teal-100 rounded shadow mt-6">
        {/* ANNOUNCEMENT */}
        <div className="bg-teal-50 p-6 rounded shadow mb-6">
          <h1 className="text-3xl font-bold text-teal-700">
            {announcement.heading}
          </h1>
          <p className="mt-2">{announcement.text}</p>

          {/* ---------------- SHOW FILES ---------------- */}
          {announcement.files?.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {announcement.files.map((f) => (
                <a
                  key={f.id}
                  href={f.file_url || f.file} // use absolute URL if available
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 text-sm"
                >
                  {f.file_url ? f.file_url.split("/").pop() : f.file.split("/").pop()}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* COMMENTS */}
        <h2 className="text-2xl font-semibold mb-4">Comments</h2>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white p-3 rounded shadow">
              <div className="flex justify-between">
                <p className="font-semibold text-sm">
                  {comment.author_name}
                </p>
                <ArrowRight className="w-4 h-4 text-teal-500" />
              </div>

              {/* Display the regular comment text */}
              <p className="text-sm mt-1 text-gray-600 italic">"{comment.text}"</p>

              {/* NEW: Display the AI extracted signs for the Teacher
              {comment.ai_text && (
                <div className="mt-3 bg-amber-50 border-l-4 border-amber-500 p-4 rounded shadow-inner">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      AI SIGN RESULT
                    </span>
                  </div>
                  <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                    {comment.ai_text}
                  </p>
                  <p className="text-[10px] text-amber-700 mt-2">
                    * This text was automatically extracted from the student's sign language video.
                  </p>
                </div>
              )} */}

              {/* TEACHER REPLY */}
              {comment.reply && (
                <div className="bg-teal-50 p-2 rounded mt-2 ml-6 relative">
                  <div className="absolute top-2 right-2 flex gap-2">
                    {editingReplyId !== comment.id ? (
                      <>
                        <Edit2
                          className="w-4 h-4 text-blue-500 cursor-pointer"
                          onClick={() =>
                            handleEditReply(comment.id, comment.reply)
                          }
                        />
                        <Trash2
                          className="w-4 h-4 text-red-500 cursor-pointer"
                          onClick={() =>
                            handleDeleteReply(comment.id)
                          }
                        />
                      </>
                    ) : (
                      <>
                        <Check
                          className="w-4 h-4 text-green-600 cursor-pointer"
                          onClick={() => handleReply(comment.id)}
                        />
                        <X
                          className="w-4 h-4 text-red-600 cursor-pointer"
                          onClick={() => {
                            setEditingReplyId(null);
                            setEditingText("");
                          }}
                        />
                      </>
                    )}
                  </div>

                  {editingReplyId === comment.id ? (
                    <input
                      value={editingText}
                      onChange={(e) =>
                        setEditingText(e.target.value)
                      }
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    <>
                      <p className="font-semibold text-sm text-teal-700">
                        Teacher Reply:
                      </p>
                      <p className="text-sm">{comment.reply}</p>
                    </>
                  )}
                </div>
              )}

              {/* ADD REPLY */}
              {!comment.reply && (
                <div className="mt-2 ml-6 flex gap-2">
                  <input
                    className="flex-1 border rounded p-1 text-sm"
                    placeholder="Write a reply..."
                    value={replyText[comment.id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({
                        ...prev,
                        [comment.id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    className="bg-teal-500 text-white px-3 py-1 rounded text-sm"
                    onClick={() => handleReply(comment.id)}
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetail;
