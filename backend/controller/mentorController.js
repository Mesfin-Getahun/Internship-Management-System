import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

const fetchStudents = async (req, res) => {
  const mentorId = req.user.id;
  try {
    const [students] = await db.query(
      "SELECT student_id, student_name, email FROM student WHERE assigned_mentor = ?",
      [mentorId]
    );

    res.json({ success: true, students: students });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

const reviewReport = async (req, res) => {
  try {
  } catch (error) {}
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
      "internship_reports/signed"
    );

    await db.query(
      `UPDATE internship_report
       SET mentor_signed_url = ?, mentor_id = ?, status = 'signed', signed_at = NOW()
       WHERE report_id = ?`,
      [signedUrl, mentor_id, report_id]
    );

    res.json({ success: true, signedUrl });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

const provideFeedback = async (req, res) => {
  try {
  } catch (error) {}
};

export { fetchStudents, provideFeedback, reviewReport, mentorSignReport };
