import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { generateTranscript } from "../api/transcriptionApi";

const StudentVideoPage = () => {
  const location = useLocation();
  const videoUrl = location.state?.videoUrl;

  const [transcription, setTranscription] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(false);

  if (!videoUrl) {
    return <p className="p-4 text-red-500">No video selected!</p>;
  }

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateTranscript(videoUrl);
      setTranscription(res.data.transcription);
      setDownloadUrl(res.data.download_url);
    } catch (err) {
      alert("Failed to generate transcription");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(`http://localhost:8000${downloadUrl}`, "_blank");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 gap-6 max-w-4xl mx-auto">
      <div className="w-full bg-gray-100 rounded-lg shadow-lg p-3">
        <video
          src={videoUrl}
          controls
          className="w-full max-h-64 rounded-lg object-contain"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-teal-500 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-600 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Transcription"}
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

      <div className="w-full max-w-3xl bg-gray-50 rounded-lg shadow-lg p-4 min-h-[120px]">
        <h2 className="text-lg font-semibold mb-2">Transcription</h2>
        {transcription ? (
          <p className="text-gray-700 whitespace-pre-line">{transcription}</p>
        ) : (
          <p className="text-gray-400 italic">
            Transcription will appear here.
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentVideoPage;
