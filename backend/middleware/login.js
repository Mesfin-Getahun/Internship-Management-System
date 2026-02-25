import express from "express";
import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req, res) => {
  const { id, email, password } = req.body;

  try {
    // Generic helper
    const tryLoginById = async (table, idColumn, role) => {
      const [rows] = await db.query(
        `SELECT * FROM ${table} WHERE ${idColumn} = ?`,
        [id]
      );

      if (rows.length === 0) return null;

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) return null;

      const token = jwt.sign(
        { id: user[idColumn], role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return { user, role, token };
    };

    // Company login (EMAIL based)
    const tryCompanyLogin = async () => {
      if (!email) return null;

      const [rows] = await db.query("SELECT * FROM company WHERE email = ? ", [
        email,
      ]);

      if (rows.length === 0) return null;

      const company = rows[0];
      const match = await bcrypt.compare(password, company.password);

      if (!match) return null;

      // const token = jwt.sign(
      //   { id: company.company_id, role: "company" },
      //   process.env.JWT_SECRET,
      //   { expiresIn: "1d" }
      // );

      const token = jwt.sign(
        { company_id: company.company_id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return { user: company, role: "company", token };
    };

    let result = null;

    // Try company first (email)
    result = await tryCompanyLogin();

    // Others use ID
    if (!result && id)
      result = await tryLoginById("student", "student_id", "student");
    if (!result && id)
      result = await tryLoginById("admin", "admin_id", "admin");
    if (!result && id)
      result = await tryLoginById("mentor", "mentor_id", "mentor");
    if (!result && id)
      result = await tryLoginById("faculty", "faculty_id", "faculty");
    if (!result && id) result = await tryLoginById("UIL", "UIL_id", "UIL");
    if (!result && id)
      result = await tryLoginById(
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
