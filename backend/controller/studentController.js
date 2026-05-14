import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import createLog from "../utils/createLog.js";

function isMissingTableError(error, tableName) {
  return (
    error?.code === "ER_NO_SUCH_TABLE" &&
    (!tableName || error?.sqlMessage?.includes(`'${tableName}'`))
  );
}

const TWO_MONTH_DEPARTMENTS = new Set([
  "computer science",
  "information technology",
  "information system",
  "information systems",
  "cyber security",
  "cybersecurity",
  "it education",
  "information technology education",
]);

const normalizeDepartment = (department = "") =>
  String(department).trim().toLowerCase().replace(/\s+/g, " ");

const requiredInternshipMonths = (department) =>
  TWO_MONTH_DEPARTMENTS.has(normalizeDepartment(department)) ? 2 : 4;

const durationMonthsFromDates = (startDate, endDate) => {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return null;
  }

  const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.round((days / 30) * 10) / 10;
};

const durationMonthsForInternship = (internship) => {
  const dateDuration = durationMonthsFromDates(internship.start_date, internship.end_date);
  if (dateDuration !== null) return dateDuration;

  const parsedDuration = Number.parseFloat(internship.duration);
  return Number.isFinite(parsedDuration) ? parsedDuration : null;
};

const withDurationEligibility = (internship, department) => {
  const minimumMonths = requiredInternshipMonths(department);
  const durationMonths = durationMonthsForInternship(internship);

  return {
    ...internship,
    duration_months: durationMonths,
    required_minimum_months: minimumMonths,
    meets_duration_requirement:
      durationMonths === null ? false : durationMonths >= minimumMonths,
  };
};

const fetchInternships = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    const [[student]] = await db.query(
      "SELECT department FROM student WHERE student_id = ?",
      [student_id],
    );

    const query = `
       SELECT i.*, c.company_name, COALESCE(i.location, c.location) AS location
      FROM internship i
      JOIN company c ON i.company_id = c.company_id
      WHERE i.status = 'approved'
    `;

    const [internships] = await db.query(query);
    const internshipsWithEligibility = internships.map((internship) =>
      withDurationEligibility(internship, student?.department),
    );

    res.status(200).json({
      success: true,
      internships: internshipsWithEligibility,
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
        ...withDurationEligibility(internship, student.department),
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

    const [[eligibility]] = await db.query(
      `
      SELECT
        s.department,
        i.internship_id,
        i.title,
        i.start_date,
        i.end_date,
        i.duration
      FROM student s
      JOIN internship i
        ON i.internship_id = ?
      WHERE s.student_id = ?
        AND i.status = 'approved'
      `,
      [internship_id, student_id],
    );

    if (!eligibility) {
      return res.status(404).json({
        success: false,
        message: "Internship not found or not approved",
      });
    }

    const requiredMonths = requiredInternshipMonths(eligibility.department);
    const durationMonths = durationMonthsForInternship(eligibility);

    if (durationMonths === null || durationMonths < requiredMonths) {
      const shownDuration =
        durationMonths === null ? "not specified" : `${durationMonths} month(s)`;

      return res.status(400).json({
        success: false,
        message: `Your department requires a minimum ${requiredMonths}-month internship. This internship duration is ${shownDuration}, so you cannot apply for it.`,
        required_minimum_months: requiredMonths,
        duration_months: durationMonths,
      });
    }

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
    const application_id = req.params.application_id || req.params.id;

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

const serializeList = (value) => {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? JSON.stringify(parsed) : trimmed;
    } catch {
      return trimmed;
    }
  }
  if (typeof value === "object") return JSON.stringify(value);
  return value ?? null;
};

