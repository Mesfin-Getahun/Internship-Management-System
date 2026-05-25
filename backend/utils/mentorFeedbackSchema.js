import db from "../config/mysql.js";

let feedbackColumnsPromise = null;

export const ensureMentorFeedbackAttachmentColumns = async () => {
  if (feedbackColumnsPromise) {
    return feedbackColumnsPromise;
  }

  feedbackColumnsPromise = (async () => {
    const [columns] = await db.query(`
      SHOW COLUMNS
      FROM mentor_feedback
      WHERE Field IN ('faculty_mentor_id', 'attachment_url', 'attachment_name')
    `);

    const existingColumns = new Set(columns.map((column) => column.Field));

    if (!existingColumns.has("faculty_mentor_id")) {
      await db.query(`
        ALTER TABLE mentor_feedback
        ADD COLUMN faculty_mentor_id varchar(20) DEFAULT NULL AFTER company_mentor_id
      `);
    }

    if (!existingColumns.has("attachment_url")) {
      await db.query(`
        ALTER TABLE mentor_feedback
        ADD COLUMN attachment_url varchar(500) DEFAULT NULL AFTER overall_comment
      `);
    }

    if (!existingColumns.has("attachment_name")) {
      await db.query(`
        ALTER TABLE mentor_feedback
        ADD COLUMN attachment_name varchar(255) DEFAULT NULL AFTER attachment_url
      `);
    }
  })().catch((error) => {
    feedbackColumnsPromise = null;
    throw error;
  });

  return feedbackColumnsPromise;
};
