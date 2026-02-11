import express from "express";
import {
  assignMentor,
  changeMentor,
  companyEvaluation,
  deleteMentor,
  evaluation,
} from "../controller/facultyController.js";
const facultyRoute = express.Router();

facultyRoute.post("/assignMentor", assignMentor);
facultyRoute.get("/companyEvaluation", companyEvaluation);
facultyRoute.get("/companyEvaluation/:id", evaluation);
facultyRoute.delete("/deleteMentor/:id", deleteMentor);
facultyRoute.put("/changeMentor/:id", changeMentor);
export default facultyRoute;
