import db from "../config/mysql.js"

export const checkMaintenanceMode = async (req, res, next) => {
  try {
    const [result] = await db.query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'maintenance_mode'"
    );

    const maintenance = result[0]?.setting_value === "true";

    // Allow admin to access even during maintenance
    if (maintenance && req.user?.role !== "admin") {
      return res.status(503).json({
        success: false,
        message: "System is under maintenance. Please try again later.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false });
  }
};