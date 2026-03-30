import express from "express";
import {
  assignMentor,
  changeMentor,
  companyEvaluation,
  deleteMentor,
  getStudents,
  facultyViewReports,
  evaluation,
} from "../controller/facultyController.js";
import { authFaculty } from "../middleware/auth.js";

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

export default facultyRoute;
