import apiClient from "./api";

export const productService = {
  getStats: async () => {
    const response = await apiClient.get("/products/stats/summary");
    return response.data;
  },
  getCollegesMeta: async () => {
    const response = await apiClient.get("/products/meta/colleges");
    return response.data;
  },
  list: async (params = {}) => {
    const response = await apiClient.get("/products", { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await apiClient.post("/products", payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await apiClient.put(`/products/${id}`, payload);
    return response.data;
  },
  remove: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
