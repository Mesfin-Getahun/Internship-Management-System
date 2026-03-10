import jwt from "jsonwebtoken";
import db from "../config/mysql.js";

const authenticateAuto = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("TOKEN RECEIVED:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("TOKEN RECEIVED:", token);

    const { id, role } = decoded;

    const roleTableMap = {
      student: { table: "student", idField: "student_id" },
      mentor: { table: "mentor", idField: "mentor_id" },
      company: { table: "company", idField: "company_id" },
      admin: { table: "admin", idField: "admin_id" },
      faculty: { table: "faculty", idField: "faculty_id" },
      uil: { table: "UIL", idField: "UIL_id" },
      company_mentor: {
        table: "company_mentor",
        idField: "company_mentor_id",
      },
    };

    const config = roleTableMap[role];

    if (!config) {
      return res.status(403).json({ message: "Invalid role" });
    }

    const [rows] = await db.query(
      `SELECT * FROM ${config.table} WHERE ${config.idField} = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    //delete user.password;

    req.user = user;
    req.user.role = role;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authenticateAuto;
