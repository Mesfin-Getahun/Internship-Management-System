import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import { uploadToCloudinary } from "../middleware/uploadApplicationFiles.js";

const fetchInternships = async (req, res) => {
  try {
    const query = `
      SELECT 
        i.*,
        c.company_name,
        c.location
      FROM internship i
      JOIN company c ON i.company_id = c.company_id
      ORDER BY i.created_at DESC
    `;

    const [internships] = await db.query(query);

    res.status(200).json({
      success: true,
      internships,
    });
  } catch (error) {
    console.error("Fetch internships error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch internships",
    });
  }
};

const applyInternships = async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const { internship_id } = req.params;
    const { statement } = req.body;

    if (!req.files?.cv || !req.files?.academic_doc) {
      return res
        .status(400)
        .json({
          success: false,
          message: "CV and academic document are required",
        });
    }

    // upload files to cloudinary
    const cvUpload = await uploadToCloudinary(
      req.files.cv[0].buffer,
      "internship_applications/cv"
    );

    const academicUpload = await uploadToCloudinary(
      req.files.academic_doc[0].buffer,
      "internship_applications/academic"
    );

    await db.query(
      `INSERT INTO application
       (student_id, internship_id, applied_date, status, statement, cv_file, academic_doc)
       VALUES (?, ?, CURDATE(), 'pending', ?, ?, ?)`,
      [
        student_id,
        internship_id,
        statement,
        cvUpload.secure_url,
        academicUpload.secure_url,
      ]
    );

    res
      .status(201)
      .json({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to apply for internship" });
  }
};

const cancelApplication = async (req, res) => {
  try {
    const student_id = req.user.student_id; // from auth middleware
    const { application_id } = req.params;

    if (!application_id) {
      return res
        .status(400)
        .json({ success: false, message: "Application ID is required" });
    }

    // Check if application exists and belongs to this student
    const [existing] = await db.query(
      "SELECT * FROM application WHERE application_id = ? AND student_id = ?",
      [application_id, student_id]
    );

    if (existing.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Application not found or you are not authorized",
        });
    }

    // Delete the application
    await db.query("DELETE FROM application WHERE application_id = ?", [
      application_id,
    ]);

    res
      .status(200)
      .json({ success: true, message: "Application cancelled successfully" });
  } catch (error) {
    console.error("Cancel application error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to cancel application" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const student_id = req.user.student_id; // from auth middleware
    const { full_name, email, phone_number, password, profile_pic } = req.body;

    if (!student_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Fetch current student data
    const [existing] = await db.query(
      "SELECT * FROM student WHERE student_id = ?",
      [student_id]
    );

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    let hashedPassword = existing[0].password;

    // Hash new password only if provided
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update student profile
    const query = `
      UPDATE student
      SET full_name = ?, email = ?, phone_number = ?, profile_pic = ?, password = ?
      WHERE student_id = ?
    `;

    await db.query(query, [
      full_name || existing[0].full_name,
      email || existing[0].email,
      phone_number || existing[0].phone_number,
      profile_pic || existing[0].profile_pic,
      hashedPassword,
      student_id,
    ]);

    res
      .status(200)
      .json({ success: false, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

const myInternship = async (req, res) => {
  try {
  } catch (error) {}
};

const uploadInternshipReport = async (req, res) => {
  try {
  } catch (error) {}
};

const feedbacks = async (req, res) => {
  try {
  } catch (error) {}
};

export {
  fetchInternships,
  applyInternships,
  myInternship,
  uploadInternshipReport,
  feedbacks,
  updateProfile,
  cancelApplication,
};
