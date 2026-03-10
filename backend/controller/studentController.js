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
      console.log("file not found");
      return res.status(400).json({
        success: false,
        message: "CV and academic document are required",
      });
    }
    console.log(req.files);

    const [existing] = await db.query(
      "SELECT * FROM application WHERE student_id = ? AND internship_id = ?",
      [student_id, internship_id]
    );

    if (existing.length > 0) {
      console.log("You already applied for this internship");
      return res.status(400).json({
        success: false,
        message: "You already applied for this internship",
      });
    }

    // ✅ Get company name using JOIN
    const [internship] = await db.query(
      `
      SELECT c.company_name
      FROM internship i
      JOIN company c ON i.company_id = c.company_id
      WHERE i.internship_id = ?
      `,
      [internship_id]
    );

    if (internship.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    const company_name = internship[0].company_name;

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

    // Insert application
    await db.query(
      `INSERT INTO application
       (student_id, internship_id, company_name, applied_date, status, statement, cv_file, academic_doc)
       VALUES (?, ?, ?, CURDATE(), 'Pending', ?, ?, ?)`,
      [student_id, internship_id, company_name, statement, cvUrl, academicUrl]
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

// const updateProfile = async (req, res) => {
//   try {
//     const student_id = req.user.student_id; // from auth middleware
//     const { email, phone_number } = req.body;

//     if (!student_id) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     // Fetch current student data
//     const [existing] = await db.query(
//       "SELECT * FROM student WHERE student_id = ?",
//       [student_id]
//     );

//     if (existing.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Student not found" });
//     }

//     let hashedPassword = existing[0].password;

//     // Hash new password only if provided
//     if (password) {
//       hashedPassword = await bcrypt.hash(password, 10);
//     }

//     // Update student profile
//     const query = `
//       UPDATE student
//       SET  email = ?, phone_number = ?,
//       WHERE student_id = ?
//     `;

//     await db.query(query, [
//       email || existing[0].email,
//       phone_number || existing[0].phone_number,

//       student_id,
//     ]);

//     res
//       .status(200)
//       .json({ success: false, message: "Profile updated successfully" });
//   } catch (error) {
//     console.error("Update profile error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to update profile" });
//   }
// };

const updateProfile = async (req, res) => {
  try {
    const studentId = req.user.student_id;

    console.log("==== UPDATE PROFILE CALLED ====");
    console.log("BODY:", req.body);
    console.log("USER FROM TOKEN:", req.user);

    const {
      technicalSkills,
      softSkills,
      languages,
      linkedin,
      github,
      portfolio,
    } = req.body;
    console.log("SKILLS BEFORE SAVE:", technicalSkills, softSkills, languages);
    const result = await db.query(
      `UPDATE student 
       SET 
       technical_skills = ?, 
       soft_skills = ?, 
       languages = ?, 
       linkedin = ?, 
       github = ?, 
       portfolio = ?
       WHERE student_id = ?`,
      [
        JSON.stringify(technicalSkills ?? []),
        JSON.stringify(softSkills ?? []),
        JSON.stringify(languages ?? []),
        linkedin,
        github,
        portfolio,
        studentId,
      ]
    );

    console.log("UPDATE RESULT:", result);
    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const myInternship = async (req, res) => {
  try {
    const studentId = req.user.student_id;

    // const [rows] = await db.query(
    //   `
    //   SELECT
    //     i.internship_id,
    //     i.title,
    //     i.description,
    //     i.start_date,
    //     i.end_date,
    //     i.skills,
    //     c.company_name,
    //     si.status
    //   FROM student_internship si
    //   JOIN internship i
    //     ON si.internship_id = i.internship_id
    //   JOIN company c
    //     ON i.company_id = c.company_id
    //   WHERE si.student_id = ?
    //     AND si.status = 'in progress'
    //   LIMIT 1
    //   `,
    //   [studentId]
    // );

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
        si.status,
    
        cm.full_name AS company_mentor_name,
        cm.email AS company_mentor_email,
    
        fm.full_name AS faculty_mentor_name,
        fm.email AS faculty_mentor_email
    
      FROM student_internship si
    
      JOIN internship i 
        ON si.internship_id = i.internship_id
    
      JOIN company c
        ON i.company_id = c.company_id
    
      JOIN student s
        ON si.student_id = s.student_id
    
      LEFT JOIN company_mentor cm
        ON si.company_mentor_id = cm.company_mentor_id
    
      LEFT JOIN mentor fm
        ON s.assigned_mentor = fm.mentor_id
    
      WHERE si.student_id = ?
        AND si.status = 'in progress'
    
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

const myApplication = async (req, res) => {
  try {
    const studentId = req.user.student_id;

    const [rows] = await db.query(
      `
      SELECT internship_id,applied_date,status,statement from Application where student_id=?
      `,
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You do not have an application",
      });
    }

    res.status(200).json({
      success: true,
      applications: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application",
    });
  }
};

const uploadInternshipReport = async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const { internship_id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Report PDF required" });
    }

    const reportUrl = await uploadToCloudinary(
      req.file.buffer,
      "internship_reports/original",
      req.file.originalname
    );

    await db.query(
      `INSERT INTO internship_report
       (student_id, internship_id, report_url, status)
       VALUES (?, ?, ?, 'submitted')`,
      [student_id, internship_id, reportUrl]
    );

    res.json({ success: true, reportUrl });
  } catch (error) {
    console.log(error);
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
    const student_id = req.user.student_id; // from auth middleware

    // fetch all feedback for this student
    const [rows] = await db.query(
      `SELECT 
         feedback_id,
         internship_id,
         company_mentor_id,
         feedback_type,
         rating,
         strengths,
         weaknesses,
         suggestions,
         overall_comment,
         created_at,
         updated_at
         
       FROM mentor_feedback 
       
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [student_id]
    );

    res.json({
      success: true,
      feedbacks: rows,
    });
  } catch (error) {
    console.error("Fetch feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedbacks",
    });
  }
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
  myApplication,
};
