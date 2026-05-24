import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import createLog from "../utils/createLog.js";
import { escapeHtml } from "../utils/security.js";

const RECOMMENDATION_SETTING_KEYS = [
  "recommendation_letter_url",
  "recommendation_letter_name",
  "recommendation_letter_available",
  "recommendation_letter_updated_at",
];

const getEmailFailurePayload = () => ({
  emailSent: false,
  emailWarning:
    "Status was updated, but the notification email could not be sent.",
});

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

const createInviteToken = (payload) =>
  jwt.sign({ ...payload, purpose: "company_invite" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const verifyInviteToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

const normalizeBaseUrl = (value) => {
  if (!value || typeof value !== "string") return null;

  try {
    const parsed = new URL(value);
    return parsed.origin.replace(/\/+$/, "");
  } catch {
    return null;
  }
};

const isAllowedFrontendBaseUrl = (value) => {
  const normalized = normalizeBaseUrl(value);
  if (!normalized) return null;

  const allowed = String(process.env.FRONTEND_URL || process.env.APP_URL || "")
    .split(",")
    .map((entry) => normalizeBaseUrl(entry.trim()))
    .filter(Boolean);

  if (allowed.length === 0 || allowed.includes(normalized)) {
    return normalized;
  }

  return null;
};

const getFrontendBaseUrl = (req, explicitUrl) => {
  const requestOrigin = req.get("origin");
  const requestReferer = req.get("referer");

  return (
    isAllowedFrontendBaseUrl(explicitUrl) ||
    isAllowedFrontendBaseUrl(requestOrigin) ||
    isAllowedFrontendBaseUrl(requestReferer) ||
    normalizeBaseUrl(String(process.env.FRONTEND_URL || "").split(",")[0]) ||
    normalizeBaseUrl(process.env.APP_URL) ||
    "http://localhost:3000"
  );
};

const getFrontendInviteUrl = (req, token, explicitUrl) => {
  const baseUrl = getFrontendBaseUrl(req, explicitUrl);
  return `${baseUrl}/#/company/invite?token=${encodeURIComponent(token)}`;
};

const getRecommendationLetterSettings = async () => {
  const [rows] = await db.query(
    `
    SELECT setting_key, setting_value
    FROM system_settings
    WHERE setting_key IN (?, ?, ?, ?)
    `,
    RECOMMENDATION_SETTING_KEYS,
  );

  const settings = Object.fromEntries(
    rows.map((row) => [row.setting_key, row.setting_value]),
  );

  const available = settings.recommendation_letter_available === "true";
  const file_url = settings.recommendation_letter_url || null;
  const file_name = settings.recommendation_letter_name || null;
  const updated_at = settings.recommendation_letter_updated_at || null;

  return {
    available: available && Boolean(file_url),
    file_url,
    file_name,
    updated_at,
  };
};

const upsertSystemSetting = async (settingKey, settingValue) => {
  await db.query(
    `
    INSERT INTO system_settings (setting_key, setting_value)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `,
    [settingKey, settingValue],
  );
};

const getRecommendationLetter = async (req, res) => {
  try {
    const recommendation = await getRecommendationLetterSettings();

    res.status(200).json({
      success: true,
      recommendation,
    });
  } catch (error) {
    console.error("Get recommendation letter error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendation letter",
    });
  }
};

const uploadRecommendationLetter = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Recommendation letter PDF is required",
      });
    }

    const uploadedUrl = await uploadToCloudinary(
      req.file.buffer,
      "uil/recommendation_letters",
      req.file.originalname,
    );

    const now = new Date().toISOString();

    await upsertSystemSetting("recommendation_letter_url", uploadedUrl);
    await upsertSystemSetting("recommendation_letter_name", req.file.originalname);
    await upsertSystemSetting("recommendation_letter_available", "true");
    await upsertSystemSetting("recommendation_letter_updated_at", now);

    if (req.user?.UIL_id) {
      await createLog(
        req.user.UIL_id,
        "RECOMMENDATION_LETTER_UPLOADED",
        `UIL uploaded recommendation letter ${req.file.originalname}`,
      );
    }

    const recommendation = await getRecommendationLetterSettings();

    res.status(200).json({
      success: true,
      message: "Recommendation letter uploaded successfully",
      recommendation,
    });
  } catch (error) {
    console.error("Upload recommendation letter error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload recommendation letter",
    });
  }
};

