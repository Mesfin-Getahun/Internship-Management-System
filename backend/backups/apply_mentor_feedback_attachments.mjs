import db from "../config/mysql.js";
import { ensureMentorFeedbackAttachmentColumns } from "../utils/mentorFeedbackSchema.js";

try {
  await ensureMentorFeedbackAttachmentColumns();

  const [columns] = await db.query(`
    SHOW COLUMNS
    FROM mentor_feedback
    WHERE Field IN ('attachment_url', 'attachment_name')
  `);

  console.table(columns);
} finally {
  await db.end();
}
