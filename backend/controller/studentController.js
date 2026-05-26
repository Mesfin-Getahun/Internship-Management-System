import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import createLog from "../utils/createLog.js";
import { createNotification } from "../utils/notificationService.js";
import { ensureMentorFeedbackAttachmentColumns } from "../utils/mentorFeedbackSchema.js";
import { ensureInternshipEvaluationMentorColumns } from "../utils/internshipEvaluationSchema.js";
import { ensureCompanyRatingTables } from "../utils/companyRatingSchema.js";
import {
  APPLICATION_STATUS,
  PLACEMENT_STATUS,
  REPORT_STATUS,
  isPendingApplication,
} from "../utils/statusRules.js";

function isMissingTableError(error, tableName) {
  return (
    error?.code === "ER_NO_SUCH_TABLE" &&
    (!tableName || error?.sqlMessage?.includes(`'${tableName}'`))
  );
}

function isDuplicateKeyError(error) {
  return error?.code === "ER_DUP_ENTRY" || error?.errno === 1062;
}

const getExistingTable = async (tableNames) => {
  for (const tableName of tableNames) {
    const [rows] = await db.query("SHOW TABLES LIKE ?", [tableName]);
    if (rows.length > 0) return tableName;
  }

  return null;
};

const getTableColumns = async (tableName) => {
  const [rows] = await db.query(`SHOW COLUMNS FROM \`${tableName}\``);
  return new Set(rows.map((row) => row.Field));
};

