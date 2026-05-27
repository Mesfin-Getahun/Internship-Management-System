import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import db from "../config/mysql.js";
import { createNotification } from "../utils/notificationService.js";
import { ensureMentorFeedbackAttachmentColumns } from "../utils/mentorFeedbackSchema.js";
import { REPORT_STATUS } from "../utils/statusRules.js";
import {
  ensureInternshipGradeColumns,
  normalizeMark,
} from "../utils/internshipGradeSchema.js";

const fetchStudents = async (req, res) => {
  const mentorId = req.user.mentor_id;

  try {
    const [students] = await db.query(
      `
      SELECT
        s.student_id,
        s.full_name AS student_name,
        s.email,
        s.department,
        si.status,
        si.cohort_status,
        si.start_date AS placement_start_date,
        si.end_date AS placement_end_date,
        i.internship_id,
        i.title AS internship_title,
        i.start_date,
        i.end_date,
        c.company_name
      FROM student s
      LEFT JOIN student_internship si
        ON s.student_id = si.student_id
       AND (
         (
           si.cohort_status = 'current'
           AND LOWER(si.status) IN ('in progress', 'accepted', 'active')
         )
         OR LOWER(si.status) IN ('completed', 'complete')
       )
      LEFT JOIN internship i
        ON si.internship_id = i.internship_id
      LEFT JOIN company c
        ON i.company_id = c.company_id
      WHERE s.assigned_mentor = ?
      ORDER BY s.full_name
      `,
      [mentorId],
    );

    res.json({ success: true, students });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch students" });
  }
};

const getMentorProfile = async (req, res) => {
  try {
    const mentor_id = req.user.mentor_id;

    const [rows] = await db.query(
      `
      SELECT
        mentor_id,
        full_name,
        email,
        phone_number
      FROM mentor
      WHERE mentor_id = ?
      `,
      [mentor_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mentor profile not found",
      });
    }

    const [[stats]] = await db.query(
      `
      SELECT
        COUNT(DISTINCT s.student_id) AS total_students,
        COUNT(DISTINCT CASE
          WHEN LOWER(si.status) IN ('in progress', 'accepted', 'active')
            AND (i.start_date IS NULL OR i.start_date <= CURDATE())
          THEN si.student_id
        END) AS active_internships
      FROM student s
      JOIN student_internship si
        ON s.student_id = si.student_id
       AND si.cohort_status = 'current'
       AND LOWER(si.status) IN ('in progress', 'accepted', 'active')
      LEFT JOIN internship i
        ON si.internship_id = i.internship_id
      WHERE s.assigned_mentor = ?
      `,
      [mentor_id],
    );

    res.status(200).json({
      success: true,
      profile: {
        ...rows[0],
        total_students: Number(stats?.total_students || 0),
        active_internships: Number(stats?.active_internships || 0),
      },
    });
  } catch (error) {
    console.error("Fetch mentor profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch mentor profile",
    });
  }
};

const reviewReport = async (req, res) => {
  const mentor_id = req.user.mentor_id;
  try {
    await ensureInternshipGradeColumns(db);

    const [reports] = await db.query(
      `
      SELECT
        ir.report_id,
        ir.report_url,
        ir.mentor_signed_url,
        ir.status,
        ir.submission_date AS submitted_at,
        ir.submission_date,
        ir.signed_at,
        ir.faculty_submitted_at,
        ir.mentor_report_mark,
        ir.mentor_report_graded_at,
        ir.internship_id,
        s.student_id,
        s.full_name AS student_name
      FROM internship_report ir
      JOIN student s
        ON ir.student_id = s.student_id
      WHERE s.assigned_mentor = ?
      ORDER BY COALESCE(ir.submission_date, DATE(ir.signed_at), DATE(ir.faculty_submitted_at)) DESC, ir.report_id DESC
      `,
      [mentor_id],
    );
    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch reports" });
  }
};

