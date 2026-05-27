let internshipGradeSchemaPromise = null;

const ensureInternshipGradeColumns = async (db) => {
  if (internshipGradeSchemaPromise) {
    return internshipGradeSchemaPromise;
  }

  internshipGradeSchemaPromise = (async () => {
    const [evaluationColumns] = await db.query(`
      SHOW COLUMNS FROM internship_evaluation
      WHERE Field IN ('faculty_attendance_mark', 'faculty_attendance_graded_by', 'faculty_attendance_graded_at')
    `);
    const evaluationColumnNames = new Set(evaluationColumns.map((column) => column.Field));

    if (!evaluationColumnNames.has("faculty_attendance_mark")) {
      await db.query(`
        ALTER TABLE internship_evaluation
        ADD COLUMN faculty_attendance_mark decimal(5,2) DEFAULT NULL AFTER total_mark
      `);
    }

    if (!evaluationColumnNames.has("faculty_attendance_graded_by")) {
      await db.query(`
        ALTER TABLE internship_evaluation
        ADD COLUMN faculty_attendance_graded_by varchar(20) DEFAULT NULL AFTER faculty_attendance_mark
      `);
    }

    if (!evaluationColumnNames.has("faculty_attendance_graded_at")) {
      await db.query(`
        ALTER TABLE internship_evaluation
        ADD COLUMN faculty_attendance_graded_at datetime DEFAULT NULL AFTER faculty_attendance_graded_by
      `);
    }

    const [reportColumns] = await db.query(`
      SHOW COLUMNS FROM internship_report
      WHERE Field IN ('mentor_report_mark', 'mentor_report_graded_at')
    `);
    const reportColumnNames = new Set(reportColumns.map((column) => column.Field));

    if (!reportColumnNames.has("mentor_report_mark")) {
      await db.query(`
        ALTER TABLE internship_report
        ADD COLUMN mentor_report_mark decimal(5,2) DEFAULT NULL AFTER mentor_id
      `);
    }

    if (!reportColumnNames.has("mentor_report_graded_at")) {
      await db.query(`
        ALTER TABLE internship_report
        ADD COLUMN mentor_report_graded_at datetime DEFAULT NULL AFTER mentor_report_mark
      `);
    }
  })().catch((error) => {
    internshipGradeSchemaPromise = null;
    throw error;
  });

  return internshipGradeSchemaPromise;
};

const normalizeMark = (value, max) => {
  const mark = Number(value);

  if (!Number.isFinite(mark) || mark < 0 || mark > max) {
    return null;
  }

  return Math.round(mark * 100) / 100;
};

const calculateKnownInternshipGrade = ({
  companyMark,
  attendanceMark,
  reportMark,
}) => {
  const parts = [companyMark, attendanceMark, reportMark]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  return Math.round(parts.reduce((sum, value) => sum + value, 0) * 100) / 100;
};

export {
  calculateKnownInternshipGrade,
  ensureInternshipGradeColumns,
  normalizeMark,
};
