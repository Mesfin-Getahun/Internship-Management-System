import bcrypt from "bcryptjs";
import db from "../config/mysql.js";
import { ensureEvaluatorTables, getPresentationStatus, normalizePresentationMark } from "../utils/evaluatorSchema.js";
import { createNotification } from "../utils/notificationService.js";

const EVALUATOR_STUDENT_LIMIT = 30;

const buildEvaluatorDefaultPassword = (email, fullName) =>
  `${String(email || "").trim()}${String(fullName || "").trim()}`;

const generateEvaluatorId = async () => {
  const [[row]] = await db.query("SELECT COUNT(*) AS total FROM evaluator");
  return `EVAL${String(Number(row?.total || 0) + 1).padStart(4, "0")}`;
};

const groupGrades = (rows) =>
  rows.reduce((acc, row) => {
    const key = `${row.student_id}_${row.internship_id}`;
    if (!acc[key]) acc[key] = [];
    if (row.grade_evaluator_id) {
      acc[key].push({
        evaluator_id: row.grade_evaluator_id,
        evaluator_name: row.grade_evaluator_name,
        mark: Number(row.mark),
        submitted_at: row.submitted_at,
      });
    }
    return acc;
  }, {});

const listFacultyEvaluators = async (req, res) => {
  try {
    await ensureEvaluatorTables(db);

    const facultyName = req.user.faculty_name;

    const [evaluators] = await db.query(
      `
      SELECT
        e.evaluator_id,
        e.full_name,
        e.email,
        e.phone_number,
        e.account_status,
        e.must_change_password,
        COUNT(DISTINCT CONCAT(a.student_id, ':', a.internship_id)) AS assigned_students
      FROM evaluator e
      LEFT JOIN presentation_evaluator_assignment a
        ON a.evaluator_id = e.evaluator_id
      WHERE e.faculty_name = ?
      GROUP BY e.evaluator_id, e.full_name, e.email, e.phone_number, e.account_status, e.must_change_password
      ORDER BY e.full_name
      `,
      [facultyName],
    );

    res.status(200).json({
      success: true,
      evaluators,
    });
  } catch (error) {
    console.error("List evaluators error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch evaluators" });
  }
};

const createEvaluator = async (req, res) => {
  try {
    await ensureEvaluatorTables(db);

    const facultyName = req.user.faculty_name;
    const facultyId = req.user.faculty_id || null;
    const fullName = String(req.body?.full_name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phoneNumber = String(req.body?.phone_number || "").trim() || null;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Evaluator name and email are required",
      });
    }

    const [duplicates] = await db.query(
      "SELECT evaluator_id FROM evaluator WHERE evaluator_id = ? OR LOWER(email) = ? LIMIT 1",
      [req.body?.evaluator_id || "", email],
    );

    if (duplicates.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An evaluator with this email or ID already exists",
      });
    }

    const evaluatorId =
      String(req.body?.evaluator_id || "").trim() || (await generateEvaluatorId());
    const temporaryPassword = buildEvaluatorDefaultPassword(email, fullName);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    await db.query(
      `
      INSERT INTO evaluator
        (evaluator_id, faculty_name, full_name, email, phone_number, password, must_change_password, account_status, created_by_faculty_id)
      VALUES (?, ?, ?, ?, ?, ?, TRUE, 'active', ?)
      `,
      [evaluatorId, facultyName, fullName, email, phoneNumber, hashedPassword, facultyId],
    );

    res.status(201).json({
      success: true,
      message: "Evaluator created successfully",
      evaluator: {
        evaluator_id: evaluatorId,
        faculty_name: facultyName,
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        account_status: "active",
        assigned_students: 0,
      },
      temporary_password: temporaryPassword,
      default_password_rule: "email + full_name",
    });
  } catch (error) {
    console.error("Create evaluator error:", error);
    res.status(500).json({ success: false, message: "Failed to create evaluator" });
  }
};

