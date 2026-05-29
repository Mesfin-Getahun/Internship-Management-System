import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import * as xlsx from "xlsx";
import {
  recordFacultyMentorAssignment,
} from "../utils/mentorAssignmentHistorySchema.js";
import { MENTOR_STUDENT_LIMIT } from "../utils/internshipRules.js";
import {
  calculateKnownInternshipGrade,
  ensureInternshipGradeColumns,
  normalizeMark,
} from "../utils/internshipGradeSchema.js";
import { ensureEvaluatorTables } from "../utils/evaluatorSchema.js";

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const normalized = String(value).replace(/\r?\n|\r/g, " ");
  const formulaSafe = /^[=+\-@]/.test(normalized)
    ? `'${normalized}`
    : normalized;

  if (/[",]/.test(formulaSafe)) {
    return `"${formulaSafe.replace(/"/g, '""')}"`;
  }

  return formulaSafe;
};

const buildCsvContent = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "No data available\n";
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(",")
    ),
  ];

  return lines.join("\n");
};

const ensureFacultyMentorColumns = async () => {
  const [columns] = await db.query(`
    SHOW COLUMNS FROM mentor
    WHERE Field IN ('faculty_id', 'faculty_name', 'account_status', 'deleted_at', 'deleted_by', 'delete_reason', 'must_change_password')
  `);
  const existing = new Set(columns.map((column) => column.Field));

  if (!existing.has("faculty_id")) {
    await db.query("ALTER TABLE mentor ADD COLUMN faculty_id varchar(20) DEFAULT NULL AFTER mentor_id");
  }
  if (!existing.has("faculty_name")) {
    await db.query("ALTER TABLE mentor ADD COLUMN faculty_name varchar(200) DEFAULT NULL AFTER faculty_id");
  }
  if (!existing.has("must_change_password")) {
    await db.query("ALTER TABLE mentor ADD COLUMN must_change_password tinyint(1) DEFAULT 1 AFTER password");
  }
  if (!existing.has("account_status")) {
    await db.query("ALTER TABLE mentor ADD COLUMN account_status ENUM('active', 'inactive') NOT NULL DEFAULT 'active'");
  }
  if (!existing.has("deleted_at")) {
    await db.query("ALTER TABLE mentor ADD COLUMN deleted_at DATETIME NULL");
  }
  if (!existing.has("deleted_by")) {
    await db.query("ALTER TABLE mentor ADD COLUMN deleted_by VARCHAR(100) NULL");
  }
  if (!existing.has("delete_reason")) {
    await db.query("ALTER TABLE mentor ADD COLUMN delete_reason TEXT NULL");
  }
};

const ensureStudentCsvProfileColumns = async () => {
  const [columns] = await db.query(`
    SHOW COLUMNS FROM student
    WHERE Field IN ('gender', 'date_of_birth', 'program', 'academic_year', 'current_semester', 'cgpa', 'expected_graduation_year')
  `);
  const existing = new Set(columns.map((column) => column.Field));

  if (!existing.has("gender")) {
    await db.query("ALTER TABLE student ADD COLUMN gender varchar(20) DEFAULT NULL AFTER phone_number");
  }
  if (!existing.has("date_of_birth")) {
    await db.query("ALTER TABLE student ADD COLUMN date_of_birth date DEFAULT NULL AFTER gender");
  }
  if (!existing.has("program")) {
    await db.query("ALTER TABLE student ADD COLUMN program varchar(30) DEFAULT NULL AFTER department");
  }
  if (!existing.has("academic_year")) {
    await db.query("ALTER TABLE student ADD COLUMN academic_year varchar(20) DEFAULT NULL AFTER program");
  }
  if (!existing.has("current_semester")) {
    await db.query("ALTER TABLE student ADD COLUMN current_semester varchar(20) DEFAULT NULL AFTER academic_year");
  }
  if (!existing.has("cgpa")) {
    await db.query("ALTER TABLE student ADD COLUMN cgpa decimal(3,2) DEFAULT NULL AFTER current_semester");
  }
  if (!existing.has("expected_graduation_year")) {
    await db.query("ALTER TABLE student ADD COLUMN expected_graduation_year int DEFAULT NULL AFTER cgpa");
  }
};

const buildFacultyMentorDefaultPassword = (fullName, email) =>
  `${String(fullName || "").trim()}${String(email || "").trim().toLowerCase()}`;

const getCsvValue = (row, keys, fallback = null) => {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return fallback;
};

const normalizeDateOnlyValue = (value) => {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
};

const normalizeCgpa = (value) => {
  const cgpa = Number(value);
  if (!Number.isFinite(cgpa)) return null;
  return Math.max(0, Math.min(4, Math.round(cgpa * 100) / 100));
};

const normalizeGraduationYear = (value) => {
  const year = Number.parseInt(value, 10);
  return Number.isInteger(year) ? year : null;
};

const generateFacultyMentorId = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
    const candidate = `FM-${suffix.slice(-10)}`;
    const [rows] = await db.query(
      "SELECT mentor_id FROM mentor WHERE mentor_id = ? LIMIT 1",
      [candidate],
    );

    if (rows.length === 0) return candidate;
  }

  throw new Error("Unable to generate a unique faculty mentor ID");
};