const updateProfile = async (req, res) => {
  try {
    const student_id = req.user.student_id; // from auth middleware
    const {
      full_name,
      email,
      phone_number,
      password,
      skills,
      preferred_location,
      technical_skills,
      soft_skills,
      languages,
      linkedin,
      github,
      portfolio,
    } = req.body;

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

    const query = `
      UPDATE student
      SET
        full_name = ?,
        email = ?,
        phone_number = ?,
        skills = ?,
        preferred_location = ?,
        technical_skills = ?,
        soft_skills = ?,
        languages = ?,
        linkedin = ?,
        github = ?,
        portfolio = ?,
        password = ?
      WHERE student_id = ?
    `;

    await db.query(query, [
      full_name || existing[0].full_name,
      email || existing[0].email,
      phone_number || existing[0].phone_number,
      skills ?? existing[0].skills,
      preferred_location ?? existing[0].preferred_location,
      serializeList(technical_skills ?? existing[0].technical_skills),
      serializeList(soft_skills ?? existing[0].soft_skills),
      serializeList(languages ?? existing[0].languages),
      linkedin ?? existing[0].linkedin,
      github ?? existing[0].github,
      portfolio ?? existing[0].portfolio,
      hashedPassword,
      student_id,
    ]);

    await createLog(
      student_id,
      "STUDENT_PROFILE_UPDATED",
      `Student profile updated for ${full_name || existing[0].full_name} (${email || existing[0].email})`
    );

    const [[updatedStudent]] = await db.query(
      `SELECT
        student_id,
        full_name,
        email,
        phone_number,
        profile_status,
        skills,
        preferred_location,
        department,
        assigned_mentor,
        faculty,
        must_change_password,
        technical_skills,
        soft_skills,
        languages,
        linkedin,
        github,
        portfolio
       FROM student
       WHERE student_id = ?`,
      [student_id],
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

const getStudentReports = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    const [reports] = await db.query(
      `
      SELECT
        r.report_id,
        r.internship_id,
        r.report_url AS file_url,
        r.mentor_signed_url,
        r.status,
        r.submission_date AS created_at,
        r.submission_date AS submitted_at,
        r.faculty_submitted_at,
        r.signed_at,
        r.mentor_id,
        i.title AS internship_title,
        c.company_name
      FROM internship_report r
      LEFT JOIN internship i ON r.internship_id = i.internship_id
      LEFT JOIN company c ON i.company_id = c.company_id
      WHERE r.student_id = ?
      ORDER BY COALESCE(r.submission_date, DATE(r.signed_at), DATE(r.faculty_submitted_at)) DESC, r.report_id DESC
      `,
      [student_id],
    );

    res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Fetch student reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
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
        COALESCE(i.location, c.location) AS location,
        si.status,
        si.company_mentor_id,
        cm.full_name AS company_mentor_name,
        s.assigned_mentor AS university_mentor_id,
        m.full_name AS university_mentor_name
      FROM student_internship si
      JOIN internship i 
        ON si.internship_id = i.internship_id
      JOIN company c
        ON i.company_id = c.company_id
      JOIN student s
        ON si.student_id = s.student_id
      LEFT JOIN company_mentor cm
        ON si.company_mentor_id = cm.company_mentor_id
      LEFT JOIN mentor m
        ON s.assigned_mentor = m.mentor_id
      WHERE si.student_id = ?
        AND si.status = 'in progress'
      LIMIT 1
      `,
      [studentId]
    );

    const [applications] = await db.query(
      `
      SELECT
        a.application_id,
        a.applied_date,
        a.status,
        a.statement,
        a.cv_file,
        a.academic_doc,
        i.internship_id,
        i.title,
        i.description,
        i.start_date,
        i.end_date,
        i.skills,
        COALESCE(i.location, c.location) AS location,
        c.company_name
      FROM application a
      JOIN internship i
        ON a.internship_id = i.internship_id
      JOIN company c
        ON i.company_id = c.company_id
      WHERE a.student_id = ?
      ORDER BY a.applied_date DESC, a.application_id DESC
      `,
      [studentId]
    );

    res.status(200).json({
      success: true,
      internship: rows[0] || null,
      applications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active internship",
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
       (student_id, internship_id, report_url, status, submission_date)
       VALUES (?, ?, ?, 'submitted', CURDATE())`,
      [student_id, internship_id, reportUrl]
    );

    res.json({ success: true, reportUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};

const getPaymentApplication = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    const [rows] = await db.query(
      `
      SELECT *
      FROM payment
      WHERE student_id = ?
      ORDER BY COALESCE(updated_at, created_at) DESC, payment_id DESC
      LIMIT 1
      `,
      [student_id]
    );

    res.status(200).json({
      success: true,
      payment: rows[0] || null,
    });
  } catch (error) {
    if (isMissingTableError(error, "internshipdb.payment")) {
      return res.status(200).json({
        success: true,
        payment: null,
        paymentFeatureAvailable: false,
        message: "Payment feature is not available because the payment table is missing.",
      });
    }

    console.error("Fetch payment application error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment application",
    });
  }
};

const submitPaymentApplication = async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const { bankName, accountHolder, accountNumber } = req.body;

    if (!bankName || !accountHolder || !accountNumber) {
      return res.status(400).json({
        success: false,
        message: "Bank name, account holder, and account number are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Signed acceptance letter PDF is required",
      });
    }

    const acceptanceLetterUrl = await uploadToCloudinary(
      req.file.buffer,
      "stipend_applications/acceptance_letters",
      req.file.originalname
    );

    const [existing] = await db.query(
      "SELECT payment_id FROM payment WHERE student_id = ? ORDER BY payment_id DESC LIMIT 1",
      [student_id]
    );

    if (existing.length > 0) {
      await db.query(
        `
        UPDATE payment
        SET
          bank_name = ?,
          account_holder = ?,
          account_number = ?,
          acceptance_letter_url = ?,
          status = 'Pending Approval'
        WHERE payment_id = ?
        `,
        [
          bankName,
          accountHolder,
          accountNumber,
          acceptanceLetterUrl,
          existing[0].payment_id,
        ]
      );
    } else {
      await db.query(
        `
        INSERT INTO payment
          (student_id, bank_name, account_holder, account_number, acceptance_letter_url, status)
        VALUES
          (?, ?, ?, ?, ?, 'Pending Approval')
        `,
        [student_id, bankName, accountHolder, accountNumber, acceptanceLetterUrl]
      );
    }

    const [savedRows] = await db.query(
      "SELECT * FROM payment WHERE student_id = ? ORDER BY payment_id DESC LIMIT 1",
      [student_id]
    );

    res.status(200).json({
      success: true,
      message: "Payment application submitted successfully",
      payment: savedRows[0] || null,
    });
  } catch (error) {
    if (isMissingTableError(error, "internshipdb.payment")) {
      return res.status(503).json({
        success: false,
        paymentFeatureAvailable: false,
        message: "Payment feature is unavailable because the payment table is missing.",
      });
    }

    console.error("Submit payment application error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit payment application",
    });
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
         mf.feedback_id,
         mf.parent_feedback_id,
         mf.internship_id,
         mf.company_mentor_id,
         mf.feedback_type,
         mf.rating,
         mf.strengths,
         mf.weaknesses,
         mf.suggestions,
         mf.overall_comment,
         mf.created_at,
         mf.updated_at,
         CASE
           WHEN mf.company_mentor_id IS NULL THEN 'faculty_mentor'
           ELSE 'company_mentor'
         END AS source_role,
         CASE
           WHEN mf.company_mentor_id IS NULL THEN m.full_name
           ELSE cm.full_name
         END AS source_name,
         cm.full_name AS company_mentor_name,
         m.full_name AS mentor_name
         
       FROM mentor_feedback mf
       LEFT JOIN company_mentor cm
         ON mf.company_mentor_id = cm.company_mentor_id
       LEFT JOIN student s
         ON mf.student_id = s.student_id
       LEFT JOIN mentor m
         ON s.assigned_mentor = m.mentor_id
       WHERE mf.student_id = ?
       ORDER BY mf.created_at DESC`,
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

const getRecommendationLetter = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT setting_key, setting_value
      FROM system_settings
      WHERE setting_key IN (?, ?, ?, ?)
      `,
      [
        "recommendation_letter_url",
        "recommendation_letter_name",
        "recommendation_letter_available",
        "recommendation_letter_updated_at",
      ],
    );

    const settings = Object.fromEntries(
      rows.map((row) => [row.setting_key, row.setting_value]),
    );

    const recommendation = {
      available:
        settings.recommendation_letter_available === "true" &&
        Boolean(settings.recommendation_letter_url),
      file_url: settings.recommendation_letter_url || null,
      file_name: settings.recommendation_letter_name || null,
      updated_at: settings.recommendation_letter_updated_at || null,
    };

    res.status(200).json({
      success: true,
      recommendation,
    });
  } catch (error) {
    console.error("Fetch student recommendation letter error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendation letter",
    });
  }
};

export {
  fetchInternships,
  applyInternships,
  myInternship,
  getStudentReports,
  uploadInternshipReport,
  getPaymentApplication,
  submitPaymentApplication,
  feedbacks,
  updateProfile,
  cancelApplication,
  suggestedInternships,
  submitSignedReportToFaculty,
  getRecommendationLetter,
};
