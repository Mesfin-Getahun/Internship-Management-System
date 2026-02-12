import express from "express";
import {
  assignMentor,
  changeMentor,
  companyEvaluation,
  deleteMentor,
  getStudents,
} from "../controller/facultyController.js";
const facultyRoute = express.Router();

facultyRoute.post("/assignMentor", assignMentor);
facultyRoute.get("/companyEvaluation", companyEvaluation);
facultyRoute.get("/students", getStudents);
// facultyRoute.get("/companyEvaluation/:id", evaluation);
facultyRoute.delete("/deleteMentor/:id", deleteMentor);
facultyRoute.put("/changeMentor/:id", changeMentor);
export default facultyRoute;
