import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  xsrfCookieName: "csrfToken",
  xsrfHeaderName: "x-csrf-token",
});


// Track whether a token refresh is already in progress
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Explicitly attach the CSRF token from cookies 
apiClient.interceptors.request.use((config) => {
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split("; ");
    const csrfCookie = cookies.find((row) => row.startsWith("csrfToken="));
    if (csrfCookie) {
      const token = csrfCookie.split("=")[1];
      config.headers["x-csrf-token"] = token;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if the failing request IS the refresh endpoint
      if (originalRequest.url?.includes("/auth/refresh-token")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/auth/refresh-token");
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Redirect to login if refresh also fails
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);