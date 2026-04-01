import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Edit2, Trash2, Check, X, Paperclip, MessageSquare, Camera, Upload } from "lucide-react";
import Webcam from "react-webcam";

import API from "../api/axios";
import {
  getAnnouncementComments,
  createComment,
  updateComment,
  deleteComment,
} from "../api/commentApi";
const MODE_TEXT = "text";
const MODE_CAMERA = "camera";
const MODE_VIDEO = "video";

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

  const [inputMode, setInputMode] = useState(MODE_TEXT);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [aiResultGenerated, setAiResultGenerated] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastPredictionTime, setLastPredictionTime] = useState(0);

  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraIntervalRef = useRef(null);
  const lastPredictionRef = useRef("");
  const predictionQueueRef = useRef([]);
  const isProcessingRef = useRef(false);
  
  const isVideoFile = (file) => {
    if (!file) return false;
    const name = typeof file === "string" ? file : file.name;
    const extension = name.split(".").pop().toLowerCase();
    return ["mp4", "webm", "ogg", "mov", "avi", "mkv"].includes(extension);
  };

  const announcementVideo = announcement?.files?.find((f) => isVideoFile(f.file));

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  };

  useEffect(() => {
    if (!announcement?.id) return;

    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const response = await getAnnouncementComments(announcement.id);
        const commentsData = response.data || response;
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch (err) {
        console.error("Failed to fetch comments", err);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [announcement]);

  useEffect(() => {
    return () => {
      if (cameraIntervalRef.current) {
        clearInterval(cameraIntervalRef.current);
      }
    };
  }, []);

  const processPredictionQueue = async () => {
    if (isProcessingRef.current || predictionQueueRef.current.length === 0) return;
    
    isProcessingRef.current = true;
    
    while (predictionQueueRef.current.length > 0) {
      const prediction = predictionQueueRef.current.shift();
      
      setNewComment(prev => {
        if (prediction === 'BACKSPACE') {
          return prev.slice(0, -1);
        } else if (prediction === 'SPACE') {
          return prev + ' ';
        } else if (prediction && prediction !== 'nothing') {
          return prev + prediction;
        }
        return prev;
      });
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    isProcessingRef.current = false;
  };

  useEffect(() => {
    if (cameraIntervalRef.current) {
      clearInterval(cameraIntervalRef.current);
      cameraIntervalRef.current = null;
      setIsCapturing(false);
      predictionQueueRef.current = [];
    }

    if (inputMode !== MODE_CAMERA) return;

    setIsCapturing(true);
    let frameCount = 0;

    const captureAndPredict = async () => {
      if (!webcamRef.current) return;

      try {
        const now = Date.now();
        if (now - lastPredictionTime < 200) return;
        
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;
        
        const blob = await fetch(imageSrc).then(r => r.blob());

        const formData = new FormData();
        formData.append("image", blob, `frame_${frameCount++}.jpg`);

        const res = await API.post("/transcription/predict-camera/", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (res.data && res.data.prediction) {
          let prediction = res.data.prediction;
          
          if (prediction !== lastPredictionRef.current && prediction !== 'nothing') {
            lastPredictionRef.current = prediction;
            setLastPredictionTime(now);
            
            if (prediction === 'BACKSPACE') {
              predictionQueueRef.current.push('BACKSPACE');
            } else if (prediction === ' ') {
              predictionQueueRef.current.push('SPACE');
            } else {
              predictionQueueRef.current.push(prediction);
            }
            
            processPredictionQueue();
          } else if (prediction === 'nothing') {
            lastPredictionRef.current = '';
          }
        }
      } catch (err) {
        console.error("Inference failed", err);
      }
    };

    cameraIntervalRef.current = setInterval(captureAndPredict, 250);

    return () => {
      if (cameraIntervalRef.current) {
        clearInterval(cameraIntervalRef.current);
        cameraIntervalRef.current = null;
      }
      setIsCapturing(false);
      predictionQueueRef.current = [];
    };
  }, [inputMode, lastPredictionTime]);

  const switchMode = (mode) => {
    setInputMode(mode);
    setNewFile(null);
    setAiResultGenerated(false);
    setNewComment(""); 
    lastPredictionRef.current = "";
    predictionQueueRef.current = [];
  };
  
  const processVideoWithAI = async () => {
    if (!newFile || !isVideoFile(newFile)) return false;

    setIsProcessingAI(true);
    setProcessProgress(10);

    try {
      const aiFormData = new FormData();
      aiFormData.append("video", newFile);

      const aiRes = await API.post("/transcription/predict-character/", aiFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProcessProgress(Math.min(percent, 90)); 
          }
        },
      });

      if (aiRes.data.prediction) {
        setNewComment(aiRes.data.prediction);
        setAiResultGenerated(true);
        setProcessProgress(100);
        return true;
      } else {
        throw new Error("No prediction received");
      }
    } catch (error) {
      console.error("AI processing failed:", error);
      alert("AI processing failed. You can still type your comment manually.");
      setAiResultGenerated(true); 
      setProcessProgress(0);
      return false;
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleAddComment = async () => {
    if (inputMode === MODE_VIDEO && newFile && isVideoFile(newFile) && !aiResultGenerated) {
      await processVideoWithAI();
      return;
    }
    if (!newComment.trim() && !newFile) {
      alert("Please enter a comment or attach a file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("text", newComment);

      if (newFile) {
        formData.append("video", newFile);
        formData.append("ai_text", newComment); 
      }

      const response = await createComment(announcement.id, formData);
      const newCommentData = response.data || response;

      const storedUser = getStoredUser();
      const displayName = newCommentData.author_name ||
        storedUser.username ||
        storedUser.first_name ||
        "You";
      setComments((prev) => [...prev, {
        ...newCommentData,
        author_name: displayName
      }]);
      setNewComment("");
      setNewFile(null);
      setAiResultGenerated(false);
      setInputMode(MODE_TEXT); 
      lastPredictionRef.current = "";
      predictionQueueRef.current = [];
    } catch (err) {
      console.error("Post error:", err.response?.data || err);
      alert("Could not post comment. Please try again.");
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Could not delete comment.");
    }
  };
  
  const handleEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return;

    try {
      const response = await updateComment(id, { text: editText });
      const updatedComment = response.data || response;

      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updatedComment } : c))
      );
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("Edit error:", err);
      alert("Could not update comment.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };
  
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setNewFile(file);
      setAiResultGenerated(false);
      setNewComment(""); 
    }
  };

  const handleClick = (fileUrl) => {
    navigate("/student/video", { state: { videoUrl: fileUrl } });
  };

  if (!announcement) {
    return (
      <div className="min-h-screen p-6 bg-teal-50">
        <div className="max-w-4xl mx-auto p-6 bg-teal-100 rounded shadow mt-6 text-center">
          <p className="text-gray-700">No announcement found!</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  let actionLabel = "Comment";
  let actionColor = "bg-orange-500 hover:bg-orange-600";

  if (isProcessingAI) {
    actionLabel = "Processing...";
    actionColor = "bg-gray-300 cursor-not-allowed";
  } else if (inputMode === MODE_VIDEO && !aiResultGenerated && newFile) {
    actionLabel = "Process Video";
    actionColor = "bg-blue-600 hover:bg-blue-700";
  }

  const isActionDisabled = isProcessingAI ||
    (inputMode === MODE_VIDEO && !aiResultGenerated && !newFile) ||
    (inputMode === MODE_TEXT && !newComment.trim() && !newFile);

  return (
    <div className="min-h-screen p-6 bg-teal-50">
      <div className="max-w-4xl mx-auto p-6 bg-teal-100 rounded shadow mt-6">
        <div className="bg-teal-50 p-6 rounded shadow-md mb-6 relative">
          <h1 className="text-3xl font-bold text-green-800 mb-4">{announcement.heading}</h1>
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
                      <span className="truncate max-w-[200px]">{fileUrl.split("/").pop()}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {announcementVideo && (
            <button
              onClick={() => handleClick(announcementVideo.file_url || announcementVideo.file)}
              className="absolute top-6 right-6 bg-teal-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 transition text-sm"
            >
              Watch Video Lesson
            </button>
          )}
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Comments</h2>

        {isProcessingAI && (
          <div className="mb-4 p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                SignBridge AI: Processing…
              </span>
              <span className="text-xs font-bold text-blue-600">{processProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${processProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-4 max-h-80 overflow-y-auto mb-4 p-2">
          {loadingComments ? (
            <p className="text-gray-500 italic">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-400 italic text-sm">No comments yet. Be the first!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm border border-teal-200 relative mb-3">
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

                <p className="text-xs font-bold text-teal-600 mb-1">{c.author_name}</p>

                {editingId === c.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 border rounded px-2 py-1 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(c.id)}
                      className="bg-green-100 p-1 rounded hover:bg-green-200"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-red-100 p-1 rounded hover:bg-red-200"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-800 text-sm pr-16">{c.text}</p>
                )}

                {c.video && (
                  <div className="mt-2 bg-black rounded-lg overflow-hidden max-w-[250px]">
                    <video
                      src={c.video}
                      controls
                      className="w-full h-auto"
                    />
                  </div>
                )}

                {c.reply && (
                  <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded mt-2 ml-4">
                    <p className="text-teal-800 font-bold text-[10px] uppercase">Teacher Reply</p>
                    <p className="text-gray-700 text-sm italic">{c.reply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-2 border-2 border-teal-200 rounded-xl px-3 py-3 bg-white shadow-inner">

          <div className="flex gap-1 mb-2 border-b border-gray-100 pb-2">
            {[
              { mode: MODE_TEXT, label: "Text", Icon: MessageSquare },
              { mode: MODE_CAMERA, label: "Live Camera", Icon: Camera },
              { mode: MODE_VIDEO, label: "Upload Video", Icon: Upload }
            ].map(({ mode, label, Icon }) => (
              <button
                key={mode}
                onClick={() => switchMode(mode)}
                disabled={isProcessingAI}
                className={`flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition-all ${
                  inputMode === mode
                    ? "bg-teal-600 text-white shadow"
                    : "text-gray-400 hover:text-teal-500"
                } ${isProcessingAI ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {inputMode === MODE_CAMERA && (
            <div className="flex flex-col items-center gap-3 mb-3">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full max-w-md rounded-lg border-2 border-teal-500"
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: "user"
                }}
              />
              <p className="text-xs text-teal-600 font-medium animate-pulse">
                {isCapturing ? "🎥 Reading signs in real-time..." : "Camera is ready"}
              </p>
            </div>
          )}

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
                disabled={isProcessingAI}
                className="flex items-center gap-2 self-start border-2 border-dashed border-teal-300 px-4 py-2 rounded-lg text-sm text-teal-600 hover:bg-teal-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                {newFile ? newFile.name : "Choose a video file"}
              </button>
              {newFile && !aiResultGenerated && (
                <p className="text-xs text-blue-600">
                  Click "Process Video" to generate text from your video
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isActionDisabled && handleAddComment()}
              placeholder={
                inputMode === MODE_TEXT
                  ? "Write your comment…"
                  : inputMode === MODE_CAMERA
                    ? "Signs appear instantly as you sign..."
                    : aiResultGenerated
                      ? "Review AI text, then click Comment…"
                      : "Select a video, then click Process Video…"
              }
              disabled={isProcessingAI || (inputMode === MODE_VIDEO && !aiResultGenerated)}
              className="flex-1 text-sm outline-none bg-transparent font-medium placeholder-gray-300 disabled:opacity-50"
            />
            <button
              onClick={handleAddComment}
              disabled={isActionDisabled}
              className={`px-5 py-2 rounded-lg text-sm font-bold text-white transition-all ${actionColor} disabled:opacity-50 disabled:cursor-not-allowed`}
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