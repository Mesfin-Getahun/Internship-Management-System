import jwt from "jsonwebtoken";
import db from "../config/mysql.js"

export const checkMaintenanceMode = async (req, res, next) => {
  try {
    const [result] = await db.query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'maintenance_mode'"
    );

    const maintenance = result[0]?.setting_value === "true";

    if (!maintenance) {
      return next();
    }

    if (req.path === "/api/login") {
      return next();
    }

    const authHeader = req.headers.authorization;
    let isAdmin = false;

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isAdmin = decoded?.role === "admin";
      } catch (error) {
        isAdmin = false;
      }
    }

    if (!isAdmin) {
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
