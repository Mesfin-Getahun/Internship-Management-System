const companyEvaluation = async (req, res) => {
  try {
  } catch (error) {}
};

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
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  assignMentor,
  companyEvaluation,
  deleteMentor,
  changeMentor,
  evaluation,
};
