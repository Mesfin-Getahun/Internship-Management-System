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

facultyRoute.post("/assignMentor", assignMentor);
facultyRoute.get("/companyEvaluation", companyEvaluation);
facultyRoute.get("/students", authFaculty, getStudents);
facultyRoute.get("/companyEvaluation/:evaluation_id", evaluation);
facultyRoute.delete("/deleteMentor/:id", deleteMentor);
facultyRoute.put("/changeMentor/:id", changeMentor);
facultyRoute.get("/reports", facultyViewReports);
export default facultyRoute;
