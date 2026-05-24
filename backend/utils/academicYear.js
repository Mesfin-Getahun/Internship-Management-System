import db from "../config/mysql.js";

const buildAcademicYearWindow = (date = new Date()) => {
  const year = date.getFullYear();
  const startsThisYear = date.getMonth() >= 8;
  const startYear = startsThisYear ? year : year - 1;
  const endYear = startYear + 1;

  return {
    label: `${startYear}/${endYear}`,
    startDate: `${startYear}-09-01`,
    endDate: `${endYear}-08-31`,
  };
};

const getCurrentAcademicYear = async (connection = db) => {
  const [rows] = await connection.query(
    `
    SELECT academic_year_id, label, start_date, end_date, status, archived_at
    FROM academic_year
    WHERE status = 'current'
    ORDER BY academic_year_id DESC
    LIMIT 1
    `,
  );

  if (rows.length > 0) return rows[0];

  const { label, startDate, endDate } = buildAcademicYearWindow();
  const [result] = await connection.query(
    `
    INSERT INTO academic_year (label, start_date, end_date, status)
    VALUES (?, ?, ?, 'current')
    ON DUPLICATE KEY UPDATE status = 'current'
    `,
    [label, startDate, endDate],
  );

  const [createdRows] = await connection.query(
    `
    SELECT academic_year_id, label, start_date, end_date, status, archived_at
    FROM academic_year
    WHERE academic_year_id = LAST_INSERT_ID()
       OR label = ?
    ORDER BY academic_year_id DESC
    LIMIT 1
    `,
    [label],
  );

  if (!createdRows[0]) {
    throw new Error("Unable to resolve current academic year");
  }

  return createdRows[0];
};

const listAcademicYears = async () => {
  const [rows] = await db.query(
    `
    SELECT academic_year_id, label, start_date, end_date, status, archived_at, created_at
    FROM academic_year
    ORDER BY start_date DESC, academic_year_id DESC
    `,
  );

  return rows;
};

export { buildAcademicYearWindow, getCurrentAcademicYear, listAcademicYears };
