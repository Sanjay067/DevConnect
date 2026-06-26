import axios from "axios";
import { store } from "@/store";
import { clearUser } from "@/store/authSlice";

export const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  xsrfCookieName: "csrfToken",
  xsrfHeaderName: "x-csrf-token",
});


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


// We rely on Axios's built-in xsrfCookieName and xsrfHeaderName behavior for CSRF tokens.

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
        
        // Ensure Redux state correctly clears so protected routes can redirect naturally
        store.dispatch(clearUser());

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);