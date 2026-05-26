import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const buildLimiter = ({ windowMs, max, message, keyGenerator, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs,
    max,
    keyGenerator,
    skipSuccessfulRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

const normalizeLimiterValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const getAuthLimiterKey = (req) => {
  const body = req.body || {};
  const role = normalizeLimiterValue(body.role);
  const identifier = normalizeLimiterValue(
    body.identifier ||
      body.id ||
      body.email ||
      body.company_id ||
      body.company_mentor_id ||
      body.account_id,
  );

  if (identifier) {
    return `auth:${role || "any"}:${identifier}`;
  }

  return `auth:ip:${ipKeyGenerator(req.ip)}`;
};

export const securityHeaders = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://ui-avatars.com"],
      connectSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      upgradeInsecureRequests: [],
    },
  },
});

export const globalLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 800,
  message: "Too many requests. Please slow down and try again later.",
});

export const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "Too many authentication attempts. Please try again later.",
  keyGenerator: getAuthLimiterKey,
  skipSuccessfulRequests: true,
});

export const uploadLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "Too many upload attempts. Please try again later.",
});

export const expensiveActionLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: "Too many heavy requests. Please try again later.",
});
