import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import db from "../config/mysql.js";

const fetchStudents = async (req, res) => {
  const mentorId = req.user.mentor_id;

  try {
    const [students] = await db.query(
      "SELECT student_id, full_name, email FROM student WHERE assigned_mentor = ?",
      [mentorId]
    );

    res.json({ success: true, students: students });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch students" });
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
        ir.internship_id,
        s.student_id,
        s.full_name,
      
      FROM internship_report ir
      JOIN student s ON ir.mentor_id = s.assigned_mentor

      WHERE s.assigned_mentor = ?
      ORDER BY ir.submitted_date DESC
      `,
      [mentor_id]
    );
    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};

const mentorSignReport = async (req, res) => {
  try {
    const mentor_id = req.user.mentor_id;
    const { report_id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Signed PDF required" });
    }

    const signedUrl = await uploadToCloudinary(
      req.file.buffer,
      "internship_reports/signed",
      req.file.originalname
    );

    await db.query(
      `UPDATE internship_report
       SET mentor_signed_url = ?, mentor_id = ?, status = 'signed', signed_at = NOW()
       WHERE report_id = ?`,
      [signedUrl, mentor_id, report_id]
    );

    res.json({ success: true, signedUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
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

    const [feedback] = await db.query(
      `
      SELECT 
        f.feedback_id,
        f.feedback,
        f.rating,
        f.created_at,

        s.student_id,
        s.full_name AS student_name,
        s.email AS student_email,

        i.internship_id,
        i.title AS internship_title,

        cm.company_mentor_id,
        cm.full_name AS company_mentor_name

      FROM student s
      JOIN mentor_feedback f 
        ON s.student_id = f.student_id
      JOIN internship i 
        ON f.internship_id = i.internship_id
      JOIN company_mentor cm 
        ON f.company_mentor_id = cm.company_mentor_id

      WHERE s.mentor_id = ?

      ORDER BY f.created_at DESC
      `,
      [mentor_id]
    );

    res.status(200).json({
      success: true,
      count: feedback.length,
      feedback,
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
        f.feedback,
        f.rating,
        f.created_at,

        s.student_id,
        s.full_name AS student_name,
        s.email AS student_email,

        i.internship_id,
        i.title AS internship_title,
        i.start_date,
        i.end_date,

        cm.company_mentor_id,
        cm.full_name AS company_mentor_name,
        cm.email AS company_mentor_email

      FROM mentor_feedback f
      JOIN student s 
        ON f.student_id = s.student_id
      JOIN internship i 
        ON f.internship_id = i.internship_id
      JOIN company_mentor cm 
        ON f.company_mentor_id = cm.company_mentor_id

      WHERE f.feedback_id = ?
        AND s.mentor_id = ?
      `,
      [feedback_id, mentor_id]
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
  } catch (error) {}
};

export {
  fetchStudents,
  provideFeedback,
  reviewReport,
  mentorSignReport,
  companyMentorFeedback,
  getSingleFeedback,
};
