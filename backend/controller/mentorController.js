import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import db from "../config/mysql.js";
<<<<<<< HEAD
import { createStudentNotification } from "../utils/notificationService.js";
=======
import { createNotification } from "../utils/notificationService.js";
>>>>>>> ef1cffe16a5eca79441eeb23a8b74941c34ab1a1

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
        i.internship_id,
        i.title AS internship_title,
        c.company_name
      FROM student s
      LEFT JOIN student_internship si
        ON s.student_id = si.student_id AND si.status = 'in progress'
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
        COUNT(DISTINCT CASE WHEN si.status = 'in progress' THEN si.student_id END) AS active_internships
      FROM student s
      LEFT JOIN student_internship si
        ON s.student_id = si.student_id
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
      SELECT ir.report_id, ir.student_id, i.title AS internship_title
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

    const signedUrl = await uploadToCloudinary(
      req.file.buffer,
      "internship_reports/signed",
      req.file.originalname,
    );

    await db.query(
      `UPDATE internship_report
       SET mentor_signed_url = ?, mentor_id = ?, status = 'signed', signed_at = NOW()
       WHERE report_id = ?`,
      [signedUrl, mentor_id, report_id],
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

const companyMentorFeedback = async (req, res) => {
  try {
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

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks,
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
        ON s.student_id = si.student_id AND si.status = 'in progress'
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
      (student_id, internship_id, company_mentor_id, parent_feedback_id, feedback_type, rating, overall_comment)
      VALUES (?, ?, NULL, ?, 'faculty', ?, ?)
      `,
      [student_id, student.internship_id, companyFeedback.feedback_id, rating || null, commentText],
    );

<<<<<<< HEAD
    try {
      await createStudentNotification({
        studentId: student_id,
        title: "Faculty feedback submitted",
        body: "Your faculty mentor submitted new feedback.",
        category: "feedback",
        metadata: {
          type: "faculty_feedback",
          internshipId: student.internship_id || null,
          mentorId: mentor_id,
        },
      });
    } catch (notificationError) {
      console.error("Failed to create faculty feedback notification:", notificationError.message);
    }
=======
    await createNotification({
      recipientRole: "student",
      recipientId: student_id,
      title: "Faculty mentor feedback",
      message: "Your faculty mentor added feedback under your company mentor feedback.",
      type: "feedback",
      link: "/student/feedback",
    });
>>>>>>> ef1cffe16a5eca79441eeb23a8b74941c34ab1a1

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
  companyMentorFeedback,
  getSingleFeedback,
};
