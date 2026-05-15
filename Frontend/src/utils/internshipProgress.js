const CURRENT_PLACEMENT_STATUSES = new Set(['accepted', 'active', 'in progress']);

const startOfDay = (date) => {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const getInternshipProgressState = (placement = {}, today = new Date()) => {
  const rawStatus = String(placement.status || placement.internship_status || '').toLowerCase();
  const hasPlacement = Boolean(placement.internship_id || placement.company_name || placement.company_id);
  const isCurrentPlacement = CURRENT_PLACEMENT_STATUSES.has(rawStatus);

  if (!hasPlacement || !isCurrentPlacement) {
    return {
      dormant: true,
      progress: 0,
      label: 'Dormant',
      message: 'Progress starts after a company accepts the student.',
    };
  }

  const startDate = startOfDay(placement.placement_start_date || placement.start_date);
  const endDate = startOfDay(placement.end_date);
  const currentDate = startOfDay(today);

  if (startDate && currentDate < startDate) {
    return {
      dormant: true,
      progress: 0,
      label: 'Dormant',
      startDate,
      message: `Progress starts on ${startDate.toLocaleDateString()}.`,
    };
  }

  if (startDate && endDate && endDate >= startDate) {
    const totalMs = endDate - startDate;
    const elapsedMs = clamp(currentDate - startDate, 0, totalMs);
    const progress = totalMs === 0 ? 100 : Math.round((elapsedMs / totalMs) * 100);

    return {
      dormant: false,
      progress: clamp(progress, 1, 100),
      label: progress >= 100 ? 'Completed' : 'In Progress',
      startDate,
      endDate,
      message: 'Progress is based on the internship start and end dates.',
    };
  }

  return {
    dormant: false,
    progress: 1,
    label: 'In Progress',
    startDate,
    message: 'Progress has started.',
  };
};
