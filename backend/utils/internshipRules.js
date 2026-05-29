const MENTOR_STUDENT_LIMIT = 10;

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

const parseDateOnly = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const match = String(value).match(DATE_ONLY_PATTERN);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return date;
};

const getTodayDateOnly = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const isFutureDateOnly = (value) => {
  const date = parseDateOnly(value);
  return Boolean(date && date > getTodayDateOnly());
};

const TWO_MONTH_DEPARTMENTS = new Set([
  "computer science",
  "information technology",
  "information system",
  "information systems",
  "cyber security",
  "cybersecurity",
  "it education",
  "information technology education",
]);

const DEPARTMENT_ALIASES = new Map([
  ["cs", "computer science"],
  ["c s", "computer science"],
  ["it", "information technology"],
  ["i t", "information technology"],
  ["ict", "information technology"],
  ["is", "information systems"],
  ["i s", "information systems"],
  ["se", "software engineering"],
  ["s e", "software engineering"],
]);

const normalizeDepartment = (department = "") => {
  const normalized = String(department)
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return DEPARTMENT_ALIASES.get(normalized) || normalized;
};

const splitDepartmentTerms = (department = "") =>
  String(department || "")
    .split(/[,;|/]+/)
    .map((term) => normalizeDepartment(term))
    .filter(Boolean);

const requiredInternshipMonths = (department) => {
  const departments = splitDepartmentTerms(department);

  if (departments.length === 0) return 4;

  return departments.every((item) => TWO_MONTH_DEPARTMENTS.has(item)) ? 2 : 4;
};

const durationMonthsFromDates = (startDate, endDate) => {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return null;
  }

  const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.round((days / 30) * 10) / 10;
};

const durationMonthsForInternship = (internship) => {
  const dateDuration = durationMonthsFromDates(internship.start_date, internship.end_date);
  if (dateDuration !== null) return dateDuration;

  const parsedDuration = Number.parseFloat(internship.duration);
  return Number.isFinite(parsedDuration) ? parsedDuration : null;
};

const validateMinimumInternshipDuration = ({ department, startDate, endDate }) => {
  const requiredMonths = requiredInternshipMonths(department);
  const durationMonths = durationMonthsFromDates(startDate, endDate);

  if (durationMonths === null) {
    return {
      valid: false,
      requiredMonths,
      durationMonths,
      message: "Internship start and end dates are required to validate duration",
    };
  }

  if (durationMonths < requiredMonths) {
    return {
      valid: false,
      requiredMonths,
      durationMonths,
      message: `Internship duration must be at least ${requiredMonths} month(s) for this department. Current duration is ${durationMonths} month(s).`,
    };
  }

  return {
    valid: true,
    requiredMonths,
    durationMonths,
  };
};

const getInternshipMonthCount = (startValue, endValue) => {
  const startDate = parseDateOnly(startValue);
  const endDate = parseDateOnly(endValue);

  if (!startDate || !endDate || endDate < startDate) {
    return 0;
  }

  let months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());

  if (endDate.getDate() > startDate.getDate()) {
    months += 1;
  }

  return Math.max(1, months);
};

const validateAttendanceRecordsForInternship = ({
  attendanceData,
  startDate,
  endDate,
  department,
}) => {
  const expectedMonths = department
    ? requiredInternshipMonths(department)
    : getInternshipMonthCount(startDate, endDate);
  const records = attendanceData?.records;

  if (!expectedMonths) {
    return {
      valid: false,
      message: "Internship start and end dates are required for attendance",
    };
  }

  if (!records || typeof records !== "object" || Array.isArray(records)) {
    return {
      valid: false,
      message: `Attendance must include ${expectedMonths} full month(s)`,
      expectedMonths,
      submittedMonths: 0,
    };
  }

  const monthKeys = Object.keys(records);

  if (monthKeys.length !== expectedMonths) {
    return {
      valid: false,
      message: `Attendance must include exactly ${expectedMonths} full month(s) for this internship`,
      expectedMonths,
      submittedMonths: monthKeys.length,
    };
  }

  for (let index = 1; index <= expectedMonths; index += 1) {
    const monthKey = `Month_${index}`;
    const weeks = records[monthKey];

    if (!weeks || typeof weeks !== "object" || Array.isArray(weeks)) {
      return {
        valid: false,
        message: `Attendance is missing ${monthKey}`,
        expectedMonths,
        submittedMonths: monthKeys.length,
      };
    }

    for (let weekIndex = 1; weekIndex <= 4; weekIndex += 1) {
      const weekKey = `Week_${weekIndex}`;
      const days = weeks[weekKey];

      if (!days || typeof days !== "object" || Array.isArray(days)) {
        return {
          valid: false,
          message: `${monthKey} must include ${weekKey}`,
          expectedMonths,
          submittedMonths: monthKeys.length,
        };
      }

      const missingDay = ["Mon", "Tue", "Wed", "Thu", "Fri"].find(
        (day) => !Object.prototype.hasOwnProperty.call(days, day),
      );

      if (missingDay) {
        return {
          valid: false,
          message: `${monthKey} ${weekKey} is missing ${missingDay}`,
          expectedMonths,
          submittedMonths: monthKeys.length,
        };
      }
    }
  }

  return {
    valid: true,
    expectedMonths,
    submittedMonths: monthKeys.length,
  };
};

export {
  MENTOR_STUDENT_LIMIT,
  durationMonthsForInternship,
  getInternshipMonthCount,
  isFutureDateOnly,
  normalizeDepartment,
  parseDateOnly,
  requiredInternshipMonths,
  validateMinimumInternshipDuration,
  validateAttendanceRecordsForInternship,
};