const assignPresentationEvaluators = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await ensureEvaluatorTables(db);

    const facultyName = req.user.faculty_name;
    const facultyId = req.user.faculty_id || null;
    const evaluatorIds = Array.isArray(req.body?.evaluator_ids)
      ? req.body.evaluator_ids.map((id) => String(id || "").trim()).filter(Boolean)
      : [];
    const students = Array.isArray(req.body?.students) ? req.body.students : [];

    if (evaluatorIds.length !== 2 || new Set(evaluatorIds).size !== 2) {
      return res.status(400).json({
        success: false,
        message: "Choose exactly two different evaluators",
      });
    }

    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one student",
      });
    }

    await connection.beginTransaction();

    const [evaluators] = await connection.query(
      `
      SELECT evaluator_id
      FROM evaluator
      WHERE evaluator_id IN (?, ?)
        AND faculty_name = ?
        AND account_status = 'active'
      FOR UPDATE
      `,
      [evaluatorIds[0], evaluatorIds[1], facultyName],
    );

    if (evaluators.length !== 2) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Both evaluators must be active and under your faculty",
      });
    }

    const normalizedStudents = [];

    for (const item of students) {
      const studentId = String(item?.student_id || "").trim();
      const internshipId = Number(item?.internship_id);

      if (!studentId || !Number.isInteger(internshipId)) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "Each selected student must include student_id and internship_id",
        });
      }

      const [studentRows] = await connection.query(
        `
        SELECT
          s.student_id,
          si.internship_id,
          si.status,
          COALESCE(si.end_date, i.end_date) AS effective_end_date
        FROM student s
        JOIN student_internship si
          ON si.student_id = s.student_id
         AND si.internship_id = ?
        JOIN internship i
          ON si.internship_id = i.internship_id
        WHERE s.student_id = ?
          AND s.faculty = ?
          AND (
            LOWER(si.status) IN ('completed', 'complete')
            OR COALESCE(si.end_date, i.end_date) < CURDATE()
          )
        LIMIT 1
        FOR UPDATE
        `,
        [internshipId, studentId, facultyName],
      );

      if (studentRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: `Student ${studentId} is not eligible for presentation evaluators until the internship is completed`,
        });
      }

      const [reportRows] = await connection.query(
        `
        SELECT report_id
        FROM internship_report
        WHERE student_id = ?
          AND internship_id = ?
          AND mentor_signed_url IS NOT NULL
          AND (
            faculty_submitted_at IS NOT NULL
            OR status = 'faculty_submitted'
          )
        ORDER BY COALESCE(faculty_submitted_at, signed_at, submission_date) DESC, report_id DESC
        LIMIT 1
        FOR UPDATE
        `,
        [studentId, internshipId],
      );

      if (reportRows.length === 0) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          message: `Student ${studentId} needs a signed report submitted to faculty before presentation evaluators can be assigned`,
        });
      }

      normalizedStudents.push({ studentId, internshipId });
    }

    for (const evaluatorId of evaluatorIds) {
      const [assignedRows] = await connection.query(
        `
        SELECT DISTINCT student_id, internship_id
        FROM presentation_evaluator_assignment
        WHERE evaluator_id = ?
        FOR UPDATE
        `,
        [evaluatorId],
      );

      const assignmentKeys = new Set(
        assignedRows.map((row) => `${row.student_id}_${row.internship_id}`),
      );
      normalizedStudents.forEach((student) =>
        assignmentKeys.add(`${student.studentId}_${student.internshipId}`),
      );

      if (assignmentKeys.size > EVALUATOR_STUDENT_LIMIT) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          message: `Each evaluator can be assigned to a maximum of ${EVALUATOR_STUDENT_LIMIT} students`,
          evaluator_id: evaluatorId,
          assigned_students: assignedRows.length,
          requested_students: normalizedStudents.length,
          limit: EVALUATOR_STUDENT_LIMIT,
        });
      }
    }

    for (const student of normalizedStudents) {
      await connection.query(
        `
        DELETE FROM presentation_evaluator_assignment
        WHERE student_id = ?
          AND internship_id = ?
        `,
        [student.studentId, student.internshipId],
      );

      for (const evaluatorId of evaluatorIds) {
        await connection.query(
          `
          INSERT INTO presentation_evaluator_assignment
            (student_id, internship_id, faculty_name, evaluator_id, assigned_by_faculty_id)
          VALUES (?, ?, ?, ?, ?)
          `,
          [student.studentId, student.internshipId, facultyName, evaluatorId, facultyId],
        );
      }
    }

    await connection.commit();

    await Promise.all(
      evaluatorIds.map((evaluatorId) =>
        createNotification({
          recipientRole: "evaluator",
          recipientId: evaluatorId,
          title: "Presentation reports assigned",
          message: `${normalizedStudents.length} student report(s) are ready for presentation evaluation.`,
          type: "evaluation",
          link: "/evaluator/assignments",
        }),
      ),
    ).catch(() => null);

    res.status(200).json({
      success: true,
      message: "Presentation evaluators assigned successfully",
      assigned_students: normalizedStudents.length,
      evaluator_ids: evaluatorIds,
    });
  } catch (error) {
    await connection.rollback().catch(() => null);
    console.error("Assign presentation evaluators error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign presentation evaluators",
    });
  } finally {
    connection.release();
  }
};

const getEvaluatorProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    profile: req.user,
  });
};

const getEvaluatorAssignments = async (req, res) => {
  try {
    await ensureEvaluatorTables(db);

    const evaluatorId = req.user.evaluator_id;

    const [rows] = await db.query(
      `
      SELECT
        a.student_id,
        a.internship_id,
        a.assigned_at,
        s.full_name AS student_name,
        s.department,
        i.title AS internship_title,
        c.company_name,
        r.report_id,
        r.report_url,
        r.mentor_signed_url,
        r.faculty_submitted_at AS report_submitted_at,
        pair.evaluator_id AS assigned_evaluator_id,
        pair_e.full_name AS assigned_evaluator_name,
        pg.evaluator_id AS grade_evaluator_id,
        ge.full_name AS grade_evaluator_name,
        pg.mark,
        pg.submitted_at
      FROM presentation_evaluator_assignment a
      JOIN student s
        ON a.student_id = s.student_id
      JOIN internship i
        ON a.internship_id = i.internship_id
      LEFT JOIN company c
        ON i.company_id = c.company_id
      LEFT JOIN internship_report r
        ON r.report_id = (
          SELECT r2.report_id
          FROM internship_report r2
          WHERE r2.student_id = a.student_id
            AND r2.internship_id = a.internship_id
            AND r2.mentor_signed_url IS NOT NULL
            AND (
              r2.faculty_submitted_at IS NOT NULL
              OR r2.status = 'faculty_submitted'
            )
          ORDER BY COALESCE(r2.faculty_submitted_at, r2.signed_at, r2.submission_date) DESC, r2.report_id DESC
          LIMIT 1
        )
      JOIN presentation_evaluator_assignment pair
        ON pair.student_id = a.student_id
       AND pair.internship_id = a.internship_id
      JOIN evaluator pair_e
        ON pair.evaluator_id = pair_e.evaluator_id
      LEFT JOIN presentation_grade pg
        ON pg.student_id = a.student_id
       AND pg.internship_id = a.internship_id
      LEFT JOIN evaluator ge
        ON pg.evaluator_id = ge.evaluator_id
      WHERE a.evaluator_id = ?
      ORDER BY s.full_name, i.title
      `,
      [evaluatorId],
    );

    const gradesByAssignment = groupGrades(rows);
    const assignmentsByKey = new Map();

    rows.forEach((row) => {
      const key = `${row.student_id}_${row.internship_id}`;
      const current = assignmentsByKey.get(key) || {
        student_id: row.student_id,
        internship_id: row.internship_id,
        student_name: row.student_name,
        department: row.department,
        internship_title: row.internship_title,
        company_name: row.company_name,
        assigned_at: row.assigned_at,
        report_id: row.report_id,
        report_url: row.report_url,
        mentor_signed_url: row.mentor_signed_url,
        evaluator_report_url: row.mentor_signed_url || row.report_url,
        report_submitted_at: row.report_submitted_at,
        evaluators: [],
      };

      if (
        row.assigned_evaluator_id &&
        !current.evaluators.some((item) => item.evaluator_id === row.assigned_evaluator_id)
      ) {
        current.evaluators.push({
          evaluator_id: row.assigned_evaluator_id,
          full_name: row.assigned_evaluator_name,
        });
      }

      assignmentsByKey.set(key, current);
    });

    const assignments = Array.from(assignmentsByKey.entries()).map(([key, assignment]) => {
      const grades = gradesByAssignment[key] || [];
      const ownGrade = grades.find((grade) => String(grade.evaluator_id) === String(evaluatorId));
      const status = getPresentationStatus(grades);

      return {
        ...assignment,
        grades,
        own_mark: ownGrade?.mark ?? null,
        presentation_status: status.status,
        final_presentation_mark: status.finalMark,
      };
    });

    res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("Get evaluator assignments error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch assignments" });
  }
};

