const DEFAULT_TRUSTED_URL_HOSTS = [
  "res.cloudinary.com",
  "ui-avatars.com",
];

const parseTrustedHosts = () =>
  String(process.env.TRUSTED_FILE_HOSTS || "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

export const trustedUrlHosts = new Set([
  ...DEFAULT_TRUSTED_URL_HOSTS,
  ...parseTrustedHosts(),
]);

export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const normalizeTrustedUrl = (value, { allowLocalhost = false } = {}) => {
  if (!value || typeof value !== "string") return null;

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(hostname);

    if (parsed.protocol !== "https:" && !(allowLocalhost && isLocalhost)) {
      return null;
    }

    if (!trustedUrlHosts.has(hostname) && !(allowLocalhost && isLocalhost)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
};

export const requireTrustedUrl = (value, options) => {
  const trustedUrl = normalizeTrustedUrl(value, options);

  if (!trustedUrl) {
    const error = new Error("Untrusted URL");
    error.statusCode = 400;
    throw error;
  }

  return trustedUrl;
};

export const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

export const isSafeIdentifier = (value, maxLength = 80) =>
  /^[A-Za-z0-9_-]+$/.test(String(value || "")) &&
  String(value || "").length <= maxLength;
