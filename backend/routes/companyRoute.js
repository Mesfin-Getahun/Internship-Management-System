import express from "express";
import {
  postInternship,
  deleteInternship,
  getApplications,
  updateInternship,
  accept,
  reject,
  postEvaluation,
  assignMentor,
  updateProfile,
  viewApplication,
  activeInternships,
  registerCompany,
} from "../controller/companyController.js";
import { authCompany } from "../middleware/auth.js";
import multer from "multer";

/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Organization/company profile and internship job posting management
 */

const companyRoute = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/company/register:
 *   post:
 *     summary: Register a new company account with UIL
 *     tags: [Company]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileFile:
 *                 type: string
 *                 format: binary
 *                 description: Company profile document
 *               licenseFile:
 *                 type: string
 *                 format: binary
 *                 description: Official business license
 *               orgName:
 *                 type: string
 *               orgEmail:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Company registration request sent successfully
 *       400:
 *         description: Invalid registration payload
 *       500:
 *         description: Server error
 */
companyRoute.post(
  "/register",
  upload.fields([
    { name: "profileFile", maxCount: 1 },
    { name: "licenseFile", maxCount: 1 },
  ]),
  registerCompany
);

/**
 * @swagger
 * /api/company/postInternship:
 *   post:
 *     summary: Create a new internship posting
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: string
 *     responses:
 *       201:
 *         description: Internship posted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
companyRoute.post("/postInternship", authCompany, postInternship);

/**
 * @swagger
 * /api/company/evaluation/{internship_id}:
 *   post:
 *     summary: Post an end-of-internship evaluation
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: internship_id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Evaluation recorded successfully
 *       500:
 *         description: Server error
 */
companyRoute.post("/evaluation/:internship_id", authCompany, postEvaluation);

/**
 * @swagger
 * /api/company/deleteInternship/{internship_id}:
 *   delete:
 *     summary: Remove an active internship posting
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: internship_id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Internship deleted successfully
 */
companyRoute.delete(
  "/deleteInternship/:internship_id",
  authCompany,
  deleteInternship
);

/**
 * @swagger
 * /api/company/updateInternship/{internship_id}:
 *   put:
 *     summary: Update an existing internship's details
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: internship_id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Internship updated successfully
 */
companyRoute.put(
  "/updateInternship/:internship_id",
  authCompany,
  updateInternship
);

/**
 * @swagger
 * /api/company/getApplications:
 *   get:
 *     summary: Retrieve a list of student applications to this company
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications list retrieved successfully
 */
companyRoute.get("/getApplications", authCompany, getApplications);

/**
 * @swagger
 * /api/company/viewApplication/{application_id}:
 *   get:
 *     summary: View specific student application details
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: application_id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Application details retrieved
 */
companyRoute.get(
  "/viewApplication/:application_id",
  authCompany,
  viewApplication
);

/**
 * @swagger
 * /api/company/activeInternships:
 *   get:
 *     summary: Load all currently active internships inside the company
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active internships returned
 */
companyRoute.get("/activeInternships", authCompany, activeInternships);

/**
 * @swagger
 * /api/company/accept/{application_id}:
 *   put:
 *     summary: Accept a student's internship application
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: application_id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Application accepted securely
 */
companyRoute.put("/accept/:application_id", authCompany, accept);

/**
 * @swagger
 * /api/company/reject/{application_id}:
 *   put:
 *     summary: Reject a student's internship application
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: application_id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Application rejected successfully
 */
companyRoute.put("/reject/:application_id", authCompany, reject);

/**
 * @swagger
 * /api/company/assignMentor:
 *   post:
 *     summary: Assign a company mentor to a placed student
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               student_id:
 *                 type: string
 *               mentor_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mentor assigned successfully
 */
companyRoute.post("/assignMentor", authCompany, assignMentor);

/**
 * @swagger
 * /api/company/updateProfile:
 *   put:
 *     summary: Update the host organization's master profile
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company profile updated
 */
companyRoute.put("/updateProfile", authCompany, updateProfile);

export default companyRoute;
