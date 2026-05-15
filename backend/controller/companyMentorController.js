import db from "../config/mysql.js";
import generateAssessmentPDF from "../utils/generateAssessmentPDF.js";
import generateAttendancePDF from "../utils/generateAttendancePDF.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import fs from "fs";
<<<<<<< HEAD
import { createStudentNotification } from "../utils/notificationService.js";
=======
import { createNotifications } from "../utils/notificationService.js";
>>>>>>> ef1cffe16a5eca79441eeb23a8b74941c34ab1a1

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

    const query = `
      SELECT DISTINCT
        s.student_id,
        s.full_name AS student_name,
        s.email,
        s.department,
        si.status,
        si.id AS student_internship_id,
        si.internship_id,
        i.title AS internship_title,
        c.company_name
      FROM student_internship si
      JOIN student s ON si.student_id = s.student_id
      JOIN internship i ON si.internship_id = i.internship_id
      JOIN company c ON i.company_id = c.company_id
      WHERE si.company_mentor_id = ?
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

    if (!assessment || !attendanceData) {
      return res.status(400).json({
        success: false,
        message: "Assessment and attendance data are required",
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
      (student_id, internship_id, assessment_pdf_url, attendance_pdf_url, total_mark)
      VALUES (?, ?, ?, ?, ?)
      `,
      [student.student_id, internship_id, assessmentURL, attendanceURL, totalMark]
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
    console.error("Post evaluation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit evaluation",
    });
  }
};

const giveFeedBack = async (req, res) => {
  try {
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

    await db.query(
      `INSERT INTO mentor_feedback
       (student_id, internship_id, company_mentor_id, feedback_type, rating,
        strengths, weaknesses, suggestions, overall_comment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        internship_id,
        company_mentor_id,
        feedback_type || "weekly",
        rating,
        strengths || null,
        weaknesses || null,
        suggestions || null,
        overall_comment || feedback_text || null,
      ]
    );

<<<<<<< HEAD
    try {
      await createStudentNotification({
        studentId: student_id,
        title: "New feedback submitted",
        body: "Your company mentor submitted new feedback.",
        category: "feedback",
        metadata: {
          type: "company_mentor_feedback",
          internshipId: internship_id,
          companyMentorId: company_mentor_id,
        },
      });
    } catch (notificationError) {
      console.error("Failed to create feedback notification:", notificationError.message);
    }
=======
    const [[studentContext]] = await db.query(
      `
      SELECT s.assigned_mentor, s.full_name, i.title
      FROM student s
      LEFT JOIN internship i
        ON i.internship_id = ?
      WHERE s.student_id = ?
      `,
      [internship_id, student_id],
    );

    await createNotifications([
      {
        recipientRole: "student",
        recipientId: student_id,
        title: "Company mentor feedback",
        message: `${req.user.full_name || "Your company mentor"} added feedback for ${studentContext?.title || "your internship"}.`,
        type: "feedback",
        link: "/student/feedback",
      },
      studentContext?.assigned_mentor && {
        recipientRole: "mentor",
        recipientId: studentContext.assigned_mentor,
        title: "Company feedback available",
        message: `${req.user.full_name || "A company mentor"} added feedback for ${studentContext.full_name || student_id}.`,
        type: "feedback",
        link: "/mentor/organization-updates",
      },
    ].filter(Boolean));
>>>>>>> ef1cffe16a5eca79441eeb23a8b74941c34ab1a1

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
    const company_mentor_id = req.user.company_mentor_id;

    const [feedbacks] = await db.query(
      `
      SELECT
        mf.feedback_id,
        mf.student_id,
        mf.internship_id,
        mf.feedback_type,
        mf.rating,
        mf.strengths,
        mf.weaknesses,
        mf.suggestions,
        mf.overall_comment,
        mf.created_at,
        s.full_name AS student_name,
        s.department,
        i.title AS internship_title,
        c.company_name
      FROM mentor_feedback mf
      JOIN student_internship si
        ON mf.student_id = si.student_id
       AND mf.internship_id = si.internship_id
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

export { giveFeedBack, fetchStudents, postEvaluation, getFeedbacks };
