import db from "../config/mysql.js";

try {
  const [parentColumns] = await db.query(`
    SHOW COLUMNS
    FROM mentor_feedback
    LIKE 'parent_feedback_id'
  `);

  if (parentColumns.length === 0) {
    await db.query(`
      ALTER TABLE mentor_feedback
        ADD COLUMN parent_feedback_id int DEFAULT NULL AFTER company_mentor_id,
        ADD KEY parent_feedback_id (parent_feedback_id)
    `);
  }

  await db.query(`
    ALTER TABLE mentor_feedback
      MODIFY company_mentor_id varchar(20) DEFAULT NULL,
      MODIFY feedback_type enum('weekly','midterm','final','faculty') DEFAULT 'weekly'
  `);

  const [columns] = await db.query(`
    SHOW COLUMNS
    FROM mentor_feedback
    WHERE Field IN ('company_mentor_id', 'parent_feedback_id', 'feedback_type')
  `);

  console.table(columns);
} finally {
  await db.end();
}
