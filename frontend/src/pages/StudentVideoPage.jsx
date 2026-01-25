import React, { useState } from "react";
import { useLocation } from "react-router-dom";

const StudentVideoPage = () => {
  const location = useLocation();
  const videoUrl = location.state?.videoUrl;

  const [transcription, setTranscription] = useState("");

  if (!videoUrl) {
    return <p className="p-4 text-red-500">No video selected!</p>;
  }

  const handleGenerate = () => {
    setTranscription(
      "This is a sample transcription generated for the video."
    );
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([transcription], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "transcription.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="flex flex-col items-center p-6 gap-6 max-w-3xl mx-auto">
      <div className="w-full bg-gray-100 rounded-lg shadow-lg p-2">
        <video
          src={videoUrl}
          controls
          className="w-full rounded-lg"
        />
        <h2 className="mt-2 text-lg font-semibold text-center">Video</h2>
       
      </div>

      <div className="flex gap-4">
        <button
          className="bg-teal-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 hover:shadow-lg transition duration-300 ease-in-out"
          onClick={handleGenerate}
        >
          Generate Transcription
        </button>
        <button
          className="bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-600 hover:shadow-lg transition duration-300 ease-in-out"
          onClick={handleDownload}
          disabled={!transcription} 
        >
          Download Transcription
        </button>
      </div>
      <div className="w-full bg-gray-50 rounded-lg shadow-lg p-4 min-h-[100px]">
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
