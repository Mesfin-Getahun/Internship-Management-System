import express from "express";
import {
  fetchStudents,
  getMentorProfile,
  provideFeedback,
  reviewReport,
  mentorSignReport,
  companyMentorFeedback,
  getSingleFeedback,
} from "../controller/mentorController.js";
import { authMentor } from "../middleware/auth.js";
import { uploadPDF } from "../middleware/uploadPDF.js";

/**
 * @swagger
 * tags:
 *   name: Mentor
 *   description: University Faculty Mentor routes for overseeing students and signing reports
 */

const mentorRoute = express.Router();

/**
 * @swagger
 * /api/mentor/students:
 *   get:
 *     summary: Get all students currently supervised by this mentor
 *     tags: [Mentor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 */
mentorRoute.get("/students", authMentor, fetchStudents);
mentorRoute.get("/profile", authMentor, getMentorProfile);

/**
 * @swagger
 * /api/mentor/reports:
 *   get:
 *     summary: Fetch all submitted student reports waiting for mentor review
 *     tags: [Mentor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports fetched successfully
 */
mentorRoute.get("/reports", authMentor, reviewReport);

/**
 * @swagger
 * /api/mentor/companyFeedback:
 *   get:
 *     summary: Retrieve academic feedback provided by company supervisors
 *     tags: [Mentor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feedback retrieved successfully
 */
mentorRoute.get("/companyFeedback", authMentor, companyMentorFeedback);

/**
 * @swagger
 * /api/mentor/provideFeedback/{id}:
 *   post:
 *     summary: Provide official academic feedback back to a student
 *     tags: [Mentor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Formatted student reference ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback sent to student portal
 */
mentorRoute.post("/provideFeedback/:id", authMentor, provideFeedback);

/**
 * @swagger
 * /api/mentor/signReport/{report_id}:
 *   post:
 *     summary: Digitally sign and return approved final report
 *     tags: [Mentor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: report_id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               report:
 *                 type: string
 *                 format: binary
 *                 description: Signed PDF returned to the student
 *     responses:
 *       200:
 *         description: Successfully uploaded the mentor-signed report
 */
mentorRoute.post(
  "/signReport/:report_id",
  authMentor,
  uploadPDF.single("report"),
  mentorSignReport,
);

/**
 * @swagger
 * /api/mentor/feedback/{feedback_id}:
 *   get:
 *     summary: View specific feedback trace node
 *     tags: [Mentor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedback_id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Feedback log returned
 */
mentorRoute.get(
  "/feedback/:feedback_id",
  authMentor, // faculty mentor auth
  getSingleFeedback,
);

export default mentorRoute;
