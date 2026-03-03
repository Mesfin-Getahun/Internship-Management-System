import { exec } from "child_process";
import fs from "fs";
import path from "path";

// export const getAllUsers = async (req, res) => {
//   try {
//     const [students] = await db.query(
//       "SELECT student_id AS id, full_name, email, status, 'student' AS role FROM student"
//     );

//     const [companies] = await db.query(
//       "SELECT company_id AS id, company_name AS full_name, email, status, 'company' AS role FROM company"
//     );

//     const [faculty] = await db.query(
//       "SELECT faculty_id AS id, faculty_name AS full_name, email, status, 'faculty' AS role FROM faculty"
//     );

//     res.json({
//       success: true,
//       users: [...students, ...companies, ...faculty],
//     });
//   } catch (error) {
//     res.status(500).json({ success: false });
//   }
// };

// export const updateUserRole = async (req, res) => {
//   const { role, id } = req.params;
//   const { newRole } = req.body;

//   try {
//     await db.query(`UPDATE ${role} SET role = ? WHERE ${role}_id = ?`, [
//       newRole,
//       id,
//     ]);

//     res.json({ success: true, message: "Role updated" });
//   } catch (error) {
//     res.status(500).json({ success: false });
//   }
// };

// export const toggleUserStatus = async (req, res) => {
//   const { role, id } = req.params;
//   const { status } = req.body;

//   try {
//     await db.query(`UPDATE ${role} SET status = ? WHERE ${role}_id = ?`, [
//       status,
//       id,
//     ]);

//     res.json({ success: true, message: "Status updated" });
//   } catch (error) {
//     res.status(500).json({ success: false });
//   }
// };

// export const getSystemSettings = async (req, res) => {
//   try {
//     const [settings] = await db.query("SELECT * FROM system_settings");
//     res.json({ success: true, settings });
//   } catch (error) {
//     res.status(500).json({ success: false });
//   }
// };

// export const updateSystemSettings = async (req, res) => {
//   const { setting_key, setting_value } = req.body;

//   try {
//     await db.query(
//       "UPDATE system_settings SET setting_value = ? WHERE setting_key = ?",
//       [setting_value, setting_key]
//     );

//     res.json({ success: true, message: "Setting updated" });
//   } catch (error) {
//     res.status(500).json({ success: false });
//   }
// };

export const updateMaintenanceMode = async (req, res) => {
  const { maintenance_mode } = req.body; // true or false

  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await db.query(
      "UPDATE system_settings SET setting_value = ? WHERE setting_key = 'maintenance_mode'",
      [maintenance_mode ? "true" : "false"]
    );

    // Log action
    await db.query("INSERT INTO system_logs (user_id, action) VALUES (?, ?)", [
      req.user.admin_id,
      `Maintenance mode set to ${maintenance_mode}`,
    ]);

    res.json({
      success: true,
      message: `Maintenance mode ${maintenance_mode ? "enabled" : "disabled"}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

export const getSystemLogs = async (req, res) => {
  try {
    const [logs] = await db.query(
      "SELECT * FROM system_logs ORDER BY created_at DESC"
    );

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// export const backupDatabase = async (req, res) => {
//   const fileName = `backup_${Date.now()}.sql`;

//   exec(
//     `mysqldump -u root -pYOURPASSWORD internship_db > backups/${fileName}`,
//     (error) => {
//       if (error) {
//         return res.status(500).json({ success: false });
//       }

//       res.json({
//         success: true,
//         message: "Backup created",
//         file: fileName,
//       });
//     }
//   );
// };

export const backupDatabase = async (req, res) => {
  try {
    const backupDir = path.join("backups");

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const fileName = `backup_${Date.now()}.sql`;
    const filePath = path.join(backupDir, fileName);

    const command = `mysqldump -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > ${filePath}`;

    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error("Backup Error:", error);
        return res.status(500).json({
          success: false,
          message: "Backup failed",
        });
      }

      try {
        // ✅ Log only after successful backup
        await db.query(
          "INSERT INTO system_logs (user_id, action) VALUES (?, ?)",
          [req.user.admin_id, "Database backup created"]
        );

        res.json({
          success: true,
          message: "Backup created successfully",
          file: fileName,
        });
      } catch (logError) {
        console.error("Log Error:", logError);
        res.status(500).json({
          success: false,
          message: "Backup created but logging failed",
        });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
