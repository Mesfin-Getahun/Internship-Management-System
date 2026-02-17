import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

const fetchInternships = async (req, res) => {
  try {
    const query = `
       SELECT i.*, c.company_name, c.location
      FROM internship i
      JOIN company c ON i.company_id = c.company_id
      WHERE i.status = 'approved'
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

const suggestedInternships = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    const [[student]] = await db.query(
      "SELECT department, skills, preferred_location FROM student WHERE student_id = ?",
      [student_id]
    );

    const studentSkills =
      student.skills?.split(",").map((s) => s.trim().toLowerCase()) || [];

    const [internships] = await db.query(
      `
      SELECT i.*, c.company_name
      FROM internship i
      JOIN company c ON i.company_id = c.company_id
      WHERE i.status = 'approved'
      AND i.department = ?
      `,
      [student.department]
    );

    const suggestions = internships.map((internship) => {
      const internshipSkills =
        internship.skills?.split(",").map((s) => s.trim().toLowerCase()) || [];

      const matchedSkills = studentSkills.filter((skill) =>
        internshipSkills.includes(skill)
      );

      let score = matchedSkills.length * 2;

      if (
        student.preferred_location &&
        internship.location === student.preferred_location
      ) {
        score += 1;
      }

      return {
        internship_id: internship.internship_id,
        title: internship.title,
        company: internship.company_name,
        location: internship.location,
        matched_skills: matchedSkills,
        match_score: score,
      };
    });

    suggestions.sort((a, b) => b.match_score - a.match_score);

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch internship suggestions",
    });
  }
};

const applyInternships = async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const { internship_id } = req.params;
    const { statement } = req.body;

    if (!req.files?.cv || !req.files?.academic_doc) {
      return res.status(400).json({
        success: false,
        message: "CV and academic document are required",
      });
    }

    // // ✅ upload files to cloudinary
    // const cvUrl = await uploadToCloudinary(
    //   req.files.cv[0].buffer,
    //   "internship_applications/cv"
    // );

    // const academicUrl = await uploadToCloudinary(
    //   req.files.academic_doc[0].buffer,
    //   "internship_applications/academic"
    // );

    const cvUrl = await uploadToCloudinary(
      req.files.cv[0].buffer,
      "internship_applications/cv",
      req.files.cv[0].originalname
    );

    const academicUrl = await uploadToCloudinary(
      req.files.academic_doc[0].buffer,
      "internship_applications/academic",
      req.files.academic_doc[0].originalname
    );

    // ✅ store URLs directly
    await db.query(
      `INSERT INTO application
       (student_id, internship_id, applied_date, status, statement, cv_file, academic_doc)
       VALUES (?, ?, CURDATE(), 'pending', ?, ?, ?)`,
      [student_id, internship_id, statement, cvUrl, academicUrl]
    );

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to apply for internship",
    });
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
      return res.status(404).json({
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
    const studentId = req.user.student_id;

    const [rows] = await db.query(
      `
      SELECT 
        i.internship_id,
        i.title,
        i.description,
        i.start_date,
        i.end_date,
        i.skills,
        c.company_name,
        si.status
      FROM student_internship si
      JOIN internship i 
        ON si.internship_id = i.internship_id
      JOIN company c
        ON i.company_id = c.company_id
      WHERE si.student_id = ?
        AND si.status = 'accepted'
      LIMIT 1
      `,
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You do not have an active internship",
      });
    }

    res.status(200).json({
      success: true,
      internship: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active internship",
    });
  }
};

// const uploadInternshipReport = async (req, res) => {
//   try {
//     const student_id = req.user.student_id;

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "PDF report is required",
//       });
//     }

//     // 1️⃣ get active internship
//     const [rows] = await db.query(
//       `SELECT internship_id
//        FROM application
//        WHERE student_id = ?
//          AND status = 'accepted'
//        LIMIT 1`,
//       [student_id]
//     );

//     if (rows.length === 0) {
//       return res.status(403).json({
//         success: false,
//         message: "No active internship found",
//       });
//     }

//     const internship_id = rows[0].internship_id;

//     // 2️⃣ upload PDF to cloudinary
//     const reportUrl = await uploadToCloudinary(
//       req.file.buffer,
//       "internship_reports"
//     );

//     // 3️⃣ save report
//     await db.query(
//       `INSERT INTO internship_report
//        (student_id, internship_id, report_url)
//        VALUES (?, ?, ?)`,
//       [student_id, internship_id, reportUrl]
//     );

//     res.status(201).json({
//       success: true,
//       message: "Internship report uploaded successfully",
//       reportUrl,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to upload internship report",
//     });
//   }
// };

const uploadInternshipReport = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    if (!req.file) {
      return res.status(400).json({ message: "Report PDF required" });
    }

    const reportUrl = await uploadToCloudinary(
      req.file.buffer,
      "internship_reports/original"
    );

    await db.query(
      `INSERT INTO internship_report
       (student_id, internship_id, report_url, status)
       VALUES (?, ?, ?, 'submitted')`,
      [student_id, req.body.internship_id, reportUrl]
    );

    res.json({ success: true, reportUrl });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

const submitSignedReportToFaculty = async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const { report_id } = req.params;

    await db.query(
      `UPDATE internship_report
       SET status = 'faculty_submitted', faculty_submitted_at = NOW()
       WHERE report_id = ? AND student_id = ? AND status = 'signed'`,
      [report_id, student_id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
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
  suggestedInternships,
  submitSignedReportToFaculty,
};
