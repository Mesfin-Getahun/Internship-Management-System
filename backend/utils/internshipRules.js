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
}) => {
  const expectedMonths = getInternshipMonthCount(startDate, endDate);
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
  getInternshipMonthCount,
  isFutureDateOnly,
  parseDateOnly,
  validateAttendanceRecordsForInternship,
};
