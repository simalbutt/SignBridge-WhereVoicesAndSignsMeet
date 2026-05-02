import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateTranscript, downloadTranscript } from "../api/transcriptionApi";
import { batchConvertTextToGloss } from "../api/textToGlossApi";

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
  
  // States for Text-to-Gloss (completely separate)
  const [glossSentences, setGlossSentences] = useState([]);
  const [showGloss, setShowGloss] = useState(false);
  const [convertingToGloss, setConvertingToGloss] = useState(false);

  const fetchStartedRef = useRef(false);
  const glossConvertedRef = useRef(false);

  useEffect(() => {
    if (!videoUrl || fetchStartedRef.current) return;
    fetchStartedRef.current = true;
    fetchAudioTranscript(); // Only Whisper transcription
  }, [videoUrl]);

  // Auto-convert to gloss when transcription is complete
  useEffect(() => {
    if (transcriptionComplete && sentences.length > 0 && !glossConvertedRef.current) {
      autoConvertToGloss();
    }
  }, [transcriptionComplete, sentences]);

  // Only Whisper transcription - no gloss conversion here
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

  // Auto convert to gloss without showing UI changes
  const autoConvertToGloss = async () => {
    if (sentences.length === 0) return;
    
    glossConvertedRef.current = true;
    console.log("Auto-converting to gloss...");
    
    try {
      const texts = sentences.map(sentence => sentence.text);
      const response = await batchConvertTextToGloss(texts);
      
      if (response.data.success && response.data.data.results) {
        // Convert each gloss to lowercase
        const glossData = response.data.data.results.map(result => 
          result.gloss.toLowerCase()
        );
        setGlossSentences(glossData);
        console.log("Gloss converted successfully:", glossData);
      }
    } catch (err) {
      console.error("Failed to convert to gloss:", err);
      glossConvertedRef.current = false;
    }
  };

  // Manual conversion for UI display
  const convertToGloss = async () => {
    if (sentences.length === 0) return;
    
    setConvertingToGloss(true);
    try {
      const texts = sentences.map(sentence => sentence.text);
      const response = await batchConvertTextToGloss(texts);
      
      if (response.data.success && response.data.data.results) {
        // Convert each gloss to lowercase
        const glossData = response.data.data.results.map(result => 
          result.gloss.toLowerCase()
        );
        setGlossSentences(glossData);
        setShowGloss(true);
      }
    } catch (err) {
      console.error("Failed to convert to gloss:", err);
      alert("Failed to convert text to sign language gloss");
    } finally {
      setConvertingToGloss(false);
    }
  };

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
    // Wait for gloss conversion if it hasn't completed yet
    if (!glossConvertedRef.current && sentences.length > 0) {
      alert("Please wait while text is being converted to sign language...");
      return;
    }
    
    // Pass both transcript and gloss data to the avatar page
    const transcriptText = sentences.map(s => s.text).join(" ");
    const fullGlossText = glossSentences.join(" ");
    
    console.log("Navigating to avatar with:", {
      transcript: transcriptText,
      gloss: fullGlossText,
      glossSentencesCount: glossSentences.length
    });
    
    navigate("/student/avatar", { 
      state: { 
        videoUrl,
        transcript: transcriptText,
        gloss: fullGlossText,
        sentences: sentences,
        glossSentences: glossSentences
      } 
    });
  };

  // Get the current text to display (either original or gloss)
  const getCurrentText = (index) => {
    if (showGloss && glossSentences[index]) {
      return glossSentences[index];
    }
    return sentences[index].text;
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
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-black text-teal-800">
                  {showGloss ? "Sign Language Gloss" : "Lecture Audio Transcript"}
                </h2>
                <div className="flex gap-2">
                  {transcriptionComplete && sentences.length > 0 && !showGloss && (
                    <button
                      onClick={convertToGloss}
                      disabled={convertingToGloss}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm font-semibold disabled:opacity-50"
                    >
                      {convertingToGloss ? "Converting..." : "Show Sign Language"}
                    </button>
                  )}
                  {showGloss && (
                    <button
                      onClick={() => setShowGloss(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm font-semibold"
                    >
                      Show Original Text
                    </button>
                  )}
                </div>
              </div>
              
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
                        <span className="flex-1">
                          {getCurrentText(idx)}
                        </span>
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
                  disabled={!glossConvertedRef.current}
                  className={`flex-1 py-4 rounded-xl shadow-lg transition-all font-black text-lg ${
                    glossConvertedRef.current
                      ? "bg-teal-600 text-white hover:bg-teal-700 active:scale-95"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
                >
                  {glossConvertedRef.current ? "VIEW SIGN AVATAR" : "CONVERTING TO SIGN LANGUAGE..."}
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