const getPaymentTableInfo = async () => {
  let tableName = await getExistingTable(["payments", "payment"]);

  if (!tableName) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        payment_id INT NOT NULL AUTO_INCREMENT,
        student_id VARCHAR(20) NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        account_holder_name VARCHAR(150) NOT NULL,
        account_number VARCHAR(50) NOT NULL,
        submitted_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (payment_id),
        KEY student_id (student_id)
      )
    `);
    tableName = "payments";
  }

  return {
    tableName,
    columns: await getTableColumns(tableName),
  };
};

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

const splitTerms = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap(splitTerms);
  }

  if (typeof value === "object") {
    return Object.values(value).flatMap(splitTerms);
  }

  const raw = String(value).trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) || typeof parsed === "object") {
      return splitTerms(parsed);
    }
  } catch {
    // Plain comma-separated text is handled below.
  }

  return raw
    .split(/[,;|/]+/)
    .map((term) => term.trim().toLowerCase().replace(/\s+/g, " "))
    .filter(Boolean);
};

const uniqueTerms = (terms) => Array.from(new Set(terms.filter(Boolean)));

const departmentProfileTerms = (department) => {
  const normalized = normalizeDepartment(department);

  if (TWO_MONTH_DEPARTMENTS.has(normalized)) {
    return [
      "software",
      "web",
      "developer",
      "development",
      "programming",
      "database",
      "network",
      "cyber",
      "technology",
      "system",
    ];
  }

  return [];
};

const getStudentProfileTerms = (student = {}) =>
  uniqueTerms([
    normalizeDepartment(student.department),
    ...(student.faculty ? [normalizeDepartment(student.faculty)] : []),
    ...departmentProfileTerms(student.department),
    ...splitTerms(student.skills),
    ...splitTerms(student.technical_skills),
    ...splitTerms(student.soft_skills),
    ...splitTerms(student.languages),
  ]);

const internshipMatchesStudentProfile = (internship = {}, student = {}) => {
  const studentDepartment = normalizeDepartment(student.department);
  const internshipDepartment = normalizeDepartment(internship.department);
  const profileTerms = getStudentProfileTerms(student);
  const internshipTerms = uniqueTerms([
    internshipDepartment,
    ...splitTerms(internship.skills),
    ...splitTerms(internship.requirements),
    ...splitTerms(internship.title),
    ...splitTerms(internship.description),
  ]);

  const targetDepartmentMatched =
    Boolean(studentDepartment && internshipDepartment) &&
    (studentDepartment === internshipDepartment ||
      studentDepartment.includes(internshipDepartment) ||
      internshipDepartment.includes(studentDepartment));

  const matchedSkills = profileTerms.filter((term) =>
    internshipTerms.some(
      (internshipTerm) =>
        internshipTerm === term ||
        internshipTerm.includes(term) ||
        term.includes(internshipTerm),
    ),
  );

  const isGeneralPost = !internshipDepartment;
  const isRelated = targetDepartmentMatched || matchedSkills.length > 0;

  return {
    is_profile_related: isRelated,
    target_department_matched: targetDepartmentMatched,
    is_general_post: isGeneralPost,
    matched_profile_terms: matchedSkills,
    match_score:
      (targetDepartmentMatched ? 5 : 0) +
      matchedSkills.length * 2 +
      (isGeneralPost ? 1 : 0),
  };
};

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

const CURRENT_INTERNSHIP_STATUSES = [
  PLACEMENT_STATUS.IN_PROGRESS,
  PLACEMENT_STATUS.ACCEPTED,
  PLACEMENT_STATUS.ACTIVE,
];
const INTERNSHIP_CANCEL_WINDOW_DAYS = 7;

const addDays = (date, days) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setDate(parsed.getDate() + days);
  return parsed;
};

const getInternshipCancellationState = (placement) => {
  const startDate = placement?.placement_start_date || placement?.start_date;
  const deadline = addDays(startDate, INTERNSHIP_CANCEL_WINDOW_DAYS);

  if (!deadline) {
    return {
      can_cancel_current_internship: false,
      cancellation_deadline: null,
      cancellation_window_days: INTERNSHIP_CANCEL_WINDOW_DAYS,
    };
  }

  deadline.setHours(23, 59, 59, 999);

  return {
    can_cancel_current_internship: new Date() <= deadline,
    cancellation_deadline: deadline.toISOString(),
    cancellation_window_days: INTERNSHIP_CANCEL_WINDOW_DAYS,
  };
};

const getStudentCurrentInternshipLock = async (studentId) => {
  const [rows] = await db.query(
    `
    SELECT
      source,
      internship_id,
      internship_title,
      company_name,
      status,
      placement_id,
      placement_start_date
    FROM (
      SELECT
        'placement' AS source,
        si.internship_id,
        i.title AS internship_title,
        c.company_name,
        si.status,
        si.id AS placement_id,
        si.start_date AS placement_start_date
      FROM student_internship si
      JOIN internship i
        ON si.internship_id = i.internship_id
      LEFT JOIN company c
        ON si.company_id = c.company_id
      WHERE si.student_id = ?
        AND si.cohort_status = 'current'
        AND LOWER(si.status) IN (?, ?, ?)

      UNION ALL

      SELECT
        'application' AS source,
        a.internship_id,
        i.title AS internship_title,
        c.company_name,
        a.status,
        NULL AS placement_id,
        NULL AS placement_start_date
      FROM application a
      JOIN internship i
        ON a.internship_id = i.internship_id
      LEFT JOIN company c
        ON i.company_id = c.company_id
      WHERE a.student_id = ?
        AND LOWER(a.status) = 'accepted'
    ) current_internship
    LIMIT 1
    `,
    [studentId, ...CURRENT_INTERNSHIP_STATUSES, studentId],
  );

  if (!rows[0]) return null;

  return {
    ...rows[0],
    ...getInternshipCancellationState(rows[0]),
  };
};

const fetchInternships = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    const [[student]] = await db.query(
      `
      SELECT department, faculty, skills, technical_skills, soft_skills, languages
      FROM student
      WHERE student_id = ?
      `,
      [student_id],
    );

    const query = `
       SELECT i.*, c.company_name, COALESCE(i.location, c.location) AS location
      FROM internship i
      JOIN company c ON i.company_id = c.company_id
      WHERE i.status = 'approved'
    `;

    const [internships] = await db.query(query);
    const currentInternshipLock = await getStudentCurrentInternshipLock(student_id);
    const internshipsWithEligibility = internships
      .map((internship) => ({
        ...withDurationEligibility(internship, student?.department),
        ...internshipMatchesStudentProfile(internship, student),
        application_locked: Boolean(currentInternshipLock),
        current_internship_title: currentInternshipLock?.internship_title || null,
        current_internship_company: currentInternshipLock?.company_name || null,
      }))
      .filter((internship) => internship.is_profile_related)
      .sort((a, b) => b.match_score - a.match_score);

    res.status(200).json({
      success: true,
      internships: internshipsWithEligibility,
      application_locked: Boolean(currentInternshipLock),
      current_internship: currentInternshipLock,
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
      `
      SELECT department, faculty, skills, technical_skills, soft_skills, languages, preferred_location
      FROM student
      WHERE student_id = ?
      `,
      [student_id]
    );

    const [internships] = await db.query(
      `
      SELECT i.*, c.company_name
      FROM internship i
      JOIN company c ON i.company_id = c.company_id
      WHERE i.status = 'approved'
      `
    );

    const suggestions = internships.map((internship) => {
      const relevance = internshipMatchesStudentProfile(internship, student);
      let score = relevance.match_score;

      if (
        student.preferred_location &&
        internship.location === student.preferred_location
      ) {
        score += 1;
      }

      return {
        ...withDurationEligibility(internship, student.department),
        ...relevance,
        internship_id: internship.internship_id,
        title: internship.title,
        company: internship.company_name,
        location: internship.location,
        matched_skills: relevance.matched_profile_terms,
        match_score: score,
      };
    }).filter((internship) => internship.is_profile_related);

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
        s.department AS student_department,
        s.faculty,
        s.skills,
        s.technical_skills,
        s.soft_skills,
        s.languages,
        i.internship_id,
        i.company_id,
        i.title,
        i.description,
        i.department AS internship_department,
        i.skills AS internship_skills,
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

    const relevance = internshipMatchesStudentProfile(
      {
        ...eligibility,
        skills: eligibility.internship_skills,
        department: eligibility.internship_department,
      },
      { ...eligibility, department: eligibility.student_department },
    );

    if (!relevance.is_profile_related) {
      return res.status(403).json({
        success: false,
        message: "This internship is not related to your department or profile skills.",
        relevance,
      });
    }

    const currentInternshipLock = await getStudentCurrentInternshipLock(student_id);

    if (currentInternshipLock) {
      return res.status(409).json({
        success: false,
        message: `You already have a current internship${currentInternshipLock.internship_title ? `: ${currentInternshipLock.internship_title}` : ""}. You cannot apply for another internship until it is completed.`,
        current_internship: currentInternshipLock,
      });
    }

    const [existingApplications] = await db.query(
      `
      SELECT application_id, status
      FROM application
      WHERE student_id = ?
        AND internship_id = ?
        AND LOWER(status) IN ('pending', 'accepted')
      LIMIT 1
      `,
      [student_id, internship_id],
    );

    if (existingApplications.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You already have an active application for this internship.",
      });
    }

    const requiredMonths = requiredInternshipMonths(eligibility.student_department);
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
       VALUES (?, ?, CURDATE(), ?, ?, ?, ?)`,
      [
        student_id,
        internship_id,
        APPLICATION_STATUS.PENDING,
        statement,
        cvUrl,
        academicUrl,
      ]
    );

    await createNotification({
      recipientRole: "company",
      recipientId: eligibility.company_id,
      title: "New internship application",
      message: `${req.user.full_name || student_id} applied for ${eligibility.title || "your internship"}.`,
      type: "application",
      link: "/organization/applications",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted this item.",
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to apply for internship",
    });
  }
};

