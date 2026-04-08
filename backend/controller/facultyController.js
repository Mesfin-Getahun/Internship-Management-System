import db from "../config/mysql.js";

const assignMentor = async (req, res) => {
  try {
    const { student_id, mentor_id } = req.body;
    const faculty = req.user.faculty_name;

    // 1️⃣ Validate input
    if (!student_id || !mentor_id) {
      return res.status(400).json({
        success: false,
        message: "student_id and mentor_id are required",
      });
    }

    // 2️⃣ Check if student exists
    const [students] = await db.query(
      "SELECT student_id FROM student WHERE student_id = ? AND faculty = ?",
      [student_id, faculty],
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found under your faculty",
      });
    }

    // 3️⃣ Check if mentor exists
    const [mentors] = await db.query(
      "SELECT mentor_id FROM mentor WHERE mentor_id = ?",
      [mentor_id],
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
      [mentor_id, student_id],
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
        s.full_name AS student_name,
        s.email,
        s.department,
    
        i.internship_id,
        i.title AS internship_title,
        i.company_id,
        c.company_name
    
      FROM internship_evaluation ie
      JOIN student s 
          ON ie.student_id = s.student_id
      JOIN internship i 
          ON ie.internship_id = i.internship_id
      JOIN company c
          ON i.company_id = c.company_id
    
      WHERE s.faculty = ?
      ORDER BY ie.submitted_at DESC
      `,
      [faculty_name],
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
        s.assigned_mentor AS university_mentor_id,
        m.full_name AS university_mentor_name,

        si.internship_id,
        i.title AS internship_title,
        si.status AS internship_status,
        c.company_name

      FROM student s
      LEFT JOIN student_internship si
        ON s.student_id = si.student_id
      LEFT JOIN internship i
        ON si.internship_id = i.internship_id
      LEFT JOIN company c
        ON i.company_id = c.company_id
      LEFT JOIN mentor m
        ON s.assigned_mentor = m.mentor_id
      WHERE s.faculty = ?
      ORDER BY s.full_name
      `,
      [faculty],
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

const getMentors = async (req, res) => {
  try {
    const [mentors] = await db.query(
      `
      SELECT
        m.mentor_id,
        m.full_name,
        m.email,
        m.phone_number,
        COUNT(s.student_id) AS assigned_students_count
      FROM mentor m
      LEFT JOIN student s
        ON s.assigned_mentor = m.mentor_id
      GROUP BY m.mentor_id, m.full_name, m.email, m.phone_number
      ORDER BY m.full_name
      `,
    );

    res.status(200).json({
      success: true,
      count: mentors.length,
      mentors,
    });
  } catch (error) {
    console.error("Fetch mentors error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch mentors",
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
  try {
    const faculty = req.user.faculty_name;

    const [reports] = await db.query(
      `
      SELECT
        r.report_id,
        r.report_url AS file_url,
        r.mentor_signed_url,
        r.status,
        r.created_at,
        r.submitted_at,
        s.student_id,
        s.full_name AS student_name,
        s.department,
        i.internship_id,
        i.title AS internship_title,
        c.company_name
      FROM internship_report r
      JOIN student s ON r.student_id = s.student_id
      LEFT JOIN internship i ON r.internship_id = i.internship_id
      LEFT JOIN company c ON i.company_id = c.company_id
      WHERE s.faculty = ?
      ORDER BY COALESCE(r.submitted_at, r.created_at) DESC
      `,
      [faculty],
    );

    res.json({ success: true, reports });
  } catch (error) {
    console.error("Fetch faculty reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty reports",
    });
  }
};

const deleteMentor = async (req, res) => {
  try {
    const faculty = req.user.faculty_name;
    const { id: student_id } = req.params;

    const [students] = await db.query(
      "SELECT student_id, assigned_mentor FROM student WHERE student_id = ? AND faculty = ?",
      [student_id, faculty],
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found under your faculty",
      });
    }

    if (!students[0].assigned_mentor) {
      return res.status(400).json({
        success: false,
        message: "Student does not have an assigned mentor",
      });
    }

    await db.query(
      "UPDATE student SET assigned_mentor = NULL WHERE student_id = ?",
      [student_id],
    );

    res.status(200).json({
      success: true,
      message: "Mentor removed successfully",
      data: { student_id },
    });
  } catch (error) {
    console.error("Delete mentor error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to remove mentor" });
  }
};

