import express from "express";
import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import authenticateAuto from "../middleware/authenticateAuto.js";

const changeRouter = express.Router();

// 🔐 Protected Route
changeRouter.put("/", authenticateAuto, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE ${user.role}
       SET password = ?, must_change_password = FALSE
       WHERE ${user.role}_id = ?`,
      [hashedPassword, user[`${user.role}_id`]]
    );

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default changeRouter;
