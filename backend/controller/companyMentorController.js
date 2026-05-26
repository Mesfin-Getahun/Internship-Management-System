import db from "../config/mysql.js";
import generateAssessmentPDF from "../utils/generateAssessmentPDF.js";
import generateAttendancePDF from "../utils/generateAttendancePDF.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import fs from "fs";
import { createNotifications } from "../utils/notificationService.js";
import { ensureMentorFeedbackAttachmentColumns } from "../utils/mentorFeedbackSchema.js";
import { ensureInternshipEvaluationMentorColumns } from "../utils/internshipEvaluationSchema.js";
import { getCurrentFeedbackWeek } from "../utils/companyMentorFeedbackReminder.js";

function isDuplicateKeyError(error) {
  return error?.code === "ER_DUP_ENTRY" || error?.errno === 1062;
}

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

// const fetchStudents = async (req, res) => {
//   const mentorId = req.user.company_mentor_id;
//   try {
//     const [students] = await db.query(
//       "SELECT student_id, full_name, email FROM student WHERE company_mentor = ?",
//       [mentorId]
//     );

//     res.json({ success: true, students: students });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch students",
//     });
//   }
// };

const fetchStudents = async (req, res) => {
  try {
    const company_mentor_id = req.user.company_mentor_id;

    if (!company_mentor_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await ensureInternshipEvaluationMentorColumns();

    const query = `
      SELECT DISTINCT
        s.student_id,
        s.full_name AS student_name,
        s.email,
        s.department,
        si.status,
        si.cohort_status,
        si.id AS student_internship_id,
        si.internship_id,
        si.start_date AS placement_start_date,
        si.end_date AS placement_end_date,
        i.title AS internship_title,
        i.start_date AS internship_start_date,
        i.end_date AS internship_end_date,
        c.company_name,
        ie.evaluation_id,
        ie.submitted_at AS evaluation_submitted_at,
        CASE
          WHEN LOWER(si.status) IN ('completed', 'complete')
            OR ie.evaluation_id IS NOT NULL
          THEN 1
          ELSE 0
        END AS is_completed,
        CASE
          WHEN LOWER(si.status) IN ('completed', 'complete')
            OR ie.evaluation_id IS NOT NULL
          THEN 'completed'
          ELSE 'current'
        END AS roster_status
      FROM student_internship si
      JOIN student s ON si.student_id = s.student_id
      JOIN internship i ON si.internship_id = i.internship_id
      JOIN company c ON i.company_id = c.company_id
      LEFT JOIN internship_evaluation ie
        ON ie.student_id = si.student_id
       AND ie.internship_id = si.internship_id
       AND (ie.company_mentor_id = si.company_mentor_id OR ie.company_mentor_id IS NULL)
      WHERE si.company_mentor_id = ?
        AND (
          (COALESCE(si.cohort_status, 'current') = 'current' AND LOWER(si.status) IN ('accepted', 'in progress', 'active'))
          OR LOWER(si.status) IN ('completed', 'complete')
          OR ie.evaluation_id IS NOT NULL
        )
      ORDER BY is_completed ASC, s.full_name ASC
    `;

    const [students] = await db.query(query, [company_mentor_id]);

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Fetch students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

const postEvaluation = async (req, res) => {
  try {
    await ensureInternshipEvaluationMentorColumns();

    const company_mentor_id = req.user.company_mentor_id;
    const { internship_id, student_id } = req.params;
    const { assessment, attendanceData } = req.body;

    if (!internship_id || !student_id) {
      return res.status(400).json({
        success: false,
        message: "Internship ID and student ID are required",
      });
    }

    const [[student]] = await db.query(
      `
      SELECT
        s.student_id,
        s.full_name AS name,
        s.department,
        s.assigned_mentor,
        i.internship_id,
        si.end_date AS placement_end_date,
        i.end_date AS internship_end_date,
        i.title AS internship_title,
        c.company_name,
        cm.full_name AS supervisor
      FROM student_internship si
      JOIN student s
        ON si.student_id = s.student_id
      JOIN internship i
        ON si.internship_id = i.internship_id
      JOIN company c
        ON si.company_id = c.company_id
      JOIN company_mentor cm
        ON si.company_mentor_id = cm.company_mentor_id
      WHERE si.company_mentor_id = ?
        AND si.internship_id = ?
        AND s.student_id = ?
        AND COALESCE(si.cohort_status, 'current') = 'current'
      LIMIT 1
      `,
      [company_mentor_id, internship_id, student_id]
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Assigned student not found for this company mentor",
      });
    }

    const internshipEndDate = student.placement_end_date || student.internship_end_date;

    if (!internshipEndDate) {
      return res.status(400).json({
        success: false,
        message: "The internship end date is not set, so final evaluation cannot be submitted yet",
      });
    }

    const endDate = new Date(internshipEndDate);
    endDate.setHours(23, 59, 59, 999);

    if (Number.isNaN(endDate.getTime()) || endDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Final evaluation and attendance can be submitted only after the internship end date",
      });
    }

    if (!assessment || !attendanceData) {
      return res.status(400).json({
        success: false,
        message: "Assessment and attendance data are required",
      });
    }

    const [existingEvaluations] = await db.query(
      `
      SELECT evaluation_id
      FROM internship_evaluation
      WHERE student_id = ?
        AND internship_id = ?
      LIMIT 1
      `,
      [student_id, internship_id],
    );

    if (existingEvaluations.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A final evaluation has already been submitted for this student and internship",
      });
    }

    const assessmentPath = await generateAssessmentPDF({
      student,
      assessment,
      company: student.company_name,
    });

    const assessmentBuffer = fs.readFileSync(assessmentPath);
    const assessmentURL = await uploadToCloudinary(
      assessmentBuffer,
      "internship/assessment",
      `${student.student_id}_assessment.pdf`
    );

    const normalizedAttendanceData = attendanceData.records
      ? attendanceData
      : {
          records: {
            Month_1: {
              Week_1: {
                Mon: "-",
                Tue: "-",
                Wed: "-",
                Thu: "-",
                Fri: "-",
              },
            },
          },
          ...attendanceData,
        };

    const attendancePath = await generateAttendancePDF({
      student,
      attendanceData: normalizedAttendanceData,
      company: student.company_name,
    });

    const attendanceBuffer = fs.readFileSync(attendancePath);
    const attendanceURL = await uploadToCloudinary(
      attendanceBuffer,
      "internship/attendance",
      `${student.student_id}_attendance.pdf`
    );

    fs.unlinkSync(assessmentPath);
    fs.unlinkSync(attendancePath);

    const totalMark =
      Object.values(assessment.general || {}).reduce((a, b) => a + Number(b || 0), 0) +
      Object.values(assessment.personal || {}).reduce((a, b) => a + Number(b || 0), 0) +
      Object.values(assessment.professional || {}).reduce((a, b) => a + Number(b || 0), 0);

    await db.query(
      `
      INSERT INTO internship_evaluation
      (student_id, internship_id, company_mentor_id, assessment_pdf_url, attendance_pdf_url, total_mark)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [student.student_id, internship_id, company_mentor_id, assessmentURL, attendanceURL, totalMark]
    );

    await createNotifications([
      {
        recipientRole: "student",
        recipientId: student.student_id,
        title: "Internship evaluation submitted",
        message: `${student.supervisor || "Your company mentor"} submitted your evaluation for ${student.internship_title || "your internship"}.`,
        type: "evaluation",
        link: "/student/feedback",
      },
      student.assigned_mentor && {
        recipientRole: "mentor",
        recipientId: student.assigned_mentor,
        title: "Company evaluation submitted",
        message: `${student.supervisor || "A company mentor"} submitted an evaluation for ${student.name || student.student_id}.`,
        type: "evaluation",
        link: "/mentor/company-updates",
      },
    ].filter(Boolean));

    res.status(201).json({
      success: true,
      message: "Evaluation submitted successfully",
      assessment_pdf: assessmentURL,
      attendance_pdf: attendanceURL,
      total_mark: totalMark,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        message: "A final evaluation has already been submitted for this student and internship",
      });
    }

    console.error("Post evaluation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit evaluation",
    });
  }
};

const getEvaluations = async (req, res) => {
  try {
    await ensureInternshipEvaluationMentorColumns();

    const company_mentor_id = req.user.company_mentor_id;

    const [evaluations] = await db.query(
      `
      SELECT
        ie.evaluation_id,
        ie.student_id,
        ie.internship_id,
        ie.company_mentor_id,
        ie.assessment_pdf_url,
        ie.attendance_pdf_url,
        ie.total_mark,
        ie.submitted_at,
        s.full_name AS student_name,
        s.department,
        i.title AS internship_title,
        c.company_name
      FROM internship_evaluation ie
      JOIN student s
        ON ie.student_id = s.student_id
      LEFT JOIN internship i
        ON ie.internship_id = i.internship_id
      LEFT JOIN company c
        ON i.company_id = c.company_id
      WHERE ie.company_mentor_id = ?
      ORDER BY ie.submitted_at DESC, ie.evaluation_id DESC
      `,
      [company_mentor_id],
    );

    res.status(200).json({
      success: true,
      count: evaluations.length,
      evaluations,
    });
  } catch (error) {
    console.error("Fetch company mentor evaluations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch evaluation history",
    });
  }
};

const giveFeedBack = async (req, res) => {
  try {
    await ensureMentorFeedbackAttachmentColumns();

    const company_mentor_id = req.user.company_mentor_id;

    // ✅ Take IDs from URL params, not body
    const { student_id, internship_id } = req.params;

    const {
      feedback_type,
      rating,
      feedback_text,
      strengths,
      weaknesses,
      suggestions,
      overall_comment,
    } = req.body;

    // basic validation
    if (!student_id || !internship_id) {
      return res.status(400).json({
        success: false,
        message: "student_id and internship_id are required in URL",
      });
    }

    const [[assignedPlacement]] = await db.query(
      `
      SELECT
        s.assigned_mentor,
        s.full_name,
        i.title,
        i.start_date AS internship_start_date,
        i.end_date AS internship_end_date,
        si.start_date AS placement_start_date,
        si.end_date AS placement_end_date
      FROM student_internship si
      JOIN student s
        ON si.student_id = s.student_id
      JOIN internship i
        ON si.internship_id = i.internship_id
      WHERE si.company_mentor_id = ?
        AND si.student_id = ?
        AND si.internship_id = ?
        AND COALESCE(si.cohort_status, 'current') = 'current'
      LIMIT 1
      `,
      [company_mentor_id, student_id, internship_id],
    );

    if (!assignedPlacement) {
      return res.status(403).json({
        success: false,
        message: "You can only give feedback for students assigned to you",
      });
    }

    const normalizedFeedbackType = feedback_type || "weekly";
    let weeklyContext = {
      feedbackWeek: null,
      weekStartDate: null,
      weekEndDate: null,
    };

    if (normalizedFeedbackType === "weekly") {
      const week = getCurrentFeedbackWeek(
        assignedPlacement.internship_start_date,
        assignedPlacement.internship_end_date,
      );

      if (!week) {
        const startsOn = assignedPlacement.internship_start_date
          ? formatDate(new Date(assignedPlacement.internship_start_date))
          : "the internship start date";

        return res.status(400).json({
          success: false,
          message: `Weekly feedback is available only during the internship schedule. It starts on ${startsOn}.`,
        });
      }

      weeklyContext = {
        feedbackWeek: week.weekIndex + 1,
        weekStartDate: toSqlDate(week.weekStart),
        weekEndDate: toSqlDate(new Date(week.weekEnd.getTime() - 1)),
      };

      const [existingWeeklyFeedback] = await db.query(
        `
        SELECT feedback_id
        FROM mentor_feedback
        WHERE student_id = ?
          AND internship_id = ?
          AND company_mentor_id = ?
          AND feedback_week = ?
        LIMIT 1
        `,
        [
          student_id,
          internship_id,
          company_mentor_id,
          weeklyContext.feedbackWeek,
        ],
      );

      if (existingWeeklyFeedback.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Weekly feedback for Week ${weeklyContext.feedbackWeek} has already been submitted.`,
        });
      }
    }

    const numericRating =
      rating === undefined || rating === null || rating === ""
        ? null
        : Number(rating);

    if (numericRating !== null && (!Number.isFinite(numericRating) || numericRating < 0 || numericRating > 10)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 0 and 10",
      });
    }

    const storedRating = numericRating && numericRating > 0 ? numericRating : null;
    const attachmentUrl = req.file
      ? await uploadToCloudinary(
          req.file.buffer,
          "mentor_feedback/attachments",
          req.file.originalname,
        )
      : null;

    await db.query(
      `INSERT INTO mentor_feedback
       (student_id, internship_id, company_mentor_id, feedback_type,
        feedback_week, week_start_date, week_end_date, rating,
        strengths, weaknesses, suggestions, overall_comment, attachment_url, attachment_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        internship_id,
        company_mentor_id,
        normalizedFeedbackType,
        weeklyContext.feedbackWeek,
        weeklyContext.weekStartDate,
        weeklyContext.weekEndDate,
        storedRating,
        strengths || null,
        weaknesses || null,
        suggestions || null,
        overall_comment || feedback_text || null,
        attachmentUrl,
        req.file?.originalname || null,
      ]
    );

    await createNotifications([
      {
        recipientRole: "student",
        recipientId: student_id,
        title: "Company mentor feedback",
        message: `${req.user.full_name || "Your company mentor"} added feedback for ${assignedPlacement.title || "your internship"}.`,
        type: "feedback",
        link: "/student/feedback",
      },
      assignedPlacement.assigned_mentor && {
        recipientRole: "mentor",
        recipientId: assignedPlacement.assigned_mentor,
        title: "Company feedback available",
        message: `${req.user.full_name || "A company mentor"} added feedback for ${assignedPlacement.full_name || student_id}.`,
        type: "feedback",
        link: "/mentor/organization-updates",
      },
    ].filter(Boolean));

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("Give feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
    });
  }
};

const getFeedbacks = async (req, res) => {
  try {
    await ensureMentorFeedbackAttachmentColumns();

    const company_mentor_id = req.user.company_mentor_id;

    const [feedbacks] = await db.query(
      `
      SELECT
        mf.feedback_id,
        mf.student_id,
        mf.internship_id,
        mf.feedback_type,
        mf.feedback_week,
        mf.week_start_date,
        mf.week_end_date,
        mf.rating,
        mf.strengths,
        mf.weaknesses,
        mf.suggestions,
        mf.overall_comment,
        mf.attachment_url,
        mf.attachment_name,
        mf.created_at,
        s.full_name AS student_name,
        s.department,
        i.title AS internship_title,
        c.company_name
      FROM mentor_feedback mf
      JOIN student s
        ON mf.student_id = s.student_id
      JOIN internship i
        ON mf.internship_id = i.internship_id
      JOIN company c
        ON i.company_id = c.company_id
      WHERE mf.company_mentor_id = ?
      ORDER BY mf.created_at DESC
      `,
      [company_mentor_id]
    );

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    console.error("Fetch company mentor feedbacks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback history",
    });
  }
};

export { giveFeedBack, fetchStudents, postEvaluation, getFeedbacks, getEvaluations };
