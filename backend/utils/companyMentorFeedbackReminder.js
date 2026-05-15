import db from "../config/mysql.js";
import { createNotification } from "./notificationService.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const DEFAULT_INTERVAL_MS = DAY_MS;

const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toSqlDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (date) =>
  date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const isMissingNotificationsTable = (error) =>
  error?.code === "ER_NO_SUCH_TABLE" && error?.sqlMessage?.includes("notifications");

const getCurrentFeedbackWeek = (startDate, endDate, today = new Date()) => {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  const current = startOfDay(today);

  if (!start || !current || current < start) return null;
  if (end && current > end) return null;

  const elapsedDays = Math.floor((current - start) / DAY_MS);
  const weekIndex = Math.floor(elapsedDays / 7);
  const weekStart = addDays(start, weekIndex * 7);
  const naturalWeekEnd = addDays(weekStart, 7);
  const weekEnd = end && end < naturalWeekEnd ? addDays(end, 1) : naturalWeekEnd;

  return {
    weekIndex,
    weekStart,
    weekEnd,
  };
};

const hasFeedbackForWeek = async ({ studentId, internshipId, companyMentorId, weekStart, weekEnd }) => {
  const [rows] = await db.query(
    `
    SELECT feedback_id
    FROM mentor_feedback
    WHERE student_id = ?
      AND internship_id = ?
      AND company_mentor_id = ?
      AND created_at >= ?
      AND created_at < ?
    LIMIT 1
    `,
    [studentId, internshipId, companyMentorId, toSqlDate(weekStart), toSqlDate(weekEnd)],
  );

  return rows.length > 0;
};

const hasReminderForWeek = async ({ studentId, internshipId, companyMentorId, weekStart, weekEnd }) => {
  try {
    const [rows] = await db.query(
      `
      SELECT notification_id
      FROM notifications
      WHERE recipient_role = 'company_mentor'
        AND recipient_id = ?
        AND type = 'feedback_reminder'
        AND link = '/org-supervisor/feedback'
        AND message LIKE ?
        AND message LIKE ?
        AND created_at >= ?
        AND created_at < ?
      LIMIT 1
      `,
      [
        companyMentorId,
        `%Student ID: ${studentId}%`,
        `%Internship ID: ${internshipId}%`,
        toSqlDate(weekStart),
        toSqlDate(weekEnd),
      ],
    );

    return rows.length > 0;
  } catch (error) {
    if (isMissingNotificationsTable(error)) return false;
    throw error;
  }
};

const fetchActiveCompanyMentorPlacements = async () => {
  const [placements] = await db.query(
    `
    SELECT
      si.student_id,
      s.full_name AS student_name,
      si.internship_id,
      i.title AS internship_title,
      i.start_date,
      i.end_date,
      si.company_mentor_id,
      cm.full_name AS company_mentor_name
    FROM student_internship si
    JOIN student s
      ON si.student_id = s.student_id
    JOIN internship i
      ON si.internship_id = i.internship_id
    JOIN company_mentor cm
      ON si.company_mentor_id = cm.company_mentor_id
    WHERE si.company_mentor_id IS NOT NULL
      AND LOWER(si.status) IN ('in progress', 'accepted', 'active')
      AND i.start_date IS NOT NULL
      AND i.start_date <= CURDATE()
      AND (i.end_date IS NULL OR i.end_date >= CURDATE())
    `,
  );

  return placements;
};

const runWeeklyCompanyMentorFeedbackReminders = async (today = new Date()) => {
  try {
    const placements = await fetchActiveCompanyMentorPlacements();
    let createdCount = 0;

    for (const placement of placements) {
      const week = getCurrentFeedbackWeek(placement.start_date, placement.end_date, today);
      if (!week) continue;

      const context = {
        studentId: placement.student_id,
        internshipId: placement.internship_id,
        companyMentorId: placement.company_mentor_id,
        weekStart: week.weekStart,
        weekEnd: week.weekEnd,
      };

      const [feedbackExists, reminderExists] = await Promise.all([
        hasFeedbackForWeek(context),
        hasReminderForWeek(context),
      ]);

      if (feedbackExists || reminderExists) continue;

      const insertedId = await createNotification({
        recipientRole: "company_mentor",
        recipientId: placement.company_mentor_id,
        title: "Weekly student feedback due",
        message: `Please give weekly feedback for ${placement.student_name || placement.student_id} (${placement.internship_title || "internship"}). Week ${week.weekIndex + 1} starts ${formatDate(week.weekStart)}. Student ID: ${placement.student_id}. Internship ID: ${placement.internship_id}.`,
        type: "feedback_reminder",
        link: "/org-supervisor/feedback",
      });

      if (insertedId) createdCount += 1;
    }

    if (createdCount > 0) {
      console.log(`Created ${createdCount} company mentor weekly feedback reminder(s).`);
    }

    return { success: true, createdCount };
  } catch (error) {
    console.error("Weekly company mentor feedback reminder error:", error);
    return { success: false, createdCount: 0, error };
  }
};

const startCompanyMentorFeedbackReminderJob = ({
  initialDelayMs = 5000,
  intervalMs = DEFAULT_INTERVAL_MS,
} = {}) => {
  const run = () => {
    runWeeklyCompanyMentorFeedbackReminders();
  };

  const initialTimer = setTimeout(run, initialDelayMs);
  const intervalTimer = setInterval(run, intervalMs);

  return () => {
    clearTimeout(initialTimer);
    clearInterval(intervalTimer);
  };
};

export {
  getCurrentFeedbackWeek,
  runWeeklyCompanyMentorFeedbackReminders,
  startCompanyMentorFeedbackReminderJob,
};
