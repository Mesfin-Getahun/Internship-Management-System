import express from "express";
import {
  acceptCompany,
  rejectCompany,
  allInternships,
  rejectInternship,
  approveInternship,
  pendingInternships,
  exportInternshipsCsv,
  companyRequest,
  getActiveCompanies,
  exportCompaniesCsv,
  getAcademicYears,
  createAcademicYear,
  closeCurrentAcademicYear,
  fulfillmentReports,
  getCompanyRatings,
  updateCompanyRatingAction,
  inviteCompany,
  verifyCompanyInvite,
  completeCompanyRegistration,
  getRecommendationLetter,
  uploadRecommendationLetter,
  removeRecommendationLetter,
} from "../controller/UILcontroller.js";
import { authUIL } from "../middleware/auth.js";
import { uploadPDF } from "../middleware/uploadPDF.js";
import { companyDocumentUpload } from "../middleware/fileUploadLimits.js";
import { uploadLimiter } from "../middleware/security.js";

/**
 * @swagger
 * tags:
 *   name: UIL
 *   description: University Industry Linkage endpoints
 */

const UILroute = express.Router();

/**
 * @swagger
 * /api/UIL/internships:
 *   get:
 *     summary: Get all internships
 *     tags: [UIL]
 *     responses:
 *       200:
 *         description: Successfully fetched all internships
 *       500:
 *         description: Failed to fetch internships
 */
UILroute.get("/internships", authUIL, allInternships);
UILroute.get("/internships/export.csv", authUIL, exportInternshipsCsv);

/**
 * @swagger
 * /api/UIL/internships/pending:
 *   get:
 *     summary: Get pending internships
 *     tags: [UIL]
 *     responses:
 *       200:
 *         description: Successfully fetched pending internships
 *       500:
 *         description: Failed to fetch pending internships
 */
UILroute.get("/internships/pending", authUIL, pendingInternships);

/**
 * @swagger
 * /api/UIL/companyRequest:
 *   get:
 *     summary: Get pending company registrations
 *     tags: [UIL]
 *     responses:
 *       200:
 *         description: Successfully fetched pending company requests
 *       500:
 *         description: Failed to fetch pending company requests
 */
UILroute.get("/companyRequest", authUIL, companyRequest);

/**
 * @swagger
 * /api/UIL/rejectInternship/{internship_id}:
 *   put:
 *     summary: Reject an internship
 *     tags: [UIL]
 *     parameters:
 *       - in: path
 *         name: internship_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the internship to reject
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Internship rejected successfully
 *       404:
 *         description: Internship not found
 *       500:
 *         description: Failed to reject internship
 */
UILroute.put("/rejectInternship/:internship_id", authUIL, rejectInternship);

/**
 * @swagger
 * /api/UIL/approveInternship/{internship_id}:
 *   put:
 *     summary: Approve an internship
 *     tags: [UIL]
 *     parameters:
 *       - in: path
 *         name: internship_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the internship to approve
 *     responses:
 *       200:
 *         description: Internship approved successfully
 *       400:
 *         description: Internship already approved
 *       404:
 *         description: Internship not found
 *       500:
 *         description: Failed to approve internship
 */
UILroute.put("/approveInternship/:internship_id", authUIL, approveInternship);

/**
 * @swagger
 * /api/UIL/acceptCompany/{company_id}:
 *   put:
 *     summary: Accept a pending company registration
 *     tags: [UIL]
 *     parameters:
 *       - in: path
 *         name: company_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the company to accept
 *     responses:
 *       200:
 *         description: Company approved successfully
 *       400:
 *         description: Company is already processed
 *       404:
 *         description: Company not found
 *       500:
 *         description: Failed to approve company
 */
UILroute.put("/acceptCompany/:company_id", authUIL, acceptCompany);

/**
 * @swagger
 * /api/UIL/rejectCompany/{company_id}:
 *   put:
 *     summary: Reject a pending company registration
 *     tags: [UIL]
 *     parameters:
 *       - in: path
 *         name: company_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the company to reject
 *     responses:
 *       200:
 *         description: Company registration rejected
 *       404:
 *         description: Company not found
 *       500:
 *         description: Failed to reject company
 */
UILroute.put("/rejectCompany/:company_id", authUIL, rejectCompany);

/**
 * @swagger
 * /api/UIL/companies/active:
 *   get:
 *     summary: Get all active companies
 *     tags: [UIL]
 *     responses:
 *       200:
 *         description: Successfully fetched active companies
 *       500:
 *         description: Failed to fetch active companies
 */
UILroute.get("/companies/active", authUIL, getActiveCompanies);
UILroute.get("/companies/export.csv", authUIL, exportCompaniesCsv);
UILroute.get("/academic-years", authUIL, getAcademicYears);
UILroute.post("/academic-years", authUIL, createAcademicYear);
UILroute.post("/academic-years/close-current", authUIL, closeCurrentAcademicYear);
UILroute.get("/fulfillmentReports", authUIL, fulfillmentReports);
UILroute.get("/company-ratings", authUIL, getCompanyRatings);
UILroute.put("/company-ratings/:company_id/action", authUIL, updateCompanyRatingAction);
UILroute.get("/recommendation-letter", authUIL, getRecommendationLetter);
UILroute.post(
  "/recommendation-letter",
  authUIL,
  uploadLimiter,
  uploadPDF.single("recommendationLetter"),
  uploadRecommendationLetter,
);
UILroute.delete("/recommendation-letter", authUIL, removeRecommendationLetter);

/**
 * @swagger
 * /api/UIL/inviteCompany:
 *   post:
 *     summary: Invite a company by name and email
 *     tags: [UIL]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invitation email sent successfully
 *       400:
 *         description: Invalid payload or company already exists
 *       500:
 *         description: Failed to send invitation
 */
UILroute.post("/inviteCompany", authUIL, inviteCompany);

/**
 * @swagger
 * /api/UIL/verifyCompanyInvite/{token}:
 *   get:
 *     summary: Verify company invitation token
 *     tags: [UIL]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Invitation token
 *     responses:
 *       200:
 *         description: Invite is valid
 *       400:
 *         description: Invalid or expired invite token
 */
UILroute.get("/verifyCompanyInvite/:token", verifyCompanyInvite);

/**
 * @swagger
 * /api/UIL/completeCompanyRegistration:
 *   post:
 *     summary: Complete invited company registration
 *     tags: [UIL]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               inviteToken:
 *                 type: string
 *               company_name:
 *                 type: string
 *               company_type:
 *                 type: string
 *               industry:
 *                 type: string
 *               website:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               location:
 *                 type: string
 *               city:
 *                 type: string
 *               region:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               agreed:
 *                 type: boolean
 *               profileFile:
 *                 type: string
 *                 format: binary
 *               licenseFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Registration completed successfully
 *       400:
 *         description: Invalid payload or invite
 *       500:
 *         description: Failed to complete registration
 */
UILroute.post(
  "/completeCompanyRegistration",
  uploadLimiter,
  companyDocumentUpload.fields([
    { name: "profileFile", maxCount: 1 },
    { name: "licenseFile", maxCount: 1 },
  ]),
  completeCompanyRegistration,
);

export default UILroute;
