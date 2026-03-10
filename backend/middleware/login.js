import express from "express";
import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req, res) => {
  const { id, email, password } = req.body;

  try {
    const tryLoginById = async (table, idColumn, role) => {
      const [rows] = await db.query(
        `SELECT * FROM ${table} WHERE ${idColumn} = ?`,
        [id]
      );

      if (!rows.length) return null;

      const user = rows[0];

      const match = await bcrypt.compare(password, user.password);
      if (!match) return null;

      // 🔥 Remove password before returning
      delete user.password;

      // 🔥 First login check
      if (user.must_change_password) {
        return {
          user,
          role,
          firstLogin: true,
        };
      }

      // 🔥 Token with consistent structure
      const token = jwt.sign(
        { id: user[idColumn], role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return {
        user,
        role,
        token,
        firstLogin: false,
      };
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
        {
          id: company.company_id,
          role: "company",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // Remove password
      delete company.password;

      return {
        user: company,
        role: "company",
        token,
      };
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

    // if (!result) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid credentials",
    //   });
    // }

    // res.status(200).json({
    //   success: true,
    //   message: "Login successful",
    //   role: result.role,
    //   token: result.token,
    //   user: result.user,
    // });

    if (!result) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🔥 If first login → no token
    // if (result.firstLogin) {
    //   return res.status(200).json({
    //     success: true,
    //     firstLogin: true,
    //     role: result.role,
    //     user: result.user,
    //     message: "You must change your password before continuing",
    //   });
    // }

    // res.status(200).json({
    //   success: true,
    //   message: "Login successful",
    //   role: result.role,
    //   token: result.token,
    //   user: result.user,
    // });

    if (result.firstLogin) {
      const token = jwt.sign(
        { id: result.user[`${result.role}_id`], role: result.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        success: true,
        firstLogin: true,
        role: result.role,
        token,
        user: result.user,
        message: "You must change your password before continuing",
      });
    }

    // ✅ NORMAL LOGIN RESPONSE (MUST ADD THIS)
    return res.status(200).json({
      success: true,
      firstLogin: false,
      role: result.role,
      token: result.token,
      user: result.user,
      message: "Login successful",
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
