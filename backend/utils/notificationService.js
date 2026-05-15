import db from "../config/mysql.js";

const NOTIFICATIONS_TABLE = "notifications";
let ensureNotificationsTablePromise = null;

const isMissingNotificationsTable = (error) =>
  error?.code === "ER_NO_SUCH_TABLE" && error?.sqlMessage?.includes(NOTIFICATIONS_TABLE);

const ensureNotificationsTable = async () => {
  if (!ensureNotificationsTablePromise) {
    ensureNotificationsTablePromise = db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id int NOT NULL AUTO_INCREMENT,
        recipient_role varchar(50) NOT NULL,
        recipient_id varchar(50) NOT NULL,
        title varchar(150) NOT NULL,
        message text,
        type varchar(50) DEFAULT 'info',
        link varchar(255) DEFAULT NULL,
        is_read tinyint(1) DEFAULT 0,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        read_at datetime DEFAULT NULL,
        PRIMARY KEY (notification_id),
        KEY idx_notifications_recipient (recipient_role, recipient_id, is_read, created_at)
      )
    `).catch((error) => {
      ensureNotificationsTablePromise = null;
      throw error;
    });
  }

  return ensureNotificationsTablePromise;
};

const createNotification = async ({
  recipientRole,
  recipientId,
  title,
  message,
  type = "info",
  link = null,
}) => {
  if (!recipientRole || recipientId === undefined || recipientId === null || !title) {
    return null;
  }

  try {
    await ensureNotificationsTable();
    const [result] = await db.query(
      `
      INSERT INTO notifications
        (recipient_role, recipient_id, title, message, type, link)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        recipientRole,
        String(recipientId),
        title,
        message || "",
        type,
        link,
      ],
    );

    return result.insertId;
  } catch (error) {
    if (!isMissingNotificationsTable(error)) {
      console.error("Create notification error:", error);
    }
    return null;
  }
};

const createNotifications = async (notifications = []) => {
  await Promise.all(notifications.map((notification) => createNotification(notification)));
};

export { createNotification, createNotifications };
