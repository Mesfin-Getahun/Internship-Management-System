import express from "express";
import {
  applyInternships,
  fetchInternships,
  myInternship,
  getStudentReports,
  getStudentEvaluations,
  uploadInternshipReport,
  getPaymentApplication,
  submitPaymentApplication,
  feedbacks,
  updateProfile,
  cancelApplication,
  cancelCurrentInternship,
  submitSignedReportToFaculty,
  getRecommendationLetter,
  suggestedInternships,
  getCompanyRatingOptions,
  submitCompanyRating,
  getProfile,
} from "../controller/studentController.js";
import { uploadApplicationFiles } from "../middleware/uploadApplicationFiles.js";
import { uploadPDF } from "../middleware/uploadPDF.js";
import { authStudent } from "../middleware/auth.js";
import { uploadLimiter } from "../middleware/security.js";
/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Student portal and internship application endpoints
 */

const studentRoute = express.Router();

/**
 * @swagger
 * /api/student/applyInternship/{internship_id}:
 *   post:
 *     summary: Apply for an internship
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: internship_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the internship to apply for
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: Student CV document (PDF)
 *               academic_doc:
 *                 type: string
 *                 format: binary
 *                 description: Academic record or related document (PDF)
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *       400:
 *         description: Missing files or invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
studentRoute.post(
  "/applyInternship/:internship_id",
  authStudent,
  uploadLimiter,
  uploadApplicationFiles,
  applyInternships
);

/**
 * @swagger
 * /api/student/cancelApplication/{id}:
 *   delete:
 *     summary: Cancel an existing internship application
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the application
 *     responses:
 *       200:
 *         description: Application cancelled successfully
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/student/internships:
 *   get:
 *     summary: Get all available internships for students
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of internships available to the student
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
studentRoute.get("/internships", authStudent, fetchInternships);
studentRoute.get("/internships/suggested", authStudent, suggestedInternships);

/**
 * @swagger
 * /api/student/myInternship:
 *   get:
 *     summary: Get current student's applied or active internship details
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Internship details fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
studentRoute.get("/myInternship", authStudent, myInternship);
studentRoute.get("/reports", authStudent, getStudentReports);
studentRoute.get("/evaluations", authStudent, getStudentEvaluations);
studentRoute.get("/paymentApplication", authStudent, getPaymentApplication);
studentRoute.get("/profile", authStudent, getProfile);

/**
 * @swagger
 * /api/student/viewFeedbacks:
 *   get:
 *     summary: Get feedbacks provided by mentors or company supervisors
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feedbacks fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
studentRoute.get("/viewFeedbacks", authStudent, feedbacks);
studentRoute.get("/company-ratings", authStudent, getCompanyRatingOptions);
studentRoute.post("/company-ratings", authStudent, submitCompanyRating);
studentRoute.get(
  "/recommendation-letter",
  authStudent,
  getRecommendationLetter,
);

/**
 * @swagger
 * /api/student/updateProfile:
 *   put:
 *     summary: Update student profile details
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *               address:
 *                 type: string
 *               skills:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       500:
 *         description: Server error
 */
studentRoute.put("/updateProfile", authStudent, updateProfile);

/**
 * @swagger
 * /api/student/uploadReport/{internship_id}:
 *   post:
 *     summary: Upload periodic internship report
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: internship_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the active internship
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
 *                 description: PDF document of the internship report
 *     responses:
 *       200:
 *         description: Report uploaded successfully
 *       400:
 *         description: Missing file or invalid format
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
studentRoute.post(
  "/uploadReport/:internship_id",
  authStudent,
  uploadLimiter,
  uploadPDF.single("report"),
  uploadInternshipReport
);
studentRoute.post(
  "/paymentApplication",
  authStudent,
  submitPaymentApplication
);

/**
 * @swagger
 * /api/student/submitToFaculty/{report_id}:
 *   put:
 *     summary: Submit a signed/finalized report to faculty
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: report_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the report to submit
 *     responses:
 *       200:
 *         description: Report submitted to faculty successfully
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
studentRoute.delete("/cancelApplication/:id", authStudent, cancelApplication);
studentRoute.put(
  "/cancelCurrentInternship/:placement_id",
  authStudent,
  cancelCurrentInternship,
);
studentRoute.put(
  "/submitToFaculty/:report_id",
  authStudent,
  submitSignedReportToFaculty
);

export default studentRoute;
