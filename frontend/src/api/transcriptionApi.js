import API from "./axios";

export const generateTranscript = (videoUrl) => {
  return API.post("/transcription/generate/", {
    video_url: videoUrl,
  });
};

export const downloadTranscript = (downloadUrl) => {
  // The download_url from backend is already formatted as:
  // "/api/transcription/download/?file=shorts_JaodP4G_transcript.txt&folder=announcements/files"
  
  // Extract the query parameters from the URL
  const url = new URL(downloadUrl, window.location.origin);
  const file = url.searchParams.get('file');
  const folder = url.searchParams.get('folder');
  
  // Make the GET request with the correct query parameters
  return API.get('/transcription/download/', {
    params: {
      file: file,
      folder: folder
    },
    responseType: 'blob',
  });
};