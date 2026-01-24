import API from "./axios";

export const generateTranscript = (videoUrl) => {
  return API.post("/transcription/generate/", {
    video_url: videoUrl,
  });
};
