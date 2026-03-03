import express from "express";
import db from "../config/mysql.js";
import bcrypt from "bcryptjs";

const changeRouter = express.Router();

changeRouter.post("/", async (req, res) => {
  const { id, role, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE ${role} 
       SET password = ?, must_change_password = FALSE
       WHERE ${role}_id = ?`,
      [hashedPassword, id]
    );

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default changeRouter;
