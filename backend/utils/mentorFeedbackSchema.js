import db from "../config/mysql.js";

let attachmentColumnsPromise = null;

export const ensureMentorFeedbackAttachmentColumns = async () => {
  if (attachmentColumnsPromise) {
    return attachmentColumnsPromise;
  }

  attachmentColumnsPromise = (async () => {
    const [columns] = await db.query(`
      SHOW COLUMNS
      FROM mentor_feedback
      WHERE Field IN ('attachment_url', 'attachment_name')
    `);

    const existingColumns = new Set(columns.map((column) => column.Field));

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
    attachmentColumnsPromise = null;
    throw error;
  });

  return attachmentColumnsPromise;
};