const removeRecommendationLetter = async (req, res) => {
  try {
    const now = new Date().toISOString();

    await upsertSystemSetting("recommendation_letter_url", "");
    await upsertSystemSetting("recommendation_letter_name", "");
    await upsertSystemSetting("recommendation_letter_available", "false");
    await upsertSystemSetting("recommendation_letter_updated_at", now);

    if (req.user?.UIL_id) {
      await createLog(
        req.user.UIL_id,
        "RECOMMENDATION_LETTER_REMOVED",
        "UIL removed the active recommendation letter",
      );
    }

    res.status(200).json({
      success: true,
      message: "Recommendation letter removed successfully",
      recommendation: {
        available: false,
        file_url: null,
        file_name: null,
        updated_at: now,
      },
    });
  } catch (error) {
    console.error("Remove recommendation letter error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove recommendation letter",
    });
  }
};

const allInternships = async (req, res) => {
  try {
    const [internships] = await db.query(`
      SELECT 
        i.internship_id,
        i.title,
        i.description,
        i.status,
        i.start_date,
        i.end_date,
        i.duration,
        i.skills,
        i.image,
        c.company_id,
        c.company_name,
        c.location,
        c.email
      FROM internship i
      JOIN company c ON i.company_id = c.company_id
      ORDER BY i.start_date DESC
    `);

    res.status(200).json({
      success: true,
      count: internships.length,
      internships,
    });
  } catch (error) {
    console.error("UIL fetch internships error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch internships",
    });
  }
};

const pendingInternships = async (req, res) => {
  try {
    const [internships] = await db.query(`
      SELECT 
        i.internship_id,
        i.title,
        i.description,
        i.start_date,
        i.end_date,
        i.skills,
        COALESCE(i.status, 'pending') AS status,
        c.company_name,
        c.location
      FROM internship i
      JOIN company c ON i.company_id = c.company_id
      WHERE i.status = 'pending' OR i.status IS NULL
      ORDER BY i.start_date DESC
    `);

    res.status(200).json({ success: true, internships });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch pending internships" });
  }
};

const exportInternshipsCsv = async (req, res) => {
  try {
    const [internships] = await db.query(`
      SELECT
        i.internship_id,
        i.title,
        i.description,
        COALESCE(i.status, 'pending') AS status,
        i.department AS target_department,
        i.skills AS requirements,
        i.duration,
        DATE_FORMAT(i.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(i.end_date, '%Y-%m-%d') AS end_date,
        COALESCE(i.location, c.location) AS location,
        c.company_id,
        c.company_name,
        c.company_type,
        c.industry,
        c.email AS company_email,
        c.phone_number AS company_phone,
        c.status AS company_status,
        (
          SELECT COUNT(*)
          FROM application a
          WHERE a.internship_id = i.internship_id
        ) AS application_count,
        (
          SELECT COUNT(*)
          FROM student_internship si
          WHERE si.internship_id = i.internship_id
        ) AS placement_count
      FROM internship i
      JOIN company c ON i.company_id = c.company_id
      ORDER BY COALESCE(i.status, 'pending'), c.company_name, i.title
    `);

    const csvContent = buildCsvContent(internships);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const fileName = `uil-internships-${timestamp}.csv`;

    if (req.user?.UIL_id) {
      await createLog(
        req.user.UIL_id,
        "INTERNSHIP_CSV_EXPORTED",
        "UIL exported all internships as CSV",
      ).catch(() => null);
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.status(200).send(`\uFEFF${csvContent}`);
  } catch (error) {
    console.error("Export internships CSV error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export internships CSV",
    });
  }
};

const approveInternship = async (req, res) => {
  try {
    const { internship_id } = req.params;

    const [existing] = await db.query(
      "SELECT status FROM internship WHERE internship_id = ?",
      [internship_id],
    );

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Internship not found" });
    }

    if (existing[0].status === "approved") {
      return res
        .status(400)
        .json({ success: false, message: "Internship already approved" });
    }

    await db.query(
      "UPDATE internship SET status = 'approved' WHERE internship_id = ?",
      [internship_id],
    );
    // 🔥 Save Log
    if (req.user?.UIL_id) {
      await createLog(
        req.user.UIL_id,
        "INTERNSHIP_APPROVED",
        `UIL approved internship with ID ${internship_id}`,
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Internship approved successfully" });
  } catch (error) {
    console.error("Approve internship error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve internship",
    });
  }
};

