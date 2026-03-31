import express from "express";
import {
  acceptCompany,
  rejectCompany,
  allInternships,
  rejectInternship,
  approveInternship,
  pendingInternships,
  companyRequest,
  getActiveCompanies,
} from "../controller/UILcontroller.js";

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
UILroute.get("/internships", allInternships);

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
UILroute.get("/internships/pending", pendingInternships);

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
UILroute.get("/companyRequest", companyRequest);

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
UILroute.put("/rejectInternship/:internship_id", rejectInternship);

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
UILroute.put("/approveInternship/:internship_id", approveInternship);

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
UILroute.put("/acceptCompany/:company_id", acceptCompany);

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
UILroute.put("/rejectCompany/:company_id", rejectCompany);

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
UILroute.get("/companies/active", getActiveCompanies);

export default UILroute;
