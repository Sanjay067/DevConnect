
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import { apiLimiter } from "./middlewares/rateLimits.js";
import { verifyCsrfToken } from "./middlewares/csrf.middleware.js";


import apiRouter from "./routes/index.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const authAnomalyCounts = { 401: 0, 403: 0, 429: 0 };

const rawOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const normalizeOrigin = (origin = "") => origin.replace(/\/+$/, "");
const clientOrigins = rawOrigins.map(normalizeOrigin);
const wildcardOrigins = clientOrigins
  .filter((o) => o.startsWith("*."))
  .map((o) => o.slice(1).toLowerCase());
const strictOrigins = clientOrigins
  .filter((o) => !o.startsWith("*."))
  .map((o) => o.toLowerCase());


const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalized = normalizeOrigin(origin).toLowerCase();
  
  // Allow localhost for local development
  if (normalized.startsWith("http://localhost:") || normalized.startsWith("http://127.0.0.1:")) {
    return true;
  }

  // Allow strict matches
  if (strictOrigins.includes(normalized)) return true;

  // Allow wildcard subdomains
  if (wildcardOrigins.some((suffix) => normalized.endsWith(suffix))) return true;

  // Allow any vercel.app subdomains starting with 'dev-connect-' (dynamic vercel deployments)
  if (/^https:\/\/dev-connect-[a-zA-Z0-9-]+\.vercel\.app$/.test(normalized)) {
    return true;
  }

  return false;
};

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


app.use(verifyCsrfToken);
app.use("/api", apiLimiter);

app.use("/api", apiRouter);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

start();
