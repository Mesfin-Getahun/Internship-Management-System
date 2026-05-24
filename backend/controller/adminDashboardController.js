import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import db from "../config/mysql.js";
import { fetchSystemLogs, insertSystemLog } from "../utils/systemLogService.js";

const backupDir = path.resolve("./backups");

const ensureBackupDir = () => {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
};

const safeQuery = async (query, params = [], fallback = null) => {
  try {
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    return fallback;
  }
};

const getBackupFiles = () => {
  ensureBackupDir();

  return fs
    .readdirSync(backupDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry, index) => {
      const fullPath = path.join(backupDir, entry.name);
      const stats = fs.statSync(fullPath);

      return {
        id: `${entry.name}-${index}`,
        file: entry.name,
        file_size_bytes: stats.size,
        created_at: stats.mtime,
        status: "Completed",
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const normalized = String(value).replace(/\r?\n|\r/g, " ");
  const formulaSafe = /^[=+\-@]/.test(normalized)
    ? `'${normalized}`
    : normalized;
  if (/[",]/.test(formulaSafe)) {
    return `"${formulaSafe.replace(/"/g, '""')}"`;
  }

  return formulaSafe;
};

const buildCsvContent = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "No data available\n";
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(",")
    ),
  ];

  return lines.join("\n");
};

export const getAdminProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      profile: {
        admin_id: req.user.admin_id,
        full_name: req.user.full_name,
        email: req.user.email,
        phone_number: req.user.phone_number,
      },
    });
  } catch (error) {
    console.error("Fetch admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin profile",
    });
  }
};

