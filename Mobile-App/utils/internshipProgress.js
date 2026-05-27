const CURRENT_PLACEMENT_STATUSES = new Set(["accepted", "active", "in progress", "completed", "complete"]);

const startOfDay = (date) => {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const formatDateLabel = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}/${month}/${day}`;
};

export function getInternshipProgressState(placement = {}, today = new Date()) {
  const rawStatus = String(placement.status || placement.internship_status || "").toLowerCase();
  const hasPlacement = Boolean(placement.internship_id || placement.company_name || placement.company_id);
  const isCurrentPlacement = CURRENT_PLACEMENT_STATUSES.has(rawStatus);

  if (rawStatus === "completed" || rawStatus === "complete") {
    return {
      dormant: false,
      progress: 100,
      label: "Completed",
      message: "Internship completed.",
    };
  }

  if (!hasPlacement || !isCurrentPlacement) {
    return {
      dormant: true,
      progress: 0,
      label: "Dormant",
      message: "Progress starts after a company accepts the student.",
    };
  }

  const startDate = startOfDay(
    placement.start_date || placement.internship_start_date || placement.placement_start_date,
  );
  const endDate = startOfDay(placement.placement_end_date || placement.end_date || placement.internship_end_date);
  const currentDate = startOfDay(today);

  if (startDate && currentDate < startDate) {
    return {
      dormant: true,
      progress: 0,
      label: "Dormant",
      startDate,
      endDate,
      message: `Progress starts on ${formatDateLabel(startDate)}.`,
    };
  }

  if (startDate && endDate && endDate >= startDate) {
    const totalMs = endDate - startDate;
    const elapsedMs = clamp(currentDate - startDate, 0, totalMs);
    const progress = totalMs === 0 ? 100 : Math.round((elapsedMs / totalMs) * 100);

    return {
      dormant: false,
      progress: clamp(progress, 1, 100),
      label: progress >= 100 ? "Completed" : "In Progress",
      startDate,
      endDate,
      message: "Progress is based on the internship start and end dates.",
    };
  }

  return {
    dormant: false,
    progress: 1,
    label: "In Progress",
    startDate,
    endDate,
    message: "Progress has started.",
  };
}
