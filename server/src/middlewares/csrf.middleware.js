import crypto from "crypto";
import { csrfCookieOptions } from "../utils/cookieOptions.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const EXEMPT_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/refresh-token",
  "/api/auth/csrf-token",
]);

export const issueCsrfToken = (req, res) => {
  const csrfToken = crypto.randomBytes(24).toString("hex");
  return res
    .cookie("csrfToken", csrfToken, csrfCookieOptions())
    .status(200)
    .json({ csrfToken });
};

// CORS controls whether a browser can read a response, but simple cross-site
// requests can still reach an API. Reject unsafe browser requests unless the
// Origin is one of the configured frontend origins.
export const enforceTrustedOrigin = (isAllowedOrigin) => (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  const origin = req.get("origin");
  if (!origin || !isAllowedOrigin(origin)) {
    return res.status(403).json({ message: "Untrusted request origin" });
  }
  return next();
};

export const verifyCsrfToken = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  if (EXEMPT_PATHS.has(req.path)) return next();

  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.get("x-csrf-token");


  if (!cookieToken || !headerToken) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  // Constant-time comparison to prevent timing attacks
  const a = Buffer.from(cookieToken);
  const b = Buffer.from(headerToken);
  const tokensMatch =
    a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!tokensMatch) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }
  return next();
};
