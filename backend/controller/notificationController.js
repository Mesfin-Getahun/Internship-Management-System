import jwt from "jsonwebtoken";
import db from "../config/mysql.js";

const ROLE_ID_FIELDS = {
  student: "id",
  mentor: "id",
  faculty: "id",
  admin: "id",
  uil: "id",
  company_mentor: "id",
  company: "company_id",
};

const normalizeRole = (role) => String(role || "").toLowerCase();

const resolveRecipient = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    const token = authHeader.slice(7).trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const role = normalizeRole(decoded.role || (decoded.company_id ? "company" : ""));
    const idField = ROLE_ID_FIELDS[role];
    const recipientId = idField ? decoded[idField] : null;

    if (!role || recipientId === undefined || recipientId === null) {
      return res.status(403).json({
        success: false,
        message: "Unable to resolve notification recipient",
      });
    }

    req.notificationRecipient = {
      role,
      id: String(recipientId),
    };

    next();
  } catch (error) {
    console.error("Notification auth error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid token or session expired",
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { role, id } = req.notificationRecipient;

    const [notifications] = await db.query(
      `
      SELECT
        notification_id,
        title,
        message,
        type,
        link,
        is_read,
        created_at
      FROM notifications
      WHERE recipient_role = ?
        AND recipient_id = ?
      ORDER BY created_at DESC, notification_id DESC
      LIMIT 30
      `,
      [role, id],
    );

    const [[countRow]] = await db.query(
      `
      SELECT COUNT(*) AS unread_count
      FROM notifications
      WHERE recipient_role = ?
        AND recipient_id = ?
        AND is_read = 0
      `,
      [role, id],
    );

    res.json({
      success: true,
      notifications,
      unread_count: countRow?.unread_count || 0,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { role, id } = req.notificationRecipient;
    const { notification_id } = req.params;

    await db.query(
      `
      UPDATE notifications
      SET is_read = 1, read_at = NOW()
      WHERE notification_id = ?
        AND recipient_role = ?
        AND recipient_id = ?
      `,
      [notification_id, role, id],
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const { role, id } = req.notificationRecipient;

    await db.query(
      `
      UPDATE notifications
      SET is_read = 1, read_at = NOW()
      WHERE recipient_role = ?
        AND recipient_id = ?
        AND is_read = 0
      `,
      [role, id],
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
};

export {
  resolveRecipient,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
