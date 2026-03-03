import db from "../config/mysql.js";
const createLog = async (userId, action, description) => {
  try {
    await db.query(
      "INSERT INTO system_logs (user_id, action, description) VALUES (?, ?, ?)",
      [userId, action, description]
    );
  } catch (error) {
    console.error("Log error:", error);
  }
};

export default createLog;