const rejectInternship = async (req, res) => {
  try {
    const { internship_id } = req.params;
    const { reason } = req.body; // optional

    const [existing] = await db.query(
      "SELECT status FROM internship WHERE internship_id = ?",
      [internship_id],
    );

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Internship not found" });
    }

    await db.query(
      "UPDATE internship SET status = 'rejected' WHERE internship_id = ?",
      [internship_id],
    );

    if (req.user?.UIL_id) {
      await createLog(
        req.user.UIL_id,
        "INTERNSHIP_REJECTED",
        `UIL reject internship with ID ${internship_id}`,
      );
    }

    res.status(200).json({
      success: true,
      message: "Internship rejected successfully",
      reason: reason || "Not specified",
    });
  } catch (error) {
    console.error("Reject internship error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject internship",
    });
  }
};

const companyRequest = async (req, res) => {
  try {
    const [companies] = await db.query(`
      SELECT 
        company_id,
        company_name,
        company_type,
        industry,
        website,
        email,
        phone_number,
        region,
        city,
        location,
        profile_pic,
        profile_pic AS company_profile_pic,
        license_url,
        license_url AS company_license_url,
        status
      FROM company
      WHERE status = 'pending'
      ORDER BY company_name ASC
    `);

    res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    console.error("Fetch company requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending company requests",
    });
  }
};

const getActiveCompanies = async (req, res) => {
  try {
    const [companies] = await db.query(`
      SELECT 
        company_id,
        company_name,
        company_type,
        industry,
        website,
        email,
        phone_number,
        region,
        city,
        location,
        profile_pic,
        profile_pic AS company_profile_pic,
        license_url,
        license_url AS company_license_url,
        status
      FROM company
      WHERE status = 'approved'
      ORDER BY company_name ASC
    `);

    res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    console.error("Fetch active companies error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active companies",
    });
  }
};

const exportCompaniesCsv = async (req, res) => {
  try {
    const [companies] = await db.query(`
      SELECT
        company_id,
        company_name,
        company_type,
        industry,
        website,
        email,
        phone_number,
        region,
        city,
        location,
        status,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        CASE WHEN agreed = 1 THEN 'yes' ELSE 'no' END AS agreement_confirmed,
        profile_pic AS profile_picture_url,
        license_url AS license_document_url
      FROM company
      ORDER BY status, company_name
    `);

    const csvContent = buildCsvContent(companies);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const fileName = `uil-companies-${timestamp}.csv`;

    if (req.user?.UIL_id) {
      await createLog(
        req.user.UIL_id,
        "COMPANY_CSV_EXPORTED",
        "UIL exported all companies as CSV",
      ).catch(() => null);
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.status(200).send(`\uFEFF${csvContent}`);
  } catch (error) {
    console.error("Export companies CSV error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export companies CSV",
    });
  }
};

const fulfillmentReports = async (req, res) => {
  try {
    const [reports] = await db.query(
      `
      SELECT
        s.faculty,
        s.student_id,
        s.full_name AS student_name,
        c.company_name,
        si.id AS placement_id,
        i.internship_id,
        i.title AS internship_title,
        si.status AS placement_status,
        ie.evaluation_id,
        ie.total_mark,
        ie.assessment_pdf_url,
        ie.attendance_pdf_url,
        ie.submitted_at AS evaluation_submitted_at,
        r.report_id,
        r.status AS report_status,
        r.mentor_signed_url,
        r.faculty_submitted_at
      FROM student s
      LEFT JOIN student_internship si
        ON s.student_id = si.student_id
      LEFT JOIN internship i
        ON si.internship_id = i.internship_id
      LEFT JOIN company c
        ON i.company_id = c.company_id
      LEFT JOIN internship_evaluation ie
        ON s.student_id = ie.student_id
       AND si.internship_id = ie.internship_id
      LEFT JOIN internship_report r
        ON s.student_id = r.student_id
       AND si.internship_id = r.internship_id
      WHERE si.id IS NOT NULL
      ORDER BY s.faculty, s.full_name
      `,
    );

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Fetch fulfillment reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch fulfillment reports",
    });
  }
};

