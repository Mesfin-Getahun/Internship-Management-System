import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import generateAssessmentPDF from "../utils/generateAssessmentPDF.js";
import generateAttendancePDF from "../utils/generateAttendancePDF.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import fs from "fs";
import createLog from "../utils/createLog.js";
import {
  createNotification,
  createNotifications,
} from "../utils/notificationService.js";

const postInternship = async (req, res) => {
  const company_id = req.user.company_id;
  try {
    const {
      title,
      description,
      image,
      start_date,
      end_date,
      skill,
      skills,
      requirements,
      location,
    } = req.body;

    // Basic validation
    if (!title || !description || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Title, description, start date, and end date are required",
      });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    // Insert into database
    const query = `
      INSERT INTO internship 
      (title, description, image, start_date, end_date, skills, location, company_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      title,
      description,
      image || null,
      start_date || null,
      end_date || null,
      requirements || skills || skill || null,
      location || null,
      company_id,
      "pending",
    ]);

    const [uilUsers] = await db.query("SELECT UIL_id FROM UIL");
    await createNotifications(
      uilUsers.map((uil) => ({
        recipientRole: "uil",
        recipientId: uil.UIL_id,
        title: "Internship awaiting approval",
        message: `${req.user.company_name || "A company"} posted ${title}.`,
        type: "approval",
        link: "/uil/internship-approvals",
      })),
    );

    res.status(201).json({
      success: true,
      message: "Internship posted successfully",
    });
  } catch (error) {
    console.error("Post internship error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to post internship",
    });
  }
};

const deleteInternship = async (req, res) => {
  try {
    const { internship_id } = req.params;
    const company_id = req.user.company_id;

    if (!internship_id) {
      return res.status(400).json({
        success: false,
        message: "Internship ID is required",
      });
    }

    const [result] = await db.query(
      "DELETE FROM internship WHERE internship_id = ? AND company_id = ?",
      [internship_id, company_id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Internship deleted successfully",
    });
  } catch (error) {
    console.error("Delete internship error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete internship",
    });
  }
};

const updateInternship = async (req, res) => {
  try {
    const { internship_id } = req.params;
    const company_id = req.user.company_id;
    const {
      title,
      description,
      image,
      start_date,
      end_date,
      skill,
      skills,
      requirements,
      location,
    } = req.body;

    if (!internship_id) {
      return res.status(400).json({
        success: false,
        message: "Internship ID is required",
      });
    }

    // Optional: check if internship exists
    const [existing] = await db.query(
      "SELECT * FROM internship WHERE internship_id = ? AND company_id = ?",
      [internship_id, company_id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    const nextStartDate = start_date || existing[0].start_date;
    const nextEndDate = end_date || existing[0].end_date;

    if (!nextStartDate || !nextEndDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    if (new Date(nextEndDate) < new Date(nextStartDate)) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    // Update internship
    const query = `
      UPDATE internship
      SET title = ?, description = ?, image = ?, start_date = ?, end_date = ?, skills = ?, location = ?
      WHERE internship_id = ?
    `;

    await db.query(query, [
      title || existing[0].title,
      description || existing[0].description,
      image || existing[0].image,
      nextStartDate,
      nextEndDate,
      requirements || skills || skill || existing[0].skills,
      location || existing[0].location,
      internship_id,
    ]);

    res.status(200).json({
      success: true,
      message: "Internship updated successfully",
    });
  } catch (error) {
    console.error("Update internship error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update internship",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const company_id = req.user.company_id; // from JWT
    const {
      company_name,
      company_type,
      industry,
      website,
      email,
      phone_number,
      location,
      city,
      region,
      profile_pic,
      password,
    } = req.body;

    if (!company_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Fetch existing company
    const [existing] = await db.query(
      "SELECT * FROM company WHERE company_id = ?",
      [company_id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    let hashedPassword = existing[0].password;

    // Hash password only if updated
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update profile
    const query = `
      UPDATE company
      SET company_name = ?, company_type = ?, industry = ?, website = ?, email = ?, phone_number = ?, location = ?, city = ?, region = ?, profile_pic = ?, password = ?
      WHERE company_id = ?
    `;

    await db.query(query, [
      company_name || existing[0].company_name,
      company_type || existing[0].company_type,
      industry || existing[0].industry,
      website || existing[0].website,
      email || existing[0].email,
      phone_number || existing[0].phone_number,
      location || existing[0].location,
      city || existing[0].city,
      region || existing[0].region,
      profile_pic || existing[0].profile_pic,
      hashedPassword,
      company_id,
    ]);

    await createLog(
      company_id,
      "COMPANY_PROFILE_UPDATED",
      `Company profile updated for ${company_name || existing[0].company_name} (${email || existing[0].email})`,
    );

    res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
    });
  } catch (error) {
    console.error("Update company profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    const [rows] = await db.query(
      `
      SELECT
        company_id,
        company_name,
        company_type,
        industry,
        website,
        email,
        phone_number,
        location,
        city,
        region,
        profile_pic,
        license_url,
        status
      FROM company
      WHERE company_id = ?
      `,
      [company_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile: rows[0],
    });
  } catch (error) {
    console.error("Get company profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch company profile",
    });
  }
};

const getCompanyMentors = async (req, res) => {
  try {
    const [mentors] = await db.query(
      `
      SELECT
        company_mentor_id,
        full_name,
        email,
        phone_number
      FROM company_mentor
      ORDER BY full_name
      `,
    );

    res.status(200).json({
      success: true,
      count: mentors.length,
      mentors,
    });
  } catch (error) {
    console.error("Get company mentors error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch company mentors",
    });
  }
};

const getApplications = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    if (!company_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const query = `
      SELECT 
        a.application_id,
        a.status,
        a.applied_date,
        a.statement,
       
        a.cv_file,
        a.academic_doc,

        s.student_id,
        s.full_name AS student_name,
        s.email AS student_email,
        s.department,
        s.faculty,
        s.skills,

        i.internship_id,
        i.title AS internship_title,

        si.id AS student_internship_id,
        si.company_mentor_id,
        cm.full_name AS company_mentor_name

      FROM application a
      JOIN student s ON a.student_id = s.student_id
      JOIN internship i ON a.internship_id = i.internship_id
      LEFT JOIN student_internship si
        ON a.student_id = si.student_id AND a.internship_id = si.internship_id
      LEFT JOIN company_mentor cm
        ON si.company_mentor_id = cm.company_mentor_id
      WHERE i.company_id = ?
     
    `;

    const [applications] = await db.query(query, [company_id]);

    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("Get applications error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch applications" });
  }
};

const viewApplication = async (req, res) => {
  try {
    const { application_id } = req.params;
    const company_id = req.user.company_id;

    if (!application_id) {
      return res
        .status(400)
        .json({ success: false, message: "Application ID is required" });
    }

    const query = `
      SELECT 
        a.application_id,
        a.status,
        a.applied_date,
        a.statement,
        a.cv_file,
        a.academic_doc,

        s.student_id,
        s.full_name AS student_name,
        s.email AS student_email,
        s.phone_number,
        s.department,
        s.faculty,
        s.skills,

        i.internship_id,
        i.title AS internship_title,
        i.description AS internship_description,
        i.location AS internship_location

      FROM application a
      JOIN student s ON a.student_id = s.student_id
      JOIN internship i ON a.internship_id = i.internship_id
      WHERE a.application_id = ?
        AND i.company_id = ?
    `;

    const [application] = await db.query(query, [application_id, company_id]);

    if (application.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found or access denied",
      });
    }

    res.status(200).json({ success: true, application: application[0] });
  } catch (error) {
    console.error("View application error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch application details" });
  }
};

const accept = async (req, res) => {
  try {
    const { application_id } = req.params;
    const company_id = req.user.company_id;

    const [rows] = await db.query(
      `
      SELECT 
        a.student_id,
        a.internship_id,
        i.company_id,
        i.title AS internship_title,
        i.start_date,
        c.company_name
      FROM application a
      JOIN internship i 
        ON a.internship_id = i.internship_id
      JOIN company c
        ON i.company_id = c.company_id
      WHERE a.application_id = ?
        AND i.company_id = ?
      `,
      [application_id, company_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const {
      student_id,
      internship_id,
      company_id: applicationCompanyId,
      internship_title,
      start_date,
      company_name,
    } = rows[0];
    const internshipStartDate = start_date || null;
    const placementStatus =
      internshipStartDate && new Date(internshipStartDate) > new Date()
        ? "accepted"
        : "in progress";

    const [currentInternships] = await db.query(
      `
      SELECT
        current_records.internship_id,
        current_records.internship_title,
        current_records.company_name,
        current_records.status
      FROM (
        SELECT
          si.internship_id,
          i.title AS internship_title,
          c.company_name,
          si.status
        FROM student_internship si
        JOIN internship i
          ON si.internship_id = i.internship_id
        LEFT JOIN company c
          ON si.company_id = c.company_id
        WHERE si.student_id = ?
          AND si.internship_id <> ?
          AND LOWER(si.status) IN ('in progress', 'accepted', 'active')

        UNION ALL

        SELECT
          a.internship_id,
          i.title AS internship_title,
          c.company_name,
          a.status
        FROM application a
        JOIN internship i
          ON a.internship_id = i.internship_id
        LEFT JOIN company c
          ON i.company_id = c.company_id
        WHERE a.student_id = ?
          AND a.internship_id <> ?
          AND LOWER(a.status) = 'accepted'
      ) current_records
      LIMIT 1
      `,
      [student_id, internship_id, student_id, internship_id],
    );

    if (currentInternships.length > 0) {
      return res.status(409).json({
        success: false,
        message: `This student already has a current internship${currentInternships[0].internship_title ? `: ${currentInternships[0].internship_title}` : ""}.`,
        current_internship: currentInternships[0],
      });
    }

    await db.query(
      "UPDATE application SET status = 'accepted' WHERE application_id = ?",
      [application_id],
    );

    const [existingPlacement] = await db.query(
      `
      SELECT id
      FROM student_internship
      WHERE student_id = ? AND internship_id = ?
      LIMIT 1
      `,
      [student_id, internship_id],
    );

    if (existingPlacement.length === 0) {
      await db.query(
        `INSERT INTO student_internship 
        (student_id, internship_id, company_id, status, start_date) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          student_id,
          internship_id,
          applicationCompanyId,
          placementStatus,
          internshipStartDate,
        ],
      );
    } else {
      await db.query(
        `
        UPDATE student_internship
        SET status = ?, start_date = ?
        WHERE id = ?
        `,
        [placementStatus, internshipStartDate, existingPlacement[0].id],
      );
    }

    await db.query(
      `
      UPDATE application
      SET status = 'withdrawn'
      WHERE student_id = ?
        AND internship_id <> ?
        AND LOWER(status) = 'pending'
      `,
      [student_id, internship_id],
    );
    await createNotification({
      recipientRole: "student",
      recipientId: student_id,
      title: "Application accepted",
      message: `${company_name || "A company"} accepted your application for ${internship_title || "an internship"}.`,
      type: "application",
      link: "/student/my-applications",
    });

    res.status(200).json({
      success: true,
      message: "Application accepted and internship assigned",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to accept application" });
  }
};

