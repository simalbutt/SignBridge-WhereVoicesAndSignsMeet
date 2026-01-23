import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Edit2, Trash2, Check, X, Paperclip, Camera } from "lucide-react";

import API from "../api/axios";
import {
  getAnnouncementComments,
  postCommentReply,
  deleteComment,
} from "../api/commentApi";

const StudentAnnouncementDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { announcement } = location.state || {};

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);

  const fileInputRef = useRef(null);

  // ✅ Helper: check if file is video
  const isVideoFile = (fileUrl) => {
    const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "mkv"];
    const ext = fileUrl.split(".").pop().toLowerCase();
    return videoExtensions.includes(ext);
  };

  // ✅ Get first announcement video (if any)
  const announcementVideo = announcement?.files?.find((f) =>
    isVideoFile(f.file)
  );

  useEffect(() => {
    if (!announcement?.id) return;

    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const res = await getAnnouncementComments(announcement.id);
        setComments(res?.data ?? res);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [announcement]);

  const handleAddComment = async () => {
    if (!newComment.trim() && !newFile) return;

    try {
      const formData = new FormData();
      if (newComment.trim()) formData.append("text", newComment);
      if (newFile) formData.append("video", newFile);

      const res = await API.post(
        `/announcements/${announcement.id}/comments/`,
        formData
      );

      setComments([...comments, res.data]);
      setNewComment("");
      setNewFile(null);
    } catch (err) {
      console.error("Failed to add comment", err.response ?? err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) setNewFile(e.target.files[0]);
  };

  const handleClick = (fileUrl) => {
    navigate("/student/video", { state: { videoUrl: fileUrl } });
  };

  const handleEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await postCommentReply(id, { text: editText });
      setComments(comments.map((c) => (c.id === id ? res.data ?? res : c)));
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("Failed to update comment", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  if (!announcement)
    return <p className="text-center mt-10">No announcement found!</p>;

  return (
    <div className="min-h-screen p-6 bg-teal-50">
      <div className="max-w-4xl mx-auto p-6 bg-teal-100 rounded shadow mt-6">
        <div className="bg-teal-50 p-6 rounded shadow-md mb-6 relative">
          <h1 className="text-3xl font-bold text-green-800 mb-4">
            {announcement.heading}
          </h1>

          <p className="text-gray-800 mb-4">{announcement.text}</p>

          {announcement.files?.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {announcement.files.map((f) => (
                <div
                  key={f.id}
                  className="bg-gray-100 rounded-lg p-3 min-w-[220px]"
                >
                  <a
                    href={f.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:underline text-sm break-all"
                  >
                    {f.file.split("/").pop()}
                  </a>
                </div>
              ))}
            </div>
          )}

          {announcementVideo && (
            <button
              onClick={() => handleClick(announcementVideo.file)}
              className="absolute bottom-4 right-4 bg-teal-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 transition text-sm"
            >
              Open Video
            </button>
          )}
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Comments</h2>

        <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
          {loadingComments ? (
            <p className="text-gray-500">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-400">No comments yet</p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="bg-white p-3 rounded shadow-sm relative"
              >
                <div className="absolute top-2 right-2 flex gap-1">
                  {editingId !== c.id && (
                    <>
                      <Edit2
                        className="w-5 h-5 text-blue-500 cursor-pointer"
                        onClick={() => handleEdit(c.id, c.text)}
                      />
                      <Trash2
                        className="w-5 h-5 text-red-500 cursor-pointer"
                        onClick={() => handleDelete(c.id)}
                      />
                    </>
                  )}
                </div>

                <p className="text-sm font-semibold text-gray-700">
                  {c.author_name}
                </p>

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

                {c.video_url && (
                  <video
                    src={c.video_url}
                    controls
                    className="mt-2 rounded w-full max-w-md"
                    style={{ maxHeight: "200px" }}
                  />
                )}

                {c.reply && (
                  <div className="bg-teal-50 p-2 rounded mt-2 ml-6">
                    <p className="text-teal-700 font-semibold text-sm">
                      Teacher Reply:
                    </p>
                    <p className="text-gray-800 text-sm">{c.reply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-2 border rounded px-2 py-2 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm outline-none px-2 py-1"
            />

            <input
              type="file"
              accept="video/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <Paperclip
              className="w-5 h-5 text-gray-600 cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            />
            <Camera
              className="w-5 h-5 text-gray-600 cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            />

            <button
              onClick={handleAddComment}
              className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600 text-sm"
            >
              Comment
            </button>
          </div>

          {newFile && (
            <span className="text-sm text-gray-600 ml-1">
              Selected: {newFile.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAnnouncementDetail;
