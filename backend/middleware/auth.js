import jwt from "jsonwebtoken";
import db from "../config/mysql.js";

const authStudent = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query(
      "SELECT * FROM student WHERE student_id = ?",
      [decoded.id]
    );

    // Exclude password before returning
    const user = rows[0];
    if (user) {
      delete user.password;
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    req.user = user; // Attach the user
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid token or session expired" });
  }
};

const authMentor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query("SELECT * FROM mentor WHERE mentor_id = ?", [
      decoded.id,
    ]);

    // Exclude password before returning
    const user = rows[0];
    if (user) {
      delete user.password;
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    req.user = user; // Attach the user
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid token or session expired" });
  }
};

const authCompany = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query(
      "SELECT * FROM company WHERE company_id = ?",
      [decoded.company_id]
    );

    // Exclude password before returning
    const user = rows[0];
    if (user) {
      delete user.password;
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    req.user = user; // Attach the user
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid token or session expired" });
  }
};

// const authCompany = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res
//         .status(401)
//         .json({ success: false, message: "No token, authorization denied" });
//     }

//     const token = authHeader.split(" ")[1];

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // ✅ use company_id, NOT id
//     const [rows] = await db.query(
//       "SELECT company_id, company_name, email FROM company WHERE company_id = ?",
//       [decoded.company_id]
//     );

//     if (rows.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Company not found" });
//     }

//     req.user = rows[0]; // attach company
//     next();
//   } catch (error) {
//     console.error("Auth error:", error.message);
//     return res
//       .status(401)
//       .json({ success: false, message: "Invalid token or session expired" });
//   }
// };

const authAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query("SELECT * FROM admin WHERE admin_id = ?", [
      decoded.id,
    ]);

    // Exclude password before returning
    const user = rows[0];
    if (user) {
      delete user.password;
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    req.user = user; // Attach the user
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid token or session expired" });
  }
};

const authUIL = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query("SELECT * FROM UIL WHERE UIL_id = ?", [
      decoded.id,
    ]);

    // Exclude password before returning
    const user = rows[0];
    if (user) {
      delete user.password;
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    req.user = user; // Attach the user
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid token or session expired" });
  }
};

const authFaculty = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query(
      "SELECT * FROM faculty WHERE faculty_id = ?",
      [decoded.id]
    );

    // Exclude password before returning
    const user = rows[0];
    if (user) {
      delete user.password;
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    req.user = user; // Attach the user
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid token or session expired" });
  }
};

const authCompanyMentor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query(
      "SELECT * FROM company_mentor WHERE company_mentor_id = ?",
      [decoded.id]
    );

    // Exclude password before returning
    const user = rows[0];
    if (user) {
      delete user.password;
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    req.user = user; // Attach the user
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid token or session expired" });
  }
};

export {
  authStudent,
  authAdmin,
  authCompany,
  authMentor,
  authUIL,
  authFaculty,
  authCompanyMentor,
};
