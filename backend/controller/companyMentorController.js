import db from "../config/mysql.js";

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
        s.full_name,
        s.email,
        si.status,
        i.title AS internship_title
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

const giveFeedBack = async (req, res) => {
  try {
    const company_mentor_id = req.user.company_mentor_id;

    // ✅ Take IDs from URL params, not body
    const { student_id, internship_id } = req.params;

    const {
      feedback_type,
      rating,
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
        strengths,
        weaknesses,
        suggestions,
        overall_comment,
      ]
    );

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

export { giveFeedBack, fetchStudents };