const assignMentor = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await ensureFacultyMentorColumns();
    const { student_id, mentor_id } = req.body;
    const faculty = req.user.faculty_name;

    // 1️⃣ Validate input
    if (!student_id || !mentor_id) {
      return res.status(400).json({
        success: false,
        message: "student_id and mentor_id are required",
      });
    }

    // 2️⃣ Check if student exists
    await connection.beginTransaction();

    const [students] = await connection.query(
      "SELECT student_id, assigned_mentor FROM student WHERE student_id = ? AND faculty = ? FOR UPDATE",
      [student_id, faculty],
    );

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Student not found under your faculty",
      });
    }

    // 3️⃣ Check if mentor exists
    const [mentors] = await connection.query(
      `SELECT mentor_id
       FROM mentor
       WHERE mentor_id = ?
         AND account_status = 'active'
         AND faculty_id = ?
       FOR UPDATE`,
      [mentor_id, req.user.faculty_id],
    );

    if (mentors.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Active mentor not found under your faculty",
      });
    }

    // 4️⃣ Assign mentor
    if (String(students[0].assigned_mentor || "") !== String(mentor_id)) {
      const [assignedRows] = await connection.query(
        "SELECT student_id FROM student WHERE assigned_mentor = ? AND faculty = ? FOR UPDATE",
        [mentor_id, faculty],
      );

      if (assignedRows.length >= MENTOR_STUDENT_LIMIT) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          message: `A faculty mentor can supervise a maximum of ${MENTOR_STUDENT_LIMIT} students`,
          assigned_students: assignedRows.length,
          limit: MENTOR_STUDENT_LIMIT,
        });
      }
    }

    const [result] = await connection.query(
      "UPDATE student SET assigned_mentor = ? WHERE student_id = ?",
      [mentor_id, student_id],
    );

    // 5️⃣ Extra safety check
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Mentor assignment failed",
      });
    }

    await recordFacultyMentorAssignment({
      connection,
      studentId: student_id,
      oldMentorId: students[0].assigned_mentor || null,
      newMentorId: mentor_id,
      changedByFacultyId: req.user.faculty_id || null,
      action: students[0].assigned_mentor ? "reassigned" : "assigned",
    });

    await connection.commit();

    // 6️⃣ Success response
    return res.status(200).json({
      success: true,
      message: "Mentor assigned successfully",
      data: {
        student_id,
        mentor_id,
      },
    });
  } catch (error) {
    await connection.rollback().catch(() => null);
    console.error("Assign mentor error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    connection.release();
  }
};

const companyEvaluation = async (req, res) => {
  try {
    await ensureInternshipGradeColumns(db);
    await ensureEvaluatorTables(db);
    await ensureEvaluatorTables(db);

    const faculty_name = req.user.faculty_name;

    const [evaluations] = await db.query(
      `
      SELECT 
        ie.evaluation_id,
        ie.total_mark,
        ie.faculty_attendance_mark,
        ie.faculty_attendance_graded_by,
        ie.faculty_attendance_graded_at,
        ie.assessment_pdf_url,
        ie.attendance_pdf_url,
        ie.submitted_at,
    
        s.student_id,
        s.full_name AS student_name,
        s.email,
        s.department,
    
        i.internship_id,
        i.title AS internship_title,
        i.company_id,
        c.company_name,
        r.mentor_report_mark,
        r.mentor_report_graded_at,
        pg.final_presentation_mark,
        pg.presentation_status,
        (
          COALESCE(ie.total_mark, 0) +
          COALESCE(ie.faculty_attendance_mark, 0) +
          COALESCE(r.mentor_report_mark, 0) +
          COALESCE(pg.final_presentation_mark, 0)
        ) AS known_total_mark
    
      FROM internship_evaluation ie
      JOIN student s 
          ON ie.student_id = s.student_id
      JOIN internship i 
          ON ie.internship_id = i.internship_id
      JOIN company c
          ON i.company_id = c.company_id
      LEFT JOIN internship_report r
          ON r.student_id = ie.student_id
         AND r.internship_id = ie.internship_id
      LEFT JOIN (
        SELECT
          student_id,
          internship_id,
          CASE
            WHEN COUNT(*) >= 2 AND COUNT(DISTINCT mark) = 1 THEN MAX(mark)
            WHEN COUNT(*) >= 2 THEN ROUND(AVG(mark), 2)
            ELSE NULL
          END AS final_presentation_mark,
          CASE
            WHEN COUNT(*) >= 2 AND COUNT(DISTINCT mark) = 1 THEN 'agreed'
            WHEN COUNT(*) >= 2 THEN 'averaged'
            ELSE 'pending'
          END AS presentation_status
        FROM presentation_grade
        GROUP BY student_id, internship_id
      ) pg
          ON pg.student_id = ie.student_id
         AND pg.internship_id = ie.internship_id
    
      WHERE s.faculty = ?
      ORDER BY ie.submitted_at DESC
      `,
      [faculty_name],
    );

    res.status(200).json({
      success: true,
      count: evaluations.length,
      evaluations,
    });
  } catch (error) {
    console.error("Fetch company evaluation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch evaluations",
    });
  }
};