const changeMentor = async (req, res) => {
  try {
    const faculty = req.user.faculty_name;
    const { id: student_id } = req.params;
    const { new_mentor_id } = req.body;

    if (!new_mentor_id) {
      return res.status(400).json({
        success: false,
        message: "new_mentor_id is required",
      });
    }

    const [students] = await db.query(
      "SELECT student_id FROM student WHERE student_id = ? AND faculty = ?",
      [student_id, faculty],
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found under your faculty",
      });
    }

    const [mentors] = await db.query(
      "SELECT mentor_id FROM mentor WHERE mentor_id = ?",
      [new_mentor_id],
    );

    if (mentors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }

    await db.query(
      "UPDATE student SET assigned_mentor = ? WHERE student_id = ?",
      [new_mentor_id, student_id],
    );

    res.status(200).json({
      success: true,
      message: "Mentor changed successfully",
      data: { student_id, mentor_id: new_mentor_id },
    });
  } catch (error) {
    console.error("Change mentor error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to change mentor" });
  }
};

const getPaymentData = async (req, res) => {
  try {
    const faculty = req.user.faculty_name;

    const [payments] = await db.query(
      `
      SELECT
        p.*,
        s.student_id,
        s.full_name AS student_name,
        s.department,
        c.company_name
      FROM payment p
      JOIN student s ON p.student_id = s.student_id
      LEFT JOIN student_internship si ON s.student_id = si.student_id
      LEFT JOIN internship i ON si.internship_id = i.internship_id
      LEFT JOIN company c ON i.company_id = c.company_id
      WHERE s.faculty = ?
      ORDER BY s.full_name
      `,
      [faculty],
    );

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Fetch payment data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment data",
    });
  }
};

const getFacultyProfile = async (req, res) => {
  try {
    const faculty_id = req.user.faculty_id;

    const [[faculty]] = await db.query(
      `
      SELECT faculty_id, faculty_name, email
      FROM faculty
      WHERE faculty_id = ?
      `,
      [faculty_id],
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found",
      });
    }

    const [[studentStats]] = await db.query(
      `
      SELECT
        COUNT(*) AS total_students,
        SUM(CASE WHEN assigned_mentor IS NOT NULL THEN 1 ELSE 0 END) AS students_mentored
      FROM student
      WHERE faculty = ?
      `,
      [faculty.faculty_name],
    );

    const [[reportStats]] = await db.query(
      `
      SELECT COUNT(*) AS total_reports
      FROM internship_report r
      JOIN student s ON r.student_id = s.student_id
      WHERE s.faculty = ?
      `,
      [faculty.faculty_name],
    );

    const [[evaluationStats]] = await db.query(
      `
      SELECT COUNT(*) AS total_evaluations
      FROM internship_evaluation ie
      JOIN student s ON ie.student_id = s.student_id
      WHERE s.faculty = ?
      `,
      [faculty.faculty_name],
    );

    res.status(200).json({
      success: true,
      profile: {
        ...faculty,
        department: faculty.faculty_name,
        phone_number: req.user.phone_number || null,
        office: req.user.office || null,
        office_hours: req.user.office_hours || null,
        profile_pic: req.user.profile_pic || null,
        bio: req.user.bio || null,
        total_students: Number(studentStats?.total_students || 0),
        students_mentored: Number(studentStats?.students_mentored || 0),
        total_reports: Number(reportStats?.total_reports || 0),
        total_evaluations: Number(evaluationStats?.total_evaluations || 0),
      },
    });
  } catch (error) {
    console.error("Fetch faculty profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty profile",
    });
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
      [evaluation_id],
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
  getMentors,
  facultyViewReports,
  getPaymentData,
  getFacultyProfile,
  evaluation,
};