const cancelApplication = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const student_id = req.user.student_id; // from auth middleware
    const application_id = req.params.application_id || req.params.id;

    if (!application_id) {
      return res
        .status(400)
        .json({ success: false, message: "Application ID is required" });
    }

    await connection.beginTransaction();

    // Check if application exists and belongs to this student
    const [existing] = await connection.query(
      "SELECT application_id, status FROM application WHERE application_id = ? AND student_id = ? FOR UPDATE",
      [application_id, student_id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Application not found or you are not authorized",
      });
    }

    if (!isPendingApplication(existing[0].status)) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Only pending applications can be cancelled from this screen.",
      });
    }

    await connection.query(
      "UPDATE application SET status = ? WHERE application_id = ?",
      [APPLICATION_STATUS.CANCELLED, application_id],
    );

    await connection.commit();

    res
      .status(200)
      .json({ success: true, message: "Application cancelled successfully" });
  } catch (error) {
    await connection.rollback().catch(() => null);
    console.error("Cancel application error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to cancel application" });
  } finally {
    connection.release();
  }
};

const cancelCurrentInternship = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const student_id = req.user.student_id;
    const { placement_id } = req.params;

    if (!placement_id) {
      return res.status(400).json({
        success: false,
        message: "Placement ID is required",
      });
    }

    await connection.beginTransaction();

    const [placements] = await connection.query(
      `
      SELECT
        si.id,
        si.student_id,
        si.internship_id,
        si.company_id,
        si.status,
        si.start_date AS placement_start_date,
        i.title AS internship_title,
        c.company_name
      FROM student_internship si
      JOIN internship i
        ON si.internship_id = i.internship_id
      LEFT JOIN company c
        ON si.company_id = c.company_id
      WHERE si.id = ?
        AND si.student_id = ?
        AND LOWER(si.status) IN (?, ?, ?)
        AND si.cohort_status = 'current'
      LIMIT 1
      FOR UPDATE
      `,
      [placement_id, student_id, ...CURRENT_INTERNSHIP_STATUSES],
    );

    if (placements.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Current internship placement not found or cannot be cancelled",
      });
    }

    const placement = placements[0];
    const cancellationState = getInternshipCancellationState(placement);

    if (!cancellationState.can_cancel_current_internship) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: `You can only cancel a current internship within ${INTERNSHIP_CANCEL_WINDOW_DAYS} days of the placement start date.`,
        cancellation_deadline: cancellationState.cancellation_deadline,
      });
    }

    const [[activity]] = await connection.query(
      `
      SELECT
        (SELECT COUNT(*)
         FROM internship_report
         WHERE student_id = ?
           AND internship_id = ?) AS report_count,
        (SELECT COUNT(*)
         FROM internship_evaluation
         WHERE student_id = ?
           AND internship_id = ?) AS evaluation_count
      `,
      [student_id, placement.internship_id, student_id, placement.internship_id],
    );

    if (Number(activity?.report_count || 0) > 0 || Number(activity?.evaluation_count || 0) > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "This internship already has reports or evaluations, so it cannot be cancelled as an early unsuitable placement.",
      });
    }

    await connection.query(
      `
      UPDATE student_internship
      SET status = ?,
          end_date = COALESCE(end_date, CURRENT_DATE())
      WHERE id = ?
      `,
      [PLACEMENT_STATUS.CANCELLED, placement_id],
    );

    await connection.query(
      `
      UPDATE application
      SET status = ?
      WHERE student_id = ?
        AND internship_id = ?
        AND LOWER(status) = ?
      `,
      [
        APPLICATION_STATUS.CANCELLED,
        student_id,
        placement.internship_id,
        APPLICATION_STATUS.ACCEPTED,
      ],
    );

    await connection.commit();

    await createNotification({
      recipientRole: "company",
      recipientId: placement.company_id,
      title: "Internship placement cancelled",
      message: `${req.user.full_name || student_id} cancelled the placement for ${placement.internship_title || "your internship"} within the early cancellation window.`,
      type: "application",
      link: "/organization/applications",
    }).catch(() => null);

    res.status(200).json({
      success: true,
      message: "Current internship cancelled successfully. You may now apply for another internship.",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Cancel current internship error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel current internship",
    });
  } finally {
    connection.release();
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

const getStudentEvaluations = async (req, res) => {
  try {
    await ensureInternshipEvaluationMentorColumns();

    const student_id = req.user.student_id;

    const [evaluations] = await db.query(
      `
      SELECT
        ie.evaluation_id,
        ie.evaluation_id AS internship_evaluation_id,
        ie.student_id,
        ie.internship_id,
        ie.company_mentor_id,
        ie.assessment_pdf_url,
        ie.attendance_pdf_url,
        ie.total_mark,
        ie.submitted_at,
        ie.submitted_at AS created_at,
        i.title AS internship_title,
        c.company_name,
        cm.full_name AS company_mentor_name
      FROM internship_evaluation ie
      LEFT JOIN internship i
        ON ie.internship_id = i.internship_id
      LEFT JOIN company c
        ON i.company_id = c.company_id
      LEFT JOIN company_mentor cm
        ON ie.company_mentor_id = cm.company_mentor_id
      WHERE ie.student_id = ?
      ORDER BY ie.submitted_at DESC, ie.evaluation_id DESC
      `,
      [student_id],
    );

    res.status(200).json({
      success: true,
      evaluations,
    });
  } catch (error) {
    console.error("Fetch student evaluations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch evaluations",
    });
  }
};

