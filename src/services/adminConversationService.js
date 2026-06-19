import axios from "./axios";

export const getAdminConversationsApi = (params) => {
  return axios.get("/api/admin/conversations", {
    params,
  });
};
export const getAdminConversationDetailApi = (id) => {
  return axios.get(`/api/admin/conversations/${id}`);
};
export const getAdminConversationInsightApi = (conversationId) => {
  return axios.get(`/api/history/${conversationId}/insights`, {
    params: { scope: "admin" },
  });
};
