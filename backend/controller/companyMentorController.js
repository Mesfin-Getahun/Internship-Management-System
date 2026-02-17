import db from "../config/mysql";

const fetchStudents = async (req, res) => {
  const mentorId = req.user.company_mentor_id;
  try {
    const [students] = await db.query(
      "SELECT student_id, student_name, email FROM student WHERE company_mentor = ?",
      [mentorId]
    );

    res.json({ success: true, students: students });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

const giveFeedBack = async (req, res) => {
  try {
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { giveFeedBack, fetchStudents };
