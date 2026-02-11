import express from "express";
import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req, res) => {
  const { id, password } = req.body;

  try {
    // Helper to search in a table with a specific column name and return result if match
    const tryLogin = async (table, idColumn, role) => {
      let query = `SELECT * FROM ${table} WHERE ${idColumn} = ?`;

      // Only for staff_official, check if active
      // if (table === "staff_official") {
      //   query += " AND status = 'active'"; // or "AND status = 'active'"
      // }

      const [rows] = await db.query(query, [id]);

      if (rows.length > 0) {
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          const token = jwt.sign(
            { id: user[idColumn], role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );
          console.log(user);
          return { user, role, token };
        }
      }

      return null;
    };

    // Try logging in as student, admin, or staff_official
    let result = await tryLogin("student", "student_id", "student");
    if (!result) result = await tryLogin("admin", "admin_id", "admin");
    if (!result) result = await tryLogin("mentor", "mentor_id", "mentor");
    if (!result) result = await tryLogin("company", "company_id", "company");
    if (!result) result = await tryLogin("faculty", "faculty_id", "faculty");
    if (!result) result = await tryLogin("UIL", "UIL_id", "UIL");
    if (!result)
      result = await tryLogin(
        "company_mentor",
        "company_mentor_id",
        "company_mentor"
      );
    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid id or password" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      role: result.role,
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" + error });
  }
});

export default router;
