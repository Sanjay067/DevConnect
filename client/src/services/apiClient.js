import axios from "axios";
import { store } from "@/store";
import { clearUser } from "@/store/authSlice";

const isProduction = process.env.NODE_ENV === "production";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  (!isProduction ? "http://localhost:5000/api" : "http://localhost:5000/api");

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes("/auth/refresh-token") ||
        originalRequest.url?.includes("/users/profiles/me")
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
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        store.dispatch(clearUser());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
