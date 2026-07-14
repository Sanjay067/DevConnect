import axios from "axios";

let rawBaseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Auto-append '/api' if missing from the Vercel env settings
if (rawBaseURL && !rawBaseURL.endsWith("/api") && !rawBaseURL.endsWith("/api/")) {
  rawBaseURL = rawBaseURL.replace(/\/+$/, "") + "/api";
}

const baseURL = rawBaseURL;

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  xsrfCookieName: "csrfToken",
  xsrfHeaderName: "x-csrf-token",
});

let csrfToken = null;
let csrfPromise = null;
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

const needsCsrf = (method) =>
  ["post", "put", "patch", "delete"].includes(String(method || "").toLowerCase());

const getCsrfToken = async () => {
  if (csrfToken) return csrfToken;

  if (!csrfPromise) {
    csrfPromise = apiClient
      .get("/auth/csrf-token")
      .then((res) => {
        csrfToken = res?.data?.csrfToken || null;
        return csrfToken;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
};

apiClient.interceptors.request.use(async (config) => {
  const url = String(config.url || "");

  if (needsCsrf(config.method) && !url.includes("/auth/csrf-token")) {
    const token = await getCsrfToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers["x-csrf-token"] = token;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (
        originalRequest.url?.includes("/auth/refresh-token")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/auth/refresh-token");
        isRefreshing = false;
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        
        // Dynamically import store/clearUser to break circular dependency:
        // apiClient -> store -> authSlice -> authService -> apiClient
        Promise.all([
          import("@/store"),
          import("@/store/authSlice")
        ]).then(([{ store }, { clearUser }]) => {
          store.dispatch(clearUser());
        }).catch((err) => {
          console.error("Failed to clear auth state dynamically:", err);
        });

        document.cookie = "is_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        if (typeof window !== "undefined" && window.location.pathname !== "/auth") {
          window.location.href = "/auth";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
