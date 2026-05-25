import db from "../config/mysql.js";

let internshipEvaluationSchemaPromise = null;

export const ensureInternshipEvaluationMentorColumns = async () => {
  if (internshipEvaluationSchemaPromise) {
    return internshipEvaluationSchemaPromise;
  }

  internshipEvaluationSchemaPromise = (async () => {
    const [columns] = await db.query(`
      SHOW COLUMNS
      FROM internship_evaluation
      WHERE Field IN ('company_mentor_id')
    `);

    const existingColumns = new Set(columns.map((column) => column.Field));

    if (!existingColumns.has("company_mentor_id")) {
      await db.query(`
        ALTER TABLE internship_evaluation
        ADD COLUMN company_mentor_id varchar(20) DEFAULT NULL AFTER internship_id
      `);
    }

    const [indexes] = await db.query(`
      SHOW INDEX
      FROM internship_evaluation
      WHERE Key_name = 'idx_internship_evaluation_company_mentor'
    `);

    if (indexes.length === 0) {
      await db.query(`
        CREATE INDEX idx_internship_evaluation_company_mentor
        ON internship_evaluation (company_mentor_id)
      `);
    }
  })().catch((error) => {
    internshipEvaluationSchemaPromise = null;
    throw error;
  });

  return internshipEvaluationSchemaPromise;
};
