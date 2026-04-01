import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { generateTranscript } from "../api/transcriptionApi";
import SignToTextChar from "../components/SignToTextChar";

const StudentVideoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoUrl = location.state?.videoUrl;
  const videoRef = useRef(null);

  // States for Whisper (Audio) Transcription
  const [sentences, setSentences] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const [loadingWhisper, setLoadingWhisper] = useState(false);

  // States for Sign-to-Text (Video AI) Flow
  const [aiSentence, setAiSentence] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);

  // Get user role for conditional rendering
  const userRole = localStorage.getItem("userRole"); 
  const fetchStartedRef = useRef(false);

  useEffect(() => {
    if (!videoUrl || fetchStartedRef.current) return;
    fetchStartedRef.current = true;

    const performAllTranscriptions = async () => {
      // 1. Run Whisper (Audio) Transcription
      await fetchAudioTranscript();
      
      // 2. Run Sign-to-Text (Video Landmark) AI
      await runSignToTextAI();
    };

    performAllTranscriptions();
  }, [videoUrl]);

  // Existing Whisper Logic
  const fetchAudioTranscript = async () => {
    setLoadingWhisper(true);
    try {
      const res = await generateTranscript(videoUrl);
      setSentences(res.data.sentences || []);
      setDownloadUrl(res.data.download_url);
    } catch (err) {
      console.error("Whisper Transcription failed:", err);
    } finally {
      setLoadingWhisper(false);
    }
  };

  // NEW: Sign-to-Text AI Pipeline
  const runSignToTextAI = async () => {
    setIsProcessingAI(true);
    setProcessProgress(10);
    try {
      // Fetch the video file as a blob to send to the AI backend
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('video', blob, 'gesture_video.mp4');

      setProcessProgress(40);

      const token = localStorage.getItem("accessToken");
      const aiRes = await axios.post('http://127.0.0.1:8000/api/transcription/predict-character/', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total) + 40;
          setProcessProgress(progress);
        }
      });

      setAiSentence(aiRes.data.prediction);
      setProcessProgress(100);
    } catch (err) {
      console.error("Sign-to-Text AI error:", err);
    } finally {
      setTimeout(() => setIsProcessingAI(false), 800);
    }
  };

  // Video Time Tracking for Whisper Sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video || sentences.length === 0) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const index = sentences.findIndex(
        (s) => currentTime >= s.start && currentTime <= s.end,
      );
      setCurrentSentenceIndex(index);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [sentences]);

  const handleDownload = () => {
    if (downloadUrl) {
      const url = downloadUrl.startsWith("http")
        ? downloadUrl
        : `http://localhost:8000${downloadUrl}`;
      window.open(url, "_blank");
    }
  };

  const goToAvatarPage = () => {
    navigate("/student/avatar", { state: { videoUrl } });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {!videoUrl ? (
        <p className="p-4 text-red-500 text-center font-bold">No video selected!</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Video Player Section */}
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-2 border-4 border-white">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full rounded-xl object-contain aspect-video"
              />
            </div>

            {/* --- PROGRESS BAR UI --- */}
            {isProcessingAI && (
              <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 shadow-inner mb-6">
                {/* <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-blue-800 flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    SIGNBRIDGE AI: EXTRACTING GESTURES...
                  </span>
                  <span className="text-xs font-black text-blue-600 bg-white px-2 py-1 rounded-md border border-blue-200">
                    {processProgress}%
                  </span>
                </div> */}
{/*                 
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-700 h-full transition-all duration-500 ease-out" 
                    style={{ width: `${processProgress}%` }}
                  ></div>
                </div> */}
                
                {/* <p className="text-[10px] text-blue-500 mt-2 text-center font-semibold italic">
                  MediaPipe is tracking hand landmarks. Please wait while the sentence is formed.
                </p> */}
              </div>
            )}

            {/* TEACHER VIEW: Display AI Extracted Sentence */}
            {userRole === 'teacher' && aiSentence && (
              <div className="bg-amber-100 border-l-8 border-amber-500 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">TEACHER ONLY</span>
                    <h3 className="text-lg font-black text-amber-900 uppercase">AI Sign-to-Text Result</h3>
                </div>
                <div className="bg-white p-6 rounded-lg border-2 border-amber-200 shadow-inner">
                  <p className="text-3xl font-mono text-gray-800 tracking-tighter leading-tight">
                    "{aiSentence}"
                  </p>
                </div>
                <p className="text-xs text-amber-700 mt-3 italic font-medium">
                  * Verify student performance by comparing this AI output with the video gestures.
                </p>
              </div>
            )}

            {/* Lecture Transcription (Whisper Audio) */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-2xl font-black text-teal-800 mb-4 border-b pb-2">Lecture Audio Transcript</h2>
              {loadingWhisper ? (
                <div className="flex items-center gap-3 text-teal-600 font-bold">
                  <div className="animate-spin h-5 w-5 border-4 border-teal-500 border-t-transparent rounded-full"></div>
                  Syncing audio with text...
                </div>
              ) : sentences.length === 0 ? (
                <p className="text-gray-400 italic">No audio transcription available for this video.</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-4 custom-scrollbar">
                  {sentences.map((sentence, idx) => (
                    <span
                      key={idx}
                      className={`block p-3 rounded-lg transition-all text-lg ${
                        idx === currentSentenceIndex
                          ? "bg-teal-600 text-white shadow-md scale-[1.02] font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {sentence.text}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 items-center">
              <button
                onClick={goToAvatarPage}
                className="flex-1 bg-teal-600 text-white py-4 rounded-xl shadow-lg hover:bg-teal-700 active:scale-95 transition-all font-black text-lg"
              >
                VIEW SIGN AVATAR
              </button>
              {downloadUrl && (
                <button
                  onClick={handleDownload}
                  className="px-6 py-4 bg-white text-gray-700 rounded-xl border-2 border-gray-200 font-bold hover:bg-gray-50 transition-all"
                >
                  DOWNLOAD Notes
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sign-to-Text Helper */}
          {/* <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="bg-white border-2 border-teal-100 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                    <h3 className="text-xl font-black text-gray-800">Sign Helper</h3>
                </div>
                <SignToTextChar />
              </div>
              
              <div className="p-6 bg-yellow-50 rounded-2xl border-2 border-dashed border-yellow-200">
                <h4 className="font-black text-yellow-800 mb-2 text-sm uppercase">Pro Tip:</h4>
                <p className="text-sm text-yellow-700 leading-relaxed font-medium">
                  Ensure your hands are fully within the frame. Your **SignBridge AI** uses MediaPipe to track 21 points on each hand for maximum accuracy.
                </p>
              </div>
            </div>
          </div> */}

        </div>
      )}
    </div>
  );
};

export default StudentVideoPage;