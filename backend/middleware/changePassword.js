import express from "express";
import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import { resolveAccountRole } from "../utils/accountRoleConfig.js";

const changeRouter = express.Router();

changeRouter.post("/", async (req, res) => {
  const { id, role, currentPassword, newPassword } = req.body;

  try {
    const roleConfig = resolveAccountRole(role);

    if (!id || !roleConfig || !newPassword || !currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Valid role, account ID, current password, and new password are required",
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
