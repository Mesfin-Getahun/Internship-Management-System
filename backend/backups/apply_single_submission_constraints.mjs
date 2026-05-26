import db from "../config/mysql.js";

const requiredColumnsCondition = (alias, columns) =>
  columns.map((column) => `${alias}.${column} IS NOT NULL`).join(" AND ");

const indexExists = async (tableName, indexName) => {
  const [rows] = await db.query(
    `
    SHOW INDEX
    FROM \`${tableName}\`
    WHERE Key_name = ?
    `,
    [indexName],
  );

  return rows.length > 0;
};

const tableExists = async (tableName) => {
  const [rows] = await db.query("SHOW TABLES LIKE ?", [tableName]);
  return rows.length > 0;
};

const columnExists = async (tableName, columnName) => {
  const [rows] = await db.query(
    `
    SHOW COLUMNS
    FROM \`${tableName}\`
    LIKE ?
    `,
    [columnName],
  );

  return rows.length > 0;
};

const archiveAndDeleteDuplicates = async ({
  tableName,
  archiveTableName,
  idColumn,
  partitionColumns,
  orderBy,
}) => {
  const keepTableName = `keep_${tableName}_${Date.now()}`;
  const sourceCondition = requiredColumnsCondition(tableName, partitionColumns);
  const deleteCondition = requiredColumnsCondition(tableName, partitionColumns);

  await db.query(`CREATE TABLE IF NOT EXISTS \`${archiveTableName}\` LIKE \`${tableName}\``);
  await db.query(`
    CREATE TEMPORARY TABLE \`${keepTableName}\` AS
    SELECT \`${idColumn}\`
    FROM (
      SELECT
        \`${idColumn}\`,
        ROW_NUMBER() OVER (
          PARTITION BY ${partitionColumns.map((column) => `\`${column}\``).join(", ")}
          ORDER BY ${orderBy}
        ) AS row_rank
      FROM \`${tableName}\`
      WHERE ${partitionColumns.map((column) => `\`${column}\` IS NOT NULL`).join(" AND ")}
    ) ranked
    WHERE row_rank = 1
  `);

  const [[archiveResult]] = await db.query(`
    SELECT COUNT(*) AS duplicate_count
    FROM \`${tableName}\`
    LEFT JOIN \`${keepTableName}\`
      ON \`${keepTableName}\`.\`${idColumn}\` = \`${tableName}\`.\`${idColumn}\`
    WHERE \`${keepTableName}\`.\`${idColumn}\` IS NULL
      AND ${sourceCondition}
  `);

  await db.query(`
    INSERT INTO \`${archiveTableName}\`
    SELECT \`${tableName}\`.*
    FROM \`${tableName}\`
    LEFT JOIN \`${keepTableName}\`
      ON \`${keepTableName}\`.\`${idColumn}\` = \`${tableName}\`.\`${idColumn}\`
    WHERE \`${keepTableName}\`.\`${idColumn}\` IS NULL
      AND ${sourceCondition}
  `);

  await db.query(`
    DELETE \`${tableName}\`
    FROM \`${tableName}\`
    LEFT JOIN \`${keepTableName}\`
      ON \`${keepTableName}\`.\`${idColumn}\` = \`${tableName}\`.\`${idColumn}\`
    WHERE \`${keepTableName}\`.\`${idColumn}\` IS NULL
      AND ${deleteCondition}
  `);

  await db.query(`DROP TEMPORARY TABLE \`${keepTableName}\``);

  return Number(archiveResult.duplicate_count || 0);
};