const getStudents = async (req, res) => {
  try {
    await ensureStudentCsvProfileColumns();

    const faculty = req.user.faculty_name;

    const [students] = await db.query(
      `
      SELECT 
        s.student_id,
        s.full_name,
        s.email,
        s.phone_number,
        s.gender,
        s.date_of_birth,
        s.department,
        s.program,
        s.academic_year,
        s.current_semester,
        s.cgpa,
        s.expected_graduation_year,
        CASE
          WHEN NULLIF(TRIM(COALESCE(s.full_name, '')), '') IS NOT NULL
           AND NULLIF(TRIM(COALESCE(s.email, '')), '') IS NOT NULL
           AND NULLIF(TRIM(COALESCE(s.phone_number, '')), '') IS NOT NULL
           AND NULLIF(TRIM(COALESCE(s.department, '')), '') IS NOT NULL
           AND (
             NULLIF(TRIM(COALESCE(s.skills, '')), '') IS NOT NULL
             OR NULLIF(TRIM(COALESCE(s.technical_skills, '')), '') IS NOT NULL
             OR NULLIF(TRIM(COALESCE(s.soft_skills, '')), '') IS NOT NULL
           )
          THEN 'complete'
          ELSE 'incomplete'
        END AS profile_status,
        s.assigned_mentor AS university_mentor_id,
        m.full_name AS university_mentor_name,
        m.account_status AS university_mentor_status,

        si.internship_id,
        si.id AS student_internship_id,
        si.cohort_status,
        i.title AS internship_title,
        i.start_date,
        i.end_date,
        si.start_date AS placement_start_date,
        si.end_date AS placement_end_date,
        si.status AS internship_status,
        c.company_name,
        r.report_id AS presentation_report_id,
        r.report_url AS presentation_report_url,
        r.mentor_signed_url AS presentation_signed_report_url,
        r.faculty_submitted_at AS presentation_report_submitted_at

      FROM student s
      LEFT JOIN student_internship si
        ON s.student_id = si.student_id
        AND (
          (
            si.cohort_status = 'current'
            AND LOWER(si.status) IN ('in progress', 'accepted', 'active', 'completed', 'complete', 'rejected')
          )
          OR LOWER(si.status) IN ('completed', 'complete')
        )
      LEFT JOIN internship i
        ON si.internship_id = i.internship_id
      LEFT JOIN company c
        ON i.company_id = c.company_id
      LEFT JOIN internship_report r
        ON r.report_id = (
          SELECT r2.report_id
          FROM internship_report r2
          WHERE r2.student_id = s.student_id
            AND r2.internship_id = si.internship_id
            AND r2.mentor_signed_url IS NOT NULL
            AND (
              r2.faculty_submitted_at IS NOT NULL
              OR r2.status = 'faculty_submitted'
            )
          ORDER BY COALESCE(r2.faculty_submitted_at, r2.signed_at, r2.submission_date) DESC, r2.report_id DESC
          LIMIT 1
        )
      LEFT JOIN mentor m
        ON s.assigned_mentor = m.mentor_id
      WHERE s.faculty = ?
      ORDER BY s.full_name
      `,
      [faculty],
    );

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch students",
    });
  }
};

const getMentors = async (req, res) => {
  try {
    await ensureFacultyMentorColumns();
    const facultyId = req.user.faculty_id;

    const [mentors] = await db.query(
      `
      SELECT
        m.mentor_id,
        m.faculty_id,
        m.faculty_name,
        m.full_name,
        m.email,
        m.phone_number,
        m.account_status,
        COUNT(DISTINCT s.student_id) AS assigned_students_count
      FROM mentor m
      LEFT JOIN student s
        ON s.assigned_mentor = m.mentor_id
       AND s.faculty = ?
      WHERE m.faculty_id = ?
        AND m.account_status = 'active'
      GROUP BY m.mentor_id, m.faculty_id, m.faculty_name, m.full_name, m.email, m.phone_number, m.account_status
      ORDER BY m.full_name
      `,
      [req.user.faculty_name, facultyId],
    );

    res.status(200).json({
      success: true,
      count: mentors.length,
      mentors,
    });
  } catch (error) {
    console.error("Fetch mentors error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch mentors",
    });
  }
};
// this is how frontend access active intern and not yet students
// if (student.internship_id === null) {
//   // Not placed yet
// } else {
//   // Placed
// }

