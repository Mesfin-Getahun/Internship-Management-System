import express from "express";
import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { resolveAccountRole } from "../utils/accountRoleConfig.js";

const changeRouter = express.Router();

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim();
};

const resolvePasswordChangeSession = (req) => {
  const token = getBearerToken(req) || req.body.setupToken;
  if (!token) return null;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  return {
    id: decoded.id || decoded.company_id,
    role: normalizeRole(decoded.role || (decoded.company_id ? "company" : "")),
    isSetupToken: decoded.purpose === "password_setup",
  };
};

changeRouter.post("/", async (req, res) => {
  const { id, role, currentPassword, newPassword } = req.body;

  try {
    const roleConfig = resolveAccountRole(role);
    let session = null;

    try {
      session = resolvePasswordChangeSession(req);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired password change session",
      });
    }

    if (!id || !roleConfig || !newPassword || !currentPassword || !session) {
      return res.status(400).json({
        success: false,
        message: "Valid role, account ID, current password, new password, and session are required",
      });
    }

    if (
      String(session.id) !== String(id) ||
      session.role !== normalizeRole(roleConfig.normalizedRole)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only change the password for your own account",
      });
    }

    const { table, idColumn } = roleConfig;
    const [rows] = await db.query(
      `SELECT password FROM ${table} WHERE ${idColumn} = ? LIMIT 1`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const passwordMatches = await bcrypt.compare(currentPassword, rows[0].password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE ${table} 
       SET password = ?, must_change_password = FALSE
       WHERE ${idColumn} = ?`,
      [hashedPassword, id],
    );

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default changeRouter;
