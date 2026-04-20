import axios from "axios";

// BASE CONFIG 

const isProduction = process.env.NODE_ENV === "production";

const baseURL =
    process.env.NEXT_PUBLIC_API_URL ||
    (!isProduction ? "http://localhost:5000/api" : "");

if (!baseURL && typeof window !== "undefined") {
    console.error("Missing NEXT_PUBLIC_API_URL in production");
}

export const apiClient = axios.create({
    baseURL: baseURL || "http://localhost:5000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// STATE 

let csrfToken = null;
let csrfPromise = null;

let isRefreshing = false;
let queue = [];
let sessionInvalid = false;

// HELPERS 

const needsCsrf = (method) =>
    ["post", "put", "patch", "delete"].includes(
        String(method || "").toLowerCase()
    );

const isAuthPath = (url = "") =>
    url.includes("/auth/login") ||
    url.includes("/auth/signup") ||
    url.includes("/auth/logout") ||
    url.includes("/auth/refresh-token");

const processQueue = (error) => {
    queue.forEach((p) => (error ? p.reject(error) : p.resolve()));
    queue = [];
};

// CSRF 

const getCsrfToken = async () => {
    if (csrfToken) return csrfToken;

    if (!csrfPromise) {
        csrfPromise = apiClient
            .get("/auth/csrf-token", { __skipAuthRefresh: true })
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

// REQUEST INTERCEPTOR 

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

// RESPONSE INTERCEPTOR 

apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        if (!original || !original.url) {
            return Promise.reject(error);
        }

        if (sessionInvalid && error.response?.status === 401) {
            return Promise.reject(error);
        }

        if (original.url.includes("/auth/refresh-token")) {
            processQueue(error);
            sessionInvalid = true;
            return Promise.reject(error);
        }

        if (
            error.response?.status === 401 &&
            !original._retry &&
            !isAuthPath(original.url) &&
            !original.__skipAuthRefresh
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    queue.push({ resolve, reject });
                }).then(() => apiClient(original));
            }

            original._retry = true;
            isRefreshing = true;

            try {
                await apiClient.post("/auth/refresh-token", null, {
                    __skipAuthRefresh: true,
                });

                sessionInvalid = false;
                processQueue();

                return apiClient(original);
            } catch (err) {
                sessionInvalid = true;
                processQueue(err);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);