import db from "../config/mysql.js";

const NOTIFICATIONS_TABLE = "notifications";

const isMissingNotificationsTable = (error) =>
  error?.code === "ER_NO_SUCH_TABLE" && error?.sqlMessage?.includes(NOTIFICATIONS_TABLE);

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
