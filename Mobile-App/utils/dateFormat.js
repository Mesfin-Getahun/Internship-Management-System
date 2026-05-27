const pad = (value) => String(value).padStart(2, "0");

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export function formatDate(value, fallback = "Not available") {
  const parsed = parseDate(value);
  if (!parsed) return value ? String(value).slice(0, 10).replace(/-/g, "/") : fallback;

  return `${parsed.getFullYear()}/${pad(parsed.getMonth() + 1)}/${pad(parsed.getDate())}`;
}

export function formatDateTime(value, fallback = "Not available") {
  const parsed = parseDate(value);
  if (!parsed) return value || fallback;

  return `${formatDate(parsed)} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

export function formatDateRange(startDate, endDate, fallback = "Schedule not available") {
  const parts = [startDate, endDate].filter(Boolean).map((value) => formatDate(value));
  return parts.length ? parts.join(" to ") : fallback;
}
