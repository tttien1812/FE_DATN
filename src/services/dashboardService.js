import axios from "./axios"; // instance của bạn

export const getSummaryApi = (userId, fromDate, toDate) => {
  return axios.get("/api/summary", {
    params: { userId, fromDate, toDate },
  });
};

export const getDetailsApi = (userId, fromDate, toDate) => {
  return axios.get("/api/details", {
    params: { userId, fromDate, toDate },
  });
};

export const getGroupByDateApi = (userId, fromDate, toDate) => {
  return axios.get("/api/group-by-date", {
    params: { userId, fromDate, toDate },
  });
};

export const getSentimentDistributionApi = (userId) => {
  return axios.get("/api/sentiment-distribution", {
    params: { userId },
  });
};

export const getMonthlyKpiApi = (userId) => {
  return axios.get("/api/monthly-kpi", {
    params: { userId },
  });
};

export const getInsightApi = (userId) => {
  return axios.get(`/api/insight`, {
    params: { userId },
  });
};

//====================admin====================
export const getAdminDashboardApi = (params) => {
  return axios.get("/api/admin-dashboard", { params });
};

export const getAdminUserDetailApi = (params) => {
  return axios.get("/api/admin-user-detail", { params });
};
