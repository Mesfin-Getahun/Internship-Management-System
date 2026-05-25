import db from "../config/mysql.js";

let companyMentorSchemaPromise = null;

export const ensureCompanyMentorCompanyColumn = async () => {
  if (companyMentorSchemaPromise) {
    return companyMentorSchemaPromise;
  }

  companyMentorSchemaPromise = (async () => {
    const [columns] = await db.query(`
      SHOW COLUMNS
      FROM company_mentor
      WHERE Field = 'company_id'
    `);

    if (columns.length === 0) {
      await db.query(`
        ALTER TABLE company_mentor
        ADD COLUMN company_id int DEFAULT NULL AFTER company_mentor_id
      `);
    }

    const [indexes] = await db.query(`
      SHOW INDEX
      FROM company_mentor
      WHERE Key_name = 'idx_company_mentor_company_id'
    `);

    if (indexes.length === 0) {
      await db.query(`
        CREATE INDEX idx_company_mentor_company_id
        ON company_mentor (company_id)
      `);
    }

    const [[companyCount]] = await db.query(
      "SELECT COUNT(*) AS total, MIN(company_id) AS only_company_id FROM company",
    );

    if (Number(companyCount?.total || 0) === 1 && companyCount.only_company_id) {
      await db.query(
        "UPDATE company_mentor SET company_id = ? WHERE company_id IS NULL",
        [companyCount.only_company_id],
      );
    }
  })().catch((error) => {
    companyMentorSchemaPromise = null;
    throw error;
  });

  return companyMentorSchemaPromise;
};
