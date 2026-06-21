import crypto from "crypto";
import { createClient } from "redis";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = Number(
  process.env.COMPANY_REGISTRATION_OTP_TTL_MINUTES || 10,
);
const OTP_TTL_SECONDS = OTP_TTL_MINUTES * 60;
const MAX_OTP_ATTEMPTS = Number(
  process.env.COMPANY_REGISTRATION_OTP_MAX_ATTEMPTS || 5,
);
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient;
let redisConnectPromise;

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const getOtpKey = (email) =>
  `company-registration-otp:${crypto
    .createHash("sha256")
    .update(normalizeEmail(email))
    .digest("hex")}`;

const hashOtp = (email, otp) =>
  crypto
    .createHash("sha256")
    .update(
      `${normalizeEmail(email)}:${String(otp).trim()}:${process.env.JWT_SECRET || ""}`,
    )
    .digest("hex");

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({ url: REDIS_URL });
    redisClient.on("error", (error) => {
      console.error("Redis client error:", error.message);
    });
  }

  if (!redisClient.isOpen) {
    redisConnectPromise ||= redisClient.connect().finally(() => {
      redisConnectPromise = null;
    });
    await redisConnectPromise;
  }

  return redisClient;
};

export const createCompanyRegistrationOtp = async (email) => {
  const cleanEmail = normalizeEmail(email);
  const otp = crypto
    .randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH)
    .toString();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  const client = await getRedisClient();
  const key = getOtpKey(cleanEmail);

  await client.set(
    key,
    JSON.stringify({
      email: cleanEmail,
      otpHash: hashOtp(cleanEmail, otp),
      attempts: 0,
      createdAt: new Date().toISOString(),
    }),
    { EX: OTP_TTL_SECONDS },
  );

  return {
    otp,
    expiresAt,
    expiresInMinutes: OTP_TTL_MINUTES,
  };
};

export const consumeCompanyRegistrationOtp = async (email, otp) => {
  const cleanEmail = normalizeEmail(email);
  const cleanOtp = String(otp || "").trim();

  if (!cleanEmail || !/^\d{6}$/.test(cleanOtp)) {
    return {
      valid: false,
      status: 400,
      message: "Enter the 6-digit OTP sent to your email.",
    };
  }

  const client = await getRedisClient();
  const key = getOtpKey(cleanEmail);
  const cachedOtp = await client.get(key);

  if (!cachedOtp) {
    return {
      valid: false,
      status: 400,
      message:
        "No OTP was requested for this email. Please request a new code.",
    };
  }

  let record;
  try {
    record = JSON.parse(cachedOtp);
  } catch {
    await client.del(key);
    return {
      valid: false,
      status: 400,
      message: "Invalid OTP session. Please request a new code.",
    };
  }

  if (Number(record.attempts || 0) >= MAX_OTP_ATTEMPTS) {
    await client.del(key);
    return {
      valid: false,
      status: 429,
      message: "Too many incorrect OTP attempts. Please request a new code.",
    };
  }

  if (record.otpHash !== hashOtp(cleanEmail, cleanOtp)) {
    const ttl = await client.ttl(key);
    const nextRecord = {
      ...record,
      attempts: Number(record.attempts || 0) + 1,
    };

    if (nextRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await client.del(key);
    } else if (ttl > 0) {
      await client.set(key, JSON.stringify(nextRecord), { EX: ttl });
    } else {
      await client.del(key);
    }

    return {
      valid: false,
      status: nextRecord.attempts >= MAX_OTP_ATTEMPTS ? 429 : 400,
      message:
        nextRecord.attempts >= MAX_OTP_ATTEMPTS
          ? "Too many incorrect OTP attempts. Please request a new code."
          : "Invalid OTP. Please check the code and try again.",
    };
  }

  await client.del(key);
  return { valid: true };
};
