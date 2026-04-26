import axios from "./axios";

// UPLOAD AUDIO
export const uploadAudioApi = (formData) => {
  return axios.post(`/api/upload-audio`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// export const analyzeEmotionApi = (conversationId) => {
//   return axios.post("/api/analyze-emotion", { conversationId });
// };

export const getStatusApi = (id) => {
  return axios.get(`/api/conversation/${id}/status`);
};

export const getResultApi = (id) => {
  return axios.get(`/api/conversation/${id}/result`);
};