const reject = async (req, res) => {
  try {
    const { application_id } = req.params;
    const company_id = req.user.company_id;

    if (!application_id) {
      return res
        .status(400)
        .json({ success: false, message: "Application ID is required" });
    }

    // Check if application exists
    const [existing] = await db.query(
      `
      SELECT
        a.application_id,
        a.student_id,
        i.title AS internship_title,
        c.company_name
      FROM application a
      JOIN internship i
        ON a.internship_id = i.internship_id
      JOIN company c
        ON i.company_id = c.company_id
      WHERE a.application_id = ? AND i.company_id = ?
      `,
      [application_id, company_id],
    );

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    // Update application status to 'rejected'
    await db.query(
      "UPDATE application SET status = 'rejected' WHERE application_id = ?",
      [application_id],
    );

    await createNotification({
      recipientRole: "student",
      recipientId: existing[0].student_id,
      title: "Application rejected",
      message: `${existing[0].company_name || "A company"} rejected your application for ${existing[0].internship_title || "an internship"}.`,
      type: "application",
      link: "/student/my-applications",
    });

    res
      .status(200)
      .json({ success: true, message: "Application rejected successfully" });
  } catch (error) {
    console.error("Reject application error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reject application" });
  }
};

const assignMentor = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { student_internship_id, company_mentor_id, student_id, mentor_id } =
      req.body;

    const resolvedMentorId = company_mentor_id || mentor_id;
    let resolvedInternshipId = student_internship_id;

    if ((!resolvedInternshipId && !student_id) || !resolvedMentorId) {
      return res.status(400).json({
        success: false,
        message:
          "Student internship reference and company mentor ID are required",
      });
    }

    if (!resolvedInternshipId && student_id) {
      const [placements] = await db.query(
        `
        SELECT id
        FROM student_internship
        WHERE student_id = ? AND company_id = ? AND status = 'in progress'
        ORDER BY id DESC
        LIMIT 1
        `,
        [student_id, company_id],
      );

      if (placements.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Student internship not found" });
      }

      resolvedInternshipId = placements[0].id;
    }

    // Check if student_internship exists
    const [existing] = await db.query(
      "SELECT * FROM student_internship WHERE id = ? AND company_id = ?",
      [resolvedInternshipId, company_id],
    );

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Student internship not found" });
    }

    // Optional: check if company_mentor exists
    const [mentor] = await db.query(
      "SELECT * FROM company_mentor WHERE company_mentor_id = ?",
      [resolvedMentorId],
    );

    if (mentor.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Company mentor not found" });
    }

    // Assign the mentor
    await db.query(
      "UPDATE student_internship SET company_mentor_id = ? WHERE id = ?",
      [resolvedMentorId, resolvedInternshipId],
    );

    res
      .status(200)
      .json({ success: true, message: "Mentor assigned successfully" });
  } catch (error) {
    console.error("Assign mentor error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to assign mentor" });
  }
};