const getCompanyRatingOptions = async (req, res) => {
  try {
    await ensureCompanyRatingTables();

    const student_id = req.user.student_id;

    const [placements] = await db.query(
      `
      SELECT
        si.id AS student_internship_id,
        si.student_id,
        si.internship_id,
        si.company_id,
        si.status AS placement_status,
        si.cohort_status,
        si.end_date AS placement_end_date,
        i.title AS internship_title,
        i.end_date AS internship_end_date,
        c.company_name,
        ie.evaluation_id,
        ie.submitted_at AS evaluation_submitted_at,
        r.report_id,
        r.faculty_submitted_at,
        cr.rating_id,
        cr.rating,
        cr.comment,
        cr.created_at AS rating_created_at,
        cr.updated_at AS rating_updated_at
      FROM student_internship si
      JOIN internship i
        ON si.internship_id = i.internship_id
      JOIN company c
        ON si.company_id = c.company_id
      LEFT JOIN internship_evaluation ie
        ON ie.student_id = si.student_id
       AND ie.internship_id = si.internship_id
      LEFT JOIN internship_report r
        ON r.student_id = si.student_id
       AND r.internship_id = si.internship_id
      LEFT JOIN company_rating cr
        ON cr.student_id = si.student_id
       AND cr.internship_id = si.internship_id
       AND cr.company_id = si.company_id
      WHERE si.student_id = ?
        AND (
          LOWER(si.status) IN ('completed', 'complete')
          OR COALESCE(si.end_date, i.end_date) <= CURDATE()
          OR ie.evaluation_id IS NOT NULL
          OR r.faculty_submitted_at IS NOT NULL
          OR r.status = 'faculty_submitted'
        )
      ORDER BY COALESCE(si.end_date, ie.submitted_at, r.faculty_submitted_at, si.start_date) DESC, si.id DESC
      `,
      [student_id],
    );

    res.status(200).json({
      success: true,
      count: placements.length,
      placements,
    });
  } catch (error) {
    console.error("Fetch company rating options error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch company rating options",
    });
  }
};

