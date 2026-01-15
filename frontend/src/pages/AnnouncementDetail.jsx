import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowRight,
  MoreVertical,
  Trash2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import API from "../api/axios";
import { postCommentReply, getAnnouncementComments } from "../api/commentApi";

const AnnouncementDetail = () => {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [, setMenuOpenId] = useState(null);
  const menuRefs = useRef({});

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [annRes, commentsRes] = await Promise.all([
          API.get(`/announcements/${id}/`),
          getAnnouncementComments(id),
        ]);
        if (isMounted) {
          setAnnouncement(annRes.data);
          setComments(commentsRes?.data ?? commentsRes);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const isClickInsideAnyMenu = Object.values(menuRefs.current).some(
        (ref) => ref && ref.contains(e.target)
      );
      if (!isClickInsideAnyMenu) setMenuOpenId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!announcement)
    return <p className="text-center mt-10">Loading announcement...</p>;

  const handleReply = async (commentId) => {
    const text =
      editingReplyId === commentId ? editingText : replyText[commentId];
    if (!text?.trim()) return;

    try {
      const updatedComment = await postCommentReply(commentId, { reply: text });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updatedComment : c))
      );
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      setEditingReplyId(null);
      setEditingText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReply = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    try {
      const updatedComment = await postCommentReply(commentId, { reply: "" });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updatedComment : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditReply = (commentId, currentText) => {
    setEditingReplyId(commentId);
    setEditingText(currentText);
  };

  return (
    <div className="min-h-screen p-6 bg-teal-50">
      <div className="max-w-4xl mx-auto p-6 bg-teal-100 rounded shadow mt-6">
        <div className="bg-teal-50 p-6 rounded shadow-md mb-6 relative">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-teal-700">
              {announcement.heading}
            </h1>
            <p className="text-sm text-gray-500">
              {new Date(announcement.created_at).toLocaleDateString()}
            </p>
          </div>

          <p className="text-gray-800 mb-4">{announcement.text}</p>

          {announcement.link && (
            <a
              href={announcement.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-500 hover:underline mb-4 block"
            >
              {announcement.link}
            </a>
          )}

          {announcement.files?.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {announcement.files.map((f) => (
                <a
                  key={f.id}
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

          <p className="text-sm text-gray-500 absolute bottom-2 right-4">
            {new Date(announcement.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Comments
          </h2>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white p-3 rounded shadow-sm hover:shadow-md transition relative"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-700 text-sm">
                    {comment.author_name}
                  </p>
                  <ArrowRight className="w-4 h-4 text-teal-500 cursor-pointer" />
                </div>

                <p className="text-gray-800 text-sm mt-1">{comment.text}</p>
                {comment.video_url && (
                  <video
                    src={comment.video_url}
                    controls
                    className="mt-2 rounded w-full max-w-md"
                    style={{ maxHeight: "200px" }}
                  />
                )}

                {comment.reply && (
                  <div className="bg-teal-50 p-2 rounded mt-2 ml-6 relative">
  
                    <div
                      className="absolute top-4 right-2 flex gap-1"
                      ref={(el) => (menuRefs.current[comment.id] = el)}
                    >
                      {editingReplyId !== comment.id && (
                        <>
                          <Edit2
                            className="w-4 h-4 text-blue-500 cursor-pointer"
                            onClick={() =>
                              handleEditReply(comment.id, comment.reply)
                            }
                          />
                          <Trash2
                            className="w-4 h-4 text-red-500 cursor-pointer"
                            onClick={() => handleDeleteReply(comment.id)}
                          />
                        </>
                      )}
                      {editingReplyId === comment.id && (
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
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      <>
                        <p className="text-teal-700 font-semibold text-sm">
                          Teacher Reply:
                        </p>
                        <p className="text-gray-800 text-sm">{comment.reply}</p>
                      </>
                    )}
                  </div>
                )}

                {editingReplyId !== comment.id && (
                  <div className="mt-2 ml-6 flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      className="flex-1 border rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={replyText[comment.id] || ""}
                      onChange={(e) =>
                        setReplyText((prev) => ({
                          ...prev,
                          [comment.id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600 text-sm"
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
    </div>
  );
};

export default AnnouncementDetail;
