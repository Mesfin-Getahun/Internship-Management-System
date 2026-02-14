const assignMentor = async (req, res) => {
  try {
    const { studentId, mentorId } = req.body;

    await db.query(
      "UPDATE student SET assigned_mentor = ? WHERE student_id = ?",
      [mentorId, studentId]
    );

    res.json({ success: true, message: "Mentor assigned successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const companyEvaluation = async (req, res) => {
  try {
    const company_id = req.user.company_id; // from auth middleware

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

        i.internship_id,
        i.title AS internship_title

      FROM internship_evaluation ie
      JOIN student s ON ie.student_id = s.student_id
      JOIN internship i ON ie.internship_id = i.internship_id
      WHERE i.company_id = ?
      ORDER BY ie.submitted_at DESC
      `,
      [company_id]
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

export {
  assignMentor,
  companyEvaluation,
  deleteMentor,
  changeMentor,
  getStudents,
  facultyViewReports,
};
