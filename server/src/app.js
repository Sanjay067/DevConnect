
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { apiLimiter } from "./middlewares/rateLimits.js";
import { enforceTrustedOrigin, verifyCsrfToken } from "./middlewares/csrf.middleware.js";
import dns from  'dns';
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import apiRouter from "./routes/index.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const authAnomalyCounts = { 401: 0, 403: 0, 429: 0 };

const configuredOrigins = process.env.NODE_ENV === "production"
  ? process.env.CLIENT_ORIGIN
  : process.env.CLIENT_ORIGIN || "http://localhost:3000";
const rawOrigins = (configuredOrigins || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const normalizeOrigin = (origin = "") => origin.replace(/\/+$/, "");
const clientOrigins = rawOrigins.map(normalizeOrigin);
const strictOrigins = clientOrigins
  .map((o) => o.toLowerCase());


const isAllowedOrigin = (origin) => {
  // In development, allow requests with no Origin header (curl, Postman, etc.)
  if (!origin) return process.env.NODE_ENV !== "production";

  const normalized = normalizeOrigin(origin).toLowerCase();
  
  // Localhost is only useful for local development. Never accept it in production.
  if (process.env.NODE_ENV !== "production" &&
    (normalized.startsWith("http://localhost:") || normalized.startsWith("http://127.0.0.1:"))) {
    return true;
  }

  // Allow strict matches
  if (strictOrigins.includes(normalized)) return true;

  return false;
};

if (process.env.NODE_ENV === "production" && clientOrigins.length === 0) {
  throw new Error("CLIENT_ORIGIN must contain the exact production frontend origin(s)");
}

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        console.warn(`Blocked CORS request from origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.get("/healthz", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  return res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable" });
});

app.use((req, res, next) => {
  res.on("finish", () => {
    const code = res.statusCode;
    if (code === 401 || code === 403 || code === 429) {
      authAnomalyCounts[code] += 1;
      const total =
        authAnomalyCounts[401] + authAnomalyCounts[403] + authAnomalyCounts[429];
      if (total % 25 === 0) {
        console.warn("[auth-monitor]", {
          reqId: req.headers["x-request-id"] || null,
          path: req.originalUrl,
          method: req.method,
          counts: authAnomalyCounts,
        });
      }
    }
  });
  next();
});


app.use(enforceTrustedOrigin(isAllowedOrigin));
app.use(verifyCsrfToken);
app.use("/api", apiLimiter);

app.use("/api", apiRouter);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error(error);
  if (error.name === "MulterError" || error.message === "Unsupported media type") {
    return res.status(400).json({ message: error.message || "Invalid upload" });
  }
  return res.status(500).json({ message: "Internal Server Error" });
});

const start = async () => {
  try {
    if (!process.env.MONGO_URL || !process.env.JWT_ACCESS_TOKEN || !process.env.JWT_REFRESH_TOKEN) {
      throw new Error("Required environment variables are missing");
    }
    await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10_000 });

    console.log("Connected to MongoDB");
    const server = app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received; shutting down`);
      server.close(() => mongoose.disconnect().finally(() => process.exit(0)));
    };
    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exitCode = 1;
  }
};

start();
