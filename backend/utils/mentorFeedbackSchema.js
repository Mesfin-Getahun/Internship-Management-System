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
      WHERE Field IN ('faculty_mentor_id', 'attachment_url', 'attachment_name', 'feedback_week', 'week_start_date', 'week_end_date')
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

    if (!existingColumns.has("feedback_week")) {
      await db.query(`
        ALTER TABLE mentor_feedback
        ADD COLUMN feedback_week int DEFAULT NULL AFTER feedback_type
      `);
    }

    if (!existingColumns.has("week_start_date")) {
      await db.query(`
        ALTER TABLE mentor_feedback
        ADD COLUMN week_start_date date DEFAULT NULL AFTER feedback_week
      `);
    }

    if (!existingColumns.has("week_end_date")) {
      await db.query(`
        ALTER TABLE mentor_feedback
        ADD COLUMN week_end_date date DEFAULT NULL AFTER week_start_date
      `);
    }

    const [indexes] = await db.query(`
      SHOW INDEX
      FROM mentor_feedback
      WHERE Key_name = 'idx_mentor_feedback_week'
    `);

    if (indexes.length === 0) {
      await db.query(`
        ALTER TABLE mentor_feedback
        ADD KEY idx_mentor_feedback_week
          (student_id, internship_id, company_mentor_id, feedback_week)
      `);
    }
  })().catch((error) => {
    feedbackColumnsPromise = null;
    throw error;
  });

  return feedbackColumnsPromise;
};
