import axios from "./axios";

export const getHistoryDays = (userId) => {
  return axios.get("/api/history/days", {
    params: { userId },
  });
};

export const getHistoryByDate = (userId, date) => {
  return axios.get("/api/history/by-date", {
    params: { userId, date },
  });
};

export const getHistoryDetail = (id) => {
  return axios.get(`/api/history/${id}`);
};