const addUniqueIndex = async ({ tableName, indexName, columns }) => {
  if (await indexExists(tableName, indexName)) {
    console.log(`${indexName} already exists`);
    return;
  }

  await db.query(`
    ALTER TABLE \`${tableName}\`
    ADD UNIQUE KEY \`${indexName}\` (${columns.map((column) => `\`${column}\``).join(", ")})
  `);
  console.log(`${indexName} added`);
};

try {
  const archivedApplications = await archiveAndDeleteDuplicates({
    tableName: "application",
    archiveTableName: "application_duplicate_archive",
    idColumn: "application_id",
    partitionColumns: ["student_id", "internship_id"],
    orderBy: `
      CASE LOWER(COALESCE(status, ''))
        WHEN 'accepted' THEN 5
        WHEN 'pending' THEN 4
        WHEN 'withdrawn' THEN 3
        WHEN 'cancelled' THEN 2
        WHEN 'rejected' THEN 1
        ELSE 0
      END DESC,
      application_id DESC
    `,
  });
  await addUniqueIndex({
    tableName: "application",
    indexName: "uq_application_student_internship",
    columns: ["student_id", "internship_id"],
  });

  const archivedReports = await archiveAndDeleteDuplicates({
    tableName: "internship_report",
    archiveTableName: "internship_report_duplicate_archive",
    idColumn: "report_id",
    partitionColumns: ["student_id", "internship_id"],
    orderBy: `
      CASE LOWER(COALESCE(status, ''))
        WHEN 'faculty_submitted' THEN 4
        WHEN 'approved' THEN 3
        WHEN 'signed' THEN 2
        WHEN 'submitted' THEN 1
        ELSE 0
      END DESC,
      COALESCE(faculty_submitted_at, signed_at, submission_date) DESC,
      report_id DESC
    `,
  });
  await addUniqueIndex({
    tableName: "internship_report",
    indexName: "uq_report_student_internship",
    columns: ["student_id", "internship_id"],
  });

  const archivedEvaluations = await archiveAndDeleteDuplicates({
    tableName: "internship_evaluation",
    archiveTableName: "internship_evaluation_duplicate_archive",
    idColumn: "evaluation_id",
    partitionColumns: ["student_id", "internship_id"],
    orderBy: "submitted_at DESC, evaluation_id DESC",
  });
  await addUniqueIndex({
    tableName: "internship_evaluation",
    indexName: "uq_evaluation_student_internship",
    columns: ["student_id", "internship_id"],
  });

  let archivedPlacements = 0;
  if (await columnExists("student_internship", "academic_year_id")) {
    archivedPlacements = await archiveAndDeleteDuplicates({
      tableName: "student_internship",
      archiveTableName: "student_internship_duplicate_archive",
      idColumn: "id",
      partitionColumns: ["student_id", "internship_id", "academic_year_id"],
      orderBy: `
        CASE LOWER(COALESCE(cohort_status, ''))
          WHEN 'current' THEN 2
          ELSE 1
        END DESC,
        CASE LOWER(COALESCE(status, ''))
          WHEN 'in progress' THEN 5
          WHEN 'active' THEN 4
          WHEN 'accepted' THEN 3
          WHEN 'completed' THEN 2
          WHEN 'complete' THEN 2
          ELSE 1
        END DESC,
        id DESC
      `,
    });
    await addUniqueIndex({
      tableName: "student_internship",
      indexName: "uq_student_internship_academic_year",
      columns: ["student_id", "internship_id", "academic_year_id"],
    });
  } else {
    console.warn("student_internship.academic_year_id is missing; skipped placement unique index");
  }

  let archivedPayments = 0;
  if (await tableExists("payments")) {
    archivedPayments = await archiveAndDeleteDuplicates({
      tableName: "payments",
      archiveTableName: "payments_duplicate_archive",
      idColumn: "payment_id",
      partitionColumns: ["student_id"],
      orderBy: "payment_id DESC",
    });
    await addUniqueIndex({
      tableName: "payments",
      indexName: "uq_payments_student",
      columns: ["student_id"],
    });
  } else {
    console.warn("payments table is missing; skipped payment unique index");
  }

  console.table({
    archivedApplications,
    archivedReports,
    archivedEvaluations,
    archivedPlacements,
    archivedPayments,
  });
} finally {
  await db.end();
}
