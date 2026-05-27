import express from "express";
import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ACCOUNT_ROLE_CONFIG from "../utils/accountRoleConfig.js";
import { ensureMustChangePasswordColumn } from "../utils/passwordReset.js";
import { ensureEvaluatorTables } from "../utils/evaluatorSchema.js";

const router = express.Router();

const getUserField = (record, fieldName) => {
  if (!record || !fieldName) return undefined;
  if (record[fieldName] !== undefined) return record[fieldName];

  const lowerFieldName = fieldName.toLowerCase();
  const matchedKey = Object.keys(record).find(
    (key) => key.toLowerCase() === lowerFieldName,
  );

  return matchedKey ? record[matchedKey] : undefined;
};

const createPasswordSetupToken = ({ id, role }) =>
  jwt.sign(
    {
      id,
      role,
      purpose: "password_setup",
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );

const isInactiveAccount = (record) =>
  String(record?.account_status || "active").toLowerCase() === "inactive";

const findAccountByIdentifier = async ({ table, idColumn, identifier }) => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM \`${table}\`
    WHERE \`${idColumn}\` = ? OR email = ?
    ORDER BY CASE WHEN \`${idColumn}\` = ? THEN 0 ELSE 1 END
    LIMIT 1
    `,
    [identifier, identifier, identifier],
  );

  return rows[0] || null;
};

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

    const tryLoginByRole = async (roleKey) => {
      if (!identifier) return null;
      const config = ACCOUNT_ROLE_CONFIG[roleKey];

      if (!config) {
        return null;
      }

      const { table, idColumn, normalizedRole: role } = config;

      const user = await findAccountByIdentifier({ table, idColumn, identifier });
      if (!user) return null;

      const match = await bcrypt.compare(password, user.password);

      if (!match) return null;

      if (isInactiveAccount(user)) {
        return {
          blocked: true,
          status: 403,
          message: "This account has been deactivated",
        };
      }

      if (maintenanceMode && role !== "admin") {
        return {
          blocked: true,
          status: 503,
          message: "System is under maintenance. Only admin login is allowed right now.",
        };
      }

      // 🔥 CHECK FIRST LOGIN
      if (user.must_change_password) {
        const resolvedUserId = getUserField(user, idColumn);

        if (resolvedUserId === undefined || resolvedUserId === null) {
          console.error(
            `Password setup token creation error: missing ${idColumn} for role ${role}`,
            user,
          );
          return null;
        }

        return {
          user: sanitizeUser(user),
          role,
          firstLogin: true,
          setupToken: createPasswordSetupToken({
            id: resolvedUserId,
            role,
          }),
        };
      }

      const resolvedUserId = getUserField(user, idColumn);

      if (resolvedUserId === undefined || resolvedUserId === null) {
        console.error(
          `Login token creation error: missing ${idColumn} for role ${role}`,
          user,
        );
        return null;
      }

      const token = jwt.sign(
        { id: resolvedUserId, role },
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
      await ensureMustChangePasswordColumn("company");

      const company = await findAccountByIdentifier({
        table: "company",
        idColumn: "company_id",
        identifier,
      });
      if (!company) return null;

      const match = await bcrypt.compare(password, company.password);

      if (!match) return null;

      if (isInactiveAccount(company)) {
        return {
          blocked: true,
          status: 403,
          message: "This company account has been deactivated",
        };
      }

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

      if (company.must_change_password) {
        return {
          user: sanitizeUser(company),
          role: "company",
          firstLogin: true,
          setupToken: createPasswordSetupToken({
            id: company.company_id,
            role: "company",
          }),
        };
      }

      const token = jwt.sign(
        { id: company.company_id, company_id: company.company_id, role: "company" },
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

    if (!result && identifier)
      result = await tryLoginByRole("student");
    if (!result && identifier)
      result = await tryLoginByRole("admin");
    if (!result && identifier)
      result = await tryLoginByRole("mentor");
    if (!result && identifier)
      result = await tryLoginByRole("faculty");
    if (!result && identifier)
      result = await tryLoginByRole("uil");
    if (!result && identifier)
      result = await tryLoginByRole("company_mentor");
    if (!result && identifier) {
      await ensureEvaluatorTables(db);
      result = await tryLoginByRole("evaluator");
    }

    if (!result) {
      result = await tryCompanyLogin();
    }

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
        setupToken: result.setupToken,
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
