import axios from "./axios";

// UPLOAD AUDIO
export const uploadAudioApi = (formData) => {
  return axios.post(`/api/upload-audio`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const analyzeEmotionApi = (conversationId) => {
  return axios.post("/api/analyze-emotion", { conversationId });
};
