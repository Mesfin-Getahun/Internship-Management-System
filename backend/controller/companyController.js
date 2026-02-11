import db from "../config/mysql.js";
import bcrypt from "bcryptjs";

const postInternship = async (req, res) => {
  try {
    const { title, description, image, start_date, end_date } = req.body;

    // Basic validation
    if (!title || !description || !start_date || !end_date) {
      return res
        .status(400)
        .json({
          success: false,
          message: "All required fields must be filled",
        });
    }

    // Insert into database
    const query = `
      INSERT INTO internship 
      (title, description, image, start_date, end_date)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      title,
      description,
      image || null,
      start_date,
      end_date,
    ]);

    res.status(201).json({
      success: true,
      message: "Internship posted successfully",
    });
  } catch (error) {
    console.error("Post internship error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to post internship",
    });
  }
};

const deleteInternship = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Internship ID is required",
      });
    }

    const [result] = await db.query(
      "DELETE FROM internship WHERE internship_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Internship deleted successfully",
    });
  } catch (error) {
    console.error("Delete internship error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete internship",
    });
  }
};

const updateInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, start_date, end_date } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Internship ID is required",
      });
    }

    // Optional: check if internship exists
    const [existing] = await db.query(
      "SELECT * FROM internship WHERE internship_id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    // Update internship
    const query = `
      UPDATE internship
      SET title = ?, description = ?, image = ?, start_date = ?, end_date = ?
      WHERE internship_id = ?
    `;

    await db.query(query, [
      title,
      description,
      image || existing[0].image,
      start_date,
      end_date,
      id,
    ]);

    res.status(200).json({
      success: true,
      message: "Internship updated successfully",
    });
  } catch (error) {
    console.error("Update internship error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update internship",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const company_id = req.user.company_id; // from JWT
    const { company_name, email, phone_number, profile_pic, password } =
      req.body;

    if (!company_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Fetch existing company
    const [existing] = await db.query(
      "SELECT * FROM company WHERE company_id = ?",
      [company_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    let hashedPassword = existing[0].password;

    // Hash password only if updated
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update profile
    const query = `
      UPDATE company
      SET company_name = ?, email = ?, phone_number = ?, profile_pic = ?, password = ?
      WHERE company_id = ?
    `;

    await db.query(query, [
      company_name || existing[0].company_name,
      email || existing[0].email,
      phone_number || existing[0].phone_number,
      profile_pic || existing[0].profile_pic,
      hashedPassword,
      company_id,
    ]);

    res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
    });
  } catch (error) {
    console.error("Update company profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

const getApplications = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    if (!company_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const query = `
      SELECT 
        a.application_id,
        a.status,
        a.submitted_at,
        a.cv_file,
        a.cover_letter_file,

        s.student_id,
        s.full_name AS student_name,
        s.email AS student_email,

        i.internship_id,
        i.title AS internship_title

      FROM application a
      JOIN student s ON a.student_id = s.student_id
      JOIN internship i ON a.internship_id = i.internship_id
      WHERE i.company_id = ?
      ORDER BY a.submitted_at DESC
    `;

    const [applications] = await db.query(query, [company_id]);

    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("Get applications error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch applications" });
  }
};

const viewApplication = async (req, res) => {
  try {
    const { id } = req.params; // application_id
    const company_id = req.user.company_id;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Application ID is required" });
    }

    const query = `
      SELECT 
        a.application_id,
        a.status,
        a.submitted_at,
        a.cv_file,
        a.cover_letter_file,

        s.student_id,
        s.full_name AS student_name,
        s.email AS student_email,
        s.phone_number,

        i.internship_id,
        i.title AS internship_title,
        i.description AS internship_description

      FROM application a
      JOIN student s ON a.student_id = s.student_id
      JOIN internship i ON a.internship_id = i.internship_id
      WHERE a.application_id = ?
        AND i.company_id = ?
    `;

    const [application] = await db.query(query, [id, company_id]);

    if (application.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Application not found or access denied",
        });
    }

    res.status(200).json({ success: true, application: application[0] });
  } catch (error) {
    console.error("View application error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch application details" });
  }
};

const accept = async (req, res) => {
  try {
    const { application_id } = req.params;

    // 1️⃣ Update application status
    await db.query(
      "UPDATE application SET status = 'accepted' WHERE application_id = ?",
      [application_id]
    );

    // 2️⃣ Get student_id & internship_id from application
    const [rows] = await db.query(
      "SELECT student_id, internship_id, company_id FROM application WHERE application_id = ?",
      [application_id]
    );

    const { student_id, internship_id, company_id } = rows[0];

    // 3️⃣ Insert into student_internship
    await db.query(
      `INSERT INTO student_internship 
      (student_id, internship_id, company_id, status, start_date) 
      VALUES (?, ?, ?, 'in progress', CURDATE())`,
      [student_id, internship_id, company_id]
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Application accepted and internship assigned",
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to accept application" });
  }
};

const reject = async (req, res) => {
  try {
    const { application_id } = req.params;

    if (!application_id) {
      return res
        .status(400)
        .json({ success: false, message: "Application ID is required" });
    }

    // Check if application exists
    const [existing] = await db.query(
      "SELECT * FROM application WHERE application_id = ?",
      [application_id]
    );

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    // Update application status to 'rejected'
    await db.query(
      "UPDATE application SET status = 'rejected' WHERE application_id = ?",
      [application_id]
    );

    res
      .status(200)
      .json({ success: true, message: "Application rejected successfully" });
  } catch (error) {
    console.error("Reject application error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reject application" });
  }
};

const assignMentor = async (req, res) => {
  try {
    const { student_internship_id, company_mentor_id } = req.body;

    if (!student_internship_id || !company_mentor_id) {
      return res.status(400).json({
        success:false,
        message: "Student internship ID and company mentor ID are required",
      });
    }

    // Check if student_internship exists
    const [existing] = await db.query(
      "SELECT * FROM student_internship WHERE id = ?",
      [student_internship_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({success:false, message: "Student internship not found" });
    }

    // Optional: check if company_mentor exists
    const [mentor] = await db.query(
      "SELECT * FROM company_mentor WHERE company_mentor_id = ?",
      [company_mentor_id]
    );

    if (mentor.length === 0) {
      return res.status(404).json({success:false, message: "Company mentor not found" });
    }

    // Assign the mentor
    await db.query(
      "UPDATE student_internship SET company_mentor_id = ? WHERE id = ?",
      [company_mentor_id, student_internship_id]
    );

    res.status(200).json({success:true, message: "Mentor assigned successfully" });
  } catch (error) {
    console.error("Assign mentor error:", error);
    res.status(500).json({success:false, message: "Failed to assign mentor" });
  }
};

const postEvaluation = async (req, res) => {
  try {
  } catch (error) {}
};


export {
  postInternship,
  accept,
  reject,
  deleteInternship,
  updateInternship,
  getApplications,
  postEvaluation,
  assignMentor,
  updateProfile,
  viewApplication,
};
