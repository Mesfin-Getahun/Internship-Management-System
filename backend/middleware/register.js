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
      ]
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
    const { company_mentor_id, full_name, email, phone_number, password } =
      req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO company_mentor
       (company_mentor_id, full_name, email, phone_number, password)
       VALUES (?, ?, ?, ?, ?)`,
      [company_mentor_id, full_name, email, phone_number, hashedPassword]
    );

    res.json({ success: true, message: "Mentor created successfully" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

export const createFaculty = async (req, res) => {
  const { faculty_id, faculty_name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.query(
    `INSERT INTO faculty (faculty_id, faculty_name, email, password)
     VALUES (?, ?, ?, ?)`,
    [faculty_id, faculty_name, email, hashedPassword]
  );

  res.json({ success: true, message: "Faculty created" });
};

export const createMentor = async (req, res) => {
  try {
    const { mentor_id, full_name, email, phone_number, password } = req.body;

    // check if mentor already exists
    const [[exists]] = await db.query(
      "SELECT mentor_id FROM mentor WHERE mentor_id = ? OR email = ?",
      [mentor_id, email]
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
      [mentor_id, full_name, email, phone_number, hashedPassword]
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

// INSERT INTO uil_admin (email, password)
// VALUES ('uil@bit.edu.et', '<hashed_password>');
