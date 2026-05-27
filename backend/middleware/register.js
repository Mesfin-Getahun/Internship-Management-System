import bcrypt from "bcryptjs";
import db from "../config/mysql.js";

export const registerStudent = async (req, res) => {
  try {
    const {
      student_id,
      full_name,
      email,
      phone_number,
      password,
      faculty,
      department,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO student
       (student_id, full_name, email, phone_number, password, faculty, department, profile_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        student_id,
        full_name,
        email,
        phone_number,
        hashedPassword,
        faculty,
        department,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

export const createCompanyMentor = async (req, res) => {
  try {
    const { company_mentor_id, full_name, email, phone_number } = req.body;

    if (!company_mentor_id || !full_name || !email) {
      return res.status(400).json({
        success: false,
        message: "Company mentor ID, full name, and email are required",
      });
    }

    const [[exists]] = await db.query(
      "SELECT company_mentor_id FROM company_mentor WHERE company_mentor_id = ? OR email = ?",
      [company_mentor_id, email],
    );

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Company mentor already exists",
      });
    }

    const defaultPassword = `${String(email || "").trim()}${String(full_name || "").trim()}`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await db.query(
      `INSERT INTO company_mentor
       (company_mentor_id, full_name, email, phone_number, password, must_change_password)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [company_mentor_id, full_name, email, phone_number, hashedPassword],
    );

    res.status(201).json({
      success: true,
      message: "Mentor created successfully",
      default_password_rule: "email + full_name",
    });
  } catch (err) {
    console.error("Company mentor registration error:", err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

export const createFaculty = async (req, res) => {
  try {
    const { faculty_id, faculty_name, email, password } = req.body;

    if (!faculty_id || !faculty_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Faculty ID, faculty name, email, and password are required",
      });
    }

    const [[exists]] = await db.query(
      "SELECT faculty_id FROM faculty WHERE faculty_id = ? OR email = ?",
      [faculty_id, email],
    );

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Faculty account already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO faculty (faculty_id, faculty_name, email, password, must_change_password)
       VALUES (?, ?, ?, ?, TRUE)`,
      [faculty_id, faculty_name, email, hashedPassword],
    );

    res.status(201).json({ success: true, message: "Faculty registered successfully" });
  } catch (error) {
    console.error("Faculty registration error:", error);
    res.status(500).json({ success: false, message: "Failed to register faculty" });
  }
};

export const createMentor = async (req, res) => {
  try {
    const { mentor_id, full_name, email, phone_number, password } = req.body;

    // check if mentor already exists
    const [[exists]] = await db.query(
      "SELECT mentor_id FROM mentor WHERE mentor_id = ? OR email = ?",
      [mentor_id, email],
    );

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Mentor already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert mentor
    await db.query(
      `
      INSERT INTO mentor
      (mentor_id, full_name, email, phone_number, password)
      VALUES (?, ?, ?, ?, ?)
      `,
      [mentor_id, full_name, email, phone_number, hashedPassword],
    );

    res.status(201).json({
      success: true,
      message: "Mentor created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create mentor",
    });
  }
};

export const createUIL = async (req, res) => {
  try {
    const { UIL_id, full_name, email, phone_number, password } = req.body;

    const [[exists]] = await db.query(
      "SELECT UIL_id FROM UIL WHERE UIL_id = ? OR email = ?",
      [UIL_id, email],
    );

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "UIL account already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO UIL
       (UIL_id, full_name, email, phone_number, password, must_change_password)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [UIL_id, full_name, email, phone_number, hashedPassword],
    );

    res.status(201).json({
      success: true,
      message: "UIL registered successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to register UIL",
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { admin_id, full_name, email, phone_number, password } = req.body;

    const [[exists]] = await db.query(
      "SELECT admin_id FROM admin WHERE admin_id = ? OR email = ?",
      [admin_id, email],
    );

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Admin account already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO admin
       (admin_id, full_name, email, phone_number, password, must_change_password)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [admin_id, full_name, email, phone_number, hashedPassword],
    );

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to register admin",
    });
  }
};