const mentorSignReport = async (req, res) => {
  try {
    const mentor_id = req.user.mentor_id;
    const { report_id } = req.params;

    if (!report_id) {
      return res.status(400).json({
        success: false,
        message: "Report ID is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Signed PDF required",
      });
    }

    const [[report]] = await db.query(
      `
      SELECT
        ir.report_id,
        ir.student_id,
        ir.mentor_signed_url,
        ir.signed_at,
        ir.faculty_submitted_at,
        ir.status,
        i.title AS internship_title
      FROM internship_report ir
      LEFT JOIN internship i
        ON ir.internship_id = i.internship_id
      JOIN student s
        ON ir.student_id = s.student_id
      WHERE ir.report_id = ?
        AND s.assigned_mentor = ?
      `,
      [report_id, mentor_id],
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found or access denied",
      });
    }

    if (
      report.mentor_signed_url ||
      report.signed_at ||
      report.faculty_submitted_at ||
      report.status === REPORT_STATUS.SIGNED ||
      report.status === REPORT_STATUS.FACULTY_SUBMITTED
    ) {
      return res.status(409).json({
        success: false,
        message: "This report has already been signed.",
      });
    }

    const signedUrl = await uploadToCloudinary(
      req.file.buffer,
      "internship_reports/signed",
      req.file.originalname,
    );

    await db.query(
      `UPDATE internship_report
       SET mentor_signed_url = ?, mentor_id = ?, status = ?, signed_at = NOW()
       WHERE report_id = ?`,
      [signedUrl, mentor_id, REPORT_STATUS.SIGNED, report_id],
    );

    await createNotification({
      recipientRole: "student",
      recipientId: report.student_id,
      title: "Report signed",
      message: `Your mentor signed your report${report.internship_title ? ` for ${report.internship_title}` : ""}.`,
      type: "report",
      link: "/student/reports",
    });

    res.json({
      success: true,
      message: "Signed report uploaded successfully",
      signedUrl,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to upload signed report",
    });
  }
};

const gradeReport = async (req, res) => {
  try {
    await ensureInternshipGradeColumns(db);

    const mentor_id = req.user.mentor_id;
    const { report_id } = req.params;
    const reportMark = normalizeMark(req.body?.report_mark, 20);

    if (!report_id) {
      return res.status(400).json({
        success: false,
        message: "Report ID is required",
      });
    }

    if (reportMark === null) {
      return res.status(400).json({
        success: false,
        message: "Report mark must be a number from 0 to 20",
      });
    }

    const [[report]] = await db.query(
      `
      SELECT
        ir.report_id,
        ir.student_id,
        ir.mentor_signed_url,
        ir.signed_at,
        ir.status
      FROM internship_report ir
      JOIN student s
        ON ir.student_id = s.student_id
      WHERE ir.report_id = ?
        AND s.assigned_mentor = ?
      LIMIT 1
      `,
      [report_id, mentor_id],
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found or access denied",
      });
    }

    if (!report.mentor_signed_url && !report.signed_at && report.status !== REPORT_STATUS.SIGNED) {
      return res.status(400).json({
        success: false,
        message: "Upload the signed report before grading it",
      });
    }

    await db.query(
      `
      UPDATE internship_report
      SET mentor_report_mark = ?,
          mentor_report_graded_at = NOW(),
          mentor_id = ?
      WHERE report_id = ?
      `,
      [reportMark, mentor_id, report_id],
    );

    await createNotification({
      recipientRole: "student",
      recipientId: report.student_id,
      title: "Report grade submitted",
      message: `Your faculty mentor graded your internship report: ${reportMark}/20.`,
      type: "report",
      link: "/student/reports",
    });

    res.status(200).json({
      success: true,
      message: "Report grade saved successfully",
      report_mark: reportMark,
    });
  } catch (error) {
    console.error("Grade report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save report grade",
    });
  }
};

