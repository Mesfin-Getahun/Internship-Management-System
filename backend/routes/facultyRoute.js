import express from "express";
import {
  assignMentor,
  changeMentor,
  companyEvaluation,
  deleteMentor,
  getStudents,
  facultyViewReports,
} from "../controller/facultyController.js";
const facultyRoute = express.Router();

facultyRoute.post("/assignMentor", assignMentor);
facultyRoute.get("/companyEvaluation", companyEvaluation);
facultyRoute.get("/students", getStudents);
// facultyRoute.get("/companyEvaluation/:id", evaluation);
facultyRoute.delete("/deleteMentor/:id", deleteMentor);
facultyRoute.put("/changeMentor/:id", changeMentor);
facultyRoute.get("/reports", facultyViewReports);
export default facultyRoute;