const facultyViewReports = async (req, res) => {
  try {
    await ensureInternshipGradeColumns(db);

    const faculty = req.user.faculty_name;

    const [reports] = await db.query(
      `
      SELECT
        r.report_id,
        r.report_url AS file_url,
        r.mentor_signed_url,
        CASE
          WHEN r.faculty_submitted_at IS NOT NULL OR r.status = 'faculty_submitted' THEN 'signed'
          ELSE r.status
        END AS status,
        r.status AS raw_status,
        r.submission_date AS created_at,
        r.faculty_submitted_at AS submitted_at,
        r.mentor_report_mark,
        r.mentor_report_graded_at,
        CASE
          WHEN r.mentor_signed_url IS NOT NULL
            OR r.signed_at IS NOT NULL
            OR r.faculty_submitted_at IS NOT NULL
            OR r.status IN ('signed', 'faculty_submitted', 'approved')
          THEN 1
          ELSE 0
        END AS is_signed,
        s.student_id,
        s.full_name AS student_name,
        s.department,
        i.internship_id,
        i.title AS internship_title,
        c.company_name
      FROM internship_report r
      JOIN student s ON r.student_id = s.student_id
      LEFT JOIN internship i ON r.internship_id = i.internship_id
      LEFT JOIN company c ON i.company_id = c.company_id
      WHERE s.faculty = ?
        AND (
          r.faculty_submitted_at IS NOT NULL
          OR r.status = 'faculty_submitted'
        )
      ORDER BY COALESCE(r.faculty_submitted_at, r.submission_date) DESC
      `,
      [faculty],
    );

    const signedReports = reports.filter((report) => Number(report.is_signed) === 1).length;

    res.json({
      success: true,
      reports,
      stats: {
        total_reports: reports.length,
        signed_reports: signedReports,
        unsigned_reports: reports.length - signedReports,
      },
    });
  } catch (error) {
    console.error("Fetch faculty reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty reports",
    });
  }
};

const createMentor = async (req, res) => {
  try {
    await ensureFacultyMentorColumns();

    const fullName = String(req.body?.full_name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phoneNumber = String(req.body?.phone_number || "").trim() || null;
    const mentorId = String(req.body?.mentor_id || "").trim() || (await generateFacultyMentorId());

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Mentor name and email are required",
      });
    }

    const [existing] = await db.query(
      "SELECT mentor_id FROM mentor WHERE mentor_id = ? OR LOWER(email) = ? LIMIT 1",
      [mentorId, email],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A faculty mentor with this ID or email already exists",
      });
    }

    const defaultPassword = buildFacultyMentorDefaultPassword(fullName, email);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await db.query(
      `INSERT INTO mentor
       (mentor_id, faculty_id, faculty_name, full_name, email, phone_number, password, must_change_password, account_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, 'active')`,
      [
        mentorId,
        req.user.faculty_id,
        req.user.faculty_name,
        fullName,
        email,
        phoneNumber,
        hashedPassword,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Faculty mentor registered successfully",
      mentor: {
        mentor_id: mentorId,
        faculty_id: req.user.faculty_id,
        faculty_name: req.user.faculty_name,
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        account_status: "active",
        assigned_students_count: 0,
      },
      default_password_rule: "full_name + email",
    });
  } catch (error) {
    console.error("Create faculty mentor error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register faculty mentor",
    });
  }
};

const updateMentor = async (req, res) => {
  try {
    await ensureFacultyMentorColumns();

    const { mentor_id } = req.params;
    const [existingRows] = await db.query(
      "SELECT * FROM mentor WHERE mentor_id = ? AND faculty_id = ? LIMIT 1",
      [mentor_id, req.user.faculty_id],
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Faculty mentor not found under your faculty",
      });
    }

    const existing = existingRows[0];
    const fullName = String(req.body?.full_name || "").trim() || existing.full_name;
    const email = String(req.body?.email || "").trim().toLowerCase() || existing.email;
    const phoneNumber =
      req.body?.phone_number === undefined
        ? existing.phone_number
        : String(req.body.phone_number || "").trim() || null;
    const resetPassword = req.body?.reset_password === true || req.body?.reset_password === "true";

    const [duplicates] = await db.query(
      "SELECT mentor_id FROM mentor WHERE LOWER(email) = ? AND mentor_id <> ? LIMIT 1",
      [email, mentor_id],
    );

    if (duplicates.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Another faculty mentor already uses this email",
      });
    }

    if (resetPassword) {
      const defaultPassword = buildFacultyMentorDefaultPassword(fullName, email);
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await db.query(
        `UPDATE mentor
         SET full_name = ?, email = ?, phone_number = ?, password = ?, must_change_password = TRUE
         WHERE mentor_id = ? AND faculty_id = ?`,
        [fullName, email, phoneNumber, hashedPassword, mentor_id, req.user.faculty_id],
      );
    } else {
      await db.query(
        `UPDATE mentor
         SET full_name = ?, email = ?, phone_number = ?
         WHERE mentor_id = ? AND faculty_id = ?`,
        [fullName, email, phoneNumber, mentor_id, req.user.faculty_id],
      );
    }

    res.status(200).json({
      success: true,
      message: resetPassword
        ? "Faculty mentor updated and password reset"
        : "Faculty mentor updated successfully",
    });
  } catch (error) {
    console.error("Update faculty mentor error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update faculty mentor",
    });
  }
};

const deactivateMentor = async (req, res) => {
  try {
    await ensureFacultyMentorColumns();

    const { mentor_id } = req.params;
    const [existingRows] = await db.query(
      "SELECT mentor_id FROM mentor WHERE mentor_id = ? AND faculty_id = ? LIMIT 1",
      [mentor_id, req.user.faculty_id],
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Faculty mentor not found under your faculty",
      });
    }

    await db.query(
      `UPDATE mentor
       SET account_status = 'inactive',
           deleted_at = COALESCE(deleted_at, NOW()),
           deleted_by = ?,
           delete_reason = COALESCE(delete_reason, 'Deactivated by faculty')
       WHERE mentor_id = ? AND faculty_id = ?`,
      [req.user.faculty_id, mentor_id, req.user.faculty_id],
    );

    res.status(200).json({
      success: true,
      message: "Faculty mentor deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate faculty mentor error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate faculty mentor",
    });
  }
};

const gradeAttendance = async (req, res) => {
  try {
    await ensureInternshipGradeColumns(db);

    const faculty = req.user.faculty_name;
    const facultyId = req.user.faculty_id || null;
    const { evaluation_id } = req.params;
    const attendanceMark = normalizeMark(req.body?.attendance_mark, 10);

    if (!evaluation_id) {
      return res.status(400).json({
        success: false,
        message: "Evaluation ID is required",
      });
    }

    if (attendanceMark === null) {
      return res.status(400).json({
        success: false,
        message: "Attendance mark must be a number from 0 to 10",
      });
    }

    const [[evaluationRow]] = await db.query(
      `
      SELECT
        ie.evaluation_id,
        ie.total_mark,
        ie.faculty_attendance_mark,
        r.mentor_report_mark,
        s.student_id,
        s.faculty
      FROM internship_evaluation ie
      JOIN student s
        ON ie.student_id = s.student_id
      LEFT JOIN internship_report r
        ON r.student_id = ie.student_id
       AND r.internship_id = ie.internship_id
      WHERE ie.evaluation_id = ?
        AND s.faculty = ?
      LIMIT 1
      `,
      [evaluation_id, faculty],
    );

    if (!evaluationRow) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found under your faculty",
      });
    }

    await db.query(
      `
      UPDATE internship_evaluation
      SET faculty_attendance_mark = ?,
          faculty_attendance_graded_by = ?,
          faculty_attendance_graded_at = NOW()
      WHERE evaluation_id = ?
      `,
      [attendanceMark, facultyId, evaluation_id],
    );

    const knownTotalMark = calculateKnownInternshipGrade({
      companyMark: evaluationRow.total_mark,
      attendanceMark,
      reportMark: evaluationRow.mentor_report_mark,
    });

    res.status(200).json({
      success: true,
      message: "Attendance grade saved successfully",
      attendance_mark: attendanceMark,
      known_total_mark: knownTotalMark,
    });
  } catch (error) {
    console.error("Grade attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save attendance grade",
    });
  }
};

const deleteMentor = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const faculty = req.user.faculty_name;
    const { id: student_id } = req.params;

    await connection.beginTransaction();

    const [students] = await connection.query(
      "SELECT student_id, assigned_mentor FROM student WHERE student_id = ? AND faculty = ? FOR UPDATE",
      [student_id, faculty],
    );

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Student not found under your faculty",
      });
    }

    if (!students[0].assigned_mentor) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Student does not have an assigned mentor",
      });
    }

    await connection.query(
      "UPDATE student SET assigned_mentor = NULL WHERE student_id = ?",
      [student_id],
    );

    await recordFacultyMentorAssignment({
      connection,
      studentId: student_id,
      oldMentorId: students[0].assigned_mentor,
      newMentorId: null,
      changedByFacultyId: req.user.faculty_id || null,
      action: "removed",
    });

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Mentor removed successfully",
      data: { student_id },
    });
  } catch (error) {
    await connection.rollback().catch(() => null);
    console.error("Delete mentor error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to remove mentor" });
  } finally {
    connection.release();
  }
};

const changeMentor = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await ensureFacultyMentorColumns();
    const faculty = req.user.faculty_name;
    const { id: student_id } = req.params;
    const { new_mentor_id } = req.body;

    if (!new_mentor_id) {
      return res.status(400).json({
        success: false,
        message: "new_mentor_id is required",
      });
    }

    await connection.beginTransaction();

    const [students] = await connection.query(
      "SELECT student_id, assigned_mentor FROM student WHERE student_id = ? AND faculty = ? FOR UPDATE",
      [student_id, faculty],
    );

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Student not found under your faculty",
      });
    }

    const [mentors] = await connection.query(
      `SELECT mentor_id
       FROM mentor
       WHERE mentor_id = ?
         AND account_status = 'active'
         AND faculty_id = ?
       FOR UPDATE`,
      [new_mentor_id, req.user.faculty_id],
    );

    if (mentors.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Active mentor not found under your faculty",
      });
    }

    if (String(students[0].assigned_mentor || "") !== String(new_mentor_id)) {
      const [assignedRows] = await connection.query(
        "SELECT student_id FROM student WHERE assigned_mentor = ? AND faculty = ? FOR UPDATE",
        [new_mentor_id, faculty],
      );

      if (assignedRows.length >= MENTOR_STUDENT_LIMIT) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          message: `A faculty mentor can supervise a maximum of ${MENTOR_STUDENT_LIMIT} students`,
          assigned_students: assignedRows.length,
          limit: MENTOR_STUDENT_LIMIT,
        });
      }
    }

    await connection.query(
      "UPDATE student SET assigned_mentor = ? WHERE student_id = ?",
      [new_mentor_id, student_id],
    );

    await recordFacultyMentorAssignment({
      connection,
      studentId: student_id,
      oldMentorId: students[0].assigned_mentor || null,
      newMentorId: new_mentor_id,
      changedByFacultyId: req.user.faculty_id || null,
      action: students[0].assigned_mentor ? "reassigned" : "assigned",
    });

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Mentor changed successfully",
      data: { student_id, mentor_id: new_mentor_id },
    });
  } catch (error) {
    await connection.rollback().catch(() => null);
    console.error("Change mentor error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to change mentor" });
  } finally {
    connection.release();
  }
};

const getPaymentData = async (req, res) => {
  try {
    const faculty = req.user.faculty_name;

    const [payments] = await db.query(
      `
      SELECT
        p.*,
        s.student_id,
        s.full_name AS student_name,
        s.department,
        c.company_name
      FROM payments p
      JOIN student s ON p.student_id = s.student_id
      LEFT JOIN student_internship si
        ON s.student_id = si.student_id
        AND si.cohort_status = 'current'
      LEFT JOIN internship i ON si.internship_id = i.internship_id
      LEFT JOIN company c ON i.company_id = c.company_id
      WHERE s.faculty = ?
      ORDER BY s.full_name
      `,
      [faculty],
    );

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Fetch payment data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment data",
    });
  }
};

const generateStipendReportCsv = async (req, res) => {
  try {
    const faculty = req.user.faculty_name;

    const [rows] = await db.query(
      `
      SELECT
        s.student_id AS student_id,
        s.full_name AS student_name,
        s.email AS student_email,
        s.department AS department,
        c.company_name AS organization,
        i.title AS internship_title,
        COALESCE(si.status, 'not placed') AS internship_status,
        p.bank_name AS bank_name,
        p.account_holder_name AS account_holder_name,
        p.account_number AS account_number,
        DATE_FORMAT(p.submitted_at, '%Y-%m-%d') AS stipend_submitted_date
      FROM payments p
      JOIN student s ON p.student_id = s.student_id
      LEFT JOIN student_internship si
        ON s.student_id = si.student_id
        AND LOWER(si.status) IN ('in progress', 'accepted', 'active', 'completed', 'complete')
        AND si.cohort_status = 'current'
      LEFT JOIN internship i ON si.internship_id = i.internship_id
      LEFT JOIN company c ON i.company_id = c.company_id
      WHERE s.faculty = ?
      ORDER BY s.department, s.full_name
      `,
      [faculty],
    );

    const csvContent = buildCsvContent(rows);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const safeFaculty = String(faculty || "faculty")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
    const fileName = `${safeFaculty || "faculty"}-stipend-report-${timestamp}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.status(200).send(`\uFEFF${csvContent}`);
  } catch (error) {
    console.error("Generate stipend report CSV error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate stipend report",
    });
  }
};

const updateInternshipCompletionStatus = async (req, res) => {
  try {
    const faculty = req.user.faculty_name;
    const { placement_id } = req.params;
    const { decision } = req.body;
    const normalizedDecision = String(decision || "").toLowerCase();

    if (!["approve", "reject"].includes(normalizedDecision)) {
      return res.status(400).json({
        success: false,
        message: "decision must be approve or reject",
      });
    }

    const [placements] = await db.query(
      `
      SELECT
        si.id,
        si.student_id,
        si.internship_id,
        si.status,
        s.full_name AS student_name
      FROM student_internship si
      JOIN student s ON si.student_id = s.student_id
      WHERE si.id = ?
        AND s.faculty = ?
        AND si.cohort_status = 'current'
      LIMIT 1
      `,
      [placement_id, faculty],
    );

    if (placements.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship placement not found under your faculty",
      });
    }

    const placement = placements[0];
    const currentStatus = String(placement.status || "").toLowerCase();

    if (["completed", "complete"].includes(currentStatus) && normalizedDecision === "approve") {
      return res.status(409).json({
        success: false,
        message: "Internship completion is already approved",
      });
    }

    if (currentStatus === "rejected" && normalizedDecision === "reject") {
      return res.status(409).json({
        success: false,
        message: "Internship completion is already rejected",
      });
    }

    const nextStatus = normalizedDecision === "approve" ? "completed" : "rejected";

    await db.query(
      `
      UPDATE student_internship
      SET status = ?,
          cohort_status = CASE WHEN ? = 'completed' THEN 'archived' ELSE cohort_status END,
          end_date = CASE WHEN ? = 'completed' THEN COALESCE(end_date, CURRENT_DATE()) ELSE end_date END
      WHERE id = ?
      `,
      [nextStatus, nextStatus, nextStatus, placement_id],
    );

    res.status(200).json({
      success: true,
      message:
        normalizedDecision === "approve"
          ? "Internship completion approved successfully"
          : "Internship completion rejected successfully",
      placement: {
        placement_id: placement.id,
        student_id: placement.student_id,
        internship_id: placement.internship_id,
        status: nextStatus,
      },
    });
  } catch (error) {
    console.error("Update internship completion status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update internship completion status",
    });
  }
};

const approveAllInternshipCompletions = async (req, res) => {
  try {
    const faculty = req.user.faculty_name;

    const [result] = await db.query(
      `
      UPDATE student_internship si
      JOIN student s
        ON si.student_id = s.student_id
      LEFT JOIN internship i
        ON si.internship_id = i.internship_id
      SET si.status = 'completed',
          si.cohort_status = 'archived',
          si.end_date = COALESCE(si.end_date, CURRENT_DATE())
      WHERE s.faculty = ?
        AND si.cohort_status = 'current'
        AND LOWER(COALESCE(si.status, '')) NOT IN ('completed', 'complete', 'rejected')
        AND COALESCE(si.end_date, i.end_date) <= CURDATE()
        AND EXISTS (
          SELECT 1
          FROM internship_evaluation ie
          WHERE ie.student_id = si.student_id
            AND ie.internship_id = si.internship_id
            AND ie.evaluation_id IS NOT NULL
            AND ie.attendance_pdf_url IS NOT NULL
        )
      `,
      [faculty],
    );

    res.status(200).json({
      success: true,
      message:
        result.affectedRows > 0
          ? `${result.affectedRows} internship completion(s) approved successfully`
          : "No pending internship completions were eligible for approval",
      approved_count: result.affectedRows || 0,
    });
  } catch (error) {
    console.error("Approve all internship completions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve all internship completions",
    });
  }
};

const getFacultyProfile = async (req, res) => {
  try {
    const faculty_id = req.user.faculty_id;

    const [[faculty]] = await db.query(
      `
      SELECT faculty_id, faculty_name, email
      FROM faculty
      WHERE faculty_id = ?
      `,
      [faculty_id],
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found",
      });
    }

    const [[studentStats]] = await db.query(
      `
      SELECT
        COUNT(*) AS total_students,
        SUM(CASE WHEN assigned_mentor IS NOT NULL THEN 1 ELSE 0 END) AS students_mentored
      FROM student
      WHERE faculty = ?
      `,
      [faculty.faculty_name],
    );

    const [[reportStats]] = await db.query(
      `
      SELECT
        COUNT(*) AS total_reports,
        SUM(CASE
          WHEN r.mentor_signed_url IS NOT NULL
            OR r.signed_at IS NOT NULL
            OR r.faculty_submitted_at IS NOT NULL
            OR r.status IN ('signed', 'faculty_submitted', 'approved')
          THEN 1
          ELSE 0
        END) AS signed_reports
      FROM internship_report r
      JOIN student s ON r.student_id = s.student_id
      WHERE s.faculty = ?
      `,
      [faculty.faculty_name],
    );

    const [[evaluationStats]] = await db.query(
      `
      SELECT COUNT(*) AS total_evaluations
      FROM internship_evaluation ie
      JOIN student s ON ie.student_id = s.student_id
      WHERE s.faculty = ?
      `,
      [faculty.faculty_name],
    );

    res.status(200).json({
      success: true,
      profile: {
        ...faculty,
        department: faculty.faculty_name,
        phone_number: req.user.phone_number || null,
        office: req.user.office || null,
        office_hours: req.user.office_hours || null,
        profile_pic: req.user.profile_pic || null,
        bio: req.user.bio || null,
        total_students: Number(studentStats?.total_students || 0),
        students_mentored: Number(studentStats?.students_mentored || 0),
        total_reports: Number(reportStats?.total_reports || 0),
        signed_reports: Number(reportStats?.signed_reports || 0),
        unsigned_reports:
          Number(reportStats?.total_reports || 0) - Number(reportStats?.signed_reports || 0),
        total_evaluations: Number(evaluationStats?.total_evaluations || 0),
      },
    });
  } catch (error) {
    console.error("Fetch faculty profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty profile",
    });
  }
};

const evaluation = async (req, res) => {
  try {
    await ensureInternshipGradeColumns(db);

    const { evaluation_id } = req.params;

    // 1️⃣ Validate param
    if (!evaluation_id) {
      return res.status(400).json({
        success: false,
        message: "Evaluation ID is required",
      });
    }

    // 2️⃣ Fetch evaluation with related data
    const [rows] = await db.query(
      `
      SELECT 
        ie.evaluation_id,
        ie.total_mark,
        ie.faculty_attendance_mark,
        ie.faculty_attendance_graded_by,
        ie.faculty_attendance_graded_at,
        ie.assessment_pdf_url,
        ie.attendance_pdf_url,
        ie.submitted_at,

        s.student_id,
        s.full_name AS student_name,
        s.email AS student_email,

        i.internship_id,
        i.title AS internship_title,
        r.mentor_report_mark,
        r.mentor_report_graded_at,
        pg.final_presentation_mark,
        pg.presentation_status,
        (
          COALESCE(ie.total_mark, 0) +
          COALESCE(ie.faculty_attendance_mark, 0) +
          COALESCE(r.mentor_report_mark, 0) +
          COALESCE(pg.final_presentation_mark, 0)
        ) AS known_total_mark

      FROM internship_evaluation ie
      JOIN student s ON ie.student_id = s.student_id
      JOIN internship i ON ie.internship_id = i.internship_id
      LEFT JOIN internship_report r
        ON r.student_id = ie.student_id
       AND r.internship_id = ie.internship_id
      LEFT JOIN (
        SELECT
          student_id,
          internship_id,
          CASE
            WHEN COUNT(*) >= 2 AND COUNT(DISTINCT mark) = 1 THEN MAX(mark)
            WHEN COUNT(*) >= 2 THEN ROUND(AVG(mark), 2)
            ELSE NULL
          END AS final_presentation_mark,
          CASE
            WHEN COUNT(*) >= 2 AND COUNT(DISTINCT mark) = 1 THEN 'agreed'
            WHEN COUNT(*) >= 2 THEN 'averaged'
            ELSE 'pending'
          END AS presentation_status
        FROM presentation_grade
        GROUP BY student_id, internship_id
      ) pg
        ON pg.student_id = ie.student_id
       AND pg.internship_id = ie.internship_id
      WHERE ie.evaluation_id = ?
      `,
      [evaluation_id],
    );

    // 3️⃣ Not found
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found",
      });
    }

    // 4️⃣ Success
    res.status(200).json({
      success: true,
      evaluation: rows[0],
    });
  } catch (error) {
    console.error("Fetch evaluation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch evaluation",
    });
  }
};

const uploadStudents = async (req, res) => {
  try {
    await ensureStudentCsvProfileColumns();

    const faculty_name = req.user.faculty_name;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "File is empty" });
    }

    let insertedCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
      const student_id = row.student_id || row.ID || row.id;
      const first_name = row.first_name || row.FirstName || row.First_Name || "";
      const last_name = row.last_name || row.LastName || row.Last_Name || "";
      const full_name = (first_name + " " + last_name).trim() || row.full_name || row.Name || row.name;
      const email = row.email || row.Email || null;
      const department = row.department || row.Department || faculty_name; // Default to faculty if not provided
      const phoneNumber = getCsvValue(row, ["phone_number", "phone number", "Phone Number", "phone", "Phone"]);
      const gender = getCsvValue(row, ["gender", "Gender"]);
      const dateOfBirth = normalizeDateOnlyValue(
        getCsvValue(row, ["date_of_birth", "Date of birth", "Date Of Birth", "DOB", "dob"]),
      );
      const program = getCsvValue(row, ["program", "Program"]);
      const academicYear = getCsvValue(row, ["academic_year", "academic year", "Academic Year"]);
      const currentSemester = getCsvValue(row, ["current_semester", "current semester", "Current Semester"]);
      const cgpa = normalizeCgpa(getCsvValue(row, ["cgpa", "CGPA", "GPA", "gpa"]));
      const expectedGraduationYear = normalizeGraduationYear(
        getCsvValue(row, [
          "expected_graduation_year",
          "Expected Graduation Year",
          "expected graduation year",
        ]),
      );
      
      if (!student_id || !first_name) {
        skippedCount++;
        continue;
      }

      // Check if student already exists
      const [existing] = await db.query("SELECT student_id FROM student WHERE student_id = ?", [student_id]);
      if (existing.length > 0) {
        skippedCount++;
        continue;
      }

      const rawPassword = String(student_id) + String(first_name);
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      await db.query(
        `INSERT INTO student 
         (student_id, full_name, email, phone_number, gender, date_of_birth, password, department, program, academic_year, current_semester, cgpa, expected_graduation_year, faculty, must_change_password)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          student_id,
          full_name,
          email,
          phoneNumber,
          gender,
          dateOfBirth,
          hashedPassword,
          department,
          program,
          academicYear,
          currentSemester,
          cgpa,
          expectedGraduationYear,
          faculty_name,
        ]
      );
      insertedCount++;
    }

    res.status(200).json({
      success: true,
      message: `Successfully registered ${insertedCount} students. Skipped ${skippedCount} duplicate/invalid records.`,
      insertedCount,
      skippedCount
    });

  } catch (error) {
    console.error("Upload students error:", error);
    res.status(500).json({ success: false, message: "Failed to upload students" });
  }
};

export {
  assignMentor,
  companyEvaluation,
  gradeAttendance,
  deleteMentor,
  changeMentor,
  getStudents,
  getMentors,
  createMentor,
  updateMentor,
  deactivateMentor,
  facultyViewReports,
  getPaymentData,
  generateStipendReportCsv,
  approveAllInternshipCompletions,
  updateInternshipCompletionStatus,
  getFacultyProfile,
  evaluation,
  uploadStudents,
};