const companyMentorFeedback = async (req, res) => {
  try {
    await ensureMentorFeedbackAttachmentColumns();

    const mentor_id = req.user.mentor_id;

    if (!mentor_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const [feedbacks] = await db.query(
      `
      SELECT 
        f.feedback_id,
        f.parent_feedback_id,
        f.feedback_type,
        f.overall_comment,
        f.rating,
        f.strengths,
        f.weaknesses,
        f.suggestions,
        f.attachment_url,
        f.attachment_name,
        f.created_at,
        s.student_id,
        s.full_name AS student_name,
        s.email AS student_email,
        i.internship_id,
        i.title AS internship_title,
        c.company_name,
        cm.company_mentor_id,
        cm.full_name AS company_mentor_name
      FROM mentor_feedback f
      JOIN student s 
        ON s.student_id = f.student_id
      JOIN internship i 
        ON f.internship_id = i.internship_id
      JOIN company c
        ON i.company_id = c.company_id
      LEFT JOIN company_mentor cm 
        ON f.company_mentor_id = cm.company_mentor_id
      WHERE s.assigned_mentor = ?
        AND f.company_mentor_id IS NOT NULL
      ORDER BY f.created_at DESC
      `,
      [mentor_id],
    );

    const [feedbackHistory] = await db.query(
      `
      SELECT
        mf.feedback_id,
        mf.parent_feedback_id,
        mf.internship_id,
        mf.company_mentor_id,
        mf.faculty_mentor_id,
        mf.feedback_type,
        mf.rating,
        mf.strengths,
        mf.weaknesses,
        mf.suggestions,
        mf.overall_comment,
        mf.attachment_url,
        mf.attachment_name,
        mf.created_at,
        mf.updated_at,
        s.student_id,
        s.full_name AS student_name,
        i.title AS internship_title,
        c.company_name,
        CASE
          WHEN mf.company_mentor_id IS NULL THEN 'faculty_mentor'
          ELSE 'company_mentor'
        END AS source_role,
        CASE
          WHEN mf.company_mentor_id IS NULL THEN COALESCE(fm.full_name, current_m.full_name)
          ELSE cm.full_name
        END AS source_name,
        cm.full_name AS company_mentor_name,
        COALESCE(fm.full_name, current_m.full_name) AS mentor_name
      FROM mentor_feedback mf
      JOIN student s
        ON mf.student_id = s.student_id
      LEFT JOIN internship i
        ON mf.internship_id = i.internship_id
      LEFT JOIN company c
        ON i.company_id = c.company_id
      LEFT JOIN company_mentor cm
        ON mf.company_mentor_id = cm.company_mentor_id
      LEFT JOIN mentor fm
        ON mf.faculty_mentor_id = fm.mentor_id
      LEFT JOIN mentor current_m
        ON s.assigned_mentor = current_m.mentor_id
      WHERE s.assigned_mentor = ?
      ORDER BY mf.created_at DESC
      `,
      [mentor_id],
    );

    const historyByStudent = feedbackHistory.reduce((acc, feedback) => {
      const studentKey = String(feedback.student_id || "");
      if (!acc[studentKey]) acc[studentKey] = [];
      acc[studentKey].push(feedback);
      return acc;
    }, {});

    const facultyRepliesByParent = feedbackHistory.reduce((acc, feedback) => {
      if (feedback.company_mentor_id || !feedback.parent_feedback_id) return acc;
      const parentKey = String(feedback.parent_feedback_id);
      if (!acc[parentKey]) acc[parentKey] = [];
      acc[parentKey].push(feedback);
      return acc;
    }, {});

    const feedbacksWithHistory = feedbacks.map((feedback) => ({
      ...feedback,
      faculty_replies: facultyRepliesByParent[String(feedback.feedback_id || "")] || [],
      feedback_history: historyByStudent[String(feedback.student_id || "")] || [],
    }));

    res.status(200).json({
      success: true,
      count: feedbacksWithHistory.length,
      feedbacks: feedbacksWithHistory,
    });
  } catch (error) {
    console.error("Faculty view feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
    });
  }
};