const submitPresentationGrade = async (req, res) => {
  try {
    await ensureEvaluatorTables(db);

    const evaluatorId = req.user.evaluator_id;
    const { student_id, internship_id } = req.params;
    const mark = normalizePresentationMark(req.body?.mark);

    if (mark === null) {
      return res.status(400).json({
        success: false,
        message: "Presentation mark must be a number from 0 to 30",
      });
    }

    const [assignments] = await db.query(
      `
      SELECT evaluator_id
      FROM presentation_evaluator_assignment
      WHERE student_id = ?
        AND internship_id = ?
      `,
      [student_id, internship_id],
    );

    if (!assignments.some((assignment) => String(assignment.evaluator_id) === String(evaluatorId))) {
      return res.status(404).json({
        success: false,
        message: "Presentation assignment not found for this evaluator",
      });
    }

    const [existingGrades] = await db.query(
      `
      SELECT grade_id
      FROM presentation_grade
      WHERE student_id = ?
        AND internship_id = ?
        AND evaluator_id = ?
      LIMIT 1
      `,
      [student_id, internship_id, evaluatorId],
    );

    if (existingGrades.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Presentation grade has already been submitted and cannot be edited",
      });
    }

    await db.query(
      `
      INSERT INTO presentation_grade (student_id, internship_id, evaluator_id, mark)
      VALUES (?, ?, ?, ?)
      `,
      [student_id, internship_id, evaluatorId, mark],
    );

    const [grades] = await db.query(
      `
      SELECT evaluator_id, mark, submitted_at
      FROM presentation_grade
      WHERE student_id = ?
        AND internship_id = ?
      `,
      [student_id, internship_id],
    );
    const status = getPresentationStatus(grades);

    if (status.status === "agreed") {
      await createNotification({
        recipientRole: "student",
        recipientId: student_id,
        title: "Presentation grade agreed",
        message: `Your presentation evaluators agreed on ${status.finalMark}/30.`,
        type: "evaluation",
        link: "/student/feedback",
      }).catch(() => null);
    }

    res.status(200).json({
      success: true,
      message:
        status.status === "agreed"
          ? "Presentation grade agreed and saved"
          : status.status === "disputed"
            ? "Presentation grade saved, but evaluator marks do not match"
            : "Presentation grade saved",
      mark,
      presentation_status: status.status,
      final_presentation_mark: status.finalMark,
      grades,
    });
  } catch (error) {
    console.error("Submit presentation grade error:", error);
    res.status(500).json({ success: false, message: "Failed to save presentation grade" });
  }
};

export {
  EVALUATOR_STUDENT_LIMIT,
  assignPresentationEvaluators,
  createEvaluator,
  getEvaluatorAssignments,
  getEvaluatorProfile,
  listFacultyEvaluators,
  submitPresentationGrade,
};
