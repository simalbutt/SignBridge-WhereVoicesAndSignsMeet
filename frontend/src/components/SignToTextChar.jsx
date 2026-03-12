import React, { useState } from 'react';
import axios from 'axios';

const SignToTextChar = () => {
    const [transcription, setTranscription] = useState("");
    const [loading, setLoading] = useState(false);
    const [videoSelected, setVideoSelected] = useState(false);
    
    // Get the user role from localStorage (saved during your successful login!)
    const userRole = localStorage.getItem("userRole");
    const isTeacher = userRole === 'teacher';

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setVideoSelected(true);
        setLoading(true);
        
        const formData = new FormData();
        formData.append('video', file);

        try {
            // Get the token we just fixed via LocalStorage/AuthHeader
            const token = localStorage.getItem("accessToken");
            
            const response = await axios.post('http://127.0.0.1:8000/api/transcription/predict-character/', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` 
                }
            });

            // Set the final processed text
            setTranscription(response.data.prediction);
        } catch (error) {
            console.error("Processing error:", error);
            setTranscription("Error: System could not extract signs from this video.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto bg-white shadow-xl rounded-2xl border border-gray-100">
            {/* <h2 className="text-2xl font-bold text-gray-800 mb-6">
                SignBridge AI: Video-to-Text Conversion
            </h2>

            <div className="mb-8 p-6 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
                <p className="text-sm text-blue-600 mb-4 font-medium">Select a Sign Language video to convert to text</p>
                <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor:pointer"
                />
            </div> */}

            {/* Step 2: Processing State */}
            {loading && (
                <div className="flex flex-col items-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Analyzing hand landmarks & MediaPipe sequence...</p>
                </div>
            )}

            {/* Step 3: Result (The "Comment" View) */}
            {transcription && (
                <div className="mt-6 animate-fade-in">
                    <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-green-800 uppercase text-xs tracking-wider">
                                {isTeacher ? "Teacher View: AI Transcription" : "Student Submission Result"}
                            </h4>
                            <span className="text-[10px] text-green-600 bg-white px-2 py-1 rounded border">Processed by SignBridge v1.0</span>
                        </div>
                        
                        <p className="text-2xl font-mono text-gray-900 bg-white p-4 border rounded shadow-inner">
                            {transcription}
                        </p>
                        
                        {isTeacher && (
                            <p className="mt-4 text-sm text-gray-500 italic">
                                * This text was extracted from the student's video landmarks.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignToTextChar;