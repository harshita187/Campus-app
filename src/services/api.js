import axios from "axios";

const getApiUrl = () => {
  const explicitApiUrl = process.env.REACT_APP_API_URL?.trim();
  const forceLocalApi = process.env.REACT_APP_FORCE_LOCAL_API !== "false";

  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  // During local development, prefer the local backend by default even if a
  // deployed API URL is present in .env. This keeps login/signup predictable.
  if (isLocalhost && forceLocalApi) {
    return "http://localhost:5001/api";
  }

  if (explicitApiUrl) {
    return explicitApiUrl;
  }

  return `http://${hostname}:5001/api`;
};

const API_URL = getApiUrl();
const SOCKET_URL = API_URL.replace(/\/api$/, "");

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");

    if (isUnauthorized && !originalRequest?._retry && !isRefreshCall) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await apiClient.post("/auth/refresh");
        const token = refreshResponse.data?.token;
        if (token) {
          localStorage.setItem("token", token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      } catch (_refreshError) {
        localStorage.removeItem("token");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { API_URL, SOCKET_URL };
