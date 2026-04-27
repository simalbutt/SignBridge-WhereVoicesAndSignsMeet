import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateTranscript, downloadTranscript } from "../api/transcriptionApi";

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
  const [downloading, setDownloading] = useState(false);
  const [transcriptionComplete, setTranscriptionComplete] = useState(false);

  const fetchStartedRef = useRef(false);

  useEffect(() => {
    if (!videoUrl || fetchStartedRef.current) return;
    fetchStartedRef.current = true;
    fetchAudioTranscript();
  }, [videoUrl]);

  // Whisper Logic
  const fetchAudioTranscript = async () => {
    setLoadingWhisper(true);
    try {
      const res = await generateTranscript(videoUrl);
      console.log("Transcription response:", res.data); 
      setSentences(res.data.sentences || []);
      setDownloadUrl(res.data.download_url);
      setTranscriptionComplete(true);
    } catch (err) {
      console.error("Whisper Transcription failed:", err);
    } finally {
      setLoadingWhisper(false);
    }
  };
  useEffect(() => {
    const video = videoRef.current;
    if (!video || sentences.length === 0) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime
      
      const index = sentences.findIndex(
        (s) => currentTime >= s.start && currentTime <= s.end,
      );
      setCurrentSentenceIndex(index);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [sentences]);

  const handleDownload = async () => {
    if (!downloadUrl) return;
    
    setDownloading(true);
    try {
      const response = await downloadTranscript(downloadUrl);
    
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'transcript.txt';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      } else {
        const urlParams = new URL(downloadUrl, window.location.origin);
        filename = urlParams.searchParams.get('file') || 'transcript.txt';
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download transcript. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const goToAvatarPage = () => {
    navigate("/student/avatar", { state: { videoUrl } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="p-6 max-w-4xl w-full">
        {!videoUrl ? (
          <p className="p-4 text-red-500 text-center font-bold">No video selected!</p>
        ) : (
          <div className="space-y-6">
            
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-2 border-4 border-white">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full rounded-xl object-contain aspect-video"
              />
            </div>

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
                    <div
                      key={idx}
                      className={`block p-3 rounded-lg transition-all text-lg cursor-pointer ${
                        idx === currentSentenceIndex
                          ? "bg-teal-600 text-white shadow-md scale-[1.02] font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = sentence.start;
                          videoRef.current.play();
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs opacity-70 min-w-[40px]">
                          {Math.floor(sentence.start / 60)}:{Math.floor(sentence.start % 60).toString().padStart(2, '0')}
                        </span>
                        <span className="flex-1">{sentence.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-4 items-center">
              {transcriptionComplete && (
                <button
                  onClick={goToAvatarPage}
                  className="flex-1 bg-teal-600 text-white py-4 rounded-xl shadow-lg hover:bg-teal-700 active:scale-95 transition-all font-black text-lg"
                >
                  VIEW SIGN AVATAR
                </button>
              )}
              {downloadUrl && (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className={`px-6 py-4 bg-white text-gray-700 rounded-xl border-2 border-gray-200 font-bold hover:bg-gray-50 transition-all ${
                    downloading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {downloading ? 'DOWNLOADING...' : 'DOWNLOAD Notes'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentVideoPage;