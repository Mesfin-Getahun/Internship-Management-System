import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import generateAssessmentPDF from "../utils/generateAssessmentPDF.js";
import generateAttendancePDF from "../utils/generateAttendancePDF.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import fs from "fs";
import createLog from "../utils/createLog.js";
import {
  createNotification,
  createNotifications,
} from "../utils/notificationService.js";
import { getCurrentAcademicYear } from "../utils/academicYear.js";
import { ensureCompanyMentorCompanyColumn } from "../utils/companyMentorSchema.js";
import { ensureInternshipEvaluationMentorColumns } from "../utils/internshipEvaluationSchema.js";
import {
  recordCompanyMentorAssignment,
} from "../utils/mentorAssignmentHistorySchema.js";
import {
  APPLICATION_STATUS,
  PLACEMENT_STATUS,
  isPendingApplication,
} from "../utils/statusRules.js";
import {
  MENTOR_STUDENT_LIMIT,
  isFutureDateOnly,
  parseDateOnly,
  validateAttendanceRecordsForInternship,
} from "../utils/internshipRules.js";

const CURRENT_PLACEMENT_STATUSES = [
  PLACEMENT_STATUS.ACCEPTED,
  PLACEMENT_STATUS.IN_PROGRESS,
  PLACEMENT_STATUS.ACTIVE,
];

function isDuplicateKeyError(error) {
  return error?.code === "ER_DUP_ENTRY" || error?.errno === 1062;
}

const getInternshipLockedUsage = async (internship_id, company_id) => {
  const [rows] = await db.query(
    `
    SELECT
      (
        SELECT COUNT(*)
        FROM application a
        JOIN internship i
          ON a.internship_id = i.internship_id
        WHERE a.internship_id = ?
          AND i.company_id = ?
      ) AS student_applications,
      (
        SELECT COUNT(*)
        FROM student_internship si
        JOIN internship i
          ON si.internship_id = i.internship_id
        WHERE si.internship_id = ?
          AND i.company_id = ?
      ) AS student_placements
    `,
    [internship_id, company_id, internship_id, company_id],
  );

  const usage = rows[0] || {};

  return {
    studentApplications: Number(usage.student_applications || 0),
    studentPlacements: Number(usage.student_placements || 0),
  };
};

const hasLockedInternshipUsage = (usage) =>
  usage.studentApplications > 0 || usage.studentPlacements > 0;

const sendLockedInternshipResponse = (res, action, usage) =>
  res.status(409).json({
    success: false,
    message: `This internship cannot be ${action} because one or more students have already applied or been accepted for it.`,
    student_applications: usage.studentApplications,
    student_placements: usage.studentPlacements,
  });

const postInternship = async (req, res) => {
  const company_id = req.user.company_id;
  try {
    const {
      title,
      description,
      image,
      start_date,
      end_date,
      skill,
      skills,
      requirements,
      department,
      location,
    } = req.body;

    // Basic validation
    if (!title || !description || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Title, description, start date, and end date are required",
      });
    }

    if (!isFutureDateOnly(start_date)) {
      return res.status(400).json({
        success: false,
        message: "Start date must be a future date",
      });
    }

    const parsedStartDate = parseDateOnly(start_date);
    const parsedEndDate = parseDateOnly(end_date);

    if (!parsedStartDate || !parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date must be valid dates",
      });
    }

    if (parsedEndDate < parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    // Insert into database
    const query = `
      INSERT INTO internship 
      (title, description, image, start_date, end_date, skills, department, location, company_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      title,
      description,
      image || null,
      start_date || null,
      end_date || null,
      requirements || skills || skill || null,
      department || null,
      location || null,
      company_id,
      "pending",
    ]);

    const [uilUsers] = await db.query("SELECT UIL_id FROM UIL");
    await createNotifications(
      uilUsers.map((uil) => ({
        recipientRole: "uil",
        recipientId: uil.UIL_id,
        title: "Internship awaiting approval",
        message: `${req.user.company_name || "A company"} posted ${title}.`,
        type: "approval",
        link: "/uil/internship-approvals",
      })),
    );

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
    const { internship_id } = req.params;
    const company_id = req.user.company_id;

    if (!internship_id) {
      return res.status(400).json({
        success: false,
        message: "Internship ID is required",
      });
    }

    const [existing] = await db.query(
      "SELECT internship_id FROM internship WHERE internship_id = ? AND company_id = ? LIMIT 1",
      [internship_id, company_id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    const lockedUsage = await getInternshipLockedUsage(
      internship_id,
      company_id,
    );

    if (hasLockedInternshipUsage(lockedUsage)) {
      return sendLockedInternshipResponse(res, "deleted", lockedUsage);
    }

    await db.query(
      "DELETE FROM internship WHERE internship_id = ? AND company_id = ?",
      [internship_id, company_id],
    );

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
    const { internship_id } = req.params;
    const company_id = req.user.company_id;
    const {
      title,
      description,
      image,
      start_date,
      end_date,
      skill,
      skills,
      requirements,
      department,
      location,
    } = req.body;

    if (!internship_id) {
      return res.status(400).json({
        success: false,
        message: "Internship ID is required",
      });
    }

    // Optional: check if internship exists
    const [existing] = await db.query(
      "SELECT * FROM internship WHERE internship_id = ? AND company_id = ?",
      [internship_id, company_id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    const lockedUsage = await getInternshipLockedUsage(
      internship_id,
      company_id,
    );

    if (hasLockedInternshipUsage(lockedUsage)) {
      return sendLockedInternshipResponse(res, "updated", lockedUsage);
    }

    const nextStartDate = start_date || existing[0].start_date;
    const nextEndDate = end_date || existing[0].end_date;

    if (!nextStartDate || !nextEndDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    if (!isFutureDateOnly(nextStartDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date must be a future date",
      });
    }

    const parsedStartDate = parseDateOnly(nextStartDate);
    const parsedEndDate = parseDateOnly(nextEndDate);

    if (!parsedStartDate || !parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date must be valid dates",
      });
    }

    if (parsedEndDate < parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    // Update internship
    const query = `
      UPDATE internship
      SET title = ?, description = ?, image = ?, start_date = ?, end_date = ?, skills = ?, department = ?, location = ?
      WHERE internship_id = ?
    `;

    await db.query(query, [
      title || existing[0].title,
      description || existing[0].description,
      image || existing[0].image,
      nextStartDate,
      nextEndDate,
      requirements || skills || skill || existing[0].skills,
      department || existing[0].department,
      location || existing[0].location,
      internship_id,
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
    const {
      company_name,
      company_type,
      industry,
      website,
      email,
      phone_number,
      location,
      city,
      region,
      profile_pic,
      password,
    } = req.body;

    if (!company_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Fetch existing company
    const [existing] = await db.query(
      "SELECT * FROM company WHERE company_id = ?",
      [company_id],
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
      SET company_name = ?, company_type = ?, industry = ?, website = ?, email = ?, phone_number = ?, location = ?, city = ?, region = ?, profile_pic = ?, password = ?
      WHERE company_id = ?
    `;

    await db.query(query, [
      company_name || existing[0].company_name,
      company_type || existing[0].company_type,
      industry || existing[0].industry,
      website || existing[0].website,
      email || existing[0].email,
      phone_number || existing[0].phone_number,
      location || existing[0].location,
      city || existing[0].city,
      region || existing[0].region,
      profile_pic || existing[0].profile_pic,
      hashedPassword,
      company_id,
    ]);

    await createLog(
      company_id,
      "COMPANY_PROFILE_UPDATED",
      `Company profile updated for ${company_name || existing[0].company_name} (${email || existing[0].email})`,
    );

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

const getProfile = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    const [rows] = await db.query(
      `
      SELECT
        company_id,
        company_name,
        company_type,
        industry,
        website,
        email,
        phone_number,
        location,
        city,
        region,
        profile_pic,
        license_url,
        status,
        account_status
      FROM company
      WHERE company_id = ?
      `,
      [company_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile: rows[0],
    });
  } catch (error) {
    console.error("Get company profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch company profile",
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const deletedBy = String(company_id);

    const [activePlacements] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM student_internship
      WHERE company_id = ?
        AND LOWER(status) IN (?, ?, ?)
      `,
      [company_id, ...CURRENT_PLACEMENT_STATUSES],
    );

    const currentStudents = Number(activePlacements[0]?.total || 0);

    if (currentStudents > 0) {
      return res.status(409).json({
        success: false,
        message:
          "You cannot delete your account while students are currently attending internship at your company.",
        current_students: currentStudents,
      });
    }

    const [result] = await db.query(
      `
      UPDATE company
      SET account_status = 'inactive',
          deleted_at = COALESCE(deleted_at, NOW()),
          deleted_by = ?,
          delete_reason = COALESCE(delete_reason, 'Company self-deleted account')
      WHERE company_id = ?
      `,
      [deletedBy, company_id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Company account not found",
      });
    }

    await createLog(
      company_id,
      "COMPANY_ACCOUNT_DEACTIVATED",
      `${req.user.company_name || "Company"} deactivated its account`,
    ).catch(() => null);

    res.status(200).json({
      success: true,
      message: "Company account deactivated successfully",
    });
  } catch (error) {
    console.error("Delete company account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate company account",
    });
  }
};

const getCompanyMentors = async (req, res) => {
  try {
    await ensureCompanyMentorCompanyColumn();
    await ensureInternshipEvaluationMentorColumns();

    const company_id = req.user.company_id;

    const [mentors] = await db.query(
      `
      SELECT
        cm.company_mentor_id,
        cm.company_id,
        cm.full_name,
        cm.email,
        cm.phone_number,
        cm.must_change_password,
        cm.account_status,
        cm.deleted_at,
        COUNT(DISTINCT CASE
          WHEN si.cohort_status = 'current'
            AND LOWER(si.status) IN ('accepted', 'in progress', 'active')
            AND NOT EXISTS (
              SELECT 1
              FROM internship_evaluation ie
              WHERE ie.student_id = si.student_id
                AND ie.internship_id = si.internship_id
                AND (ie.company_mentor_id = si.company_mentor_id OR ie.company_mentor_id IS NULL)
            )
          THEN si.id
        END) AS assigned_students,
        COUNT(DISTINCT mf.feedback_id) AS feedback_count
      FROM company_mentor cm
      LEFT JOIN student_internship si
        ON si.company_mentor_id = cm.company_mentor_id
      LEFT JOIN mentor_feedback mf
        ON mf.company_mentor_id = cm.company_mentor_id
      WHERE cm.company_id = ?
      GROUP BY
        cm.company_mentor_id,
        cm.company_id,
        cm.full_name,
        cm.email,
        cm.phone_number,
        cm.must_change_password,
        cm.account_status,
        cm.deleted_at
      ORDER BY cm.full_name
      `,
      [company_id],
    );

    res.status(200).json({
      success: true,
      count: mentors.length,
      mentors,
    });
  } catch (error) {
    console.error("Get company mentors error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch company mentors",
    });
  }
};

const buildCompanyMentorDefaultPassword = (email, fullName) =>
  `${String(email || "").trim()}${String(fullName || "").trim()}`;

const generateCompanyMentorId = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = `${Date.now().toString(36)}${Math.random()
      .toString(36)
      .slice(2, 6)}`.toUpperCase();
    const candidate = `CM-${suffix.slice(-10)}`;
    const [rows] = await db.query(
      "SELECT company_mentor_id FROM company_mentor WHERE company_mentor_id = ? LIMIT 1",
      [candidate],
    );

    if (rows.length === 0) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique company mentor ID");
};

const createCompanyMentor = async (req, res) => {
  try {
    await ensureCompanyMentorCompanyColumn();

    const company_id = req.user.company_id;
    const {
      company_mentor_id,
      full_name,
      email,
      phone_number,
    } = req.body;

    const cleanFullName = String(full_name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone_number || "").trim() || null;

    if (!cleanFullName || !cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Mentor name and email are required",
      });
    }

    const mentorId =
      String(company_mentor_id || "").trim() || (await generateCompanyMentorId());

    const [existing] = await db.query(
      `SELECT company_mentor_id
       FROM company_mentor
       WHERE company_mentor_id = ? OR LOWER(email) = ?
       LIMIT 1`,
      [mentorId, cleanEmail],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A company mentor with this ID or email already exists",
      });
    }

    const defaultPassword = buildCompanyMentorDefaultPassword(
      cleanEmail,
      cleanFullName,
    );
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await db.query(
      `INSERT INTO company_mentor
       (company_mentor_id, company_id, full_name, email, phone_number, password, must_change_password, account_status)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, 'active')`,
      [mentorId, company_id, cleanFullName, cleanEmail, cleanPhone, hashedPassword],
    );

    await createLog(
      req.user.company_id,
      "COMPANY_MENTOR_CREATED",
      `Company mentor ${cleanFullName} (${cleanEmail}) created by ${req.user.company_name || "company"}`,
    );

    res.status(201).json({
      success: true,
      message: "Company mentor created successfully",
      mentor: {
        company_mentor_id: mentorId,
        company_id,
        full_name: cleanFullName,
        email: cleanEmail,
        phone_number: cleanPhone,
        must_change_password: 1,
        account_status: "active",
        assigned_students: 0,
        feedback_count: 0,
      },
      default_password_rule: "email + full_name",
    });
  } catch (error) {
    console.error("Create company mentor error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create company mentor",
    });
  }
};

const updateCompanyMentor = async (req, res) => {
  try {
    await ensureCompanyMentorCompanyColumn();

    const company_id = req.user.company_id;
    const { company_mentor_id } = req.params;
    const {
      full_name,
      email,
      phone_number,
      reset_password,
    } = req.body;

    const [existingRows] = await db.query(
      `SELECT company_mentor_id, company_id, full_name, email, phone_number, must_change_password, account_status
       FROM company_mentor
       WHERE company_mentor_id = ? AND company_id = ?
       LIMIT 1`,
      [company_mentor_id, company_id],
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company mentor not found",
      });
    }

    const existing = existingRows[0];
    const cleanFullName =
      String(full_name || "").trim() || existing.full_name;
    const cleanEmail =
      String(email || "").trim().toLowerCase() || existing.email;
    const cleanPhone =
      phone_number === undefined
        ? existing.phone_number
        : String(phone_number || "").trim() || null;

    if (!cleanFullName || !cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Mentor name and email are required",
      });
    }

    const [duplicateRows] = await db.query(
      `SELECT company_mentor_id
       FROM company_mentor
       WHERE LOWER(email) = ? AND company_mentor_id <> ?
       LIMIT 1`,
      [cleanEmail, company_mentor_id],
    );

    if (duplicateRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Another company mentor already uses this email",
      });
    }

    const shouldResetPassword =
      reset_password === true ||
      reset_password === "true" ||
      Number(existing.must_change_password) === 1;

    if (shouldResetPassword) {
      const defaultPassword = buildCompanyMentorDefaultPassword(
        cleanEmail,
        cleanFullName,
      );
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      await db.query(
        `UPDATE company_mentor
         SET full_name = ?, email = ?, phone_number = ?, password = ?, must_change_password = TRUE
         WHERE company_mentor_id = ?`,
        [cleanFullName, cleanEmail, cleanPhone, hashedPassword, company_mentor_id],
      );
    } else {
      await db.query(
        `UPDATE company_mentor
         SET full_name = ?, email = ?, phone_number = ?
         WHERE company_mentor_id = ?`,
        [cleanFullName, cleanEmail, cleanPhone, company_mentor_id],
      );
    }

    await createLog(
      req.user.company_id,
      "COMPANY_MENTOR_UPDATED",
      `Company mentor ${cleanFullName} (${cleanEmail}) updated by ${req.user.company_name || "company"}`,
    );

    res.status(200).json({
      success: true,
      message: shouldResetPassword
        ? "Company mentor updated and temporary password reset"
        : "Company mentor updated successfully",
      default_password_rule: shouldResetPassword ? "email + full_name" : null,
    });
  } catch (error) {
    console.error("Update company mentor error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update company mentor",
    });
  }
};

const deleteCompanyMentor = async (req, res) => {
  try {
    await ensureCompanyMentorCompanyColumn();

    const company_id = req.user.company_id;
    const { company_mentor_id } = req.params;

    const [mentorRows] = await db.query(
      `SELECT company_mentor_id, full_name, email, account_status
       FROM company_mentor
       WHERE company_mentor_id = ? AND company_id = ?
       LIMIT 1`,
      [company_mentor_id, company_id],
    );

    if (mentorRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company mentor not found",
      });
    }

    await db.query(
      `UPDATE company_mentor
       SET account_status = 'inactive',
           deleted_at = COALESCE(deleted_at, NOW()),
           deleted_by = ?,
           delete_reason = COALESCE(delete_reason, 'Deactivated by company')
       WHERE company_mentor_id = ? AND company_id = ?`,
      [String(req.user.company_id), company_mentor_id, company_id],
    );

    await createLog(
      req.user.company_id,
      "COMPANY_MENTOR_DEACTIVATED",
      `Company mentor ${mentorRows[0].full_name || company_mentor_id} deactivated by ${req.user.company_name || "company"}`,
    );

    res.status(200).json({
      success: true,
      message: "Company mentor deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate company mentor error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate company mentor",
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
        a.applied_date,
        a.statement,
       
        a.cv_file,
        a.academic_doc,

        s.student_id,
        s.full_name AS student_name,
        s.email AS student_email,
        s.department,
        s.faculty,
        s.skills,

        i.internship_id,
        i.title AS internship_title,

        si.id AS student_internship_id,
        si.status AS placement_status,
        si.company_mentor_id,
        cm.full_name AS company_mentor_name

      FROM application a
      JOIN student s ON a.student_id = s.student_id
      JOIN internship i ON a.internship_id = i.internship_id
      LEFT JOIN student_internship si
        ON a.student_id = si.student_id
       AND a.internship_id = si.internship_id
       AND si.cohort_status = 'current'
      LEFT JOIN company_mentor cm
        ON si.company_mentor_id = cm.company_mentor_id
      WHERE i.company_id = ?
     
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
    const { application_id } = req.params;
    const company_id = req.user.company_id;

    if (!application_id) {
      return res
        .status(400)
        .json({ success: false, message: "Application ID is required" });
    }

    const query = `
      SELECT 
        a.application_id,
        a.status,
        a.applied_date,
        a.statement,
        a.cv_file,
        a.academic_doc,

        s.student_id,
        s.full_name AS student_name,
        s.email AS student_email,
        s.phone_number,
        s.department,
        s.faculty,
        s.skills,

        i.internship_id,
        i.title AS internship_title,
        i.description AS internship_description,
        i.location AS internship_location

      FROM application a
      JOIN student s ON a.student_id = s.student_id
      JOIN internship i ON a.internship_id = i.internship_id
      WHERE a.application_id = ?
        AND i.company_id = ?
    `;

    const [application] = await db.query(query, [application_id, company_id]);

    if (application.length === 0) {
      return res.status(404).json({
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
  const connection = await db.getConnection();

  try {
    const { application_id } = req.params;
    const company_id = req.user.company_id;

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT 
        a.application_id,
        a.status AS application_status,
        a.student_id,
        a.internship_id,
        i.company_id,
        i.title AS internship_title,
        i.start_date,
        c.company_name
      FROM application a
      JOIN internship i 
        ON a.internship_id = i.internship_id
      JOIN company c
        ON i.company_id = c.company_id
      WHERE a.application_id = ?
        AND i.company_id = ?
      FOR UPDATE
      `,
      [application_id, company_id],
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (!isPendingApplication(rows[0].application_status)) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Only pending applications can be accepted",
      });
    }

    const {
      student_id,
      internship_id,
      company_id: applicationCompanyId,
      internship_title,
      start_date,
      company_name,
    } = rows[0];
    const internshipStartDate = start_date || null;
    const placementStatus =
      internshipStartDate && new Date(internshipStartDate) > new Date()
        ? PLACEMENT_STATUS.ACCEPTED
        : PLACEMENT_STATUS.IN_PROGRESS;
    const currentAcademicYear = await getCurrentAcademicYear(connection);

    await connection.query(
      "SELECT student_id FROM student WHERE student_id = ? FOR UPDATE",
      [student_id],
    );

    const [currentInternships] = await connection.query(
      `
      SELECT
        si.internship_id,
        i.title AS internship_title,
        c.company_name,
        si.status
      FROM student_internship si
      JOIN internship i
        ON si.internship_id = i.internship_id
      LEFT JOIN company c
        ON si.company_id = c.company_id
      WHERE si.student_id = ?
        AND si.internship_id <> ?
        AND si.academic_year_id = ?
        AND si.cohort_status = 'current'
        AND LOWER(si.status) IN (?, ?, ?)
      LIMIT 1
      FOR UPDATE
      `,
      [
        student_id,
        internship_id,
        currentAcademicYear.academic_year_id,
        ...CURRENT_PLACEMENT_STATUSES,
      ],
    );

    if (currentInternships.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: `This student already has a current internship${currentInternships[0].internship_title ? `: ${currentInternships[0].internship_title}` : ""}.`,
        current_internship: currentInternships[0],
      });
    }

    await connection.query(
      "UPDATE application SET status = ? WHERE application_id = ?",
      [APPLICATION_STATUS.ACCEPTED, application_id],
    );

    const [existingPlacement] = await connection.query(
      `
      SELECT id
      FROM student_internship
      WHERE student_id = ? AND internship_id = ?
        AND academic_year_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [student_id, internship_id, currentAcademicYear.academic_year_id],
    );

    if (existingPlacement.length === 0) {
      await connection.query(
        `INSERT INTO student_internship 
        (student_id, internship_id, company_id, status, start_date, academic_year_id, cohort_status)
        VALUES (?, ?, ?, ?, ?, ?, 'current')`,
        [
          student_id,
          internship_id,
          applicationCompanyId,
          placementStatus,
          internshipStartDate,
          currentAcademicYear.academic_year_id,
        ],
      );
    } else {
      await connection.query(
        `
        UPDATE student_internship
        SET status = ?, start_date = ?, cohort_status = 'current'
        WHERE id = ?
        `,
        [placementStatus, internshipStartDate, existingPlacement[0].id],
      );
    }

    await connection.query(
      `
      UPDATE application
      SET status = ?
      WHERE student_id = ?
        AND internship_id <> ?
        AND LOWER(status) = ?
      `,
      [
        APPLICATION_STATUS.WITHDRAWN,
        student_id,
        internship_id,
        APPLICATION_STATUS.PENDING,
      ],
    );

    await connection.commit();

    await createNotification({
      recipientRole: "student",
      recipientId: student_id,
      title: "Application accepted",
      message: `${company_name || "A company"} accepted your application for ${internship_title || "an internship"}.`,
      type: "application",
      link: "/student/my-applications",
    });

    res.status(200).json({
      success: true,
      message: "Application accepted and internship assigned",
    });
  } catch (error) {
    await connection.rollback().catch(() => null);

    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        message: "This student already has this internship placement.",
      });
    }

    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to accept application" });
  } finally {
    connection.release();
  }
};

const reject = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { application_id } = req.params;
    const company_id = req.user.company_id;

    if (!application_id) {
      return res
        .status(400)
        .json({ success: false, message: "Application ID is required" });
    }

    await connection.beginTransaction();

    const [existing] = await connection.query(
      `
      SELECT
        a.application_id,
        a.status AS application_status,
        a.student_id,
        i.title AS internship_title,
        c.company_name
      FROM application a
      JOIN internship i
        ON a.internship_id = i.internship_id
      JOIN company c
        ON i.company_id = c.company_id
      WHERE a.application_id = ? AND i.company_id = ?
      FOR UPDATE
      `,
      [application_id, company_id],
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    if (!isPendingApplication(existing[0].application_status)) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Only pending applications can be rejected",
      });
    }

    await connection.query(
      "UPDATE application SET status = ? WHERE application_id = ?",
      [APPLICATION_STATUS.REJECTED, application_id],
    );

    await connection.commit();

    await createNotification({
      recipientRole: "student",
      recipientId: existing[0].student_id,
      title: "Application rejected",
      message: `${existing[0].company_name || "A company"} rejected your application for ${existing[0].internship_title || "an internship"}.`,
      type: "application",
      link: "/student/my-applications",
    });

    res
      .status(200)
      .json({ success: true, message: "Application rejected successfully" });
  } catch (error) {
    await connection.rollback().catch(() => null);
    console.error("Reject application error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reject application" });
  } finally {
    connection.release();
  }
};

const assignMentor = async (req, res) => {
  let connection;

  try {
    await ensureCompanyMentorCompanyColumn();
    connection = await db.getConnection();

    const company_id = req.user.company_id;
    const { student_internship_id, company_mentor_id, student_id, mentor_id } =
      req.body;

    const resolvedMentorId = company_mentor_id || mentor_id;
    let resolvedInternshipId = student_internship_id;

    if ((!resolvedInternshipId && !student_id) || !resolvedMentorId) {
      return res.status(400).json({
        success: false,
        message:
          "Student internship reference and company mentor ID are required",
      });
    }

    await connection.beginTransaction();

    if (!resolvedInternshipId && student_id) {
      const [placements] = await connection.query(
        `
        SELECT id
        FROM student_internship
        WHERE student_id = ?
          AND company_id = ?
          AND cohort_status = 'current'
          AND LOWER(status) IN (?, ?, ?)
        ORDER BY id DESC
        LIMIT 1
        FOR UPDATE
        `,
        [student_id, company_id, ...CURRENT_PLACEMENT_STATUSES],
      );

      if (placements.length === 0) {
        await connection.rollback();
        return res
          .status(404)
          .json({ success: false, message: "Student internship not found" });
      }

      resolvedInternshipId = placements[0].id;
    }

    // Check if student_internship exists
    const [existing] = await connection.query(
      `SELECT id, student_id, internship_id, company_id, company_mentor_id
       FROM student_internship
       WHERE id = ?
         AND company_id = ?
         AND cohort_status = 'current'
         AND LOWER(status) IN (?, ?, ?)
       FOR UPDATE`,
      [resolvedInternshipId, company_id, ...CURRENT_PLACEMENT_STATUSES],
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Student internship not found" });
    }

    const [mentor] = await connection.query(
      `SELECT *
       FROM company_mentor
       WHERE company_mentor_id = ?
         AND company_id = ?
         AND account_status = 'active'
       FOR UPDATE`,
      [resolvedMentorId, company_id],
    );

    if (mentor.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Active company mentor not found" });
    }

    if (
      String(existing[0].company_mentor_id || "") !== String(resolvedMentorId)
    ) {
      const [assignedRows] = await connection.query(
        `SELECT id
         FROM student_internship
         WHERE company_mentor_id = ?
           AND company_id = ?
           AND COALESCE(cohort_status, 'current') = 'current'
           AND LOWER(status) IN (?, ?, ?)
         FOR UPDATE`,
        [resolvedMentorId, company_id, ...CURRENT_PLACEMENT_STATUSES],
      );

      if (assignedRows.length >= MENTOR_STUDENT_LIMIT) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          message: `A company mentor can supervise a maximum of ${MENTOR_STUDENT_LIMIT} students`,
          assigned_students: assignedRows.length,
          limit: MENTOR_STUDENT_LIMIT,
        });
      }
    }

    // Assign the mentor
    await connection.query(
      "UPDATE student_internship SET company_mentor_id = ? WHERE id = ?",
      [resolvedMentorId, resolvedInternshipId],
    );

    await recordCompanyMentorAssignment({
      connection,
      studentInternshipId: existing[0].id,
      studentId: existing[0].student_id,
      internshipId: existing[0].internship_id,
      companyId: existing[0].company_id,
      oldCompanyMentorId: existing[0].company_mentor_id || null,
      newCompanyMentorId: resolvedMentorId,
      changedByCompanyId: company_id,
      action: existing[0].company_mentor_id ? "reassigned" : "assigned",
    });

    await connection.commit();

    res
      .status(200)
      .json({ success: true, message: "Mentor assigned successfully" });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => null);
    console.error("Assign mentor error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to assign mentor" });
  } finally {
    if (connection) connection.release();
  }
};

const postEvaluation = async (req, res) => {
  try {
    const { assessment, attendanceData } = req.body;
    const { internship_id } = req.params;
    const company = req.user.company_name;

    /* ================= FETCH STUDENT ================= */
    const [[student]] = await db.query(
      `
      SELECT 
          s.*,
          si.start_date AS placement_start_date,
          si.end_date AS placement_end_date,
          i.start_date AS internship_start_date,
          i.end_date AS internship_end_date,
          cm.full_name AS supervisor
      FROM student s
      JOIN student_internship si 
          ON s.student_id = si.student_id
      JOIN internship i
          ON si.internship_id = i.internship_id
      JOIN company_mentor cm
          ON si.company_mentor_id = cm.company_mentor_id
      WHERE si.internship_id = ?
      `,
      [internship_id],
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const attendanceValidation = validateAttendanceRecordsForInternship({
      attendanceData,
      startDate: student.placement_start_date || student.internship_start_date,
      endDate: student.placement_end_date || student.internship_end_date,
    });

    if (!attendanceValidation.valid) {
      return res.status(400).json({
        success: false,
        message: attendanceValidation.message,
        expected_months: attendanceValidation.expectedMonths,
        submitted_months: attendanceValidation.submittedMonths,
      });
    }

    const assessmentPath = await generateAssessmentPDF({
      student,
      assessment,
      company,
    });

    const assessmentBuffer = fs.readFileSync(assessmentPath);

    const assessmentURL = await uploadToCloudinary(
      assessmentBuffer,
      "internship/assessment",
      `${student.student_id}_assessment.pdf`,
    );

    // const assessmentURL = await uploadToCloudinary(
    //   assessmentPath,
    //   "internship/assessment"
    // );

    const attendancePath = await generateAttendancePDF({
      student,
      attendanceData,
      company,
    });

    const attendanceBuffer = fs.readFileSync(attendancePath);

    const attendanceURL = await uploadToCloudinary(
      attendanceBuffer,
      "internship/attendance",
      `${student.student_id}_attendance.pdf`,
    );

    fs.unlinkSync(assessmentPath);
    fs.unlinkSync(attendancePath);

    /* ================= CALCULATE TOTAL ================= */
    const totalMark =
      Object.values(assessment.general).reduce((a, b) => a + b, 0) +
      Object.values(assessment.personal).reduce((a, b) => a + b, 0) +
      Object.values(assessment.professional).reduce((a, b) => a + b, 0);

    /* ================= SAVE TO DATABASE ================= */
    await db.query(
      `
      INSERT INTO internship_evaluation
      (student_id, internship_id, assessment_pdf_url, attendance_pdf_url, total_mark)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        student.student_id,
        internship_id,
        assessmentURL,
        attendanceURL,
        totalMark,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Evaluation submitted successfully",
      assessment_pdf: assessmentURL,
      attendance_pdf: attendanceURL,
      total_mark: totalMark,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to submit evaluation",
    });
  }
};

const activeInternships = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    if (!company_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const [rows] = await db.query(
      `
      SELECT 
        i.internship_id,
        i.title,
        i.description,
        i.start_date,
        i.end_date,
        i.skills,
        i.skills AS requirements,
        i.department,
        i.location,
        i.status,

        COUNT(CASE WHEN si.status = 'in progress' AND si.cohort_status = 'current' THEN si.student_id END) AS active_students,
        COUNT(CASE
          WHEN LOWER(COALESCE(si.status, '')) IN ('accepted', 'in progress', 'active', 'completed', 'complete')
          THEN si.student_id
        END) AS locked_students,
        COUNT(DISTINCT si.id) AS placement_count,
        (
          SELECT COUNT(*)
          FROM application a
          WHERE a.internship_id = i.internship_id
        ) AS application_count

      FROM internship i
      LEFT JOIN student_internship si 
        ON i.internship_id = si.internship_id

      WHERE i.company_id = ?

      GROUP BY i.internship_id
      ORDER BY i.internship_id DESC
      `,
      [company_id],
    );

    const internships = rows.map((internship) => {
      const lockedStudents = Number(internship.locked_students || 0);
      const placementCount = Number(internship.placement_count || 0);
      const applicationCount = Number(internship.application_count || 0);
      const is_locked =
        lockedStudents > 0 || placementCount > 0 || applicationCount > 0;

      return {
        ...internship,
        locked_students: lockedStudents,
        placement_count: placementCount,
        application_count: applicationCount,
        is_locked,
        can_edit: !is_locked,
        can_delete: !is_locked,
      };
    });

    res.status(200).json({
      success: true,
      count: internships.length,
      internships,
    });
  } catch (error) {
    console.error("Active internships error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active internships",
    });
  }
};

const registerCompany = async (req, res) => {
  try {
    const {
      orgName,
      orgType,
      industry,
      website,
      orgEmail,
      orgPhone,
      address,
      city,
      region,
      password,
      confirmPassword,
      agreed,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (!agreed) {
      return res.status(400).json({
        success: false,
        message: "You must accept terms",
      });
    }

    const agreedValue = agreed === "true" || agreed === true ? 1 : 0;

    const hashedPassword = await bcrypt.hash(password, 10);

    /* ===== Upload Files ===== */

    let profileURL = null;
    let licenseURL = null;

    if (req.files?.profileFile) {
      profileURL = await uploadToCloudinary(
        req.files.profileFile[0].buffer,
        "company/profile",
      );
    }

    if (req.files?.licenseFile) {
      licenseURL = await uploadToCloudinary(
        req.files.licenseFile[0].buffer,
        "company/license",
      );
    }

    /* ===== Insert into DB ===== */

    const [result] = await db.query(
      `
      INSERT INTO company
      (company_name, company_type, industry, website, email, phone_number,
       location, city, region, password, profile_pic, license_url, agreed, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        orgName,
        orgType,
        industry,
        website,
        orgEmail,
        orgPhone,
        address,
        city,
        region,
        hashedPassword,
        profileURL,
        licenseURL,
        agreedValue,
      ],
    );

    await createLog(
      result.insertId,
      "COMPANY_REGISTERED",
      `Company registration submitted by ${orgName} (${orgEmail})`,
    );

    res.status(201).json({
      success: true,
      message: "Company registered successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export {
  postInternship,
  accept,
  reject,
  deleteInternship,
  updateInternship,
  getProfile,
  getCompanyMentors,
  createCompanyMentor,
  updateCompanyMentor,
  deleteCompanyMentor,
  getApplications,
  postEvaluation,
  assignMentor,
  updateProfile,
  viewApplication,
  activeInternships,
  registerCompany,
  deleteAccount,
};
