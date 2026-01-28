import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateTranscript } from "../api/transcriptionApi";

const StudentVideoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoUrl = location.state?.videoUrl;
  const videoRef = useRef(null);

  const [sentences, setSentences] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const fetchStartedRef = useRef(false);

  useEffect(() => {
    if (!videoUrl || fetchStartedRef.current) return;

    fetchStartedRef.current = true; 

    const fetchTranscript = async () => {
      setLoading(true);
      try {
        const res = await generateTranscript(videoUrl);
        setSentences(res.data.sentences || []);
        setDownloadUrl(res.data.download_url);
      } catch (err) {
        console.error("Transcription failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscript();
  }, [videoUrl]);

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
    <div className="flex flex-col items-center p-6 gap-6 max-w-4xl mx-auto">
      {!videoUrl ? (
        <p className="p-4 text-red-500">No video selected!</p>
      ) : (
        <>
          <div className="w-full bg-gray-100 rounded-lg shadow-lg p-3">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full max-h-64 rounded-lg object-contain"
            />
          </div>
          <div className="w-full bg-gray-50 rounded-lg shadow-lg p-4 min-h-[120px]">
            <h2 className="text-lg font-semibold mb-2">Transcription</h2>
            {loading ? (
              <p className="text-gray-400 italic">
                Generating transcription...
              </p>
            ) : sentences.length === 0 ? (
              <p className="text-gray-400 italic">
                No transcription available.
              </p>
            ) : (
              <div className="space-y-1">
                {sentences.map((sentence, idx) => (
                  <span
                    key={idx}
                    className={`block ${
                      idx === currentSentenceIndex
                        ? "bg-teal-100 font-semibold"
                        : ""
                    }`}
                  >
                    {sentence.text}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-4 justify-end w-full max-w-3xl mt-2">
            <button
              onClick={goToAvatarPage}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-600"
            >
              View Sign Language Avatar
            </button>
            {downloadUrl && (
              <button
                onClick={handleDownload}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700"
              >
                Download Transcript
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentVideoPage;
