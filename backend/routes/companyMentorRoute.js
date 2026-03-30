import express from "express";
import {
  giveFeedBack,
  fetchStudents,
} from "../controller/companyMentorController.js";
import { authCompanyMentor } from "../middleware/auth.js";

/**
 * @swagger
 * tags:
 *   name: CompanyMentor
 *   description: Endpoints for organization/company supervisors to manage assigned interns
 */

const companyMentorRoute = express.Router();

/**
 * @swagger
 * /api/company_mentor/feedBack/{internship_id}/{student_id}:
 *   post:
 *     summary: Provide feedback for a specific student's internship performance
 *     tags: [CompanyMentor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: internship_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the internship program
 *       - in: path
 *         name: student_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the student receiving feedback
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedback_text:
 *                 type: string
 *                 description: The detailed feedback narrative
 *               rating:
 *                 type: number
 *                 description: Numeric rating (e.g. 1-5)
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
companyMentorRoute.post(
  "/feedBack/:internship_id/:student_id",
  authCompanyMentor,
  giveFeedBack
);

/**
 * @swagger
 * /api/company_mentor/students:
 *   get:
 *     summary: Fetch all students assigned to the current company mentor
 *     tags: [CompanyMentor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned students retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
companyMentorRoute.get("/students", authCompanyMentor, fetchStudents);

export default companyMentorRoute;
