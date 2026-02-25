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
const facultyRoute = express.Router();

facultyRoute.post("/assignMentor", authFaculty, assignMentor);
facultyRoute.get("/companyEvaluation", authFaculty, companyEvaluation);
facultyRoute.get("/students", authFaculty, getStudents);
facultyRoute.get("/companyEvaluation/:evaluation_id", authFaculty, evaluation);
facultyRoute.delete("/deleteMentor/:id", authFaculty, deleteMentor);
facultyRoute.put("/changeMentor/:id", authFaculty, changeMentor);
facultyRoute.get("/reports", authFaculty, facultyViewReports);
export default facultyRoute;