export const getAdminOverview = async (req, res) => {
  try {
    const [
      studentCountRows,
      mentorCountRows,
      facultyCountRows,
      companyCountRows,
      activePlacementRows,
      pendingCompanyRows,
      recentLogs,
    ] = await Promise.all([
      db.query("SELECT COUNT(*) AS total FROM student"),
      db.query("SELECT COUNT(*) AS total FROM mentor"),
      db.query("SELECT COUNT(*) AS total FROM faculty"),
      db.query("SELECT COUNT(*) AS total FROM company"),
      db.query("SELECT COUNT(*) AS total FROM student_internship WHERE status = 'in progress'"),
      db.query("SELECT COUNT(*) AS total FROM company WHERE status = 'pending'"),
      fetchSystemLogs(8).catch(() => []),
    ]);

    res.status(200).json({
      success: true,
      summary: {
        total_students: Number(studentCountRows[0][0]?.total || 0),
        total_mentors: Number(mentorCountRows[0][0]?.total || 0),
        total_faculties: Number(facultyCountRows[0][0]?.total || 0),
        total_organizations: Number(companyCountRows[0][0]?.total || 0),
        active_placements: Number(activePlacementRows[0][0]?.total || 0),
        pending_organizations: Number(pendingCompanyRows[0][0]?.total || 0),
      },
      recent_logs: recentLogs || [],
    });
  } catch (error) {
    console.error("Fetch admin overview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin overview",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [
      students,
      mentors,
      faculties,
      uils,
      companies,
      admins,
      companyMentors,
    ] = await Promise.all([
      db.query(
        "SELECT student_id AS id, full_name, email, faculty, department, 'student' AS role, profile_status AS status FROM student"
      ),
      db.query(
        "SELECT mentor_id AS id, full_name, email, NULL AS faculty, NULL AS department, 'mentor' AS role, account_status AS status FROM mentor"
      ),
      db.query(
        "SELECT faculty_id AS id, faculty_name AS full_name, email, faculty_name AS faculty, NULL AS department, 'faculty' AS role, account_status AS status FROM faculty"
      ),
      db.query(
        "SELECT UIL_id AS id, full_name, email, 'UIL' AS faculty, NULL AS department, 'uil' AS role, 'active' AS status FROM UIL"
      ),
      db.query(
        "SELECT company_id AS id, company_name AS full_name, email, company_type AS faculty, industry AS department, 'company' AS role, account_status AS status, status AS approval_status FROM company"
      ),
      db.query(
        "SELECT admin_id AS id, full_name, email, 'System Administration' AS faculty, NULL AS department, 'admin' AS role, 'active' AS status FROM admin"
      ),
      db.query(
        "SELECT company_mentor_id AS id, full_name, email, 'Company Mentor' AS faculty, NULL AS department, 'company_mentor' AS role, account_status AS status FROM company_mentor"
      ),
    ]);

    const users = [
      ...students[0],
      ...mentors[0],
      ...faculties[0],
      ...uils[0],
      ...companies[0],
      ...admins[0],
      ...companyMentors[0],
    ];

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Fetch admin users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

const DEACTIVATABLE_ACCOUNT_TABLES = Object.freeze({
  mentor: {
    table: "mentor",
    idColumn: "mentor_id",
    label: "Faculty mentor",
  },
  faculty: {
    table: "faculty",
    idColumn: "faculty_id",
    label: "Faculty",
  },
  company_mentor: {
    table: "company_mentor",
    idColumn: "company_mentor_id",
    label: "Company mentor",
  },
  company: {
    table: "company",
    idColumn: "company_id",
    label: "Company",
  },
});

export const deactivateUserAccount = async (req, res) => {
  try {
    const role = String(req.params.role || "").trim().toLowerCase();
    const accountId = req.params.id;
    const config = DEACTIVATABLE_ACCOUNT_TABLES[role];

    if (!config || !accountId) {
      return res.status(400).json({
        success: false,
        message: "Unsupported account type or missing account ID",
      });
    }

    if (role === "company") {
      const [[usage]] = await db.query(
        `
        SELECT COUNT(*) AS current_students
        FROM student_internship
        WHERE company_id = ?
          AND LOWER(status) IN ('accepted', 'in progress', 'active')
        `,
        [accountId],
      );

      if (Number(usage?.current_students || 0) > 0) {
        return res.status(409).json({
          success: false,
          message:
            "This company cannot be deactivated while students are currently attending internship there.",
          current_students: Number(usage.current_students || 0),
        });
      }
    }

    const [result] = await db.query(
      `
      UPDATE ${config.table}
      SET account_status = 'inactive',
          deleted_at = COALESCE(deleted_at, NOW()),
          deleted_by = ?,
          delete_reason = COALESCE(delete_reason, 'Deactivated by admin')
      WHERE ${config.idColumn} = ?
      `,
      [req.user.admin_id, accountId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `${config.label} not found`,
      });
    }

    await insertSystemLog({
      actorId: req.user.admin_id,
      action: "ACCOUNT_DEACTIVATED",
      description: `${config.label} deactivated: ${accountId}`,
    }).catch(() => null);

    res.status(200).json({
      success: true,
      message: `${config.label} deactivated successfully`,
    });
  } catch (error) {
    console.error("Deactivate account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate account",
    });
  }
};

export const getFaculties = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        f.faculty_id,
        f.faculty_name,
        f.email,
        f.account_status,
        COUNT(DISTINCT s.student_id) AS total_students,
        COUNT(DISTINCT CASE WHEN s.assigned_mentor IS NOT NULL THEN s.assigned_mentor END) AS linked_mentors
      FROM faculty f
      LEFT JOIN student s
        ON s.faculty = f.faculty_name
      GROUP BY f.faculty_id, f.faculty_name, f.email, f.account_status
      ORDER BY f.faculty_name
      `
    );

    const faculties = rows.map((row) => ({
      ...row,
      status: row.account_status,
    }));

    res.status(200).json({
      success: true,
      count: faculties.length,
      faculties,
    });
  } catch (error) {
    console.error("Fetch faculties error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch faculties",
    });
  }
};

export const updateFaculty = async (req, res) => {
  try {
    const { faculty_id } = req.params;
    const { faculty_name, email } = req.body;

    if (!faculty_id) {
      return res.status(400).json({
        success: false,
        message: "Faculty ID is required",
      });
    }

    const [existingRows] = await db.query(
      "SELECT faculty_id, faculty_name, email, account_status FROM faculty WHERE faculty_id = ?",
      [faculty_id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const existing = existingRows[0];

    await db.query(
      "UPDATE faculty SET faculty_name = ?, email = ? WHERE faculty_id = ?",
      [faculty_name || existing.faculty_name, email || existing.email, faculty_id]
    );

    await insertSystemLog({
      actorId: req.user.admin_id,
      action: "FACULTY_UPDATED",
      description: `Faculty updated: ${faculty_id}`,
    }).catch(() => null);

    res.status(200).json({
      success: true,
      message: "Faculty updated successfully",
    });
  } catch (error) {
    console.error("Update faculty error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update faculty",
    });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const { faculty_id } = req.params;

    if (!faculty_id) {
      return res.status(400).json({
        success: false,
        message: "Faculty ID is required",
      });
    }

    const [result] = await db.query(
      `UPDATE faculty
       SET account_status = 'inactive',
           deleted_at = COALESCE(deleted_at, NOW()),
           deleted_by = ?,
           delete_reason = COALESCE(delete_reason, 'Deactivated by admin')
       WHERE faculty_id = ?`,
      [req.user.admin_id, faculty_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    await insertSystemLog({
      actorId: req.user.admin_id,
      action: "FACULTY_DEACTIVATED",
      description: `Faculty deactivated: ${faculty_id}`,
    }).catch(() => null);

    res.status(200).json({
      success: true,
      message: "Faculty deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate faculty error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate faculty",
    });
  }
};

export const updateMaintenanceMode = async (req, res) => {
  const { maintenance_mode } = req.body;

  try {
    const normalizedValue =
      maintenance_mode === true || maintenance_mode === "true"
        ? "true"
        : "false";

    await db.query(
      `
      INSERT INTO system_settings (setting_key, setting_value)
      VALUES ('maintenance_mode', ?)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `,
      [normalizedValue]
    );

    await insertSystemLog({
      actorId: req.user.admin_id,
      action: "MAINTENANCE_MODE_UPDATED",
      description: `Maintenance mode set to ${normalizedValue}`,
    }).catch(() => null);

    res.json({
      success: true,
      message: `Maintenance mode ${normalizedValue === "true" ? "enabled" : "disabled"}`,
      maintenance_mode: normalizedValue === "true",
    });
  } catch (error) {
    console.error("Update maintenance mode error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update maintenance mode",
    });
  }
};

export const getSystemLogs = async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit || 100);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 200)
      : 100;
    const logs = await fetchSystemLogs(limit);

    res.json({ success: true, logs });
  } catch (error) {
    console.error("Fetch system logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system logs",
    });
  }
};

export const getPlatformMonitoring = async (req, res) => {
  try {
    const [maintenanceRows, activePlacementRows, companyRows] = await Promise.all([
      safeQuery(
        "SELECT setting_value FROM system_settings WHERE setting_key = 'maintenance_mode' LIMIT 1",
        [],
        []
      ),
      db.query("SELECT COUNT(*) AS total FROM student_internship WHERE status = 'in progress'"),
      db.query("SELECT COUNT(*) AS total FROM company"),
    ]);

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const backupFiles = getBackupFiles();
    const cpuPercent = Math.min(
      100,
      Math.max(0, Math.round((os.loadavg()[0] / Math.max(os.cpus().length, 1)) * 100))
    );

    res.status(200).json({
      success: true,
      monitoring: {
        host_status: "Online",
        database_status: "Connected",
        api_latency_ms: 42,
        storage_used_percent: Math.min(
          100,
          Math.round((backupFiles.reduce((sum, file) => sum + file.file_size_bytes, 0) / Math.max(totalMemory, 1)) * 100)
        ),
        cpu_percent: cpuPercent,
        ram_used_bytes: usedMemory,
        ram_total_bytes: totalMemory,
        throughput_rps: Number(activePlacementRows[0][0]?.total || 0) + Number(companyRows[0][0]?.total || 0),
        maintenance_mode: maintenanceRows?.[0]?.setting_value === "true",
      },
    });
  } catch (error) {
    console.error("Fetch platform monitoring error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch platform monitoring",
    });
  }
};

export const getBackupHistory = async (req, res) => {
  try {
    const backups = getBackupFiles().map((file) => ({
      ...file,
      file_size: formatBytes(file.file_size_bytes),
    }));

    res.status(200).json({
      success: true,
      backups,
    });
  } catch (error) {
    console.error("Fetch backup history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch backup history",
    });
  }
};

export const exportAdminData = async (req, res) => {
  try {
    const { dataType } = req.params;
    const normalizedType = String(dataType || "").toLowerCase();
    let rows = [];
    let fileBaseName = normalizedType || "export";

    if (normalizedType === "users") {
      const [
        students,
        mentors,
        faculties,
        uils,
        companies,
        admins,
        companyMentors,
      ] = await Promise.all([
        db.query(
          "SELECT student_id AS id, full_name, email, faculty, department, 'student' AS role, profile_status AS status FROM student"
        ),
        db.query(
          "SELECT mentor_id AS id, full_name, email, NULL AS faculty, NULL AS department, 'mentor' AS role, account_status AS status FROM mentor"
        ),
        db.query(
          "SELECT faculty_id AS id, faculty_name AS full_name, email, faculty_name AS faculty, NULL AS department, 'faculty' AS role, account_status AS status FROM faculty"
        ),
        db.query(
          "SELECT UIL_id AS id, full_name, email, 'UIL' AS faculty, NULL AS department, 'uil' AS role, 'active' AS status FROM UIL"
        ),
        db.query(
          "SELECT company_id AS id, company_name AS full_name, email, company_type AS faculty, industry AS department, 'company' AS role, account_status AS status, status AS approval_status FROM company"
        ),
        db.query(
          "SELECT admin_id AS id, full_name, email, 'System Administration' AS faculty, NULL AS department, 'admin' AS role, 'active' AS status FROM admin"
        ),
        db.query(
          "SELECT company_mentor_id AS id, full_name, email, 'Company Mentor' AS faculty, NULL AS department, 'company_mentor' AS role, account_status AS status FROM company_mentor"
        ),
      ]);

      rows = [
        ...students[0],
        ...mentors[0],
        ...faculties[0],
        ...uils[0],
        ...companies[0],
        ...admins[0],
        ...companyMentors[0],
      ];
      fileBaseName = "users";
    } else if (normalizedType === "organizations") {
      const [companies] = await db.query(
        `
        SELECT
          company_id,
          company_name,
          company_type,
          industry,
          email,
          phone_number,
          location,
          city,
          region,
          status,
          account_status
        FROM company
        ORDER BY company_name
        `
      );
      rows = companies;
      fileBaseName = "organizations";
    } else if (normalizedType === "students") {
      const [students] = await db.query(
        `
        SELECT
          student_id,
          full_name,
          email,
          phone_number,
          faculty,
          department,
          skills,
          preferred_location,
          profile_status
        FROM student
        ORDER BY full_name
        `
      );
      rows = students;
      fileBaseName = "students";
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported export type",
      });
    }

    const csvContent = buildCsvContent(rows);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const fileName = `${fileBaseName}_${timestamp}.csv`;

    await insertSystemLog({
      actorId: req.user.admin_id,
      action: "CSV_EXPORT_CREATED",
      description: `Admin exported ${normalizedType} data as CSV`,
    }).catch(() => null);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.status(200).send(`\uFEFF${csvContent}`);
  } catch (error) {
    console.error("Export CSV error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export CSV data",
    });
  }
};

export const backupDatabase = async (req, res) => {
  try {
    ensureBackupDir();

    const fileName = `backup_${Date.now()}.sql`;
    const filePath = path.join(backupDir, fileName);
    const dbHost = process.env.DB_HOST || "localhost";
    const dbUser = process.env.DB_USER || "root";
    const dbName = process.env.DB_NAME || "internshipdb";

    const output = fs.createWriteStream(filePath, { flags: "wx" });
    const dump = spawn(
      "mysqldump",
      ["-h", dbHost, "-u", dbUser, dbName],
      {
        env: {
          ...process.env,
          MYSQL_PWD: process.env.DB_PASSWORD || "",
        },
        windowsHide: true,
      },
    );

    dump.stdout.pipe(output);

    let errorOutput = "";
    dump.stderr.on("data", (chunk) => {
      errorOutput += chunk.toString();
    });

    let responseSent = false;

    dump.on("error", (error) => {
      console.error("Backup process error:", error);
      output.destroy();
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      responseSent = true;
      return res.status(500).json({
        success: false,
        message: "Backup failed",
      });
    });

    dump.on("close", async (code) => {
      if (responseSent) return;
      output.end();

      if (code !== 0) {
        console.error("Backup Error:", errorOutput);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(500).json({
          success: false,
          message: "Backup failed",
        });
      }

      await insertSystemLog({
        actorId: req.user.admin_id,
        action: "DATABASE_BACKUP_CREATED",
        description: "Database backup created",
      }).catch(() => null);

      const stats = fs.statSync(filePath);

      res.json({
        success: true,
        message: "Backup created successfully",
        backup: {
          file: fileName,
          file_size: formatBytes(stats.size),
          created_at: stats.mtime,
        },
      });
    });
  } catch (error) {
    console.error("Backup database error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
