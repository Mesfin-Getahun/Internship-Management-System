import db from "../config/mysql.js";

const assignMentor = async (req, res) => {
  try {
    const { student_id, mentor_id } = req.body;

    // 1️⃣ Validate input
    if (!student_id || !mentor_id) {
      return res.status(400).json({
        success: false,
        message: "student_id and mentor_id are required",
      });
    }

    // 2️⃣ Check if student exists
    const [students] = await db.query(
      "SELECT student_id FROM student WHERE student_id = ?",
      [student_id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // 3️⃣ Check if mentor exists
    const [mentors] = await db.query(
      "SELECT mentor_id FROM mentor WHERE mentor_id = ?",
      [mentor_id]
    );

    if (mentors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }

    // 4️⃣ Assign mentor
    const [result] = await db.query(
      "UPDATE student SET assigned_mentor = ? WHERE student_id = ?",
      [mentor_id, student_id]
    );

    // 5️⃣ Extra safety check
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Mentor assignment failed",
      });
    }

    // 6️⃣ Success response
    return res.status(200).json({
      success: true,
      message: "Mentor assigned successfully",
      data: {
        student_id,
        mentor_id,
      },
    });
  } catch (error) {
    console.error("Assign mentor error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const companyEvaluation = async (req, res) => {
  try {
    const faculty_name = req.user.faculty_name;

    const [evaluations] = await db.query(
      `
      SELECT 
        ie.evaluation_id,
        ie.total_mark,
        ie.assessment_pdf_url,
        ie.attendance_pdf_url,
        ie.submitted_at,
    
        s.student_id,
        s.full_name,
        s.email,
        s.department,
    
        i.internship_id,
        i.title AS internship_title,
        i.company_id
    
      FROM internship_evaluation ie
      JOIN student s 
          ON ie.student_id = s.student_id
      JOIN internship i 
          ON ie.internship_id = i.internship_id
    
      WHERE s.faculty = ?
      ORDER BY ie.submitted_at DESC
      `,
      [faculty_name]
    );

    res.status(200).json({
      success: true,
      count: evaluations.length,
      evaluations,
    });
  } catch (error) {
    console.error("Fetch company evaluation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch evaluations",
    });
  }
};

const getStudents = async (req, res) => {
  try {
    const faculty = req.user.faculty_name;

    const [students] = await db.query(
      `
      SELECT 
        s.student_id,
        s.full_name,
        s.email,
        s.department,
        s.profile_status,

        si.internship_id,
        i.title AS internship_title,
        si.status AS internship_status

      FROM student s
      LEFT JOIN student_internship si
        ON s.student_id = si.student_id
      LEFT JOIN internship i
        ON si.internship_id = i.internship_id
      WHERE s.faculty = ?
      ORDER BY s.full_name
      `,
      [faculty]
    );

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch students",
    });
  }
};
// this is how frontend access active intern and not yet students
// if (student.internship_id === null) {
//   // Not placed yet
// } else {
//   // Placed
// }

const facultyViewReports = async (req, res) => {
  const faculty = req.user.faculty_name;

  const [reports] = await db.query(
    `
    SELECT r.*, s.full_name
    FROM internship_report r
    JOIN student s ON r.student_id = s.student_id
    WHERE s.faculty = ? AND r.status = 'faculty_submitted'
    `,
    [faculty]
  );

  res.json({ success: true, reports });
};

const deleteMentor = async (req, res) => {
  try {
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const changeMentor = async (req, res) => {
  try {
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const evaluation = async (req, res) => {
  try {
    const { evaluation_id } = req.params;

    // 1️⃣ Validate param
    if (!evaluation_id) {
      return res.status(400).json({
        success: false,
        message: "Evaluation ID is required",
      });
    }

    // 2️⃣ Fetch evaluation with related data
    const [rows] = await db.query(
      `
      SELECT 
        ie.evaluation_id,
        ie.total_mark,
        ie.assessment_pdf_url,
        ie.attendance_pdf_url,
        ie.submitted_at,

        s.student_id,
        s.full_name AS student_name,
        s.email AS student_email,

        i.internship_id,
        i.title AS internship_title

      FROM internship_evaluation ie
      JOIN student s ON ie.student_id = s.student_id
      JOIN internship i ON ie.internship_id = i.internship_id
      WHERE ie.evaluation_id = ?
      `,
      [evaluation_id]
    );

    // 3️⃣ Not found
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found",
      });
    }

    // 4️⃣ Success
    res.status(200).json({
      success: true,
      evaluation: rows[0],
    });
  } catch (error) {
    console.error("Fetch evaluation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch evaluation",
    });
  }
};

export {
  assignMentor,
  companyEvaluation,
  deleteMentor,
  changeMentor,
  getStudents,
  facultyViewReports,
  evaluation,
};