const postEvaluation = async (req, res) => {
  try {
    const { assessment, attendanceData } = req.body;
    const { internship_id } = req.params;
    const company = req.user.company_name;

    /* ================= FETCH STUDENT ================= */
    const [[student]] = await db.query(
      `
      SELECT 
          s.*,
          cm.full_name AS supervisor
      FROM student s
      JOIN student_internship si 
          ON s.student_id = si.student_id
      JOIN company_mentor cm
          ON si.company_mentor_id = cm.company_mentor_id
      WHERE si.internship_id = ?
      `,
      [internship_id],
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const assessmentPath = await generateAssessmentPDF({
      student,
      assessment,
      company,
    });

    const assessmentBuffer = fs.readFileSync(assessmentPath);

    const assessmentURL = await uploadToCloudinary(
      assessmentBuffer,
      "internship/assessment",
      `${student.student_id}_assessment.pdf`,
    );

    // const assessmentURL = await uploadToCloudinary(
    //   assessmentPath,
    //   "internship/assessment"
    // );

    const attendancePath = await generateAttendancePDF({
      student,
      attendanceData,
      company,
    });

    const attendanceBuffer = fs.readFileSync(attendancePath);

    const attendanceURL = await uploadToCloudinary(
      attendanceBuffer,
      "internship/attendance",
      `${student.student_id}_attendance.pdf`,
    );

    fs.unlinkSync(assessmentPath);
    fs.unlinkSync(attendancePath);

    /* ================= CALCULATE TOTAL ================= */
    const totalMark =
      Object.values(assessment.general).reduce((a, b) => a + b, 0) +
      Object.values(assessment.personal).reduce((a, b) => a + b, 0) +
      Object.values(assessment.professional).reduce((a, b) => a + b, 0);

    /* ================= SAVE TO DATABASE ================= */
    await db.query(
      `
      INSERT INTO internship_evaluation
      (student_id, internship_id, assessment_pdf_url, attendance_pdf_url, total_mark)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        student.student_id,
        internship_id,
        assessmentURL,
        attendanceURL,
        totalMark,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Evaluation submitted successfully",
      assessment_pdf: assessmentURL,
      attendance_pdf: attendanceURL,
      total_mark: totalMark,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to submit evaluation",
    });
  }
};

const activeInternships = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    if (!company_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const [rows] = await db.query(
      `
      SELECT 
        i.internship_id,
        i.title,
        i.description,
        i.start_date,
        i.end_date,
        i.skills,
        i.skills AS requirements,
        i.location,
        i.status,

        COUNT(CASE WHEN si.status = 'in progress' THEN si.student_id END) AS active_students

      FROM internship i
      LEFT JOIN student_internship si 
        ON i.internship_id = si.internship_id

      WHERE i.company_id = ?

      GROUP BY i.internship_id
      ORDER BY i.internship_id DESC
      `,
      [company_id],
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      internships: rows,
    });
  } catch (error) {
    console.error("Active internships error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active internships",
    });
  }
};

const registerCompany = async (req, res) => {
  try {
    const {
      orgName,
      orgType,
      industry,
      website,
      orgEmail,
      orgPhone,
      address,
      city,
      region,
      password,
      confirmPassword,
      agreed,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (!agreed) {
      return res.status(400).json({
        success: false,
        message: "You must accept terms",
      });
    }

    const agreedValue = agreed === "true" || agreed === true ? 1 : 0;

    const hashedPassword = await bcrypt.hash(password, 10);

    /* ===== Upload Files ===== */

    let profileURL = null;
    let licenseURL = null;

    if (req.files?.profileFile) {
      profileURL = await uploadToCloudinary(
        req.files.profileFile[0].buffer,
        "company/profile",
      );
    }

    if (req.files?.licenseFile) {
      licenseURL = await uploadToCloudinary(
        req.files.licenseFile[0].buffer,
        "company/license",
      );
    }

    /* ===== Insert into DB ===== */

    const [result] = await db.query(
      `
      INSERT INTO company
      (company_name, company_type, industry, website, email, phone_number,
       location, city, region, password, profile_pic, license_url, agreed, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        orgName,
        orgType,
        industry,
        website,
        orgEmail,
        orgPhone,
        address,
        city,
        region,
        hashedPassword,
        profileURL,
        licenseURL,
        agreedValue,
      ],
    );

    await createLog(
      result.insertId,
      "COMPANY_REGISTERED",
      `Company registration submitted by ${orgName} (${orgEmail})`,
    );

    res.status(201).json({
      success: true,
      message: "Company registered successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export {
  postInternship,
  accept,
  reject,
  deleteInternship,
  updateInternship,
  getProfile,
  getCompanyMentors,
  getApplications,
  postEvaluation,
  assignMentor,
  updateProfile,
  viewApplication,
  activeInternships,
  registerCompany,
};
