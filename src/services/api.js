import axios from "axios";

const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  if (isLocalhost) {
    return "http://localhost:5000/api";
  }

  return `http://${hostname}:5000/api`;
};

const API_URL = getApiUrl();

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const generateCurlCommand = (config) => {
  const { method, url, data, headers } = config;
  const fullUrl = url.startsWith("http")
    ? url
    : `${API_URL}${url.startsWith("/") ? url : "/" + url}`;

  let curlCommand = `curl -X ${method.toUpperCase()} '${fullUrl}'`;

  const allHeaders = { ...headers };
  if (!allHeaders["Content-Type"] && !allHeaders["content-type"]) {
    allHeaders["Content-Type"] = "application/json";
  }

  Object.entries(allHeaders).forEach(([key, value]) => {
    curlCommand += ` \\\n  -H '${key}: ${value}'`;
  });

  if (
    data &&
    (method.toLowerCase() === "post" ||
      method.toLowerCase() === "put" ||
      method.toLowerCase() === "patch")
  ) {
    const jsonData =
      typeof data === "string" ? data : JSON.stringify(data, null, 2);
    const escapedData = jsonData.replace(/'/g, "'\\''");
    curlCommand += ` \\\n  -d '${escapedData}'`;
  }

  return curlCommand;
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const curlCommand = generateCurlCommand(config);
    console.log("📡 API Request:", config.method.toUpperCase(), config.url);
    console.log("💻 cURL Command:");
    console.log(curlCommand);
    console.log("📦 Request Data:", config.data || "No data");

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      "✅ API Response:",
      response.config.method.toUpperCase(),
      response.config.url
    );
    console.log("📦 Response Data:", response.data);
    return response;
  },
  (error) => {
    console.error(
      "❌ API Error:",
      error.config?.method?.toUpperCase(),
      error.config?.url
    );
    if (error.response) {
      console.error("📦 Error Response:", error.response.data);
      console.error("📊 Status:", error.response.status);
    } else if (error.request) {
      console.error("📡 No response received:", error.request);
    } else {
      console.error("❌ Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_URL };