const submitCompanyRating = async (req, res) => {
  try {
    await ensureCompanyRatingTables();

    const student_id = req.user.student_id;
    const { internship_id, company_id, rating, comment } = req.body;
    const numericRating = Number(rating);
    const cleanComment = String(comment || "").trim();

    if (!internship_id || !company_id) {
      return res.status(400).json({
        success: false,
        message: "Internship and company are required",
      });
    }

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number from 1 to 5",
      });
    }

    if (!cleanComment) {
      return res.status(400).json({
        success: false,
        message: "A comment is required",
      });
    }

    const [[placement]] = await db.query(
      `
      SELECT
        si.id,
        si.student_id,
        si.internship_id,
        si.company_id,
        si.status,
        si.end_date AS placement_end_date,
        i.title AS internship_title,
        i.end_date AS internship_end_date,
        c.company_name,
        ie.evaluation_id,
        r.faculty_submitted_at,
        r.status AS report_status
      FROM student_internship si
      JOIN internship i
        ON si.internship_id = i.internship_id
      JOIN company c
        ON si.company_id = c.company_id
      LEFT JOIN internship_evaluation ie
        ON ie.student_id = si.student_id
       AND ie.internship_id = si.internship_id
      LEFT JOIN internship_report r
        ON r.student_id = si.student_id
       AND r.internship_id = si.internship_id
      WHERE si.student_id = ?
        AND si.internship_id = ?
        AND si.company_id = ?
      LIMIT 1
      `,
      [student_id, internship_id, company_id],
    );

    const completedByStatus = ["completed", "complete"].includes(
      String(placement?.status || "").toLowerCase(),
    );
    const completedByEndDate = Boolean(
      placement?.placement_end_date || placement?.internship_end_date,
    ) && new Date(placement.placement_end_date || placement.internship_end_date) <= new Date();
    const completedByEvidence =
      Boolean(placement?.evaluation_id) ||
      Boolean(placement?.faculty_submitted_at) ||
      placement?.report_status === REPORT_STATUS.FACULTY_SUBMITTED;

    if (!placement || (!completedByStatus && !completedByEndDate && !completedByEvidence)) {
      return res.status(403).json({
        success: false,
        message: "You can rate a company only after finishing the internship",
      });
    }

    await db.query(
      `
      INSERT INTO company_rating
        (student_id, internship_id, company_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rating = VALUES(rating),
        comment = VALUES(comment),
        updated_at = CURRENT_TIMESTAMP
      `,
      [student_id, internship_id, company_id, numericRating, cleanComment],
    );

    res.status(200).json({
      success: true,
      message: "Company rating submitted successfully",
    });
  } catch (error) {
    console.error("Submit company rating error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit company rating",
    });
  }
};

const myInternship = async (req, res) => {
  try {
    const studentId = req.user.student_id;

    const [rows] = await db.query(
      `
      SELECT 
        si.id AS student_internship_id,
        i.internship_id,
        i.title,
        i.description,
        i.start_date,
        i.end_date,
        si.start_date AS placement_start_date,
        si.end_date AS placement_end_date,
        i.skills,
        c.company_name,
        COALESCE(i.location, c.location) AS location,
        si.status,
        si.company_mentor_id,
        cm.full_name AS company_mentor_name,
        s.faculty,
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
        AND LOWER(si.status) IN ('in progress', 'accepted', 'active')
        AND si.cohort_status = 'current'
      ORDER BY
        CASE
          WHEN LOWER(si.status) IN ('in progress', 'active') THEN 0
          WHEN LOWER(si.status) = 'accepted' THEN 1
          ELSE 2
        END,
        CASE WHEN si.company_mentor_id IS NULL THEN 1 ELSE 0 END,
        si.id DESC,
        i.start_date ASC
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
      internship: rows[0]
        ? {
            ...rows[0],
            ...getInternshipCancellationState(rows[0]),
          }
        : null,
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

    const [[activeInternship]] = await db.query(
      `
      SELECT si.internship_id, i.start_date, i.end_date, si.end_date AS placement_end_date
      FROM student_internship si
      JOIN internship i
        ON si.internship_id = i.internship_id
      WHERE si.student_id = ?
        AND si.internship_id = ?
        AND LOWER(si.status) IN (?, ?, ?)
        AND si.cohort_status = 'current'
      LIMIT 1
      `,
      [student_id, internship_id, ...CURRENT_INTERNSHIP_STATUSES],
    );

    if (!activeInternship) {
      return res.status(403).json({
        success: false,
        message: "You can only upload a report for your active internship.",
      });
    }

    const internshipEndDate = activeInternship.placement_end_date || activeInternship.end_date;

    if (!internshipEndDate || new Date(internshipEndDate) > new Date()) {
      return res.status(403).json({
        success: false,
        message: "You can submit an internship report only after the internship end date.",
      });
    }

    const [existingReports] = await db.query(
      `
      SELECT report_id
      FROM internship_report
      WHERE student_id = ?
        AND internship_id = ?
      LIMIT 1
      `,
      [student_id, internship_id],
    );

    if (existingReports.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted an internship report to your mentor.",
      });
    }

    const reportUrl = await uploadToCloudinary(
      req.file.buffer,
      "internship_reports/original",
      req.file.originalname
    );

    await db.query(
      `INSERT INTO internship_report
       (student_id, internship_id, report_url, status, submission_date)
       VALUES (?, ?, ?, ?, CURDATE())`,
      [student_id, internship_id, reportUrl, REPORT_STATUS.SUBMITTED]
    );

    const [[reportContext]] = await db.query(
      `
      SELECT s.assigned_mentor, i.title
      FROM student s
      LEFT JOIN internship i
        ON i.internship_id = ?
      WHERE s.student_id = ?
      `,
      [internship_id, student_id],
    );

    if (reportContext?.assigned_mentor) {
      await createNotification({
        recipientRole: "mentor",
        recipientId: reportContext.assigned_mentor,
        title: "New student report",
        message: `${req.user.full_name || student_id} uploaded a report for ${reportContext.title || "their internship"}.`,
        type: "report",
        link: "/mentor/student-submissions",
      });
    }

    res.json({ success: true, reportUrl });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted an internship report to your mentor.",
      });
    }

    console.log(error);
    res.status(500).json({ success: false });
  }
};

const getPaymentApplication = async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const paymentTable = await getPaymentTableInfo();

    if (!paymentTable) {
      return res.status(503).json({
        success: false,
        paymentFeatureAvailable: false,
        message: "Payment feature is unavailable because the payments table is missing.",
      });
    }

    const { tableName, columns } = paymentTable;
    const accountHolderColumn = columns.has("account_holder")
      ? "account_holder"
      : "account_holder_name";
    const dateColumn = columns.has("updated_at")
      ? "updated_at"
      : columns.has("created_at")
        ? "created_at"
        : columns.has("submitted_at")
          ? "submitted_at"
          : "payment_id";

    const [rows] = await db.query(
      `
      SELECT
        payment_id,
        student_id,
        bank_name,
        ${accountHolderColumn} AS account_holder,
        account_number
      FROM \`${tableName}\`
      WHERE student_id = ?
      ORDER BY ${dateColumn} DESC, payment_id DESC
      LIMIT 1
      `,
      [student_id],
    );

    res.status(200).json({
      success: true,
      payment: rows[0] || null,
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return res.status(200).json({
        success: true,
        payment: null,
        paymentFeatureAvailable: false,
        message: "Payment feature is not available because the payments table is missing.",
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

    const paymentTable = await getPaymentTableInfo();

    if (!paymentTable) {
      return res.status(503).json({
        success: false,
        paymentFeatureAvailable: false,
        message: "Payment feature is unavailable because the payments table is missing.",
      });
    }

    const { tableName, columns } = paymentTable;
    const accountHolderColumn = columns.has("account_holder")
      ? "account_holder"
      : "account_holder_name";
    const hasAcceptanceLetterColumn = columns.has("acceptance_letter_url");

    const [existing] = await db.query(
      `SELECT payment_id FROM \`${tableName}\` WHERE student_id = ? ORDER BY payment_id DESC LIMIT 1`,
      [student_id]
    );

    if (existing.length > 0) {
      const updateColumns = [
        "bank_name = ?",
        `${accountHolderColumn} = ?`,
        "account_number = ?",
      ];
      const values = [bankName, accountHolder, accountNumber];

      if (hasAcceptanceLetterColumn) {
        updateColumns.push("acceptance_letter_url = COALESCE(acceptance_letter_url, '')");
      }

      values.push(existing[0].payment_id);

      await db.query(
        `
        UPDATE \`${tableName}\`
        SET ${updateColumns.join(", ")}
        WHERE payment_id = ?
        `,
        values,
      );
    } else {
      const insertColumns = ["student_id", "bank_name", accountHolderColumn, "account_number"];
      const placeholders = ["?", "?", "?", "?"];
      const values = [student_id, bankName, accountHolder, accountNumber];

      if (hasAcceptanceLetterColumn) {
        insertColumns.push("acceptance_letter_url");
        placeholders.push("''");
      }

      await db.query(
        `
        INSERT INTO \`${tableName}\`
          (${insertColumns.join(", ")})
        VALUES
          (${placeholders.join(", ")})
        `,
        values,
      );
    }

    const dateColumn = columns.has("updated_at")
      ? "updated_at"
      : columns.has("created_at")
        ? "created_at"
        : columns.has("submitted_at")
          ? "submitted_at"
          : "payment_id";

    const [savedRows] = await db.query(
      `
      SELECT
        payment_id,
        student_id,
        bank_name,
        ${accountHolderColumn} AS account_holder,
        account_number
      FROM \`${tableName}\`
      WHERE student_id = ?
      ORDER BY ${dateColumn} DESC, payment_id DESC
      LIMIT 1
      `,
      [student_id],
    );

    res.status(200).json({
      success: true,
      message: "Payment application submitted successfully",
      payment: savedRows[0] || null,
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return res.status(503).json({
        success: false,
        paymentFeatureAvailable: false,
        message: "Payment feature is unavailable because the payments table is missing.",
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

    const [result] = await db.query(
      `UPDATE internship_report
       SET status = ?, faculty_submitted_at = NOW()
       WHERE report_id = ?
         AND student_id = ?
         AND status = ?
         AND mentor_signed_url IS NOT NULL
         AND faculty_submitted_at IS NULL`,
      [
        REPORT_STATUS.FACULTY_SUBMITTED,
        report_id,
        student_id,
        REPORT_STATUS.SIGNED,
      ]
    );

    if (result.affectedRows === 0) {
      const [[report]] = await db.query(
        `
        SELECT status, mentor_signed_url, faculty_submitted_at
        FROM internship_report
        WHERE report_id = ?
          AND student_id = ?
        LIMIT 1
        `,
        [report_id, student_id],
      );

      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Report not found.",
        });
      }

      if (
        report.faculty_submitted_at ||
        report.status === REPORT_STATUS.FACULTY_SUBMITTED
      ) {
        return res.status(409).json({
          success: false,
          message: "This report has already been submitted to faculty.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "The mentor must upload a signed report before you can submit it to faculty.",
      });
    }

    const [facultyUsers] = await db.query(
      `
      SELECT f.faculty_id, i.title
      FROM student s
      JOIN faculty f
        ON f.faculty_name = s.faculty
      LEFT JOIN internship_report r
        ON r.report_id = ?
      LEFT JOIN internship i
        ON r.internship_id = i.internship_id
      WHERE s.student_id = ?
      `,
      [report_id, student_id],
    );

    await Promise.all(
      facultyUsers.map((faculty) =>
        createNotification({
          recipientRole: "faculty",
          recipientId: faculty.faculty_id,
          title: "Signed report submitted",
          message: `${req.user.full_name || student_id} submitted a signed report${faculty.title ? ` for ${faculty.title}` : ""}.`,
          type: "report",
          link: "/faculty/reports",
        }),
      ),
    );

    res.json({ success: true, message: "Signed report submitted to faculty." });
  } catch (err) {
    console.error("Submit signed report to faculty error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit report to faculty.",
    });
  }
};

const feedbacks = async (req, res) => {
  try {
    await ensureMentorFeedbackAttachmentColumns();

    const student_id = req.user.student_id; // from auth middleware

    // fetch all feedback for this student
    const [rows] = await db.query(
      `SELECT 
         mf.feedback_id,
         mf.parent_feedback_id,
         mf.internship_id,
         mf.company_mentor_id,
         mf.faculty_mentor_id,
         mf.feedback_type,
         mf.rating,
         mf.strengths,
         mf.weaknesses,
         mf.suggestions,
         mf.overall_comment,
         mf.attachment_url,
         mf.attachment_name,
         mf.created_at,
         mf.updated_at,
         CASE
           WHEN mf.company_mentor_id IS NULL THEN 'faculty_mentor'
           ELSE 'company_mentor'
         END AS source_role,
         CASE
           WHEN mf.company_mentor_id IS NULL THEN COALESCE(fm.full_name, current_m.full_name)
           ELSE cm.full_name
         END AS source_name,
         cm.full_name AS company_mentor_name,
         COALESCE(fm.full_name, current_m.full_name) AS mentor_name
         
       FROM mentor_feedback mf
       LEFT JOIN company_mentor cm
         ON mf.company_mentor_id = cm.company_mentor_id
       LEFT JOIN student s
         ON mf.student_id = s.student_id
       LEFT JOIN mentor fm
         ON mf.faculty_mentor_id = fm.mentor_id
       LEFT JOIN mentor current_m
         ON s.assigned_mentor = current_m.mentor_id
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
  getStudentEvaluations,
  uploadInternshipReport,
  getPaymentApplication,
  submitPaymentApplication,
  feedbacks,
  updateProfile,
  cancelApplication,
  cancelCurrentInternship,
  suggestedInternships,
  submitSignedReportToFaculty,
  getRecommendationLetter,
  getCompanyRatingOptions,
  submitCompanyRating,
};
