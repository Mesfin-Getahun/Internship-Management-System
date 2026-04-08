import express from "express";
import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req, res) => {
  const { id, email, password } = req.body;

  try {
    const identifier = id || email;
    const [maintenanceRows] = await db.query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'maintenance_mode' LIMIT 1"
    );
    const maintenanceMode = maintenanceRows[0]?.setting_value === "true";

    const sanitizeUser = (user) => {
      const { password: _password, ...safeUser } = user;
      return safeUser;
    };

    const tryLoginByIdOrEmail = async (table, idColumn, role) => {
      if (!identifier) return null;

      const [rows] = await db.query(
        `SELECT * FROM ${table} WHERE ${idColumn} = ? OR email = ? LIMIT 1`,
        [identifier, identifier]
      );

      if (rows.length === 0) return null;

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) return null;

      if (maintenanceMode && role !== "admin") {
        return {
          blocked: true,
          status: 503,
          message: "System is under maintenance. Only admin login is allowed right now.",
        };
      }

      // 🔥 CHECK FIRST LOGIN
      if (user.must_change_password) {
        return {
          user: sanitizeUser(user),
          role,
          firstLogin: true,
        };
      }

      const token = jwt.sign(
        { id: user[idColumn], role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return {
        user: sanitizeUser(user),
        role,
        token,
        firstLogin: false,
      };
    };

    // Company login (EMAIL or company_id based)
    const tryCompanyLogin = async () => {
      if (!identifier) return null;

      const [rows] = await db.query(
        "SELECT * FROM company WHERE email = ? OR company_id = ? LIMIT 1",
        [identifier, identifier]
      );

      if (rows.length === 0) return null;

      const company = rows[0];
      const match = await bcrypt.compare(password, company.password);

      if (!match) return null;

      if (maintenanceMode) {
        return {
          blocked: true,
          status: 503,
          message: "System is under maintenance. Only admin login is allowed right now.",
        };
      }

      if (company.status === "pending") {
        return {
          blocked: true,
          status: 403,
          message: "Company account is pending UIL approval",
        };
      }

      if (company.status === "rejected") {
        return {
          blocked: true,
          status: 403,
          message: "Company account was rejected",
        };
      }

      const token = jwt.sign(
        { company_id: company.company_id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return {
        user: sanitizeUser(company),
        role: "company",
        token,
        firstLogin: false,
      };
    };

    let result = null;

    // Try company first (email)
    result = await tryCompanyLogin();

    if (result?.blocked) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }

    // Others use ID
    if (!result && identifier)
      result = await tryLoginByIdOrEmail("student", "student_id", "student");
    if (!result && identifier)
      result = await tryLoginByIdOrEmail("admin", "admin_id", "admin");
    if (!result && identifier)
      result = await tryLoginByIdOrEmail("mentor", "mentor_id", "mentor");
    if (!result && identifier)
      result = await tryLoginByIdOrEmail("faculty", "faculty_id", "faculty");
    if (!result && identifier)
      result = await tryLoginByIdOrEmail("UIL", "UIL_id", "UIL");
    if (!result && identifier)
      result = await tryLoginByIdOrEmail(
        "company_mentor",
        "company_mentor_id",
        "company_mentor"
      );

    if (!result) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (result?.blocked) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }

    // 🔥 If first login → no token
    if (result.firstLogin) {
      return res.status(200).json({
        success: true,
        firstLogin: true,
        role: result.role,
        user: result.user,
        message: "You must change your password before continuing",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      role: result.role,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
