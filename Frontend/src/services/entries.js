import api from "./api";

export const entriesService = {
  getAll: (params = {}) => api.get("/entries", { params }),
  getOne: (id) => api.get(`/entries/${id}`),
  create: (data) => api.post("/entries", data),
  update: (id, data) => api.put(`/entries/${id}`, data),
  remove: (id) => api.delete(`/entries/${id}`),
  getDashboardStats: () => api.get("/entries/stats/dashboard"),
  getReportStats: (params = {}) => api.get("/entries/stats/report", { params }),
};