const inviteCompany = async (req, res) => {
  try {
    const { company_name, email, frontend_url } = req.body;

    if (!company_name || !email) {
      return res.status(400).json({
        success: false,
        message: "Company name and email are required",
      });
    }

    const [existingCompany] = await db.query(
      "SELECT company_id, status FROM company WHERE email = ? LIMIT 1",
      [email],
    );

    if (existingCompany.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A company with this email already exists",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO company (company_name, email, status)
      VALUES (?, ?, 'invited')
      `,
      [company_name, email],
    );

    const company_id = result.insertId;
    const inviteToken = createInviteToken({ company_id, email });
    const inviteUrl = getFrontendInviteUrl(req, inviteToken, frontend_url);

    await sendEmail(
      email,
      "Complete your UIL company registration",
      `
        <h2>Hello ${escapeHtml(company_name)}</h2>
        <p>You have been invited by UIL to complete your company registration.</p>
        <p>Click the link below to finish your registration and set your password:</p>
        <p><a href="${escapeHtml(inviteUrl)}" target="_blank" rel="noopener noreferrer">Complete company registration</a></p>
        <p>This invitation link will expire in 7 days.</p>
        <br/>
        <p>Best regards,<br/>Internship Management Team</p>
      `,
    );

    if (req.user?.UIL_id) {
      await createLog(
        req.user.UIL_id,
        "COMPANY_INVITE_SENT",
        `UIL invited ${company_name} (${email}) to complete registration`,
      );
    }

    res.status(201).json({
      success: true,
      message: "Company invitation sent successfully",
      inviteUrl,
    });
  } catch (error) {
    console.error("Invite company error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to invite company",
    });
  }
};

const verifyCompanyInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const payload = verifyInviteToken(token);

    if (payload?.purpose !== "company_invite") {
      return res.status(400).json({
        success: false,
        message: "Invalid invite token",
      });
    }

    const [company] = await db.query(
      "SELECT company_id, company_name, email, status FROM company WHERE company_id = ? LIMIT 1",
      [payload.company_id],
    );

    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invited company not found",
      });
    }

    if (company[0].status !== "invited") {
      return res.status(400).json({
        success: false,
        message: "Invite has already been used or is invalid",
      });
    }

    res.status(200).json({
      success: true,
      invite: {
        company_id: company[0].company_id,
        company_name: company[0].company_name,
        email: company[0].email,
      },
    });
  } catch (error) {
    console.error("Verify company invite error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid or expired invite token",
    });
  }
};

const completeCompanyRegistration = async (req, res) => {
  try {
    const {
      inviteToken,
      password,
      confirmPassword,
      agreed,
      company_name,
      company_type,
      industry,
      website,
      email,
      phone_number,
      location,
      city,
      region,
    } = req.body;

    if (!inviteToken) {
      return res.status(400).json({
        success: false,
        message: "Invite token is required",
      });
    }

    if (!password || !confirmPassword || password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password must match",
      });
    }

    const payload = verifyInviteToken(inviteToken);
    if (payload?.purpose !== "company_invite") {
      return res.status(400).json({
        success: false,
        message: "Invalid invite token",
      });
    }

    const [companies] = await db.query(
      "SELECT * FROM company WHERE company_id = ? LIMIT 1",
      [payload.company_id],
    );

    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invited company not found",
      });
    }

    const invitedCompany = companies[0];
    if (invitedCompany.status !== "invited") {
      return res.status(400).json({
        success: false,
        message: "This invitation has already been completed or cannot be used",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profileURL = invitedCompany.profile_pic;
    let licenseURL = invitedCompany.license_url;

    if (req.files?.profileFile?.[0]) {
      profileURL = await uploadToCloudinary(
        req.files.profileFile[0].buffer,
        "company/profile",
        req.files.profileFile[0].originalname,
      );
    }

    if (req.files?.licenseFile?.[0]) {
      licenseURL = await uploadToCloudinary(
        req.files.licenseFile[0].buffer,
        "company/license",
        req.files.licenseFile[0].originalname,
      );
    }

    await db.query(
      `
      UPDATE company
      SET company_name = ?,
          company_type = ?,
          industry = ?,
          website = ?,
          email = ?,
          phone_number = ?,
          location = ?,
          city = ?,
          region = ?,
          password = ?,
          profile_pic = ?,
          license_url = ?,
          agreed = ?,
          status = 'pending'
      WHERE company_id = ?
      `,
      [
        company_name || invitedCompany.company_name,
        company_type || invitedCompany.company_type,
        industry || invitedCompany.industry,
        website || invitedCompany.website,
        email || invitedCompany.email,
        phone_number || invitedCompany.phone_number,
        location || invitedCompany.location,
        city || invitedCompany.city,
        region || invitedCompany.region,
        hashedPassword,
        profileURL,
        licenseURL,
        agreed === "true" || agreed === true ? 1 : 0,
        invitedCompany.company_id,
      ],
    );

    res.status(200).json({
      success: true,
      message:
        "Company information submitted successfully. Awaiting UIL approval.",
    });
  } catch (error) {
    console.error("Complete company registration error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete company registration",
    });
  }
};

// const acceptCompany = async (req, res) => {
//   try {
//     const { company_id } = req.params;

//     // Check if company exists & is pending
//     const [company] = await db.query(
//       "SELECT status FROM company WHERE company_id = ?",
//       [company_id]
//     );

//     if (company.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Company not found",
//       });
//     }

//     if (company[0].status !== "pending") {
//       return res.status(400).json({
//         success: false,
//         message: "Company is already processed",
//       });
//     }

//     // Approve company
//     await db.query(
//       "UPDATE company SET status = 'approved' WHERE company_id = ?",
//       [company_id]
//     );

//     res.status(200).json({
//       success: true,
//       message: "Company approved successfully",
//     });
//   } catch (error) {
//     console.error("Accept company error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to approve company",
//     });
//   }
// };

const acceptCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    const [company] = await db.query(
      "SELECT email, company_name, status FROM company WHERE company_id = ?",
      [company_id],
    );

    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (company[0].status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Company is already processed",
      });
    }

    await db.query(
      "UPDATE company SET status = 'approved' WHERE company_id = ?",
      [company_id],
    );

    let emailResult = { emailSent: true };
    try {
      await sendEmail(
        company[0].email,
        "Company Registration Approved",
        `
          <h2>Congratulations ${escapeHtml(company[0].company_name)}</h2>
          <p>Your company registration has been <b>approved</b>.</p>
          <p>You can now log in and start posting internships.</p>
          <br/>
          <p>Best regards,<br/>Internship Management Team</p>
        `,
      );
    } catch (emailError) {
      console.error(
        "Approval email failed after company was approved:",
        emailError,
      );
      emailResult = getEmailFailurePayload();
    }
    // 🔥 Save Log
    if (req.user?.UIL_id) {
      await createLog(
        req.user.UIL_id,
        "COMPANY_APPROVED",
        `UIL approved company ${company[0].company_name} (ID ${company_id})`,
      );
    }

    res.status(200).json({
      success: true,
      message: emailResult.emailSent
        ? "Company approved and email sent"
        : "Company approved, but email notification failed",
      ...emailResult,
    });
  } catch (error) {
    console.error("Accept company error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve company",
    });
  }
};
// const rejectCompany = async (req, res) => {
//   try {
//     const { company_id } = req.params;

//     // Check if company exists
//     const [company] = await db.query(
//       "SELECT status FROM company WHERE company_id = ?",
//       [company_id]
//     );

//     if (company.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Company not found",
//       });
//     }

//     // Reject company
//     await db.query(
//       "UPDATE company SET status = 'rejected' WHERE company_id = ?",
//       [company_id]
//     );

//     res.status(200).json({
//       success: true,
//       message: "Company registration rejected",
//     });
//   } catch (error) {
//     console.error("Reject company error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to reject company",
//     });
//   }
// };

const rejectCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    const [company] = await db.query(
      "SELECT email, company_name FROM company WHERE company_id = ?",
      [company_id],
    );

    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    await db.query(
      "UPDATE company SET status = 'rejected' WHERE company_id = ?",
      [company_id],
    );

    let emailResult = { emailSent: true };
    try {
      await sendEmail(
        company[0].email,
        "Company Registration Rejected",
        `
          <h2>Hello ${escapeHtml(company[0].company_name)}</h2>
          <p>We regret to inform you that your company registration has been <b>rejected</b>.</p>
          <p>If you believe this is a mistake, please contact the administrator.</p>
          <br/>
          <p>Best regards,<br/>Internship Management Team</p>
        `,
      );
    } catch (emailError) {
      console.error(
        "Rejection email failed after company was rejected:",
        emailError,
      );
      emailResult = getEmailFailurePayload();
    }

    // 🔥 Save Log
    if (req.user?.UIL_id) {
      await createLog(
        req.user.UIL_id,
        "COMPANY_REJECTED",
        `UIL rejected company ${company[0].company_name} (ID ${company_id})`,
      );
    }

    res.status(200).json({
      success: true,
      message: emailResult.emailSent
        ? "Company rejected and email sent"
        : "Company rejected, but email notification failed",
      ...emailResult,
    });
  } catch (error) {
    console.error("Reject company error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject company",
    });
  }
};

export {
  allInternships,
  acceptCompany,
  rejectCompany,
  approveInternship,
  rejectInternship,
  pendingInternships,
  exportInternshipsCsv,
  companyRequest,
  getActiveCompanies,
  exportCompaniesCsv,
  fulfillmentReports,
  inviteCompany,
  verifyCompanyInvite,
  completeCompanyRegistration,
  getRecommendationLetter,
  uploadRecommendationLetter,
  removeRecommendationLetter,
};
