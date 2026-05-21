import express from "express";
import {
  giveFeedBack,
  fetchStudents,
  postEvaluation,
  getFeedbacks,
} from "../controller/companyMentorController.js";
import { authCompanyMentor } from "../middleware/auth.js";
import { expensiveActionLimiter } from "../middleware/security.js";

/**
 * @swagger
 * tags:
 *   name: CompanyMentor
 *   description: Endpoints for organization/company supervisors to manage assigned interns
 */

const companyMentorRoute = express.Router();

companyMentorRoute.get("/students", authCompanyMentor, fetchStudents);
companyMentorRoute.get("/feedbacks", authCompanyMentor, getFeedbacks);

companyMentorRoute.post(
  "/evaluation/:internship_id/:student_id",
  authCompanyMentor,
  expensiveActionLimiter,
  postEvaluation
);

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

export default companyMentorRoute;
