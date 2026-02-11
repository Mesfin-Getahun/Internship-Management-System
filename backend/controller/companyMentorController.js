const giveFeedBack = async (req, res) => {
  try {
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const fetchStudents = async (req, res) => {
  //const mentorId = req.user.id;
  try {
    // const [students] = await db.query(
    //   "SELECT student_id, student_name, email FROM student WHERE assigned_mentor = ?",
    //   [mentorId]
    // );

    // res.json({ success: true, students: students });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

export { giveFeedBack,fetchStudents };
