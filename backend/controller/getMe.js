//import db from "../config/mysql.js";
//import jwt from "jsonwebtoken";

// export const getMe = async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "No token" });
//     }

//     const token = authHeader.split(" ")[1];

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const role = decoded.role;
//     const id = decoded.id;

//     const [rows] = await db.query(
//       `SELECT * FROM ${role} WHERE ${role}_id = ?`,
//       [id]
//     );

//     if (!rows.length) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const user = rows[0];

//     delete user.password;

//     res.json({
//       user: {
//         ...user,
//         role,
//         isFirstLogin: user.must_change_password === 1, // 🔥 SAFE CHECK
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

export const getMe = async (req, res) => {
  res.json({
    user: {
      ...req.user,
      isFirstLogin: req.user.must_change_password === 1,
    },
  });
};

// export const getMe = async (req, res) => {
//   try {
//     const { id, role } = req.user;

//     let query = "";
//     let params = [];

//     if (role === "student") {
//       query = "SELECT * FROM student WHERE student_id = ?";
//       params = [id];
//     } else if (role === "company") {
//       query = "SELECT * FROM company WHERE company_id = ?";
//       params = [id];
//     } else if (role === "admin") {
//       query = "SELECT * FROM admin WHERE admin_id = ?";
//       params = [id];
//     } else if (role === "uil") {
//       query = "SELECT * FROM university_staff WHERE staff_id = ?";
//       params = [id];
//     }

//     const [rows] = await db.query(query, params);

//     if (rows.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const user = rows[0];

//     res.json({
//       user: {
//         ...user,
//         isFirstLogin: user.must_change_password === 1,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
