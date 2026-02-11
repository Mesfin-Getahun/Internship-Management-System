import db from "../config/mysql.js";

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
        i.start_date,
        i.end_date,
        c.company_name,
        c.location
      FROM internship i
      JOIN company c ON i.company_id = c.company_id
      WHERE i.status = 'pending'
      ORDER BY i.start_date DESC
    `);

    res.status(200).json({ success: true, internships });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch pending internships" });
  }
};

const approveInternship = async (req, res) => {
  try {
    const { internship_id } = req.params;

    const [existing] = await db.query(
      "SELECT status FROM internship WHERE internship_id = ?",
      [internship_id]
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
      [internship_id]
    );

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
      [internship_id]
    );

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Internship not found" });
    }

    await db.query(
      "UPDATE internship SET status = 'rejected' WHERE internship_id = ?",
      [internship_id]
    );

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
        email,
        phone_number,
        profile_pic,
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
        email,
        phone_number,
        profile_pic,
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

const acceptCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    // Check if company exists & is pending
    const [company] = await db.query(
      "SELECT status FROM company WHERE company_id = ?",
      [company_id]
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

    // Approve company
    await db.query(
      "UPDATE company SET status = 'approved' WHERE company_id = ?",
      [company_id]
    );

    res.status(200).json({
      success: true,
      message: "Company approved successfully",
    });
  } catch (error) {
    console.error("Accept company error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve company",
    });
  }
};

const rejectCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    // Check if company exists
    const [company] = await db.query(
      "SELECT status FROM company WHERE company_id = ?",
      [company_id]
    );

    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Reject company
    await db.query(
      "UPDATE company SET status = 'rejected' WHERE company_id = ?",
      [company_id]
    );

    res.status(200).json({
      success: true,
      message: "Company registration rejected",
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
  companyRequest,
  getActiveCompanies,
};
