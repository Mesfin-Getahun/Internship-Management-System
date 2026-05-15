import db from "../config/mysql.js";

<<<<<<< HEAD
let schemaReady = false;
let schemaPromise = null;

async function ensureExpoPushTokenColumn() {
  const [rows] = await db.query("SHOW COLUMNS FROM student LIKE 'expo_push_token'");

  if (rows.length === 0) {
    await db.query("ALTER TABLE student ADD COLUMN expo_push_token VARCHAR(255) DEFAULT NULL");
  }
}

export async function ensureNotificationSchema() {
  if (schemaReady) {
    return;
  }

  if (schemaPromise) {
    return schemaPromise;
  }

  schemaPromise = (async () => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id INT NOT NULL AUTO_INCREMENT,
        student_id VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        metadata JSON DEFAULT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (notification_id),
        KEY student_id (student_id),
        CONSTRAINT notifications_ibfk_1 FOREIGN KEY (student_id) REFERENCES student (student_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await ensureExpoPushTokenColumn();
    schemaReady = true;
  })();

  try {
    await schemaPromise;
  } finally {
    schemaPromise = null;
  }
}

async function getStudentPushToken(studentId) {
  await ensureNotificationSchema();

  const [rows] = await db.query(
    "SELECT expo_push_token FROM student WHERE student_id = ? LIMIT 1",
    [studentId]
  );

  return rows[0]?.expo_push_token || null;
}

async function sendExpoPushNotification(expoPushToken, title, body, data = {}) {
  if (!expoPushToken) {
    return;
  }

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data,
    }),
  });
}

export async function saveStudentPushToken(studentId, expoPushToken) {
  await ensureNotificationSchema();

  if (!studentId || !expoPushToken) {
    throw new Error("Student ID and Expo push token are required");
  }

  await db.query("UPDATE student SET expo_push_token = ? WHERE student_id = ?", [
    expoPushToken,
    studentId,
  ]);

  return { success: true };
}

export async function createStudentNotification({
  studentId,
  title,
  body,
  category = "general",
  metadata = null,
  sendPush = true,
}) {
  await ensureNotificationSchema();

  if (!studentId || !title || !body) {
    throw new Error("studentId, title, and body are required for notifications");
  }

  const metadataValue =
    metadata && typeof metadata === "object" ? JSON.stringify(metadata) : metadata;

  await db.query(
    `
      INSERT INTO notifications (student_id, title, body, category, metadata)
      VALUES (?, ?, ?, ?, ?)
    `,
    [studentId, title, body, category, metadataValue]
  );

  if (sendPush) {
    try {
      const expoPushToken = await getStudentPushToken(studentId);
      await sendExpoPushNotification(expoPushToken, title, body, {
        studentId,
        category,
        metadata,
      });
    } catch (pushError) {
      console.error("Push notification delivery failed:", pushError.message);
    }
  }
}

export async function fetchStudentNotifications(studentId, limit = 50) {
  await ensureNotificationSchema();

  const [rows] = await db.query(
    `
      SELECT
        notification_id,
        student_id,
        title,
        body,
        category,
        metadata,
        is_read,
        created_at,
        updated_at
      FROM notifications
      WHERE student_id = ?
      ORDER BY created_at DESC, notification_id DESC
      LIMIT ?
    `,
    [studentId, Number(limit)]
  );

  return rows;
}
=======
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
>>>>>>> ef1cffe16a5eca79441eeb23a8b74941c34ab1a1
