import axios from "./axios"; // instance của bạn

export const getDashboardDailyApi = (userId) => {
  return axios.get(`/api/dashboard-daily?userId=${userId}`);
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
