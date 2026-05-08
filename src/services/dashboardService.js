import axios from "./axios"; // instance của bạn

export const getDashboardDailyApi = (userId, month) => {
  return axios.get(`/api/dashboard-daily`, {
    params: {
      userId,
      month,
    },
  });
};

export const getMonthlyKpiApi = (userId, month) => {
  return axios.get("/api/monthly-kpi", {
    params: {
      userId,
      month,
    },
  });
};

export const getInsightApi = (userId, month) => {
  return axios.get(`/api/insight`, {
    params: {
      userId,
      month,
    },
  });
};

//====================admin====================
export const getAdminDashboardApi = (params) => {
  return axios.get("/api/admin-dashboard", { params });
};

export const getAdminUserDetailApi = (params) => {
  return axios.get("/api/admin-user-detail", { params });
};