const getSingleFeedback = async (req, res) => {
  try {
    await ensureMentorFeedbackAttachmentColumns();

    const mentor_id = req.user.mentor_id;
    const { feedback_id } = req.params;

    if (!feedback_id) {
      return res.status(400).json({
        success: false,
        message: "Feedback ID is required",
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        f.feedback_id,
        f.parent_feedback_id,
        f.feedback_type,
        f.overall_comment,
        f.rating,
        f.strengths,
        f.weaknesses,
        f.suggestions,
        f.attachment_url,
        f.attachment_name,
        f.created_at,
        s.student_id,
        s.full_name AS student_name,
        s.email AS student_email,
        i.internship_id,
        i.title AS internship_title,
        i.start_date,
        i.end_date,
        c.company_name,
        cm.company_mentor_id,
        cm.full_name AS company_mentor_name,
        cm.email AS company_mentor_email
      FROM mentor_feedback f
      JOIN student s 
        ON f.student_id = s.student_id
      JOIN internship i 
        ON f.internship_id = i.internship_id
      JOIN company c
        ON i.company_id = c.company_id
      LEFT JOIN company_mentor cm 
        ON f.company_mentor_id = cm.company_mentor_id
      WHERE f.feedback_id = ?
        AND s.assigned_mentor = ?
      `,
      [feedback_id, mentor_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      feedback: rows[0],
    });
  } catch (error) {
    console.error("Fetch single feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback detail",
    });
  }
};

const provideFeedback = async (req, res) => {
  try {
    await ensureMentorFeedbackAttachmentColumns();

    const mentor_id = req.user.mentor_id;
    const { id: student_id } = req.params;
    const { comments, rating, company_feedback_id } = req.body;
    const commentText = typeof comments === "string" ? comments.trim() : "";

    if (!student_id || !commentText) {
      return res.status(400).json({
        success: false,
        message: "Student ID and comments are required",
      });
    }

    const [[student]] = await db.query(
      `
      SELECT s.student_id, si.internship_id
      FROM student s
      LEFT JOIN student_internship si
        ON s.student_id = si.student_id
        AND si.status = 'in progress'
        AND si.cohort_status = 'current'
      WHERE s.student_id = ? AND s.assigned_mentor = ?
      `,
      [student_id, mentor_id],
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found under this mentor",
      });
    }

    if (!student.internship_id) {
      return res.status(400).json({
        success: false,
        message: "Student has no active internship for feedback",
      });
    }

    const [[companyFeedback]] = await db.query(
      `
      SELECT f.feedback_id
      FROM mentor_feedback f
      JOIN student s
        ON f.student_id = s.student_id
      WHERE f.feedback_id = ?
        AND f.student_id = ?
        AND f.internship_id = ?
        AND f.company_mentor_id IS NOT NULL
        AND s.assigned_mentor = ?
      `,
      [company_feedback_id || null, student_id, student.internship_id, mentor_id],
    );

    if (!companyFeedback) {
      return res.status(400).json({
        success: false,
        message: "Select a company mentor feedback item before sending faculty feedback",
      });
    }

    await db.query(
      `
      INSERT INTO mentor_feedback
      (student_id, internship_id, company_mentor_id, faculty_mentor_id, parent_feedback_id, feedback_type, rating, overall_comment)
      VALUES (?, ?, NULL, ?, ?, 'faculty', ?, ?)
      `,
      [student_id, student.internship_id, mentor_id, companyFeedback.feedback_id, rating || null, commentText],
    );

    await createNotification({
      recipientRole: "student",
      recipientId: student_id,
      title: "Faculty mentor feedback",
      message: "Your faculty mentor added feedback under your company mentor feedback.",
      type: "feedback",
      link: "/student/feedback",
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("Provide feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
    });
  }
};

export {
  fetchStudents,
  getMentorProfile,
  provideFeedback,
  reviewReport,
  mentorSignReport,
  gradeReport,
  companyMentorFeedback,
  getSingleFeedback,
};
