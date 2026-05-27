import express from "express";
import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { resolveAccountRole } from "../utils/accountRoleConfig.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  generateTemporaryPassword,
  resetAccountPassword,
} from "../utils/passwordReset.js";
import { insertSystemLog } from "../utils/systemLogService.js";

const changeRouter = express.Router();

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const normalizeResetRole = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === "organization") return "company";
  if (normalized === "org_supervisor") return "company_mentor";
  return normalized;
};

const SELF_SERVICE_RESET_ROLES = new Set(["company", "company_mentor", "admin"]);

const getRoleLabel = (role) => {
  switch (normalizeRole(role)) {
    case "company":
      return "company";
    case "company_mentor":
      return "company mentor";
    case "admin":
      return "admin";
    default:
      return "account";
  }
};

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

changeRouter.post("/forgot", async (req, res) => {
  try {
    const role = normalizeResetRole(req.body?.role);
    const identifier = String(req.body?.identifier || "").trim();
    const roleConfig = resolveAccountRole(role);

    if (!SELF_SERVICE_RESET_ROLES.has(role) || !roleConfig || !identifier) {
      return res.status(400).json({
        success: false,
        message: "Forgot password is available only for company, company mentor, and admin accounts.",
      });
    }

    const { table, idColumn } = roleConfig;
    const [rows] = await db.query(
      `SELECT ${idColumn} AS account_id, email FROM \`${table}\` WHERE ${idColumn} = ? OR email = ? LIMIT 1`,
      [identifier, identifier],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found for that role and identifier.",
      });
    }

    const account = rows[0];
    const temporaryPassword = generateTemporaryPassword();
    const resetResult = await resetAccountPassword({
      table,
      idColumn,
      accountId: account.account_id,
      temporaryPassword,
    });

    if (resetResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    let emailSent = false;
    let emailWarning = null;

    if (account.email) {
      try {
        await sendEmail(
          account.email,
          "Password reset request",
          `
            <h2>Password Reset</h2>
            <p>Your ${getRoleLabel(role)} account password was reset.</p>
            <p><b>Temporary password:</b> ${temporaryPassword}</p>
            <p>Please sign in and change this password immediately.</p>
          `,
        );
        emailSent = true;
      } catch (emailError) {
        console.error("Forgot password email error:", emailError);
        emailWarning = "Password was reset, but the email could not be sent.";
      }
    } else {
      emailWarning = "Password was reset, but this account has no email address.";
    }

    await insertSystemLog({
      actorId: account.account_id,
      action: "SELF_SERVICE_PASSWORD_RESET",
      description: `${roleConfig.normalizedRole} requested password reset: ${account.account_id}`,
    }).catch(() => null);

    res.status(200).json({
      success: true,
      message: emailSent
        ? "Temporary password sent to the account email."
        : "Temporary password generated. Email delivery is unavailable.",
      emailSent,
      emailWarning,
      temporary_password: emailSent ? undefined : temporaryPassword,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password.",
    });
  }
});

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
      return res.status(400).json({
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
