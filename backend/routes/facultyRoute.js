import express from "express";
import {
  assignMentor,
  approveAllInternshipCompletions,
  changeMentor,
  companyEvaluation,
  createMentor,
  deactivateMentor,
  deleteMentor,
  gradeAttendance,
  getStudents,
  getMentors,
  getPaymentData,
  generateStipendReportCsv,
  getFacultyProfile,
  facultyViewReports,
  evaluation,
  updateInternshipCompletionStatus,
  uploadStudents,
  updateMentor,
} from "../controller/facultyController.js";
import {
  assignPresentationEvaluators,
  createEvaluator,
  listFacultyEvaluators,
} from "../controller/evaluatorController.js";
import { authFaculty } from "../middleware/auth.js";
import { spreadsheetUpload } from "../middleware/fileUploadLimits.js";
import { uploadLimiter } from "../middleware/security.js";

/**
 * @swagger
 * tags:
 *   name: Faculty
 *   description: Faculty Coordinator internship management and mentor assignments
 */

const facultyRoute = express.Router();

/**
 * @swagger
 * /api/faculty/assignMentor:
 *   post:
 *     summary: Assign a university mentor to a student
 *     tags: [Faculty]
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
 *         description: Mentor successfully assigned
 *       500:
 *         description: Server error
 */
facultyRoute.post("/assignMentor", authFaculty, assignMentor);

/**
 * @swagger
 * /api/faculty/companyEvaluation:
 *   get:
 *     summary: Retrieve aggregate evaluations provided by host companies
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of company evaluations fetched successfully
 */
facultyRoute.get("/companyEvaluation", authFaculty, companyEvaluation);
facultyRoute.put(
  "/companyEvaluation/:evaluation_id/attendance-grade",
  authFaculty,
  gradeAttendance,
);

/**
 * @swagger
 * /api/faculty/students:
 *   get:
 *     summary: Get a list of students under this faculty department
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Faculty student list returned successfully
 */
facultyRoute.get("/students", authFaculty, getStudents);

/**
 * @swagger
 * /api/faculty/mentors:
 *   get:
 *     summary: Get available university mentors with current assignment load
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Faculty mentor list returned successfully
 */
facultyRoute.get("/mentors", authFaculty, getMentors);
facultyRoute.post("/mentors", authFaculty, createMentor);
facultyRoute.put("/mentors/:mentor_id", authFaculty, updateMentor);
facultyRoute.delete("/mentors/:mentor_id", authFaculty, deactivateMentor);
facultyRoute.get("/evaluators", authFaculty, listFacultyEvaluators);
facultyRoute.post("/evaluators", authFaculty, createEvaluator);
facultyRoute.post(
  "/presentation-evaluators/assign",
  authFaculty,
  assignPresentationEvaluators,
);

/**
 * @swagger
 * /api/faculty/companyEvaluation/{evaluation_id}:
 *   get:
 *     summary: View specific company evaluation details
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: evaluation_id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Evaluation detail retrieved
 */
facultyRoute.get("/companyEvaluation/:evaluation_id", authFaculty, evaluation);

/**
 * @swagger
 * /api/faculty/deleteMentor/{id}:
 *   delete:
 *     summary: Remove an assigned faculty mentor from a student
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Mentor association deleted successfully
 */
facultyRoute.delete("/deleteMentor/:id", authFaculty, deleteMentor);

/**
 * @swagger
 * /api/faculty/changeMentor/{id}:
 *   put:
 *     summary: Update/Reassign the university mentor
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_mentor_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mentor altered successfully
 */
facultyRoute.put("/changeMentor/:id", authFaculty, changeMentor);

/**
 * @swagger
 * /api/faculty/reports:
 *   get:
 *     summary: Fetch all student internship reports for this faculty
 *     tags: [Faculty]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports listed successfully
 */
facultyRoute.get("/reports", authFaculty, facultyViewReports);
facultyRoute.get("/payments", authFaculty, getPaymentData);
facultyRoute.get("/stipend-report.csv", authFaculty, generateStipendReportCsv);
facultyRoute.post(
  "/internship-completion/approve-all",
  authFaculty,
  approveAllInternshipCompletions,
);
facultyRoute.put(
  "/internship-completion/:placement_id",
  authFaculty,
  updateInternshipCompletionStatus,
);
facultyRoute.get("/profile", authFaculty, getFacultyProfile);
facultyRoute.post(
  "/uploadStudents",
  authFaculty,
  uploadLimiter,
  spreadsheetUpload.single("file"),
  uploadStudents,
);

export default facultyRoute;
