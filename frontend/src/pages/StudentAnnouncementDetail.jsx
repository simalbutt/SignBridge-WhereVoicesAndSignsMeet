import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Edit2, Trash2, Check, X, Paperclip, MessageSquare, Camera, Upload } from "lucide-react";
import Webcam from "react-webcam";

import API from "../api/axios";
import {
  getAnnouncementComments,
  postCommentReply,
  deleteComment,
} from "../api/commentApi";

// Input mode constants
const MODE_TEXT   = "text";
const MODE_CAMERA = "camera";
const MODE_VIDEO  = "video";

const StudentAnnouncementDetail = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { announcement } = location.state || {};

  const [comments,        setComments]        = useState([]);
  const [newComment,      setNewComment]       = useState("");
  const [newFile,         setNewFile]          = useState(null);
  const [editingId,       setEditingId]        = useState(null);
  const [editText,        setEditText]         = useState("");
  const [loadingComments, setLoadingComments]  = useState(true);

  // --- input mode ---
  const [inputMode, setInputMode] = useState(MODE_TEXT);

  // --- AI processing ---
  const [isProcessingAI,  setIsProcessingAI]  = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [aiResultGenerated, setAiResultGenerated] = useState(false);

  const webcamRef   = useRef(null);
  const fileInputRef = useRef(null);

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                             */
  /* ------------------------------------------------------------------ */
  const isVideoFile = (file) => {
    if (!file) return false;
    const name = typeof file === "string" ? file : file.name;
    return ["mp4", "webm", "ogg", "mov", "avi", "mkv"].includes(
      name.split(".").pop().toLowerCase()
    );
  };

  const announcementVideo = announcement?.files?.find((f) =>
    isVideoFile(f.file)
  );

  const getStoredUser = () => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; }
    catch { return {}; }
  };

  /* ------------------------------------------------------------------ */
  /*  Fetch comments                                                      */
  /* ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ */
  /*  Live-camera inference loop                                          */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (inputMode !== MODE_CAMERA) return;

    const captureAndPredict = async () => {
      if (!webcamRef.current) return;
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;
      try {
        const blob      = await fetch(imageSrc).then((r) => r.blob());
        const formData  = new FormData();
        formData.append("image", blob, "frame.jpg");
        const res = await API.post("/transcription/predict-camera/", formData);
        if (res.data.prediction) {
          setNewComment((prev) => prev + res.data.prediction);
        }
      } catch (err) {
        console.error("Inference failed", err);
      }
    };

    const interval = setInterval(captureAndPredict, 1500);
    return () => clearInterval(interval);
  }, [inputMode]);

  /* ------------------------------------------------------------------ */
  /*  Mode switch helper                                                  */
  /* ------------------------------------------------------------------ */
  const switchMode = (mode) => {
    setInputMode(mode);
    setNewFile(null);
    setAiResultGenerated(false);
    // keep comment text so user doesn't lose typing
  };

  /* ------------------------------------------------------------------ */
  /*  Add / post comment                                                  */
  /* ------------------------------------------------------------------ */
  const handleAddComment = async () => {
    // Step 1 – process video with AI first (upload mode)
    if (
      inputMode === MODE_VIDEO &&
      newFile &&
      isVideoFile(newFile) &&
      !aiResultGenerated
    ) {
      setIsProcessingAI(true);
      setProcessProgress(10);
      try {
        const aiFormData = new FormData();
        aiFormData.append("video", newFile);
        const aiRes = await API.post(
          "/transcription/predict-character/",
          aiFormData,
          {
            onUploadProgress: (p) =>
              setProcessProgress(Math.round((p.loaded * 100) / p.total)),
          }
        );
        setNewComment(aiRes.data.prediction);
        setAiResultGenerated(true);
        setProcessProgress(100);
      } catch {
        alert("AI processing failed. You can still type your comment manually.");
        setAiResultGenerated(true);
      } finally {
        setIsProcessingAI(false);
      }
      return; // user confirms text then clicks again to post
    }

    // Step 2 – post
    if (!newComment.trim() && !newFile) return;

    try {
      const formData = new FormData();
      formData.append("text", newComment);
      if (newFile) {
        formData.append("video", newFile);
        formData.append("ai_text", newComment);
      }

      const res = await API.post(
        `/transcription/announcements/${announcement.id}/comments/`,
        formData
      );

      // Fix instant name display — read from localStorage right now
      const storedUser = getStoredUser();
      const displayName =
        res.data.author_name ||
        storedUser.username ||
        storedUser.first_name ||
        "You";

      setComments((prev) => [
        ...prev,
        { ...res.data, author_name: displayName },
      ]);
      setNewComment("");
      setNewFile(null);
      setAiResultGenerated(false);
    } catch (err) {
      console.error("Post error:", err.response?.data);
      alert("Could not post comment.");
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Delete comment — calls DELETE /transcription/comments/<id>/        */
  /* ------------------------------------------------------------------ */
  const handleDelete = async (commentId) => {
    // 1. Confirm before action
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      // 2. Use the exact URL from your urls.py: /transcription/comments/<id>/delete/
      await API.delete(`/transcription/comments/${commentId}/delete/`);

      // 3. Update the UI state immediately
      setComments((prev) => prev.filter((c) => c.id !== commentId));

    } catch (err) {
      console.error("Delete error details:", err.response?.data);
      
      // Handle specific backend errors
      if (err.response?.status === 403) {
        alert("Permission Denied: You can only delete your own comments.");
      } else if (err.response?.status === 404) {
        alert("Error: Comment not found on server.");
      } else {
        alert("Could not delete comment. Please try again.");
      }
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Edit comment                                                        */
  /* ------------------------------------------------------------------ */
  const handleEdit     = (id, text) => { setEditingId(id); setEditText(text); };
  const handleSaveEdit = async (id) => {
    try {
      const res = await postCommentReply(id, { text: editText });
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...(res.data ?? res) } : c))
      );
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  File change                                                         */
  /* ------------------------------------------------------------------ */
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setNewFile(e.target.files[0]);
      setAiResultGenerated(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Misc                                                                */
  /* ------------------------------------------------------------------ */
  const handleClick = (fileUrl) =>
    navigate("/student/video", { state: { videoUrl: fileUrl } });

  if (!announcement)
    return <p className="text-center mt-10">No announcement found!</p>;

  /* ------------------------------------------------------------------ */
  /*  Button label / colour for the action button                         */
  /* ------------------------------------------------------------------ */
  const actionLabel = isProcessingAI
    ? "Wait..."
    : inputMode === MODE_VIDEO && !aiResultGenerated && newFile
    ? "Process Video"
    : "Comment";

  const actionColor = isProcessingAI
    ? "bg-gray-300 cursor-not-allowed"
    : inputMode === MODE_VIDEO && !aiResultGenerated && newFile
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-orange-500 hover:bg-orange-600";

  /* ================================================================== */
  return (
    <div className="min-h-screen p-6 bg-teal-50">
      <div className="max-w-4xl mx-auto p-6 bg-teal-100 rounded shadow mt-6">

        {/* ── Announcement card ── */}
        <div className="bg-teal-50 p-6 rounded shadow-md mb-6 relative">
          <h1 className="text-3xl font-bold text-green-800 mb-4">
            {announcement.heading}
          </h1>
          <p className="text-gray-800 mb-4">{announcement.text}</p>

          {announcement.files?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-teal-200">
              <p className="text-xs font-bold text-teal-700 uppercase mb-2 tracking-wider">
                Attached Materials
              </p>
              <div className="flex flex-wrap gap-2">
                {announcement.files.map((f) => {
                  const fileUrl = f.file_url || f.file;
                  if (isVideoFile(fileUrl)) return null;
                  return (
                    <a
                      key={f.id}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white border border-teal-300 px-3 py-1.5 rounded-lg text-teal-700 hover:bg-teal-100 transition text-sm shadow-sm"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span className="truncate max-w-[200px]">
                        {fileUrl.split("/").pop()}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {announcementVideo && (
            <button
              onClick={() =>
                handleClick(announcementVideo.file_url || announcementVideo.file)
              }
              className="absolute top-6 right-6 bg-teal-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 transition text-sm"
            >
              Watch Video Lesson
            </button>
          )}
        </div>

        {/* ── Comments heading ── */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Comments</h2>

        {/* ── AI progress bar ── */}
        {isProcessingAI && (
          <div className="mb-4 p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm animate-pulse">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                SignBridge AI: Processing…
              </span>
              <span className="text-xs font-bold text-blue-600">
                {processProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${processProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Comments feed ── */}
        <div className="space-y-4 max-h-80 overflow-y-auto mb-4 p-2">
          {loadingComments ? (
            <p className="text-gray-500 italic">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-400 italic text-sm">No comments yet. Be the first!</p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-teal-200 relative mb-3"
              >
                {/* Edit / Delete buttons */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(c.id, c.text)}
                    className="p-1 rounded hover:bg-blue-50 transition"
                    title="Edit comment"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1 rounded hover:bg-red-50 transition"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>

                <p className="text-xs font-bold text-teal-600 mb-1">
                  {c.author_name}
                </p>

                {editingId === c.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 border rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => handleSaveEdit(c.id)}
                      className="bg-green-100 p-1 rounded"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-red-100 p-1 rounded"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-800 text-sm pr-16">{c.text}</p>
                )}

                {c.video_url && (
                  <div className="mt-2 bg-black rounded-lg overflow-hidden max-w-[250px]">
                    <video src={c.video_url} controls className="w-full h-auto" />
                  </div>
                )}

                {c.reply && (
                  <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded mt-2 ml-4">
                    <p className="text-teal-800 font-bold text-[10px] uppercase">
                      Teacher Reply
                    </p>
                    <p className="text-gray-700 text-sm italic">"{c.reply}"</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ── Integrated input area ── */}
        <div className="flex flex-col gap-2 border-2 border-teal-200 rounded-xl px-3 py-3 bg-white shadow-inner">

          {/* Mode tabs */}
          <div className="flex gap-1 mb-2 border-b border-gray-100 pb-2">
            {[
              { mode: MODE_TEXT,   label: "Text",        Icon: MessageSquare },
              { mode: MODE_CAMERA, label: "Live Camera", Icon: Camera        },
              { mode: MODE_VIDEO,  label: "Upload Video", Icon: Upload       },
            ].map(({ mode, label, Icon }) => (
              <button
                key={mode}
                onClick={() => switchMode(mode)}
                className={`flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition-all ${
                  inputMode === mode
                    ? "bg-teal-600 text-white shadow"
                    : "text-gray-400 hover:text-teal-500"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Live camera preview */}
          {inputMode === MODE_CAMERA && (
            <div className="flex flex-col items-center gap-3 mb-3">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full max-w-md rounded-lg border-2 border-teal-500"
              />
              <p className="text-xs text-gray-400 italic">
                Signs are being read in real-time and appended below.
              </p>
            </div>
          )}

          {/* Upload video – file picker + preview */}
          {inputMode === MODE_VIDEO && (
            <div className="flex flex-col gap-2 mb-2">
              <input
                type="file"
                accept="video/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => !isProcessingAI && fileInputRef.current.click()}
                className="flex items-center gap-2 self-start border-2 border-dashed border-teal-300 px-4 py-2 rounded-lg text-sm text-teal-600 hover:bg-teal-50 transition"
              >
                <Upload className="w-4 h-4" />
                {newFile ? newFile.name : "Choose a video file"}
              </button>
              {/* {newFile && aiResultGenerated && (
                <p className="text-xs text-green-600 font-semibold">
                  ✓ AI extracted text — review below and click Comment.
                </p>
              )} */}
            </div>
          )}

          {/* Text input row */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isProcessingAI && handleAddComment()}
              placeholder={
                inputMode === MODE_TEXT
                  ? "Write your comment…"
                  : inputMode === MODE_CAMERA
                  ? "Signs appear here in real-time…"
                  : aiResultGenerated
                  ? "Review AI text, then click Comment…"
                  : "Select a video, then click Process Video…"
              }
              disabled={isProcessingAI}
              className="flex-1 text-sm outline-none bg-transparent font-medium placeholder-gray-300"
            />

            <button
              onClick={handleAddComment}
              disabled={isProcessingAI}
              className={`px-5 py-2 rounded-lg text-sm font-bold text-white transition-all ${actionColor}`}
            >
              {actionLabel}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentAnnouncementDetail;